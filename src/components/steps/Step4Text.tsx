"use client";

import React, { useState, useRef, useEffect } from "react";
import { CardState, ManaSlot, MANA_SLOTS } from "@/types/card";
import { manaSymbols, getManaById } from "@/config/mana";

type Props = {
  card: CardState;
  onTitleChange: (v: string) => void;
  onSubtypeChange: (v: string) => void;
  onCardTextChange: (v: string) => void;
  onPowerChange: (v: string) => void;
  onToughnessChange: (v: string) => void;
  onLoyaltyChange: (v: string) => void;
  onShowManaChange: (v: boolean) => void;
  onManaTypesChange: (v: ManaSlot[]) => void;
  onShowSymbolChange: (v: boolean) => void;
};

function ManaDropdown({ value, onChange }: { value: ManaSlot; onChange: (v: ManaSlot) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value !== "none" ? getManaById(value) : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1 border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        {selected
          ? <img src={selected.file} alt={selected.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
          : <span className="w-5 h-5 flex-shrink-0" />
        }
        <span className="flex-1 text-left text-gray-700 truncate">{selected?.name ?? "なし"}</span>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 w-36 mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-56 overflow-y-auto">
          {/* なし */}
          <button
            onClick={() => { onChange("none"); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-amber-50 transition-colors ${value === "none" ? "bg-amber-50 font-medium" : ""}`}
          >
            <span className="w-6 h-6 flex-shrink-0" />
            <span className="text-gray-500">なし</span>
          </button>
          {manaSymbols.map((m) => (
            <button
              key={m.id}
              onClick={() => { onChange(m.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-amber-50 transition-colors ${value === m.id ? "bg-amber-50 font-medium" : ""}`}
            >
              <img src={m.file} alt={m.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
              <span className="text-gray-700">{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Step4Text({
  card,
  onTitleChange,
  onSubtypeChange,
  onCardTextChange,
  onPowerChange,
  onToughnessChange,
  onLoyaltyChange,
  onShowManaChange,
  onManaTypesChange,
  onShowSymbolChange,
}: Props) {
  const isCreature = card.cardType === "creature";
  const isPlaneswalker = card.cardType === "planeswalker";

  const handleManaSlotChange = (index: number, value: ManaSlot) => {
    const next = [...card.manaTypes] as ManaSlot[];
    next[index] = value;
    onManaTypesChange(next);
  };

  return (
    <div className="space-y-4">
      {/* カード名 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">カード名</label>
        <input
          type="text"
          value={card.title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={40}
          placeholder="例：ラノワールのエルフ"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* カードタイプ */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">カードタイプ</label>
        <input
          type="text"
          value={card.subtype}
          onChange={(e) => onSubtypeChange(e.target.value)}
          maxLength={40}
          placeholder="例：クリーチャー ― エルフ・ドルイド"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* カードテキスト */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">カードテキスト</label>
        <textarea
          value={card.cardText}
          onChange={(e) => onCardTextChange(e.target.value)}
          maxLength={300}
          rows={4}
          placeholder="例：T：緑を加える。"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* パワー/タフネス（クリーチャーのみ） */}
      {isCreature && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">パワー / タフネス</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={card.power}
              onChange={(e) => onPowerChange(e.target.value)}
              maxLength={4}
              placeholder="P"
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-gray-500 font-bold">/</span>
            <input
              type="text"
              value={card.toughness}
              onChange={(e) => onToughnessChange(e.target.value)}
              maxLength={4}
              placeholder="T"
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      )}

      {/* 忠誠度（プレインズウォーカーのみ） */}
      {isPlaneswalker && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">忠誠度</label>
          <input
            type="text"
            value={card.loyalty}
            onChange={(e) => onLoyaltyChange(e.target.value)}
            maxLength={4}
            placeholder="0"
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      )}

      {/* シンボル */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">シンボルを表示</label>
          <button
            onClick={() => onShowSymbolChange(!card.showSymbol)}
            className={`relative w-11 h-6 rounded-full transition-colors ${card.showSymbol ? "bg-amber-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${card.showSymbol ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* マナコスト */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">マナコストを表示</label>
          <button
            onClick={() => onShowManaChange(!card.showMana)}
            className={`relative w-11 h-6 rounded-full transition-colors ${card.showMana ? "bg-amber-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${card.showMana ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {card.showMana && (
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: MANA_SLOTS }).map((_, i) => (
              <ManaDropdown
                key={i}
                value={card.manaTypes[i] ?? "none"}
                onChange={(v) => handleManaSlotChange(i, v)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
