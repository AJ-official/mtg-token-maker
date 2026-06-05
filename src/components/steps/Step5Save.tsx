"use client";

import React, { useState } from "react";
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

const DOUBLE_MARGIN_LR = 50;
const DOUBLE_MARGIN_TOP = 65;
const DOUBLE_MARGIN_BOTTOM = 35;
const DOUBLE_CANVAS_W = W * 2 + DOUBLE_MARGIN_LR * 2;
const DOUBLE_CANVAS_H = H + DOUBLE_MARGIN_TOP + DOUBLE_MARGIN_BOTTOM;

// ── Canvas描画とCSSプレビューの位置差を補正する定数 ──────────────────
// CSSはline-heightで文字上下に余白が入る・height:%で画像を縦長divに中央配置する。
// Canvasはtextbaseline="top"で余白なし・top座標に直接配置するため上にずれて見える。
// 正の値 = 下にずらす（プレビューに合わせる）。単位: canvas px (1260×1760基準)
//
// 【調整方法】保存画像とプレビューを比較し、ずれたpx数をこの値に加算/減算する。
// 例: タイトルがまだ5px上にずれている → titleY を +5 増やす
const ADJ = {
  titleY:   11,  // テキスト line-height補正: 4.5cqw(56.7px) × 0.1 ≈ 5.7px (+5調整)
  manaY:    20,  // 画像 height:8% センタリング補正: (141px - 101px) / 2 ≈ 20px
  typeY:    15,  // テキスト line-height補正: 3.8cqw(47.9px) × 0.1 ≈ 4.8px (+10調整)
  symbolY:  23,  // 画像 height:9% センタリング補正: (159px - 113px) / 2 ≈ 23px
  textboxY: 4,   // テキスト line-height補正: 3.2cqw(40.3px) × 0.1 ≈ 4px
  ptY:      -1,  // テキスト line-height補正: 5.2cqw(65.5px) × 0.1 ≈ 6.5px (-8調整)
  loyaltyY: 7,   // テキスト line-height補正: 5.5cqw(69.3px) × 0.1 ≈ 6.9px
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
  const isCreature = card.cardType === "creature";
  const isPlaneswalker = card.cardType === "planeswalker";

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ダンジョン：イラストのみ全面表示
  if (isDungeon) {
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
      ctx.fillText(card.loyalty || "0", pctW("84.5"), pctH("89") + ADJ.loyaltyY);
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

export default function Step5Save({ card }: Props) {
  const [saving, setSaving] = useState(false);
  const [savingDouble, setSavingDouble] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const dataUrl = await renderCardToCanvas(card);
      download(dataUrl, `token_${formatTimestamp()}.png`);
      setMessage("保存しました！");
    } catch (err) {
      console.error(err);
      setMessage("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDouble = async () => {
    setSavingDouble(true);
    setMessage(null);
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

      download(canvas.toDataURL("image/png"), `token_double_${formatTimestamp()}.png`);
      setMessage("2枚並び画像を保存しました！");
    } catch (err) {
      console.error(err);
      setMessage("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSavingDouble(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">プレビューのカードをPNG画像として保存します。</p>
        <p className="text-xs text-gray-400 mt-1">出力サイズ: {W} × {H} px</p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || savingDouble}
        className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg active:bg-amber-600 disabled:opacity-50"
      >
        {saving ? "保存中..." : "トークンを画像として保存"}
      </button>

      <button
        onClick={handleSaveDouble}
        disabled={saving || savingDouble}
        className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg active:bg-blue-600 disabled:opacity-50"
      >
        {savingDouble ? "保存中..." : "コンビニ印刷用Ｗ保存"}
      </button>
      <p className="text-xs text-gray-400">2枚横並び（余白込み）: {DOUBLE_CANVAS_W} × {DOUBLE_CANVAS_H} px</p>

      {message && (
        <p className={`text-sm font-medium ${message.includes("失敗") ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
