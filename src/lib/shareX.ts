// 「Xでシェア」機能。
// Xの投稿Intent（x.com/intent/post）は仕様上、画像を自動添付できない。そのため2段構え：
// ① Web Share API（navigator.share + files）対応環境（iOS Safari / Android Chrome 等）
//    → トークン画像＋クレジット文面を共有シートへ直接渡す（Xアプリなら画像添付済みで開く）
// ② 非対応環境（主にPCブラウザ）
//    → 文面入りのX投稿画面を新規タブで開き、画像は保存済みのものを添付してもらう
//    （呼び出し側で案内メッセージを表示する）

export const SHARE_TEXT = `「エージェイのトークン屋さん」でオリジナルトークンを作りました🎴

イラスト: A.J.さん (@JanadoNovel)
https://aj-tokenmaker.vercel.app/

#エージェイのトークン屋さん #MTG #トークン`;

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/data:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

// 文面プリセット入りのX投稿画面を新規タブで開く（画像は手動添付）
export function openXIntent(): void {
  const url = `https://x.com/intent/post?text=${encodeURIComponent(SHARE_TEXT)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export type ShareResult = "shared" | "intent" | "cancelled";

// トークン画像をXへシェアする。
// 戻り値: "shared"=共有シート経由で共有 / "intent"=X投稿画面を開いた（画像は手動添付）
//         / "cancelled"=ユーザーが共有シートを閉じた
export async function shareToX(
  dataUrl: string,
  filename: string
): Promise<ShareResult> {
  const file = dataUrlToFile(dataUrl, filename);
  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: SHARE_TEXT });
      return "shared";
    } catch (err) {
      // ユーザーが共有シートを閉じただけの場合は何もしない
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      // それ以外の失敗はintentへフォールバック
    }
  }
  openXIntent();
  return "intent";
}
