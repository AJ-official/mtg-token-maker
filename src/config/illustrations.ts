export type IllustrationConfig = {
  id: string;
  name: string;
  file: string;
  category?: string;
};

export const illustrations: IllustrationConfig[] = [
  { id: "ill_01", name: "イラスト01", file: "/illustrations/ill_01.png", category: "default" },
  { id: "ill_02", name: "イラスト02", file: "/illustrations/ill_02.png", category: "default" },
  { id: "ill_03", name: "イラスト03", file: "/illustrations/ill_03.png", category: "default" },
  { id: "ill_04", name: "イラスト04", file: "/illustrations/ill_04.png", category: "default" },
  { id: "ill_05", name: "イラスト05", file: "/illustrations/ill_05.png", category: "default" },
  { id: "ill_06", name: "イラスト06", file: "/illustrations/ill_06.png", category: "default" },
  { id: "ill_07", name: "イラスト07", file: "/illustrations/ill_07.png", category: "default" },
  { id: "ill_08", name: "イラスト08", file: "/illustrations/ill_08.png", category: "default" },
  { id: "ill_09", name: "イラスト09", file: "/illustrations/ill_09.png", category: "default" },
  { id: "dungeon_01", name: "ファンデルヴァーの失われた鉱山", file: "/illustrations/dungeon_01.png", category: "dungeon" },
  { id: "dungeon_02", name: "魂を喰らう墓",                   file: "/illustrations/dungeon_02.png", category: "dungeon" },
  { id: "dungeon_03", name: "狂える魔道士の迷宮",             file: "/illustrations/dungeon_03.png", category: "dungeon" },
];

export const getIllustrationById = (id: string): IllustrationConfig | undefined =>
  illustrations.find((i) => i.id === id);
