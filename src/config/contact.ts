// お問い合わせ AI チャットの機能フラグ。
//
// false（既定）: 既存の SSGFORM 問い合わせフォームをそのまま描画する（現状の /contact と完全に同一）。
// true        : AI チャット ウィジェット（ContactChat.astro）を描画する。
//
// バックエンド Worker（workers/contact-chat/, cor-jp.com/api/contact/*）が
// 本番にデプロイ・検証されるまでは必ず false のままにすること。
// 本番切替はこの 1 行を true にするだけ（デプロイ + 動作確認の後に行う）。
export const CONTACT_CHAT_ENABLED = false;

// Cloudia を /contact/ の主導線にする。false に戻すと既存フォームをページ本体へ戻せる。
// Cloudia 自体の停止時に、既存の ContactForm fallback を残したまま切り戻すためのビルド時フラグ。
export const CLOUDIA_CONTACT_PRIMARY_ENABLED =
  import.meta.env.PUBLIC_CLOUDIA_CONTACT_PRIMARY_ENABLED !== 'false';

// CloudiaLauncher は既存フォームを残したまま、Cloudia への入口だけを追加する。
// CONTACT_CHAT_ENABLED（旧ContactChat.astroの置換）とは独立して切り替える。
// 未指定時は有効。無効化する場合は PUBLIC_CLOUDIA_LAUNCHER_ENABLED=false をビルド時に設定する。
export const CLOUDIA_LAUNCHER_ENABLED = import.meta.env.PUBLIC_CLOUDIA_LAUNCHER_ENABLED !== 'false';

// Cloudia iframe から受け取る Grift 公開ポータル URL の許可 origin。
// Preview を追加する場合は、path や query を含まない HTTPS origin をカンマ区切りで指定する。
const DEFAULT_GRIFT_HANDOFF_ORIGIN = 'https://app.griftai.org';

export const CLOUDIA_GRIFT_HANDOFF_MAX_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeAllowedHttpsOrigin(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function getCloudiaGriftHandoffAllowedOrigins(): readonly string[] {
  const configured = (import.meta.env.PUBLIC_GRIFT_HANDOFF_ALLOWED_ORIGINS || '')
    .split(',')
    .map(normalizeAllowedHttpsOrigin)
    .filter((origin: string | null): origin is string => origin !== null);

  return [...new Set([DEFAULT_GRIFT_HANDOFF_ORIGIN, ...configured])];
}

export const CLOUDIA_GRIFT_HANDOFF_ALLOWED_ORIGINS = getCloudiaGriftHandoffAllowedOrigins();
