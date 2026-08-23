export type IllustrationConfig = {
  id: string;
  name: string;
  file: string;
  category?: string;
};

export const illustrations: IllustrationConfig[] = [
  { id: "ill_01", name: "イラスト01", file: "/illustrations/ill_01.webp", category: "default" },
  { id: "ill_02", name: "イラスト02", file: "/illustrations/ill_02.webp", category: "default" },
  { id: "ill_03", name: "イラスト03", file: "/illustrations/ill_03.webp", category: "default" },
  { id: "ill_04", name: "イラスト04", file: "/illustrations/ill_04.webp", category: "default" },
  { id: "ill_05", name: "イラスト05", file: "/illustrations/ill_05.webp", category: "default" },
  { id: "ill_06", name: "イラスト06", file: "/illustrations/ill_06.webp", category: "default" },
  { id: "ill_07", name: "イラスト07", file: "/illustrations/ill_07.webp", category: "default" },
  { id: "ill_08", name: "イラスト08", file: "/illustrations/ill_08.webp", category: "default" },
  { id: "ill_09", name: "イラスト09", file: "/illustrations/ill_09.webp", category: "default" },
  { id: "ill_10", name: "イラスト10", file: "/illustrations/ill_10.webp", category: "default" },
  { id: "ill_11", name: "イラスト11", file: "/illustrations/ill_11.webp", category: "default" },
  { id: "ill_12", name: "イラスト12", file: "/illustrations/ill_12.webp", category: "default" },
  { id: "ill_13", name: "地下街の暴君、エージェイ", file: "/illustrations/ill_13.webp", category: "default" },
  { id: "ill_14", name: "万象を裁く者、にっく", file: "/illustrations/ill_14.webp", category: "default" },
  { id: "ill_15", name: "宝物庫に侵入する者、ドロ坊", file: "/illustrations/ill_15.webp", category: "default" },
  { id: "ill_16", name: "活路を開く者、ミニマーク", file: "/illustrations/ill_16.webp", category: "default" },
  { id: "dungeon_01", name: "ファンデルヴァーの失われた鉱山", file: "/illustrations/dungeon_01.webp", category: "dungeon" },
  { id: "dungeon_02", name: "魂を喰らう墓",                   file: "/illustrations/dungeon_02.webp", category: "dungeon" },
  { id: "dungeon_03", name: "狂える魔道士の迷宮",             file: "/illustrations/dungeon_03.webp", category: "dungeon" },
  { id: "dungeon_04", name: "地下街",                         file: "/illustrations/dungeon_04.webp", category: "dungeon" },
  { id: "counter_01_color", name: "カウンター01カラー",   file: "/illustrations/counter_01_color.webp", category: "counter" },
  { id: "counter_02_color", name: "カウンター02カラー",   file: "/illustrations/counter_02_color.webp", category: "counter" },
  { id: "counter_01_mono",  name: "カウンター01モノクロ", file: "/illustrations/counter_01_mono.webp",  category: "counter" },
  { id: "counter_02_mono",  name: "カウンター02モノクロ", file: "/illustrations/counter_02_mono.webp",  category: "counter" },
];

export const getIllustrationById = (id: string): IllustrationConfig | undefined =>
  illustrations.find((i) => i.id === id);
