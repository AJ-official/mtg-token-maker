import { FrameConfig } from "@/types/frame";

const NON_CREATURE_TYPES = ["enchantment", "artifact", "land", "emblem", "battle", "dungeon"];

// 座標はフレーム画像 250×350px のピクセル分析から算出
// タイトルバー: y=15-41 (4.3%-11.7%)
// 種族/テキストエリア: y=233-325 (66.6%-92.9%)
//   └ 種族バー: y=233-260 (66.6%-74.3%)
//   └ テキストボックス: y=260-325 (74.3%-92.9%)
// P/Tボックス(クリーチャーのみ): y=326-333 (93.1%-95.1%) x=193-237 (77.2%-94.8%)
const baseAreas = {
  illustrationArea: { top: "0%", left: "0%", width: "100%", height: "100%" },
  manaArea: { top: "4.05%", left: "85%", size: "8%" },
  titleArea: { top: "5.7%",left: "8%", width: "75%", fontSize: "4.5cqw", fontWeight: "bold" },
  typeArea: { top: "68%", left: "8%", width: "82%", fontSize: "3.8cqw" },
  textboxArea: { top: "75.5%", left: "10%", width: "80%", height: "18%", fontSize: "3.2cqw", lineHeight: "1.4" },
  ptArea: { top: "90%", left: "82.5%", fontSize: "5.2cqw", fontWeight: "bold" },
};

