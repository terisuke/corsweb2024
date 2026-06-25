# ADR-0008 読みもの（AI支援記事）作成ワークフロー — 編集者が main を経由せず公開

## ステータス: Proposed (2026-06-25)

## 背景
- main ブランチは「マージ可能なのは `kisayama0725` のみ」のブランチ保護下にある（誤デプロイ防止のセキュリティ統制）。
- 現状ブログ記事は `src/content/blog`（Content Collections・各言語10本＝計50本）の `.md`＝**コードの一部**であり、記事公開＝コードの main マージが必須。
- 結果、**読みもの（ブログ）の更新が main マージ権限保持者（諫山）のマージ待ちになるボトルネック**が発生。日々の読みもの運用を Nagi（編集者）に委譲したいが、現状はコード権限がないと公開できない。
- 文体・自動下書きの資産は既にある: `docs/blog-style-guide.md`（社長＝寺田の書き方メモリ）、`scripts/generate-blog-draft.mjs`（Claude＋`web_search` で収集→執筆→ガードレール）、`scripts/blog-guardrails.mjs`（旧事業名・未取得認証等の機械検出）。
- CMS 化の方針は **ADR-0001（StudioCMS・Astroネイティブ・SSR・即時反映）／ADR-0002（Firebase App Hosting=SSR）／ADR-0003（Supabase Postgres）で決定済（Accepted・未着手）**。本 ADR はその基盤の上に乗る「AI支援の読みもの作成フロー」と「編集者が main を経由せず公開できる仕組み」を定義する。

## 決定
1. **記事の保存先をコード（git）から DB（ADR-0003: Supabase/Postgres、ADR-0001: StudioCMS 管理）に分離する。** 公開＝**DB書込（編集者認証）**であり、コードの main マージとは完全に独立。編集者はコード／main／git に一切触れない。`/blog`（および `/news`）は ADR-0002 の SSR で DB から配信し即時反映する（再ビルド不要）。→ **main 保護を維持したままボトルネックを解消**。役割分離: **コード＝諫山 / 記事＝Nagi**。
2. **AI支援ワークフローをバックエンドAPIとして実装する**（既存 `generate-blog-draft.mjs` / `blog-guardrails.mjs` / `blog-style-guide.md` を再利用）:
   - ①**情報収集**: Claude＋`web_search` で直近約27時間の AI／DX／生成AI社内活用／ローカルLLM・セキュアAI／RAG／PoC 等から候補テーマを抽出し、**10〜15件をランキング表示**。
   - ②**テーマ確定**: 編集者が候補から**複数選択**（人目線）。
   - ③**枚数決定**: 作成本数を指定。
   - ④**記事生成**: Claude が `blog-style-guide.md`（社長文体メモリ）に従って生成。**誰が作っても社長と同じ視点**を担保。一次出典は `web_search` 実在URLのみ・捏造禁止。
   - ⑤**レビュー**: 編集者が出典・トーン・ガードレールを人目線で確認・修正。
   - ⑥**公開**: GO で DB に published 保存 → SSR の `/blog` に反映。
3. **認証**: ADR-0001 の管理者認証（cor-jp.com Google OAuth 限定・最小権限・操作ログ）に準拠。**「秘密URL（/blog 等の隠しパス）」は採用しない**（推測アクセスで Claude API 浪費・無断公開のリスクのため）。
4. **ガードレール**: 生成時（書出前）と公開時の二段で `blog-guardrails.mjs` 相当を機械チェック（ADR-0007 に整合）。旧事業名・未取得認証の取得済み主張・断定/効果保証・プレビューURL/下書きキーをブロック。
5. **AIツールは Claude（`claude-opus-4-8`、adaptive thinking、`web_search_20260209`）を採用**（ハイブリッド不要・両工程とも Claude）。

## 理由
- **コードと記事の責務分離**が本質。記事を「データ」にすれば、main 保護（コード統制）を緩めずに編集者が公開できる。B案（develop自動コミット＋定期昇格）は本番が諫山依存で要件未達、C案（PR＋1クリック承認）は毎回のクリックが残りボトルネックを解消しない。
- ADR-0001 が既に StudioCMS/SSR/即時反映を選定済みのため、本ワークフローはその上に最小増分で乗る（別 headless CMS を新規接続するより結合コストが低い）。
- 既存の生成エンジン・文体メモリ・ガードレールを再利用でき、品質と一貫性を最初から担保できる。

## 影響
- **前提**: ADR-0001（StudioCMS）／ADR-0002（SSRホスティング）／ADR-0003（Supabase）の着手が必要。本ワークフローはこれらの上に構築する。
- **新規運用**: Claude API キー・`web_search` のバックエンド実行、生成コスト（1本あたり概ね数十円）、複数枚同時生成のレート/コスト上限管理。
- **セキュリティ/法務**: 非エンジニア自由投稿により本文経由のガードレール違反リスク（ADR-0007）。認証・操作ログを ISMS（整備中）基準に整合。
- **URL不変**: 既存50本の移行時も既存 URL 不変が絶対条件（ADR-0001 影響と同じ）。多言語（ja/en/zh/ko/es、ADR-0006）の記事も DB スキーマで `lang` を保持。
- **段階導入**:
  - **MVP（月末目標 / 最小構成）**: 管理者認証＋①情報収集＋②③選択＋④生成＋⑤レビュー＋⑥公開（**新規読みもののみ**・既存50本移行は後回し）。`/blog` の SSR 配信または暫定の限定 SSR エンドポイント。
  - **発展**: 複数枚同時・ランキング精度向上・本文エディタ・画像/OGP・既存50本の DB 移行（ADR-0001 本体）・予約公開・多言語自動翻訳連携（#60 の翻訳基盤と接続）。

## 代替案
- **B: develop へ自動コミット＋諫山が定期昇格** — 本番反映が諫山依存のままで「main ブロッカー回避」の要件を満たさず却下。
- **C: 対話UIで PR 作成＋諫山が1クリック承認** — 実装は最小だが毎回のクリックが残りボトルネック解消にならず却下。
- **秘密URL（隠しパス）** — 認証なしは推測アクセスで Claude API 浪費・無断公開・スパムのリスクがあり却下。Firebase Auth 等のログイン必須。
- **Content Collections 継続（CMS非導入）** — ADR-0001 で却下済（非エンジニア投稿・運用一本化を満たせない）。

## 関連
- 前提: ADR-0001（StudioCMS）/ ADR-0002（SSR Hosting）/ ADR-0003（Supabase）
- 整合: ADR-0006（i18n 単一正本）/ ADR-0007（対外表現ガードレール）
- 既存資産: `docs/blog-style-guide.md` / `scripts/generate-blog-draft.mjs` / `scripts/blog-guardrails.mjs` / `.github/workflows/blog-autodraft.yml`（自動下書きの cron 版。本ワークフローは対話・即時公開版）

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
