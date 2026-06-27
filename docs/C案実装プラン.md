# Cor.HP C案刷新 実装プラン（次セッション引き継ぎ用）

作成: 2026-06-15 / 対象: `Cor-Incorporated/corsweb2024`（cor-jp.com）
正本: Google Drive `1ZiVK9XrCffLI-S88U6DiZqpWqytp-Nlw`（00.5ガードレール最優先 / 01コピー / 02実装 / 03 i18n / 04 security / 07 きょうそう / 08 Issue）
メモリ: `cor-hp-renewal-project.md` に8コンポ仕様・禁止表現・正本場所を保存済み。

---

## 大原則（絶対）
- **C案はデザインの方向性。モック丸コピー禁止。** 正本01/03の確定コピーで実装。
- **i18n正本 = `src/utils/i18n.ts`**（5言語直書き）。`src/i18n/*.json` は死蔵。文言はここに足す。
- **PRはコンポーネント単位で小さく。** Home全体を1PRにしない。
- **5言語**（ja/en/zh/ko/es）。日本語確定→他言語の2段。
- **段階リリース:** Wave1（ガードレール）→公開→Wave2（C案本体）。
- **禁止表現（QA§2）:** 旧事業名(TapForge/BoltSite/IoTRealm/IoT/IT戦略コンサル) / 未取得認証(Pマーク/SCS★/ISMS取得済み/SGS/取得日・審査機関名)→「整備中」のみ / 架空Testimonials・FAQ / 確定見積もり断定→「参考見積もり」 / 絶対表現(完全に守る等) / 福岡100選は公開可能日まで非表示。
- ブランチ: `develop` 統合。作業は `fix/*`（Wave1）/ `feature/home-c-*`（コンポ単位）/ `feature/page-*`。`main` 直push禁止・PR経由。
- Hero lead は「**誰一人取り残されない」を使わない**。正本lead「違いをぶつけ、価値を磨き…」。

---

## 既存PR #86 の扱い（最初に判断）
`mock/home-c-base` の #86 はモック簡易移植。Heroリード/CTAが正本とズレ・日本語のみ・8コンポ未実装。
- **流用可:** `tailwind.config.cjs`(cor-* 色/font) と `src/styles/global.css`(grid-bg等) のデザイントークン。
- **作り直し:** `src/pages/index.astro` のHome本文は正本8コンポ構成へ。
- 推奨: #86 はトークン土台のみ残してマージ or クローズ。Home本文は新ブランチで正本準拠に再実装。**諫山さん判断を仰ぐ。**

---

## Wave 1 — 公開前ガードレール（M0、`fix/*` ブランチ群）
公開中サイトの信頼毀損を先に止める。デザイン変更は最小。
1. **C-0 Phase0事故防止**: 架空Testimonials撤去 / 古FAQ・JSON-LD(Layout.astro)削除or更新 / Footer年動的化(`{new Date().getFullYear()}`) / i18n source of truth=`src/utils/i18n.ts`確定・`src/i18n/*.json`削除 / `npm run build`ベースライン。
2. **C-1 Pマーク・SCS予防ガード**: 手直し版由来文言を入れない。全文検索で公開対象に0。
3. **C-2 ISMS「整備中」統一**: SecurityTrust/構造化データで取得日・審査機関名を出さない。
4. **C-3 PP差し替え＋Contact同意導線**: `/privacy`を個人情報保護方針(案)準拠（管理者=寺田凪沙/開示30日/越境/委員会報告）。ContactにSSGFORM第三者提供・越境明記＋利用目的＋PPリンク＋同意。
5. **C-4 旧事業撤去＋相談種別6区分**: 会社概要/Services/Contact/FAQから旧事業名撤去。Contact種別を新6区分。
6. **C-5 未取得認証の実装ガード**: JSON-LD `hasCredential`不使用・認証ロゴ/番号なし・福岡100選フラグ化。
7. **C-6 `/security`新設**: `src/pages/security.astro`、04文面、3本柱、Privacy相互リンク、ISMS整備中。
- 各PR共通受入: `npm run build`通過 / 5言語表示 / DON'T表現が全文検索で0 / 前後スクショ / Lighthouse悪化なし。

