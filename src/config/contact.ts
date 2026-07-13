// お問い合わせ AI チャットの機能フラグ。
//
// false（既定）: 既存の SSGFORM 問い合わせフォームをそのまま描画する（現状の /contact と完全に同一）。
// true        : AI チャット ウィジェット（ContactChat.astro）を描画する。
//
// バックエンド Worker（workers/contact-chat/, cor-jp.com/api/contact/*）が
// 本番にデプロイ・検証されるまでは必ず false のままにすること。
// 本番切替はこの 1 行を true にするだけ（デプロイ + 動作確認の後に行う）。
export const CONTACT_CHAT_ENABLED = false;

// CloudiaLauncher は既存フォームを残したまま、Cloudia への入口だけを追加する。
// CONTACT_CHAT_ENABLED（旧ContactChat.astroの置換）とは独立して切り替える。
// 未指定時は有効。無効化する場合は PUBLIC_CLOUDIA_LAUNCHER_ENABLED=false をビルド時に設定する。
export const CLOUDIA_LAUNCHER_ENABLED =
  import.meta.env.PUBLIC_CLOUDIA_LAUNCHER_ENABLED !== 'false';
