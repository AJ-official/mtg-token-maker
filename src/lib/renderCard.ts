// カードのCanvas描画ロジック（Step5Save と /save ページで共用）
// 元は Step5Save.tsx にあったものを、LINE Android 対応の /save ページ新設に伴い切り出した。

import { CardState, ManaType, MANA_SLOTS } from "@/types/card";
import { getFrameById } from "@/config/frames";
import { getIllustrationById } from "@/config/illustrations";
import { getManaById } from "@/config/mana";

export const W = 1260;
export const H = 1760;

const DOUBLE_MARGIN_LR = 60;
const DOUBLE_MARGIN_TOP = 75;
const DOUBLE_MARGIN_BOTTOM = 45;
const DOUBLE_CANVAS_W = W * 2 + DOUBLE_MARGIN_LR * 2;
const DOUBLE_CANVAS_H = H + DOUBLE_MARGIN_TOP + DOUBLE_MARGIN_BOTTOM;

// ── 環境検出 ─────────────────────────────────────────────────────────
export const isIOS = typeof navigator !== "undefined" && (
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
);

// LINEの内蔵ブラウザ（WebView）検出。Androidでは <a download> が無効化されるため分岐が必要。
export const isLINE = typeof navigator !== "undefined" && /Line\//i.test(navigator.userAgent);
export const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

// ── Canvas描画とCSSプレビューの位置差を補正する定数 ──────────────────
// CSSはline-heightで文字上下に余白が入る・height:%で画像を縦長divに中央配置する。
// Canvasはtextbaseline="top"で余白なし・top座標に直接配置するためずれて見える。
// 正の値 = 下にずらす。単位: canvas px (1260×1760基準)
//
// 【調整方法】保存画像とプレビューを比較し、ずれたpx数をこの値に加算/減算する。
// iPhoneでずれる場合は IOS_FONT_OFFSET を調整する（負の値=上にずらす）。
const IOS_FONT_OFFSET = -15;

const f = (pcVal: number) => pcVal + (isIOS ? IOS_FONT_OFFSET : 0);

const ADJ = {
  titleY:   f(11),  // PC:11 / iOS:6
  manaY:    20,     // 画像のため platform offset 不要
  typeY:    f(15),  // PC:15 / iOS:10
  symbolY:  23,     // 画像のため platform offset 不要
  textboxY: f(4),   // PC:4  / iOS:-1
  ptY:      f(-1) + (isIOS ? -5 : 0),  // PC:-1 / iOS:-21
  loyaltyY: f(7) + (isIOS ? 0 : 10),  // PC:17 / iOS:-8
};
// ────────────────────────────────────────────────────────────────────

