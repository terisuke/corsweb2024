// お問い合わせ AI チャット ウィジェットの機能フラグ。
//
// false（既定）: 既存の SSGFORM 問い合わせフォームをそのまま描画する（現状の /contact と完全に同一）。
// true        : AI チャット ウィジェット（ContactChat.astro）を描画する。
//
// バックエンド Worker（workers/contact-chat/, cor-jp.com/api/contact/*）が
// 本番にデプロイ・検証されるまでは必ず false のままにすること。
// 本番切替はこの 1 行を true にするだけ（デプロイ + 動作確認の後に行う）。
export const CONTACT_CHAT_ENABLED = false;
