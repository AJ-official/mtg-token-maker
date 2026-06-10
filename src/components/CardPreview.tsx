"use client";

import React from "react";
import Image from "next/image";
import { CardState, ManaType, MANA_SLOTS } from "@/types/card";
import { getFrameById } from "@/config/frames";
import { getIllustrationById } from "@/config/illustrations";
import { getManaById } from "@/config/mana";

type Props = {
  card: CardState;
  previewRef?: React.RefObject<HTMLDivElement | null>;
};

export default function CardPreview({ card, previewRef }: Props) {
  const frame = getFrameById(card.frameId);
  const illustration = getIllustrationById(card.illustrationId);
  const activeManas = Array.from({ length: MANA_SLOTS })
    .map((_, i) => card.manaTypes[i] ?? "none")
    .filter((s): s is ManaType => s !== "none")
    .map((s) => getManaById(s))
    .filter(Boolean);

  const isCreature = card.cardType === "creature";
  const isPlaneswalker = card.cardType === "planeswalker";
  const isDungeon = card.cardType === "dungeon";
  const isCounter = card.cardType === "counter";

  // ダンジョン・カウンターはイラスト全体をカードとして表示
  if (isDungeon || isCounter) {
    return (
      <div
        ref={previewRef}
        className="relative w-full bg-gray-200 overflow-hidden"
        style={{ aspectRatio: "5 / 7", containerType: "inline-size" }}
      >
        {illustration ? (
          <Image
            src={illustration.file}
            alt={illustration.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            イラストを選択してください
          </div>
        )}
      </div>
    );
  }

  return (
    // MTGカード比率: 2.5:3.5 = 5:7
    <div
      ref={previewRef}
      className="relative w-full bg-gray-200 overflow-hidden"
      style={{ aspectRatio: "5 / 7", containerType: "inline-size" }}
    >
      {/* イラスト層 */}
      {frame && illustration && (
        <div
          className="absolute"
          style={{
            top: frame.illustrationArea.top,
            left: frame.illustrationArea.left,
            width: frame.illustrationArea.width,
            height: frame.illustrationArea.height,
          }}
        >
          <Image
            src={illustration.file}
            alt={illustration.name}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      {/* フレーム層 */}
      {frame ? (
        <Image
          src={frame.file}
          alt={frame.name}
          fill
          className="object-fill"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          フレームを選択してください
        </div>
      )}

      {/* マナシンボル層（最大6個、右端から左方向に絶対配置） */}
      {frame && card.showMana && activeManas.map((m, i) => {
        const reverseIndex = activeManas.length - 1 - i;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: frame.manaArea.top,
              right: `calc(6% + ${reverseIndex} * 6%)`,
              width: frame.manaArea.size,
              height: frame.manaArea.size,
            }}
          >
            <Image src={m!.file} alt={m!.name} fill className="object-contain" unoptimized />
          </div>
        );
      })}

      {/* テキスト層 */}
      {frame && (
        <>
          {/* カード名 */}
          <div
            className="absolute truncate font-bold text-black"
            style={{
              top: frame.titleArea.top,
              left: frame.titleArea.left,
              width: frame.titleArea.width,
              fontSize: frame.titleArea.fontSize,
              fontWeight: frame.titleArea.fontWeight,
            }}
          >
            {card.title || "カード名"}
          </div>

          {/* 種族/種類名 */}
          <div
            className="absolute truncate text-black"
            style={{
              top: frame.typeArea.top,
              left: frame.typeArea.left,
              width: frame.typeArea.width,
              fontSize: frame.typeArea.fontSize,
            }}
          >
            {card.subtype || "カードタイプ"}
          </div>

          {/* シンボル */}
          {card.showSymbol && (
            <div
              className="absolute"
              style={{
                top: "65.7%",
                right: "6.7%",
                width: "9%",
                height: "9%",
              }}
            >
              <Image src="/symbol/symbol.png" alt="symbol" fill className="object-contain" unoptimized />
            </div>
          )}

          {/* カードテキスト */}
          <div
            className="absolute overflow-hidden text-black"
            style={{
              top: frame.textboxArea.top,
              left: frame.textboxArea.left,
              width: frame.textboxArea.width,
              height: frame.textboxArea.height,
              fontSize: frame.textboxArea.fontSize,
              lineHeight: frame.textboxArea.lineHeight,
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <p className="w-full whitespace-pre-wrap text-left">{card.cardText}</p>
          </div>

          {/* P/T（クリーチャーのみ） */}
          {isCreature && frame.ptArea && (
            <div
              className="absolute flex items-center font-bold text-black"
              style={{
                top: frame.ptArea.top,
                left: "77%",
                right: "4.7%",
                fontSize: frame.ptArea.fontSize,
                fontWeight: frame.ptArea.fontWeight,
                lineHeight: 1,
              }}
            >
              <span className="flex-1 text-right">{card.power || "0"}</span>
              <span className="flex-none px-px">/</span>
              <span className="flex-1 text-left">{card.toughness || "0"}</span>
            </div>
          )}

          {/* 忠誠度（プレインズウォーカーのみ） */}
          {isPlaneswalker && frame.loyaltyArea && (
            <div
              className="absolute font-bold text-white text-center"
              style={{
                top: frame.loyaltyArea.top,
                left: "80%",
                width: "12%",
                fontSize: frame.loyaltyArea.fontSize,
                fontWeight: frame.loyaltyArea.fontWeight,
              }}
            >
              {card.loyalty || "0"}
            </div>
          )}
        </>
      )}
    </div>
  );
}
