"use client";

import React, { useState, useCallback } from "react";
import { formatTimestamp } from "@/lib/utils";
import { CardState } from "@/types/card";
import { encodeCardState } from "@/lib/cardCodec";
import {
  renderCardToCanvas,
  renderDoubleFromSingle,
  download,
  isIOS,
  isLINE,
  isAndroid,
} from "@/lib/renderCard";

type Props = {
  card: CardState;
};

// Android LINEの内蔵ブラウザ（WebView）では画像保存が一切できない
// （navigator.share 不在・<a download> 無効・長押し保存も無効。2026-07-05実機診断で確定）。
// 対策: カード状態をURLに載せて intent:// で外部ブラウザ（Chrome等）の /save ページを開き、
// そちらで再描画・保存する。intent:// でのChrome起動はLINE内から動作することを実機検証済み。
// LINE側のタブはそのまま残るため、作成中のカード状態は失われない。
const isLineAndroid = isLINE && isAndroid;

export default function Step5Save({ card }: Props) {
  const [saving, setSaving] = useState(false);
  const [savingDouble, setSavingDouble] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // iOS Safari は非同期後の link.click() をブロックするためモーダルで画像表示
  const [iosModal, setIosModal] = useState<string | null>(null);
  // 実機で何が起きたかを画面に出すための診断文字列
  const [diag, setDiag] = useState<string | null>(null);
  // intentが握りつぶされた場合の手動フォールバック用URL表示
  const [manualUrl, setManualUrl] = useState<string | null>(null);

  const closeModal = useCallback(() => setIosModal(null), []);

  // /save ページのURL（カード状態をbase64urlで埋め込み）
  const buildSaveUrl = () =>
    `${window.location.origin}/save?d=${encodeCardState(card)}`;

  // 外部ブラウザ（Chrome等）で /save ページを開く。
  // intent:// はAndroidの「アプリで開く」を誘発する（実機検証済みの手法）。
  const openSavePageInBrowser = () => {
    setMessage(null);
    setDiag(null);
    const url = buildSaveUrl();
    const bare = url.replace(/^https?:\/\//, "");
    const scheme = window.location.protocol.replace(":", "");
    window.location.href = `intent://${bare}#Intent;scheme=${scheme};end`;
  };

  // intentでブラウザが開かない場合の手動フォールバック：URLをコピーしてもらう
  const copySaveUrl = async () => {
    setMessage(null);
    setDiag(null);
    const url = buildSaveUrl();
    try {
      await navigator.clipboard.writeText(url);
      setMessage("URLをコピーしました。Chromeなどのブラウザに貼り付けて開いてください。");
      setManualUrl(null);
    } catch (err) {
      // clipboard APIが使えないWebViewでは、URLを表示して手動コピーしてもらう
      setManualUrl(url);
      setDiag(err instanceof Error ? `clipboard err:${err.name}` : String(err));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setDiag(null);
    const filename = `token_${formatTimestamp()}.png`;
    try {
      if (isIOS) {
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
      const doubleUrl = await renderDoubleFromSingle(dataUrl);
      const filename = `token_double_${formatTimestamp()}.png`;
      if (isIOS) {
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

  // ── Android LINE：保存ページを外部ブラウザで開く導線 ──
  if (isLineAndroid) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 leading-relaxed">
            LINEのブラウザでは画像を保存できないため、
            Chromeなどの通常のブラウザで保存ページを開きます。
            作成中のカードはこの画面に残ります。
          </p>
        </div>

        <button
          onClick={openSavePageInBrowser}
          className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg active:bg-amber-600"
        >
          ブラウザを開いて保存
        </button>

        <button
          onClick={copySaveUrl}
          className="w-full py-3 rounded-2xl bg-gray-200 text-gray-700 font-bold text-sm active:bg-gray-300"
        >
          開かない場合：保存ページのURLをコピー
        </button>

        {manualUrl && (
          <div className="w-full">
            <p className="text-xs text-gray-600 mb-1">
              下のURLを長押しで全選択・コピーして、Chromeなどに貼り付けて開いてください。
            </p>
            <textarea
              readOnly
              value={manualUrl}
              onFocus={(e) => e.target.select()}
              className="w-full h-24 text-[10px] text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-2 break-all"
            />
          </div>
        )}

        {message && (
          <p className={`text-sm font-medium ${message.includes("失敗") ? "text-red-500" : "text-green-600"}`}>
            {message}
          </p>
        )}

        {diag && (
          <p className="text-[10px] leading-tight text-gray-400 text-center break-all max-w-full">
            {diag}
          </p>
        )}
      </div>
    );
  }

  // ── 通常ブラウザ・iOS ──
  return (
    <>
      {/* iOS 長押し保存モーダル */}
      {iosModal && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center gap-4 p-5 overflow-y-auto"
          onClick={closeModal}
        >
          <p className="text-white text-base font-bold text-center">
            画像を長押し →「写真に追加」で保存
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
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

        {/* 診断情報（実機テスト用・通常ユーザーには目立たない小さい灰色文字） */}
        {diag && !iosModal && (
          <p className="text-[10px] leading-tight text-gray-400 text-center break-all max-w-full">
            {diag}
          </p>
        )}
      </div>
    </>
  );
}
