# Architecture Decision Records (ADR)

`cor-jp.com`（`Cor-Incorporated/corsweb2024`）HP刷新（C案）に関するアーキテクチャ決定の記録。

各 ADR は「背景／決定／理由／影響／代替案」を記す標準フォーマット。決定の正本は社内文書 `00.7_意思決定ログ` / `00.8_実装計画＆役割分担＆Issue・ADR設計`（いずれも 2026-06-13）。諫山が必要に応じて改訂・追加する。

## 一覧

| ADR | タイトル | ステータス |
|---|---|---|
| [ADR-0001](./ADR-0001-cms-studiocms.md) | CMS に StudioCMS（Astroネイティブ・SSR・libSQL）を採用 | Accepted (2026-06-13) |
| [ADR-0002](./ADR-0002-hosting-firebase-app-hosting.md) | ホスティングを Firebase App Hosting（cor-jp-web）＋Astro SSR に移行（静的SSGから） | Accepted (2026-06-13) |
| [ADR-0003](./ADR-0003-db-turso-libsql.md) | DB に Turso(libSQL) マネージド（東京・無料枠）を採用。PII は対象外（別管理） | Accepted (2026-06-13) |
| [ADR-0004](./ADR-0004-analytics-cloudflare-clarity.md) | 計測を Cloudflare Web Analytics＋Microsoft Clarity（cookieless優先・Clarity は PP 明記） | Accepted (2026-06-13) |
| [ADR-0005](./ADR-0005-contact-phased-migration.md) | Contact を段階移行（Phase1 SSGFORM 継続＋PP明記/同意、Phase2 自社チャットボット・GCP集約・LLM非依存） | Accepted (2026-06-13) |
| [ADR-0006](./ADR-0006-i18n-single-source.md) | i18n source of truth を `src/utils/i18n.ts` に一本化（`*.json` 廃止） | Accepted (2026-06-13) |
| [ADR-0007](./ADR-0007-external-expression-guardrails.md) | 対外表現ガードレール（ISMS「整備中」・Pマーク/SCS不採用・旧事業撤去・社名「Cor.株式会社」統一） | Accepted (2026-06-13) |

## フェーズ対応

- **Phase1（バックエンド土台＋公開前ガードレール）**: ADR-0001〜0003（SSR化・App Hosting・Turso・StudioCMS）／ADR-0005 Phase1（SSGFORM＋同意）／ADR-0006（i18n一本化）／ADR-0007（公開前ガードレール）。
- **Phase2（C案UI刷新・新ページ・チャットボット）**: ADR-0004（計測導入）／ADR-0005 Phase2（自社チャットボット）。

## 運用

- 新たな論点は ADR の改訂・追加 or children Issue で吸収する。
- ADR は `docs/adr/ADR-00xx-*.md` を Docs PR で追加・改訂する。
