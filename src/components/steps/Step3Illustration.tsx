"use client";

import React from "react";
import Image from "next/image";
import { illustrations } from "@/config/illustrations";

type Props = {
  selected: string;
  cardType: string;
  onSelect: (illustrationId: string) => void;
};

export default function Step3Illustration({ selected, cardType, onSelect }: Props) {
  const filtered = illustrations.filter((i) =>
    cardType === "dungeon" ? i.category === "dungeon" : i.category !== "dungeon"
  );

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 mb-3">イラストを選んでください</p>
      <div className="grid grid-cols-3 gap-2">
        {filtered.map((illust) => (
          <button
            key={illust.id}
            onClick={() => onSelect(illust.id)}
            className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
              selected === illust.id ? "border-amber-500" : "border-gray-200"
            }`}
            style={{ aspectRatio: "1 / 1" }}
          >
            <Image
              src={illust.file}
              alt={illust.name}
              fill
              className="object-contain"
              unoptimized
            />
          </button>
        ))}
      </div>
    </div>
  );
}
