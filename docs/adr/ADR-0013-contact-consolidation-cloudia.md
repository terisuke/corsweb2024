# ADR-0013 問い合わせ一極集中（Cloudia UI + contact-chat）

## ステータス: Accepted (2026-07-11)

## 背景
- ADR-0005（Contact 段階移行）・ADR-0012（Cloudia 統合）で、Contact のチャットボット化と Cloudia の org 移管・Cloudflare 化を決定済み。
- Grift LP（griftai）は自前フォームを持たず、全 CTA を `cor-jp.com/contact/?intent=...` へ橋渡しする（griftai ADR-0002 / 本リポ ADR-0010）。
- 各導線の終着点が「corsweb の Contact」であることは事実上決まっていたが、「全問い合わせの受け口は Cloudia + contact-chat のペアである」というグランドデザインは明文化されていなかった。

## 決定

### 一極集中の定義
- Cor.inc に関わる**すべての問い合わせ導線**（corsweb 主 CTA・業種別 LP・Grift LP・ブログ CTA・将来の 050 AI 受付）の終着点を、次の**ペア**に固定する:
  1. **UI**: Cloudia（Cor-Incorporated/cloudia、LINE 風チャット + 8 表情）— corsweb `/contact/` に同一オリジンで埋め込み（#254）
  2. **API**: `workers/contact-chat`（本リポ配下の Cloudflare Worker、`/api/contact/*`）— 問い合わせ処理の正本（#250）
- 「一極集中」の実体は **Worker への集約**であり、UI 実装が何であれ問い合わせデータは contact-chat を必ず経由する。

### fallback フォームの維持（単一障害点の回避）
- SSGFORM ベースの従来フォームは **恒久的に fallback として維持**する（cloudia #19）。
- 発動条件: (a) Cloudia の障害・応答不能時、(b) JavaScript 無効環境、(c) チャット UI が利用困難なユーザー（a11y）。
- fallback からの送信も intent / source を可能な範囲で引き継ぐ。

### 公開順序との整合
- Epic #243 の公開順序「導線の真実性 → 有料入口 → 信頼証拠 → Cloudia → 050 AI 受付 → 背景演出」を維持する。
- Cloudia 本線化（#254）までは従来フォームが主 UI であり、本 ADR は最終状態（グランドデザイン）を定義するものである。

## 影響
- corsweb: #250（contact-chat 構造化 intent フロー）、#254（Cloudia 埋め込み）、#252（計測）
- cloudia: #7（contact-chat 直結）、#8（埋め込み + a11y）、#14（LINE 風 UI）、#19（fallback フォーム）
- griftai: CTA 橋渡し先は変更なし（`/contact/?intent=...` のまま。Contact の中身が Cloudia に変わっても URL 契約は不変）

## 参照
- ADR-0005 / ADR-0010 / ADR-0012 / ADR-0014（intent ルーティング） / ADR-0015（正本配置）
- griftai ADR-0002、cloudia ADR-0001〜0007
