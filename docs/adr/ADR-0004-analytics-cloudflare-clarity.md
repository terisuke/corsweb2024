# ADR-0004 計測を Cloudflare Web Analytics＋Microsoft Clarity（cookieless優先・Clarity は PP 明記）

## ステータス: Accepted (2026-06-13) / **改訂 2026-07-10**（リードファネルイベントを追加）

## 背景
- 現状アナリティクスは未実装または部分実装（gtag/GTM 前提の残骸に注意）。
- HP刷新でアクセス解析・行動分析の計測基盤を導入する必要がある。
- 2026-07-10 監査により、pageview より **相談ファネル**（関心 → 相談開始 → 適合 → 商談 → 売上）を測る必要があると確定。

## 決定
- 計測を **Cloudflare Web Analytics（cookieless）をベース**に導入する。
- 加えて **Microsoft Clarity（行動分析）を導入**する。
- Clarity は cookie＋セッション記録のため、**プライバシーポリシーに Clarity（Microsoft・米国越境）を第三者ツールとして明記**し、同意の要否を検討する。
- measurement ID 等は `PUBLIC_` 環境変数で管理（ハードコード禁止）。
- CTA / Cloudia は **明示的イベント**で計測する（下記ファネル）。

### ファネル KPI

| 段階 | KPI |
|---|---|
| 関心 | サービス詳細到達、実績閲覧、セキュリティ閲覧 |
| 相談開始 | Cloudia 開始率、電話開始、CTA 別開始率 |
| 適合 | 診断 / PoC / Grift 別の適合リード数 |
| 商談 | 有効面談、診断提案、PoC 提案、Team Beta 提案 |
| 売上 | パイプライン金額、契約額、入口→PoC 転換率（オフライン連携可） |

### イベント名（正本）

| イベント | 発火タイミング | 主な properties |
|---|---|---|
| `cta_click` | 主/副 CTA クリック | `intent`, `source`, `page`, `label` |
| `cloudia_start` | Cloudia / contact-chat 開始 | `intent`, `source`, `page` |
| `cloudia_intent_selected` | 初期選択肢確定 | `intent` |
| `cloudia_completed` | 要約確認後の送信成功 | `intent`, `classification` |
| `lead_qualified` | 人手 or ルールで適合判定 | `intent`, `segment` |
| `meeting_booked` | 日程確定 | `intent`, `channel` |
| `phone_ai_completed` | 050 AI 受付完了（将来） | `intent` |
| `human_transfer_success` | 有人転送成功（将来） | `intent` |

Grift 外部 CTA は遷移離脱前に `sendBeacon` / `transport: beacon` で送信する。

## 理由
- Cloudflare Web Analytics は cookieless で同意負荷が低い。
- Clarity は行動分析を補完するが越境・cookie を伴うため二層構成とする。
- 監査の改善サイクルは「どの CTA・intent が商談化したか」に依存するため、イベント名を ADR で固定する。

## 影響
- 実装 Issue で analytics ユーティリティに上記イベントを定義し、Cor / Grift / Cloudia で同名を使う。
- PP と同意導線（ADR-0005）と整合させる。

## 代替案
- **GA4 をベース**: Consent Mode 負荷が高く、cookieless 優先と相反するためベースには採らない。
- **イベント未定義のまま pageview のみ**: 公開後のコピー改善ができないため却下。

## 参照
- 監査資料 §11 計測設計
- ADR-0010（CTA intent / source）
