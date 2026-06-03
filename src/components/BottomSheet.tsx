"use client";

import React from "react";

type Props = {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  children: React.ReactNode;
};

const STEP_LABELS = ["カード種類", "フレーム", "イラスト", "テキスト", "保存"];

export default function BottomSheet({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  children,
}: Props) {
  return (
    <div className="flex flex-col bg-white rounded-t-2xl shadow-lg overflow-hidden">
      {/* ステップヘッダー */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">
            STEP {currentStep}/{totalSteps}
          </span>
          <span className="text-sm font-bold text-gray-800">
            {STEP_LABELS[currentStep - 1]}
          </span>
        </div>

        {/* プログレスバー */}
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < currentStep ? "bg-amber-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">{children}</div>

      {/* ナビゲーションボタン */}
      <div className="flex gap-3 px-4 pb-6 pt-3 border-t border-gray-100">
        <button
          onClick={onPrev}
          disabled={currentStep === 1}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium disabled:opacity-30 active:bg-gray-100"
        >
          戻る
        </button>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps}
          className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold disabled:opacity-30 active:bg-amber-600"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
