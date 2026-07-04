"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { formatTimestamp } from "@/lib/utils";
import { CardState, ManaType, MANA_SLOTS } from "@/types/card";
import { getFrameById } from "@/config/frames";
import { getIllustrationById } from "@/config/illustrations";
import { getManaById } from "@/config/mana";

type Props = {
  card: CardState;
};

const W = 1260;
const H = 1760;

const DOUBLE_MARGIN_LR = 60;
const DOUBLE_MARGIN_TOP = 75;
const DOUBLE_MARGIN_BOTTOM = 45;
const DOUBLE_CANVAS_W = W * 2 + DOUBLE_MARGIN_LR * 2;
const DOUBLE_CANVAS_H = H + DOUBLE_MARGIN_TOP + DOUBLE_MARGIN_BOTTOM;

// ── Canvas描画とCSSプレビューの位置差を補正する定数 ──────────────────
// CSSはline-heightで文字上下に余白が入る・height:%で画像を縦長divに中央配置する。
// Canvasはtextbaseline="top"で余白なし・top座標に直接配置するためずれて見える。
// 正の値 = 下にずらす。単位: canvas px (1260×1760基準)
//
// 【調整方法】保存画像とプレビューを比較し、ずれたpx数をこの値に加算/減算する。
// iPhoneでずれる場合は IOS_FONT_OFFSET を調整する（負の値=上にずらす）。
const isIOS = typeof navigator !== "undefined" && (
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
);

// LINEの内蔵ブラウザ（WebView）検出。Androidでは <a download> が無効化されるため分岐が必要。
const isLINE = typeof navigator !== "undefined" && /Line\//i.test(navigator.userAgent);
const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

// iOSはChromeと異なるフォントレンダリングのため、テキスト要素が下にずれる。
// この値で補正する（負の値=iOSのADJを減らして上にずらす）
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

async function renderCardToCanvas(card: CardState): Promise<string> {
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

function download(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// data: URL → Blob 変換
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)![1];
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

type ShareResult = { shared: boolean; diag: string };

// Web Share API でファイル共有（Android LINE 向け）。
// ★重要: この関数は最初の await が navigator.share() になるよう同期的に組む。
//   呼び出し側で dataUrl を事前生成しておくことで、タップ由来の transient user activation を
//   消費せずに share() へ到達できる（activation が切れると NotAllowed で沈黙失敗するため）。
// 何が起きたかを診断文字列で返し、実機テスト時に画面へ表示できるようにする。
async function tryWebShare(dataUrl: string, filename: string): Promise<ShareResult> {
  const diag: string[] = [`share:${typeof navigator !== "undefined" ? typeof navigator.share : "no-nav"}`];
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return { shared: false, diag: diag.join(" ") };
  }
  try {
    const file = new File([dataUrlToBlob(dataUrl)], filename, { type: "image/png" });
    // canShare は「関数として存在する場合のみ」判定に使う（LINE WebViewでは未定義のことがある）。
    if (typeof navigator.canShare === "function") {
      const ok = navigator.canShare({ files: [file] });
      diag.push(`canShare(files):${ok}`);
      if (!ok) return { shared: false, diag: diag.join(" ") };
    } else {
      diag.push("canShare:undefined");
    }
    await navigator.share({ files: [file] });
    diag.push("share:ok");
    return { shared: true, diag: diag.join(" ") };
  } catch (e) {
    // AbortError = ユーザーが共有シートをキャンセル → 成功扱い（フォールバック不要）
    if (e instanceof Error && e.name === "AbortError") {
      return { shared: true, diag: [...diag, "share:aborted"].join(" ") };
    }
    const name = e instanceof Error ? e.name : "unknown";
    const msg = e instanceof Error ? e.message : String(e);
    return { shared: false, diag: [...diag, `err:${name}:${msg}`].join(" ") };
  }
}

