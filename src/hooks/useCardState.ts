"use client";

import { useState, useCallback } from "react";
import { CardState, defaultCardState, ManaSlot, CardType } from "@/types/card";

export function useCardState() {
  const [card, setCard] = useState<CardState>(defaultCardState);

  const setCardType = useCallback((cardType: CardType | "") => {
    setCard((prev) => ({ ...prev, cardType }));
  }, []);

  const setFrameId = useCallback((frameId: string) => {
    setCard((prev) => ({ ...prev, frameId }));
  }, []);

  const setIllustrationId = useCallback((illustrationId: string) => {
    setCard((prev) => ({ ...prev, illustrationId }));
  }, []);

  const setTitle = useCallback((title: string) => {
    setCard((prev) => ({ ...prev, title }));
  }, []);

  const setSubtype = useCallback((subtype: string) => {
    setCard((prev) => ({ ...prev, subtype }));
  }, []);

  const setCardText = useCallback((cardText: string) => {
    setCard((prev) => ({ ...prev, cardText }));
  }, []);

  const setPower = useCallback((power: string) => {
    setCard((prev) => ({ ...prev, power }));
  }, []);

  const setToughness = useCallback((toughness: string) => {
    setCard((prev) => ({ ...prev, toughness }));
  }, []);

  const setLoyalty = useCallback((loyalty: string) => {
    setCard((prev) => ({ ...prev, loyalty }));
  }, []);

  const setShowMana = useCallback((showMana: boolean) => {
    setCard((prev) => ({ ...prev, showMana }));
  }, []);

  const setManaTypes = useCallback((manaTypes: ManaSlot[]) => {
    setCard((prev) => ({ ...prev, manaTypes }));
  }, []);

  const setShowSymbol = useCallback((showSymbol: boolean) => {
    setCard((prev) => ({ ...prev, showSymbol }));
  }, []);

  return {
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
  };
}
