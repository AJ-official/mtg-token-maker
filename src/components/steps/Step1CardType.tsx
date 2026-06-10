"use client";

import React from "react";
import { CardType } from "@/types/card";

type Props = {
  selected: CardType | "";
  onSelect: (type: CardType) => void;
};

const CARD_TYPES: { id: CardType; label: string; emoji: string }[] = [
  { id: "creature",     label: "クリーチャー",           emoji: "⚔️" },
  { id: "planeswalker", label: "プレインズウォーカー",    emoji: "✨" },
  { id: "enchantment",  label: "エンチャント",            emoji: "🌀" },
  { id: "artifact",     label: "アーティファクト",        emoji: "⚙️" },
  { id: "land",         label: "土地",                   emoji: "🏔️" },
  { id: "emblem",       label: "紋章",                   emoji: "🛡️" },
  { id: "dungeon",      label: "ダンジョン",              emoji: "🗝️" },
  { id: "counter",      label: "カウンター",              emoji: "🎲" },
];

export default function Step1CardType({ selected, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 mb-3">カードの種類を選んでください</p>
      <div className="grid grid-cols-2 gap-2">
        {CARD_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-colors ${
              selected === type.id
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-gray-200 bg-white text-gray-700 active:bg-gray-50"
            }`}
          >
            <span className="text-xl">{type.emoji}</span>
            <span className="text-sm font-medium leading-tight">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
