// カード状態をURLパラメータへ埋め込むためのエンコード/デコード。
// Android LINE内蔵ブラウザでは画像保存が一切できないため、カード状態をURLに載せて
// 外部ブラウザ（Chrome等）の /save ページへ渡し、そちらで再描画・保存する。
// 形式: JSON → UTF-8 → base64url（+/= をURL安全な -_ に置換、パディング除去）

import { CardState, defaultCardState } from "@/types/card";

export function encodeCardState(card: CardState): string {
  const json = JSON.stringify(card);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCardState(param: string): CardState | null {
  try {
    let b64 = param.replace(/-/g, "+").replace(/_/g, "/");
    b64 += "=".repeat((4 - (b64.length % 4)) % 4);
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof parsed !== "object" || parsed === null) return null;
    // 欠損フィールドは defaultCardState で補完する（将来フィールドが増えても壊れないように）
    const card: CardState = { ...defaultCardState, ...(parsed as Partial<CardState>) };
    if (!Array.isArray(card.manaTypes)) card.manaTypes = [...defaultCardState.manaTypes];
    return card;
  } catch {
    return null;
  }
}
