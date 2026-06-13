# ADR-0003 DB に Turso(libSQL) マネージド（東京・無料枠）を採用。PII は対象外（別管理）

## ステータス: Accepted (2026-06-13)

## 背景
- StudioCMS（ADR-0001）は libSQL をストレージに使用する。CMS コンテンツ（ブログ・お知らせ）の永続化に DB が必要。
- 本番ランタイムは Firebase App Hosting（GCP `cor-jp-web`）＋Astro SSR（ADR-0002）。GCP に密結合しないマネージド libSQL を選定する必要がある。
- Contact 経由の PII（個人情報）は別管理方針（ADR-0005）であり、CMS コンテンツ DB に混在させない。

## 決定
- DB に **Turso(libSQL) マネージド（無料枠・東京リージョン）** を採用する（CMS コンテンツ用）。
- **PII はここに置かない**（Contact の PII は ADR-0005 の段階移行方針に従い、Wave1 は SSGFORM、Wave2 は GCP 集約で国内管理）。
- 接続は `@libsql/client` を使用。ローカルは `file:./local.db`、本番は `libsql:`。
- env 名は StudioCMS 公式に従い確定（`TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` ⇔ StudioCMS 公式 `CMS_LIBSQL_URL`/`CMS_LIBSQL_AUTH_TOKEN` の差異を諫山が公式ドキュメントで確定）。env は Secret Manager 管理。

## 理由
- Turso(libSQL) は東京リージョン・無料枠でマネージド運用でき、Astro DB の自前運用や別 RDBMS の構築より低コスト・低運用負荷。
- StudioCMS が libSQL をネイティブにサポートしており統合が容易（ADR-0001）。
- PII を CMS DB から分離することで、個人情報の保管・越境・安全管理の責任境界を明確化できる（ADR-0007 ガードレール・社内『個人情報保護方針(案)』整合）。

## 影響
- 接続情報（URL／トークン）は Secret Manager／環境変数のみで管理し、リポジトリ・CI ログ・クライアントバンドルに平文露出させない（コミット0）。
- `CMS_ENCRYPTION_KEY` 等の認証シークレットを生成し Secret Manager に登録。バックアップ／リストア手順を確立。
- 初回本番DBマイグレーション（`studiocms migrate` 系）は **手動承認ゲート**を通し、post-merge validation／soak time（migration は1営業日）の対象とする。
- プレビュー環境は本番 Turso を指さず別 DB／レプリカに分離（PII/CMS 保護）。
- 無料枠（DB数/行数/ストレージ/月次同期）が本番想定に収まるかの検証が要（未検証・諫山）。

## 代替案
- **Astro DB**: マネージド東京リージョン・無料枠・StudioCMS 統合の観点で Turso を優先。
- **Cloud SQL（GCP）**: マネージドだが無料枠が無く運用コスト・構築が重いため CMS コンテンツ用途には過剰。
- **PII を同一 DB に同居**: 責任境界・越境判断・安全管理が複雑化し、個人情報保護方針との整合が困難なため却下。

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