// fetch → blob URL でCanvas汚染を防いで画像を読み込む
async function loadImg(src: string): Promise<HTMLImageElement> {
  const res = await fetch(src);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Failed: ${src}`)); };
    img.src = url;
  });
}

function pctW(v: string): number { return parseFloat(v) / 100 * W; }
function pctH(v: string): number { return parseFloat(v) / 100 * H; }
function cqw(v: string): number  { return parseFloat(v) / 100 * W; }

function getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    if (!para) { lines.push(""); continue; }
    let line = "";
    for (const char of para) {
      const test = line + char;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = char; }
      else line = test;
    }
    lines.push(line);
  }
  return lines;
}

export async function renderCardToCanvas(card: CardState): Promise<string> {
  const frame = getFrameById(card.frameId);
  const illustration = getIllustrationById(card.illustrationId);
  const isDungeon = card.cardType === "dungeon";
  const isCounter = card.cardType === "counter";
  const isCreature = card.cardType === "creature";
  const isPlaneswalker = card.cardType === "planeswalker";

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ダンジョン・カウンター：イラストのみ全面表示
  if (isDungeon || isCounter) {
    if (illustration) {
      const img = await loadImg(illustration.file);
      ctx.drawImage(img, 0, 0, W, H);
    }
    return canvas.toDataURL("image/png");
  }

  // イラスト
  if (frame && illustration) {
    const ia = frame.illustrationArea;
    const img = await loadImg(illustration.file);
    ctx.drawImage(img, pctW(ia.left), pctH(ia.top), pctW(ia.width), pctH(ia.height));
  }

  // フレーム
  if (frame) {
    const img = await loadImg(frame.file);
    ctx.drawImage(img, 0, 0, W, H);
  }

  // マナシンボル
  if (frame && card.showMana) {
    const activeManas = Array.from({ length: MANA_SLOTS })
      .map((_, i) => card.manaTypes[i] ?? "none")
      .filter((s): s is ManaType => s !== "none")
      .map((s) => getManaById(s))
      .filter(Boolean);

    const manaSize = pctW(frame.manaArea.size);
    const manaTop  = pctH(frame.manaArea.top) + ADJ.manaY;

    await Promise.all(activeManas.map(async (m, i) => {
      try {
        const reverseIndex = activeManas.length - 1 - i;
        const img = await loadImg(m!.file);
        const x = W - (reverseIndex + 1) * 0.06 * W - manaSize;
        ctx.drawImage(img, x, manaTop, manaSize, manaSize);
      } catch (_) {}
    }));
  }

  // AJシンボル
  if (frame && card.showSymbol) {
    try {
      const img = await loadImg("/symbol/symbol.png");
      const symW = pctW("9");
      const symH = pctW("9"); // 正方形（pctHだと縦長になるため）
      ctx.drawImage(img, W - pctW("6.7") - symW, pctH("65.7") + ADJ.symbolY, symW, symH);
    } catch (_) {}
  }

  // テキスト
  if (frame) {
    // next/font/google はVercel本番環境で "__Noto_Sans_JP_xxxx" のような独自名でフォントを登録する。
    // CSSカスタムプロパティから実際のフォントファミリー名を取得してcanvasに使用する。
    const fontFamily =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-noto-sans-jp")
        .trim() || '"Noto Sans JP", sans-serif';

    // 使用するサイズのフォントを明示的にロードしてからcanvasで描画する
    await Promise.allSettled([
      document.fonts.load(`bold ${cqw("4.5")}px ${fontFamily}`),
      document.fonts.load(`${cqw("3.8")}px ${fontFamily}`),
      document.fonts.load(`bold ${cqw("5.2")}px ${fontFamily}`),
      document.fonts.load(`bold ${cqw("5.5")}px ${fontFamily}`),
      document.fonts.load(`${cqw("3.2")}px ${fontFamily}`),
    ]);

    ctx.textBaseline = "top";
    ctx.fillStyle = "#000000";

    // カード名
    ctx.font = `bold ${cqw("4.5")}px ${fontFamily}`;
    ctx.fillText(card.title || "カード名", pctW("8"), pctH("5.7") + ADJ.titleY, pctW("75"));

    // カードタイプ
    ctx.font = `${cqw("3.8")}px ${fontFamily}`;
    ctx.fillText(card.subtype || "カードタイプ", pctW("8"), pctH("68") + ADJ.typeY, pctW("82"));

    // カードテキスト（自動折り返し・縮小）
    if (card.cardText) {
      const tbLeft = pctW("10");
      const tbTop  = pctH("75.5") + ADJ.textboxY;
      const tbW    = pctW("80");
      const tbH    = pctH("18");
      let fs = cqw("3.2");
      let lines: string[] = [];
      while (fs >= 12) {
        ctx.font = `${fs}px ${fontFamily}`;
        lines = getWrappedLines(ctx, card.cardText, tbW);
        if (lines.length * fs * 1.4 <= tbH) break;
        fs = Math.floor(fs * 0.9);
      }
      ctx.font = `${fs}px ${fontFamily}`;
      lines.forEach((line, i) => ctx.fillText(line, tbLeft, tbTop + i * fs * 1.4));
    }

    // P/T（クリーチャーのみ）
    if (isCreature && frame.ptArea) {
      const ptFs = cqw("5.2");
      ctx.font = `bold ${ptFs}px ${fontFamily}`;
      const ptTop   = pctH("90") + ADJ.ptY;
      const ptBoxL  = 0.77 * W;
      const ptBoxW  = W - ptBoxL - 0.047 * W;
      const p = card.power || "0";
      const t = card.toughness || "0";
      const pW = ctx.measureText(p).width;
      const sW = ctx.measureText("/").width;
      const tW = ctx.measureText(t).width;
      const startX = ptBoxL + (ptBoxW - pW - sW - tW) / 2;
      ctx.fillText(p, startX, ptTop);
      ctx.fillText("/", startX + pW, ptTop);
      ctx.fillText(t, startX + pW + sW, ptTop);
    }

    // 忠誠度（プレインズウォーカーのみ）
    if (isPlaneswalker && frame.loyaltyArea) {
      const loyFs = cqw("5.5");
      ctx.font = `bold ${loyFs}px ${fontFamily}`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(card.loyalty || "0", pctW("86"), pctH("89") + ADJ.loyaltyY);
    }
  }

  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// コンビニ印刷用W画像（2枚横並び 2640×1880px）をカード単体のdataURLから生成する
export async function renderDoubleFromSingle(singleDataUrl: string): Promise<string> {
  const img = await loadImage(singleDataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = DOUBLE_CANVAS_W;
  canvas.height = DOUBLE_CANVAS_H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, DOUBLE_CANVAS_W, DOUBLE_CANVAS_H);
  ctx.drawImage(img, DOUBLE_MARGIN_LR, DOUBLE_MARGIN_TOP, W, H);
  ctx.drawImage(img, DOUBLE_MARGIN_LR + W, DOUBLE_MARGIN_TOP, W, H);

  return canvas.toDataURL("image/png");
}

export function download(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// data: URL → Blob 変換
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)![1];
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}
