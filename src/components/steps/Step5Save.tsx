"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { formatTimestamp } from "@/lib/utils";

type Props = {
  previewRef: React.RefObject<HTMLDivElement | null>;
};

const OUTPUT_WIDTH = 1260;
const OUTPUT_HEIGHT = 1760;

const DOUBLE_MARGIN_LR = 50;
const DOUBLE_MARGIN_TOP = 65;
const DOUBLE_MARGIN_BOTTOM = 35;
const DOUBLE_CANVAS_W = OUTPUT_WIDTH * 2 + DOUBLE_MARGIN_LR * 2;              // 2620
const DOUBLE_CANVAS_H = OUTPUT_HEIGHT + DOUBLE_MARGIN_TOP + DOUBLE_MARGIN_BOTTOM; // 1860

async function captureCard(el: HTMLDivElement): Promise<string> {
  const ratio = OUTPUT_WIDTH / el.offsetWidth;

  // 1回目: 画像をブラウザキャッシュに読み込む（モバイル対策）
  try { await toPng(el, { pixelRatio: 1 }); } catch (_) {}

  // 2回目: キャッシュ済み画像で本番キャプチャ
  const dataUrl = await toPng(el, { pixelRatio: ratio });

  const img = await loadImage(dataUrl);
  if (img.naturalWidth === OUTPUT_WIDTH && img.naturalHeight === OUTPUT_HEIGHT) {
    return dataUrl;
  }

  // キャプチャサイズが想定と異なる場合、上部余白をトリミングして正確なサイズに揃える
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  const srcY = img.naturalHeight - OUTPUT_HEIGHT;
  ctx.drawImage(img, 0, srcY, OUTPUT_WIDTH, OUTPUT_HEIGHT, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
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

export default function Step5Save({ previewRef }: Props) {
  const [saving, setSaving] = useState(false);
  const [savingDouble, setSavingDouble] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!previewRef.current) return;
    setSaving(true);
    setMessage(null);
    try {
      const dataUrl = await captureCard(previewRef.current);
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
    if (!previewRef.current) return;
    setSavingDouble(true);
    setMessage(null);
    try {
      const dataUrl = await captureCard(previewRef.current);
      const img = await loadImage(dataUrl);

      const canvas = document.createElement("canvas");
      canvas.width = DOUBLE_CANVAS_W;
      canvas.height = DOUBLE_CANVAS_H;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, DOUBLE_CANVAS_W, DOUBLE_CANVAS_H);
      ctx.drawImage(img, DOUBLE_MARGIN_LR, DOUBLE_MARGIN_TOP, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      ctx.drawImage(img, DOUBLE_MARGIN_LR + OUTPUT_WIDTH, DOUBLE_MARGIN_TOP, OUTPUT_WIDTH, OUTPUT_HEIGHT);

      const doubleUrl = canvas.toDataURL("image/png");
      download(doubleUrl, `token_double_${formatTimestamp()}.png`);
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
        <p className="text-xs text-gray-400 mt-1">出力サイズ: {OUTPUT_WIDTH} × {OUTPUT_HEIGHT} px</p>
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
