export type CardType =
  | "creature"
  | "planeswalker"
  | "enchantment"
  | "artifact"
  | "land"
  | "emblem"
  | "dungeon";

export type ManaType =
  | "white" | "blue" | "black" | "red" | "green"
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19"
  | "X"
  | "BP" | "BR" | "BRP" | "BG" | "BGP"
  | "UP" | "UB" | "UBP" | "UR" | "URP"
  | "RP" | "RW" | "RWP" | "RG" | "RGP"
  | "WP" | "WB" | "WBP" | "WU" | "WUP"
  | "S"
  | "GP" | "GU" | "GUP" | "GW" | "GWP";

export type ManaSlot = ManaType | "none";

export const MANA_SLOTS = 6;

export type CardState = {
  cardType: CardType | "";
  illustrationId: string;
  frameId: string;
  title: string;
  subtype: string;
  cardText: string;
  power: string;
  toughness: string;
  loyalty: string;
  showMana: boolean;
  manaTypes: ManaSlot[];
  showSymbol: boolean;
};

export const defaultCardState: CardState = {
  cardType: "",
  illustrationId: "",
  frameId: "",
  title: "",
  subtype: "",
  cardText: "",
  power: "",
  toughness: "",
  loyalty: "",
  showMana: false,
  manaTypes: ["none", "none", "none", "none", "none", "none"],
  showSymbol: false,
};