export default function Step5Save({ card }: Props) {
  const [saving, setSaving] = useState(false);
  const [savingDouble, setSavingDouble] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // iOS Safari は非同期後の link.click() をブロックするためモーダルで画像表示
  const [iosModal, setIosModal] = useState<string | null>(null);
  // 実機（特にAndroid LINE）で何が起きたかを画面に出すための診断文字列
  const [diag, setDiag] = useState<string | null>(null);

  // Android LINE 用に、タップ前に画像を事前レンダリングしておく。
  // こうすることで保存タップ直後に（await を挟まず）navigator.share() を呼べ、
  // transient user activation を維持できる。ref に置くのは同期的に読み出すため。
  const preRenderedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!(isLINE && isAndroid)) return;
    let cancelled = false;
    renderCardToCanvas(card)
      .then((url) => { if (!cancelled) preRenderedRef.current = url; })
      .catch(() => { /* 事前レンダリング失敗時はタップ時に再生成する */ });
    return () => { cancelled = true; };
  }, [card]);

  // モーダルを閉じる。blob URL を確実に revoke する。
  // ※ history.pushState/popstate は LINE WebView + Next.js router でフリーズするため使わない。
  const closeModal = useCallback(() => {
    setIosModal((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  // 保存できなかった時のフォールバック（画像を長押し保存＋外部ブラウザ案内）モーダルを開く
  const openFallbackModal = (dataUrl: string) => {
    setIosModal(URL.createObjectURL(dataUrlToBlob(dataUrl)));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setDiag(null);
    const filename = `token_${formatTimestamp()}.png`;
    try {
      if (isLINE && isAndroid) {
        // 事前レンダリング済みならタップ直後に share() を呼べる（activation維持）
        const dataUrl = preRenderedRef.current ?? await renderCardToCanvas(card);
        const result = await tryWebShare(dataUrl, filename);
        if (!result.shared) {
          openFallbackModal(dataUrl);
          setDiag(result.diag);
        }
      } else if (isIOS) {
        // iOS は data: URL の長押し保存が確実（現行の動作を維持）
        const dataUrl = await renderCardToCanvas(card);
        setIosModal(dataUrl);
      } else {
        const dataUrl = await renderCardToCanvas(card);
        download(dataUrl, filename);
        setMessage("保存しました！");
      }
    } catch (err) {
      console.error(err);
      setMessage("保存に失敗しました。もう一度お試しください。");
      setDiag(err instanceof Error ? `render/save err:${err.name}:${err.message}` : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDouble = async () => {
    setSavingDouble(true);
    setMessage(null);
    setDiag(null);
    try {
      const dataUrl = await renderCardToCanvas(card);
      const img = await loadImage(dataUrl);

      const canvas = document.createElement("canvas");
      canvas.width = DOUBLE_CANVAS_W;
      canvas.height = DOUBLE_CANVAS_H;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, DOUBLE_CANVAS_W, DOUBLE_CANVAS_H);
      ctx.drawImage(img, DOUBLE_MARGIN_LR, DOUBLE_MARGIN_TOP, W, H);
      ctx.drawImage(img, DOUBLE_MARGIN_LR + W, DOUBLE_MARGIN_TOP, W, H);

      const doubleUrl = canvas.toDataURL("image/png");
      const filename = `token_double_${formatTimestamp()}.png`;
      if (isLINE && isAndroid) {
        const result = await tryWebShare(doubleUrl, filename);
        if (!result.shared) {
          openFallbackModal(doubleUrl);
          setDiag(result.diag);
        }
      } else if (isIOS) {
        setIosModal(doubleUrl);
      } else {
        download(doubleUrl, filename);
        setMessage("コンビニプリント（L判写真）で印刷してください。");
      }
    } catch (err) {
      console.error(err);
      setMessage("保存に失敗しました。もう一度お試しください。");
      setDiag(err instanceof Error ? `render/save err:${err.name}:${err.message}` : String(err));
    } finally {
      setSavingDouble(false);
    }
  };

  return (
    <>
      {/* iOS / Android LINE フォールバック用モーダル：長押し保存 or 外部ブラウザ案内 */}
      {iosModal && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center gap-4 p-5 overflow-y-auto"
          onClick={closeModal}
        >
          {isLINE && isAndroid ? (
            <div
              className="text-white text-center space-y-1 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-base font-bold">画像を長押し →「画像を保存」</p>
              <p className="text-sm text-amber-300">
                保存できない場合 → 右上「…」→「他のブラウザで開く」→ もう一度保存ボタン
              </p>
            </div>
          ) : (
            <p className="text-white text-base font-bold text-center">
              画像を長押し →「写真に追加」で保存
            </p>
          )}
          <img
            src={iosModal}
            alt="保存用画像"
            className="max-w-full max-h-[68vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closeModal}
            className="px-8 py-3 bg-white rounded-full text-black font-bold text-sm"
          >
            閉じる
          </button>
          {diag && (
            <p
              className="text-[10px] leading-tight text-gray-400 text-center break-all max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {diag}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-4 py-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">保存を押してもダウンロードされない場合は、画面の指示に従って「画像長押し」で保存してください。</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || savingDouble}
          className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg active:bg-amber-600 disabled:opacity-50"
        >
          {saving ? "保存中..." : "画像として保存"}
        </button>

        <button
          onClick={handleSaveDouble}
          disabled={saving || savingDouble}
          className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg active:bg-blue-600 disabled:opacity-50"
        >
          {savingDouble ? "保存中..." : "コンビニ印刷用Ｗ保存"}
        </button>

        {message && (
          <p className={`text-sm font-medium ${message.includes("失敗") ? "text-red-500" : "text-green-600"}`}>
            {message}
          </p>
        )}

        {/* 診断情報（実機テスト用・通常ユーザーには目立たない小さい灰色文字）。
            モーダル表示時はモーダル内に出すのでここでは重複表示しない。 */}
        {diag && !iosModal && (
          <p className="text-[10px] leading-tight text-gray-400 text-center break-all max-w-full">
            {diag}
          </p>
        )}
      </div>
    </>
  );
}
