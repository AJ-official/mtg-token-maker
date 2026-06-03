import { ManaType } from "@/types/card";

export type ManaConfig = {
  id: ManaType;
  name: string;
  file: string;
  color: string; // Tailwind background color for fallback
};

export const manaSymbols: ManaConfig[] = [
  // 単色
  { id: "white", name: "白 (W)",  file: "/mana/mana_white.png", color: "#F9FAF4" },
  { id: "blue",  name: "青 (U)",  file: "/mana/mana_blue.png",  color: "#AAE0FA" },
  { id: "black", name: "黒 (B)",  file: "/mana/mana_black.png", color: "#ADA29A" },
  { id: "red",   name: "赤 (R)",  file: "/mana/mana_red.png",   color: "#F9AA8F" },
  { id: "green", name: "緑 (G)",  file: "/mana/mana_green.png", color: "#9BD3AE" },
  // 数字
  ...([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19] as const).map((n) => ({
    id: String(n) as ManaType,
    name: String(n),
    file: `/mana/mana_${n}.png`,
    color: "#D0D0D0",
  })),
  // X
  { id: "X",   name: "X",    file: "/mana/mana_X.png",   color: "#D0D0D0" },
  // 白系混色・ファイレクシア
  { id: "WP",  name: "白Φ",  file: "/mana/mana_WP.png",  color: "#F9FAF4" },
  { id: "WU",  name: "白青",  file: "/mana/mana_WU.png",  color: "#C8E8F4" },
  { id: "WUP", name: "白青Φ", file: "/mana/mana_WUP.png", color: "#C8E8F4" },
  { id: "WB",  name: "白黒",  file: "/mana/mana_WB.png",  color: "#C8C4C0" },
  { id: "WBP", name: "白黒Φ", file: "/mana/mana_WBP.png", color: "#C8C4C0" },
  // 青系混色・ファイレクシア
  { id: "UP",  name: "青Φ",  file: "/mana/mana_UP.png",  color: "#AAE0FA" },
  { id: "UB",  name: "青黒",  file: "/mana/mana_UB.png",  color: "#A0C0CC" },
  { id: "UBP", name: "青黒Φ", file: "/mana/mana_UBP.png", color: "#A0C0CC" },
  { id: "UR",  name: "青赤",  file: "/mana/mana_UR.png",  color: "#C8C0E8" },
  { id: "URP", name: "青赤Φ", file: "/mana/mana_URP.png", color: "#C8C0E8" },
  // 黒系混色・ファイレクシア
  { id: "BP",  name: "黒Φ",  file: "/mana/mana_BP.png",  color: "#ADA29A" },
  { id: "BR",  name: "黒赤",  file: "/mana/mana_BR.png",  color: "#C8A090" },
  { id: "BRP", name: "黒赤Φ", file: "/mana/mana_BRP.png", color: "#C8A090" },
  { id: "BG",  name: "黒緑",  file: "/mana/mana_BG.png",  color: "#A0B8A0" },
  { id: "BGP", name: "黒緑Φ", file: "/mana/mana_BGP.png", color: "#A0B8A0" },
  // 赤系混色・ファイレクシア
  { id: "RP",  name: "赤Φ",  file: "/mana/mana_RP.png",  color: "#F9AA8F" },
  { id: "RW",  name: "赤白",  file: "/mana/mana_RW.png",  color: "#F8C8A0" },
  { id: "RWP", name: "赤白Φ", file: "/mana/mana_RWP.png", color: "#F8C8A0" },
  { id: "RG",  name: "赤緑",  file: "/mana/mana_RG.png",  color: "#C8C870" },
  { id: "RGP", name: "赤緑Φ", file: "/mana/mana_RGP.png", color: "#C8C870" },
  // 緑系混色・ファイレクシア
  { id: "GP",  name: "緑Φ",  file: "/mana/mana_GP.png",  color: "#9BD3AE" },
  { id: "GU",  name: "緑青",  file: "/mana/mana_GU.png",  color: "#90C8B8" },
  { id: "GUP", name: "緑青Φ", file: "/mana/mana_GUP.png", color: "#90C8B8" },
  { id: "GW",  name: "緑白",  file: "/mana/mana_GW.png",  color: "#C8E8C0" },
  { id: "GWP", name: "緑白Φ", file: "/mana/mana_GWP.png", color: "#C8E8C0" },
  // 氷雪
  { id: "S",   name: "氷雪",  file: "/mana/mana_S.png",   color: "#C8E0F0" },
];

export const getManaById = (id: ManaType): ManaConfig | undefined =>
  manaSymbols.find((m) => m.id === id);
