/**
 * テキストが指定幅に収まるよう、フォントサイズを動的に計算する。
 * canvas measureText を使用して文字幅を推定する。
 */
export function calcFitFontSize(
  text: string,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number = 8,
  fontFamily: string = "sans-serif"
): number {
  if (typeof document === "undefined") return maxFontSize;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return maxFontSize;

  let fontSize = maxFontSize;
  while (fontSize > minFontSize) {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const measured = ctx.measureText(text).width;
    if (measured <= maxWidth) break;
    fontSize -= 1;
  }
  return fontSize;
}

/**
 * テキストが指定エリアに収まるよう、フォントサイズを動的に計算する。
 * 行数と行高を考慮する。
 */
export function calcFitTextFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  maxFontSize: number,
  minFontSize: number = 7,
  lineHeightRatio: number = 1.4,
  fontFamily: string = "sans-serif"
): number {
  if (typeof document === "undefined") return maxFontSize;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return maxFontSize;

  const lines = text.split("\n");

  let fontSize = maxFontSize;
  while (fontSize > minFontSize) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const lineHeight = fontSize * lineHeightRatio;
    const totalHeight = lines.length * lineHeight;
    const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (totalHeight <= maxHeight && maxLineWidth <= maxWidth) break;
    fontSize -= 0.5;
  }
  return fontSize;
}

export function formatTimestamp(): string {
  const now = new Date();
  return (
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0")
  );
}
