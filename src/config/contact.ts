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
// 本番は既定 origin のみ。Preview 追加時は PUBLIC_SITE_ENV=preview を明示したうえで、
// path や query を含まない HTTPS origin をカンマ区切りで指定する。
const DEFAULT_GRIFT_HANDOFF_ORIGIN = 'https://app.griftai.org';

// Browserへ渡す一回限りのexchange codeは、case/share-linkの寿命とは別に最大5分。
export const CLOUDIA_GRIFT_HANDOFF_MAX_TTL_MS = 5 * 60 * 1000;

function normalizeAllowedHttpsOrigin(value: string): string | null {
  try {
    const candidate = value.trim();
    const url = new URL(candidate);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      candidate.includes('*') ||
      candidate !== url.origin
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function getCloudiaGriftHandoffAllowedOrigins(): readonly string[] {
  if ((import.meta.env.PUBLIC_SITE_ENV || '').toLowerCase() !== 'preview') {
    return [DEFAULT_GRIFT_HANDOFF_ORIGIN];
  }

  const configured = (import.meta.env.PUBLIC_GRIFT_HANDOFF_ALLOWED_ORIGINS || '')
    .split(',')
    .map(normalizeAllowedHttpsOrigin)
    .filter((origin: string | null): origin is string => origin !== null);

  return [...new Set([DEFAULT_GRIFT_HANDOFF_ORIGIN, ...configured])];
}

export const CLOUDIA_GRIFT_HANDOFF_ALLOWED_ORIGINS = getCloudiaGriftHandoffAllowedOrigins();
