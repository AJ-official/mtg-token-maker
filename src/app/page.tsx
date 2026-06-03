"use client";

import React, { useRef, useState } from "react";
import CardPreview from "@/components/CardPreview";
import BottomSheet from "@/components/BottomSheet";
import Step1CardType from "@/components/steps/Step1CardType";
import Step2Frame from "@/components/steps/Step2Frame";
import Step3Illustration from "@/components/steps/Step3Illustration";
import Step4Text from "@/components/steps/Step4Text";
import Step5Save from "@/components/steps/Step5Save";
import { useCardState } from "@/hooks/useCardState";
import { CardType, ManaSlot } from "@/types/card";

const TOTAL_STEPS = 5;

export default function Home() {
  const [step, setStep] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const {
    card,
    setCardType,
    setFrameId,
    setIllustrationId,
    setTitle,
    setSubtype,
    setCardText,
    setPower,
    setToughness,
    setLoyalty,
    setShowMana,
    setManaTypes,
    setShowSymbol,
  } = useCardState();

  const DUNGEON_SKIP = [2, 4];

  const handleNext = () => {
    setStep((s) => {
      let next = s + 1;
      if (card.cardType === "dungeon") {
        while (DUNGEON_SKIP.includes(next) && next <= TOTAL_STEPS) next++;
      }
      return Math.min(TOTAL_STEPS, next);
    });
  };

  const handlePrev = () => {
    setStep((s) => {
      let prev = s - 1;
      if (card.cardType === "dungeon") {
        while (DUNGEON_SKIP.includes(prev) && prev >= 1) prev--;
      }
      return Math.max(1, prev);
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1CardType
            selected={card.cardType}
            onSelect={(type: CardType) => {
              setCardType(type);
              setStep((s) => {
                let next = s + 1;
                if (type === "dungeon") {
                  while (DUNGEON_SKIP.includes(next) && next <= TOTAL_STEPS) next++;
                }
                return Math.min(TOTAL_STEPS, next);
              });
            }}
          />
        );
      case 2:
        return (
          <Step2Frame
            selected={card.frameId}
            cardType={card.cardType}
            onSelect={(id) => setFrameId(id)}
          />
        );
      case 3:
        return (
          <Step3Illustration
            selected={card.illustrationId}
            cardType={card.cardType}
            onSelect={(id) => setIllustrationId(id)}
          />
        );
      case 4:
        return (
          <Step4Text
            card={card}
            onTitleChange={setTitle}
            onSubtypeChange={setSubtype}
            onCardTextChange={setCardText}
            onPowerChange={setPower}
            onToughnessChange={setToughness}
            onLoyaltyChange={setLoyalty}
            onShowManaChange={setShowMana}
            onManaTypesChange={(v: ManaSlot[]) => setManaTypes(v)}
            onShowSymbolChange={setShowSymbol}
          />
        );
      case 5:
        return <Step5Save previewRef={previewRef} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-[390px] flex flex-col min-h-screen">
        {/* カードプレビュー（固定） */}
        <div className="p-3 flex-shrink-0">
          <CardPreview card={card} previewRef={previewRef} />
        </div>

        {/* ボトムシート */}
        <div className="flex-1 flex flex-col">
          <BottomSheet
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            onPrev={handlePrev}
            onNext={handleNext}
          >
            {renderStep()}
          </BottomSheet>
        </div>
      </div>
    </main>
  );
}
