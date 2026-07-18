"use client";

// 保存専用ページ。
// Android LINE内蔵ブラウザでは画像保存が一切できないため、STEP5からカード状態を
// URL（?d=base64url）に載せて intent:// でChrome等の外部ブラウザでこのページを開き、
// ここで同じCanvas描画を行って保存する。LINE側のタブは残るため作成状態は失われない。
// 通常ブラウザで直接開いても動作する（download / iOSは長押しモーダル）。

import React, { useState, useEffect, useCallback } from "react";
import { formatTimestamp } from "@/lib/utils";
import { CardState } from "@/types/card";
import { decodeCardState } from "@/lib/cardCodec";
import {
  renderCardToCanvas,
  renderDoubleFromSingle,
  download,
  isIOS,
} from "@/lib/renderCard";
import { shareToX } from "@/lib/shareX";

export default function SavePage() {
  const [card, setCard] = useState<CardState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingDouble, setSavingDouble] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // iOS は非同期後の link.click() がブロックされるため長押し保存モーダルを表示
  const [iosModal, setIosModal] = useState<string | null>(null);
  const [diag, setDiag] = useState<string | null>(null);

  // URLパラメータからカード状態を復元（ハイドレーション不整合回避のため effect で読む）
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("d");
    if (!param) {
      setError("カードのデータが見つかりませんでした。");
      return;
    }
    const decoded = decodeCardState(param);
    if (!decoded) {
      setError("カードのデータを読み込めませんでした。");
      return;
    }
    setCard(decoded);
  }, []);

  // カード状態が復元できたらプレビュー画像を生成
  useEffect(() => {
    if (!card) return;
    let cancelled = false;
    renderCardToCanvas(card)
      .then((url) => { if (!cancelled) setPreviewUrl(url); })
      .catch((err) => {
        if (!cancelled) {
          setError("カードの描画に失敗しました。");
          setDiag(err instanceof Error ? `render err:${err.name}:${err.message}` : String(err));
        }
      });
    return () => { cancelled = true; };
  }, [card]);

  const closeModal = useCallback(() => setIosModal(null), []);

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);
    setMessage(null);
    setDiag(null);
    try {
      const dataUrl = previewUrl ?? (await renderCardToCanvas(card));
      if (isIOS) {
        setIosModal(dataUrl);
      } else {
        download(dataUrl, `token_${formatTimestamp()}.png`);
        setMessage("保存しました！");
      }
    } catch (err) {
      console.error(err);
      setMessage("保存に失敗しました。もう一度お試しください。");
      setDiag(err instanceof Error ? `save err:${err.name}:${err.message}` : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDouble = async () => {
    if (!card) return;
    setSavingDouble(true);
    setMessage(null);
    setDiag(null);
    try {
      const single = previewUrl ?? (await renderCardToCanvas(card));
      const doubleUrl = await renderDoubleFromSingle(single);
      if (isIOS) {
        setIosModal(doubleUrl);
      } else {
        download(doubleUrl, `token_double_${formatTimestamp()}.png`);
        setMessage("コンビニプリント（L判写真）で印刷してください。");
      }
    } catch (err) {
      console.error(err);
      setMessage("保存に失敗しました。もう一度お試しください。");
      setDiag(err instanceof Error ? `save err:${err.name}:${err.message}` : String(err));
    } finally {
      setSavingDouble(false);
    }
  };

  const handleShareX = async () => {
    if (!card) return;
    setSharing(true);
    setMessage(null);
    setDiag(null);
    try {
      const dataUrl = previewUrl ?? (await renderCardToCanvas(card));
      const result = await shareToX(dataUrl, `token_${formatTimestamp()}.png`);
      if (result === "intent") {
        setMessage("Xの投稿画面を開きました。保存したトークン画像を添付して投稿してください！");
      } else if (result === "shared") {
        setMessage("シェアありがとうございます！🎴");
      }
    } catch (err) {
      console.error(err);
      setMessage("シェアに失敗しました。もう一度お試しください。");
      setDiag(err instanceof Error ? `share err:${err.name}:${err.message}` : String(err));
    } finally {
      setSharing(false);
    }
  };

  // データ不正時のエラー画面
  if (error) {
    return (
      <main className="flex justify-center items-center bg-gray-100 min-h-screen p-6">
        <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 text-center">
          <p className="text-base font-bold text-gray-900">⚠️ {error}</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            アプリでカードを作成し、STEP 5 の保存ボタンからこのページを開いてください。
          </p>
          <a
            href="/"
            className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-base active:bg-amber-600"
          >
            アプリを開く
          </a>
          {diag && (
            <p className="text-[10px] leading-tight text-gray-400 break-all">{diag}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex justify-center bg-gray-100 min-h-screen">
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

      <div className="w-full max-w-[390px] flex flex-col items-center gap-4 p-4">
        <div className="w-full bg-white rounded-2xl shadow-sm p-5 text-center">
          <h1 className="text-base font-bold text-gray-900 mb-1">トークン画像の保存</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            作成したトークンをこのページから保存できます。
          </p>
        </div>

        {previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previewUrl}
            alt="トークンプレビュー"
            className="w-[70%] rounded-xl shadow"
          />
        ) : (
          <div className="w-[70%] aspect-[63/88] rounded-xl bg-gray-200 flex items-center justify-center">
            <p className="text-sm text-gray-500">カードを描画中...</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!previewUrl || saving || savingDouble}
          className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg active:bg-amber-600 disabled:opacity-50"
        >
          {saving ? "保存中..." : "画像として保存"}
        </button>

        <button
          onClick={handleSaveDouble}
          disabled={!previewUrl || saving || savingDouble}
          className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg active:bg-blue-600 disabled:opacity-50"
        >
          {savingDouble ? "保存中..." : "コンビニ印刷用Ｗ保存"}
        </button>

        <button
          onClick={handleShareX}
          disabled={!previewUrl || saving || savingDouble || sharing}
          className="w-full py-4 rounded-2xl bg-black text-white font-bold text-lg active:bg-gray-800 disabled:opacity-50"
        >
          {sharing ? "共有中..." : "𝕏 でシェア"}
        </button>

        {message && (
          <p className={`text-sm font-medium ${message.includes("失敗") ? "text-red-500" : "text-green-600"}`}>
            {message}
          </p>
        )}

        <p className="text-xs text-gray-500 leading-relaxed text-center">
          保存が終わったら、このページを閉じてLINEに戻れます。<br />
          作成中のカードはLINE側に残っています。
        </p>

        {diag && (
          <p className="text-[10px] leading-tight text-gray-400 text-center break-all max-w-full">
            {diag}
          </p>
        )}
      </div>
    </main>
  );
}