→ Wave1完了・公開後にWave2へ。

---

## Wave 2 — C案本体（M1〜M4）

### M1: Home 8コンポーネント（各 `feature/home-c-{name}`、1コンポ=1PR）
作成先 `src/components/home/`。コピーは01、i18nキーは03(jaRefreshDraft)。`src/pages/index.astro` は最後に8つをimportして組む。
1. `ProblemHero.astro` — kicker/H1「現場の課題を、AIで解く。」/lead(正本)/CTA3(griftai別タブ・/contact・/about#kyousou)/Trust chips4(福岡100選は非表示フラグ)。既存Hero.astro複製可。画像Heroは背景装飾に留め主役はコピー+CTA。
2. `ChallengeGrid.astro` — 「こんな課題、一緒に解きましょう。」`t.homeChallenges.items`6枚→/contact。
3. `GriftBridge.astro` — griftai別タブ`rel="noopener noreferrer"`/参考見積もり注記必須/ミニモック。
4. `ProofHighlights.astro` — Stats6(注記付)/実績6カード(架空0)→/works。`src/data/works.ts`新設で共通化。
5. `ServicesReframed.astro` — 4カード(AI受託/AI顧問・研修/ローカルLLM/Grift)。
6. `SecurityTrust.astro` — 4カード→/security。顧問弁護士実名は許諾後。
7. `KyousouPhilosophy.astro` — 5表記テーブル→/about#founder-story。狂騒は行動規範化しない。
8. `FinalCTA.astro` — griftai/contact/共創パートナー・採用導線。
- 旧6コンポ(Hero/Services/Expertise/About/Testimonials/Cta)はHomeから外す（他言語index依存に注意。5言語すべて差し替える）。

### M2: 新規ページ・About改修
- `src/pages/works.astro`（H1「実績は、思想の裏付けです。」/7実績/NDA匿名化/寄与率git実測注記）。
- `src/pages/security.astro`（Wave1のC-6で着手済みなら拡充）。
- `src/pages/about.astro` をきょうそう中心に（KyousouDefinition/MVV/FounderStory/PublicActivity/#kyousou・#founder-storyアンカー）。

### M3: Header/Footer/Contact/SEO
- Header: Home/Works/Grift(外部isExternal)/Security/About/Blog/Contact。`links`に`isExternal`追加しtarget/rel条件付与。
- Footer: Security追加・Copyright動的化。
- Contact: 相談種別6区分（C-4と整合）。
- SEO: meta 2026年事業へ / OGP画像新規(home/security/works) / 固定FAQ JSON-LD削除 / sitemap customPagesにworks,security。

### M4: 多言語・計測・公開前レビュー
- 5言語展開（ja確定後 en/zh/ko/es、AI/法務/ISMS用語は人手確認）。
- CTA計測（Griftクリック/Contact/Works/Security）。
- 公開前レビュー: 寺田(きょうそう定義)/諫山(ISMS)/Nagi(デザイン)/安藤弁護士(Security・Privacy)。

---

## 進め方プロトコル（信頼回復のため厳守）
1. **都度止まる**: 各コンポ/各Wave着手前に方針を1行提示→GO確認。
2. **実装→ローカル検証(build+preview screenshot)→code-reviewer→push→PR→CI claude-review全green**。
3. **コンポ単位PR**。1PR肥大化させない。
4. **ツール呼び出しの直前にテキストを書かない**（「call」混入の再発防止）。
5. claude-reviewは push毎に新規指摘するため、push前に code-reviewer ローカルレビューを通してから上げる。

---

## 次セッションの最初の一手
「Cor HP 正本に従って Wave1 C-0 から実装」→ 本プラン＋メモリ`cor-hp-renewal-project`を読み、PR #86の扱いを諫山さんに確認してから Wave1 着手。