export const frames: FrameConfig[] = [
  // ── 通常フレーム（クリーチャー以外） ──
  { id: "white",     name: "白",   file: "/frames/frame_white.png",     forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "blue",      name: "青",   file: "/frames/frame_blue.png",      forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "black",     name: "黒",   file: "/frames/frame_black.png",     forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "red",       name: "赤",   file: "/frames/frame_red.png",       forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "green",     name: "緑",   file: "/frames/frame_green.png",     forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "colorless", name: "無色", file: "/frames/frame_colorless.png", forCardTypes: NON_CREATURE_TYPES, ...baseAreas },

  // ── プレインズウォーカーフレーム ──
  { id: "white_planeswalker",     name: "白",   file: "/frames/frame_white_planeswalker.png",     forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "blue_planeswalker",      name: "青",   file: "/frames/frame_blue_planeswalker.png",      forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "black_planeswalker",     name: "黒",   file: "/frames/frame_black_planeswalker.png",     forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "red_planeswalker",       name: "赤",   file: "/frames/frame_red_planeswalker.png",       forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "green_planeswalker",     name: "緑",   file: "/frames/frame_green_planeswalker.png",     forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "colorless_planeswalker", name: "無色", file: "/frames/frame_colorless_planeswalker.png", forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },

  // ── クリーチャーフレーム ──
  { id: "white_creature",     name: "白",   file: "/frames/frame_white_creature.png",     forCardTypes: ["creature"], ...baseAreas },
  { id: "blue_creature",      name: "青",   file: "/frames/frame_blue_creature.png",      forCardTypes: ["creature"], ...baseAreas },
  { id: "black_creature",     name: "黒",   file: "/frames/frame_black_creature.png",     forCardTypes: ["creature"], ...baseAreas },
  { id: "red_creature",       name: "赤",   file: "/frames/frame_red_creature.png",       forCardTypes: ["creature"], ...baseAreas },
  { id: "green_creature",     name: "緑",   file: "/frames/frame_green_creature.png",     forCardTypes: ["creature"], ...baseAreas },
  { id: "colorless_creature", name: "無色", file: "/frames/frame_colorless_creature.png", forCardTypes: ["creature"], ...baseAreas },

  // ── 多色 通常フレーム ──
  { id: "black_red",    name: "黒赤", file: "/frames/frame_black_red.png",    forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "black_green",  name: "黒緑", file: "/frames/frame_black_green.png",  forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "blue_black",   name: "青黒", file: "/frames/frame_blue_black.png",   forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "blue_red",     name: "青赤", file: "/frames/frame_blue_red.png",     forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "red_white",    name: "赤白", file: "/frames/frame_red_white.png",    forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "red_green",    name: "赤緑", file: "/frames/frame_red_green.png",    forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "multicolor",   name: "多色", file: "/frames/frame_multicolor.png",   forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "white_black",  name: "白黒", file: "/frames/frame_white_black.png",  forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "white_blue",   name: "白青", file: "/frames/frame_white_blue.png",   forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "green_blue",   name: "緑青", file: "/frames/frame_green_blue.png",   forCardTypes: NON_CREATURE_TYPES, ...baseAreas },
  { id: "green_white",  name: "緑白", file: "/frames/frame_green_white.png",  forCardTypes: NON_CREATURE_TYPES, ...baseAreas },

  // ── 多色 プレインズウォーカーフレーム ──
  { id: "black_red_planeswalker",   name: "黒赤", file: "/frames/frame_black_red_planeswalker.png",   forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "black_green_planeswalker", name: "黒緑", file: "/frames/frame_black_green_planeswalker.png", forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "blue_black_planeswalker",  name: "青黒", file: "/frames/frame_blue_black_planeswalker.png",  forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "blue_red_planeswalker",    name: "青赤", file: "/frames/frame_blue_red_planeswalker.png",    forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "red_white_planeswalker",   name: "赤白", file: "/frames/frame_red_white_planeswalker.png",   forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "red_green_planeswalker",   name: "赤緑", file: "/frames/frame_red_green_planeswalker.png",   forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "multicolor_planeswalker",  name: "多色", file: "/frames/frame_multicolor_planeswalker.png",  forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "white_black_planeswalker", name: "白黒", file: "/frames/frame_white_black_planeswalker.png", forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "white_blue_planeswalker",  name: "白青", file: "/frames/frame_white_blue_planeswalker.png",  forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "green_blue_planeswalker",  name: "緑青", file: "/frames/frame_green_blue_planeswalker.png",  forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },
  { id: "green_white_planeswalker", name: "緑白", file: "/frames/frame_green_white_planeswalker.png", forCardTypes: ["planeswalker"], ...baseAreas, loyaltyArea: { top: "89%", left: "84.5%", fontSize: "5.5cqw", fontWeight: "bold" } },

  // ── 多色 クリーチャーフレーム ──
  { id: "black_red_creature",   name: "黒赤", file: "/frames/frame_black_red_creature.png",   forCardTypes: ["creature"], ...baseAreas },
  { id: "black_green_creature", name: "黒緑", file: "/frames/frame_black_green_creature.png", forCardTypes: ["creature"], ...baseAreas },
  { id: "blue_black_creature",  name: "青黒", file: "/frames/frame_blue_black_creature.png",  forCardTypes: ["creature"], ...baseAreas },
  { id: "blue_red_creature",    name: "青赤", file: "/frames/frame_blue_red_creature.png",    forCardTypes: ["creature"], ...baseAreas },
  { id: "red_white_creature",   name: "赤白", file: "/frames/frame_red_white_creature.png",   forCardTypes: ["creature"], ...baseAreas },
  { id: "red_green_creature",   name: "赤緑", file: "/frames/frame_red_green_creature.png",   forCardTypes: ["creature"], ...baseAreas },
  { id: "multicolor_creature",  name: "多色", file: "/frames/frame_multicolor_creature.png",  forCardTypes: ["creature"], ...baseAreas },
  { id: "white_black_creature", name: "白黒", file: "/frames/frame_white_black_creature.png", forCardTypes: ["creature"], ...baseAreas },
  { id: "white_blue_creature",  name: "白青", file: "/frames/frame_white_blue_creature.png",  forCardTypes: ["creature"], ...baseAreas },
  { id: "green_blue_creature",  name: "緑青", file: "/frames/frame_green_blue_creature.png",  forCardTypes: ["creature"], ...baseAreas },
  { id: "green_white_creature", name: "緑白", file: "/frames/frame_green_white_creature.png", forCardTypes: ["creature"], ...baseAreas },
];

export const getFrameById = (id: string): FrameConfig | undefined =>
  frames.find((f) => f.id === id);

export const getFramesByCardType = (cardType: string): FrameConfig[] =>
  frames.filter((f) => !f.forCardTypes || f.forCardTypes.includes(cardType));
