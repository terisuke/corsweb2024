# ADR-0004 計測を Cloudflare Web Analytics＋Microsoft Clarity（cookieless優先・Clarity は PP 明記）

## ステータス: Accepted (2026-06-13)

## 背景
- 現状アナリティクスは未実装（gtag/GTM/dataLayer/plausible が grep0）。`WebVitals.astro` は gtag 前提だが本体が無く、メトリクスが `console.log` されるだけで未送信（規約違反）。
- HP刷新でアクセス解析・行動分析の計測基盤を導入する必要がある。
- プライバシーポリシー（ADR-0005／社内『個人情報保護方針(案)』）の同意導線・cookie 同意と計測を整合させる必要がある。

## 決定
- 計測を **Cloudflare Web Analytics（cookieless）をベース**に導入する。
- 加えて **Microsoft Clarity（行動分析）を導入**する。
- Clarity は cookie＋セッション記録のため、**プライバシーポリシーに Clarity（Microsoft・米国越境）を第三者ツールとして明記**し、同意の要否を検討する。
- `WebVitals.astro` を修正し `console.log` を除去、Web Vitals（LCP/CLS/INP/FCP/TTFB）を実送信、web-vitals をローカルバンドル化、getFID 廃止し INP 対応とする。
- measurement ID 等は `PUBLIC_` 環境変数で管理（ハードコード禁止）。

## 理由
- Cloudflare Web Analytics は cookieless で同意取得の負荷が低く、Cloudflare を前段に置く構成（ADR-0002）と親和性が高い。
- Clarity は行動分析（ヒートマップ・セッション記録）を補完するが越境・cookie を伴うため、cookieless を「ベース」に置き Clarity を「明記＋同意検討」で扱う二層構成とする。
- 計測 ID の環境変数化でハードコードを排し、秘密／設定の管理境界を保つ。

## 影響
- プライバシーポリシーに Clarity（Microsoft・米国越境）を第三者ツールとして明記し、Contact 同意導線（ADR-0005）と cookie 同意を整合させる。同意前トラッキングが PP 方針に反しないことを担保する。
- CTA 計測（Grift/Contact/Works/Security）を実装。Grift 外部 CTA は遷移離脱前に sendBeacon／transport:beacon で送信する。
- 計測ツールの選定確定後、本番で pageview／イベント記録を検証する。
- 計測導入が ADR-0007 の対外表現ガードレール（未取得認証・誇大表現）に抵触しないことを確認する。

## 代替案
- **GA4 / Firebase Analytics（GA4）**: GCP（App Hosting）との親和性は高いが cookie ＋ Consent Mode v2 の同意管理が必要で、cookieless を優先する方針と相反するためベースには採らない。
- **Plausible 等の単一 cookieless ツールのみ**: 行動分析（ヒートマップ・セッション記録）が得られず、Clarity の補完価値を捨てるため却下。
- **計測なし**: 改善サイクルに必要な定量データが得られないため却下。

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
