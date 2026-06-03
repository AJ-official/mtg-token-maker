"use client";

import React from "react";
import Image from "next/image";
import { getFramesByCardType } from "@/config/frames";

type Props = {
  selected: string;
  cardType: string;
  onSelect: (frameId: string) => void;
};

const MULTICOLOR_IDS = new Set([
  "black_red", "black_green", "blue_black", "blue_red",
  "red_white", "red_green", "multicolor",
  "white_black", "white_blue", "green_blue", "green_white",
]);

const isMulticolor = (id: string) =>
  MULTICOLOR_IDS.has(id.replace(/_creature$|_planeswalker$/, ""));

export default function Step2Frame({ selected, cardType, onSelect }: Props) {
  const all = getFramesByCardType(cardType);
  const availableFrames = [
    ...all.filter((f) => !isMulticolor(f.id)),
    ...all.filter((f) => isMulticolor(f.id)),
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 mb-3">フレームを選んでください</p>
      <div className="grid grid-cols-3 gap-2">
        {availableFrames.map((frame) => (
          <button
            key={frame.id}
            onClick={() => onSelect(frame.id)}
            className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
              selected === frame.id ? "border-amber-500" : "border-gray-200"
            }`}
            style={{ aspectRatio: "5 / 7" }}
          >
            <Image
              src={frame.file}
              alt={frame.name}
              fill
              className="object-fill"
              unoptimized
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs text-center py-1">
              {frame.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
