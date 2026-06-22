# ブログ自動下書き（Claude）セットアップ＆運用

毎日 Claude が web_search で最新トピックを調べ、社長の文体でブログ記事の **下書き** を1本生成し、
**PR** を作ります。公開は人が承認（`isDraft: false` にしてマージ）して初めて行われます（draft-review）。

## 構成
| ファイル | 役割 |
|---|---|
| `docs/blog-style-guide.md` | 社長の文体・トーン・ガードレールの固定リファレンス（生成AIに渡す） |
| `scripts/generate-blog-draft.mjs` | Claude(`claude-opus-4-8`)＋`web_search`で調査→執筆→`src/content/blog/ja/{slug}.md`に`isDraft:true`で出力 |
| `scripts/blog-guardrails.mjs` | 旧事業名・未取得認証・漏洩URL等を機械検出（生成時に自動実行＋単体実行も可） |
| `.github/workflows/blog-autodraft.yml` | 毎日 cron＋手動。生成→ガードレール→下書きPR作成 |

## 初期セットアップ（必須）
1. **GitHub Secrets に `ANTHROPIC_API_KEY` を追加**
   - リポジトリ → Settings → Secrets and variables → Actions → **New repository secret**
   - Name: `ANTHROPIC_API_KEY` / Value: Anthropic のAPIキー
2. （任意・ローカル試用）`.env` に `ANTHROPIC_API_KEY=...` を追加

## 試運転（cronを待たずに今すぐ）
- GitHub → **Actions** タブ → 「Blog auto-draft (Claude)」→ **Run workflow**（手動実行）
- 成功すると `auto-draft/...` ブランチで **下書きPR** が `develop` 宛に作られます
- ローカルで試す場合: `ANTHROPIC_API_KEY=xxxx npm run blog:draft`（最終行に生成ファイルパスが出る）

## 公開フロー（人の承認）
1. 作られたPRを開き、本文・**出典URLが実在し正しいか**・トーンを確認
2. 問題なければ frontmatter の `isDraft: true` を **`false`** に変更してマージ → 公開
3. 公開しない場合は PR をクローズ

## ガードレール（自動＋手動）
- 生成時に自動検査。違反があればファイルを書き出さず失敗（PRは作られない）。
- 手動チェック: `npm run blog:check src/content/blog/ja/foo.md`
- 検出対象: 旧事業名(TapForge等) / 未取得認証の「取得済み」主張 / develop プレビューURL(`*.web.app`) / draftKey / 内部編集メモ
- ※ 捏造データや誤った出典は機械では検出しきれません。**最終確認は必ず人が行ってください。**

## 運用メモ
- **モデル**: `claude-opus-4-8`（adaptive thinking、`web_search`内蔵で最新調査＋出典取得）。記事1本あたり概ね数十円程度。
- **頻度**: 毎日 06:00 JST（`.github/workflows/blog-autodraft.yml` の cron）。試運転が済むまでは cron 行をコメントアウトし手動運用でもOK。
- **重複回避**: 既存記事の直近タイトルを避けるようプロンプトに渡しています。
- **ベースブランチ**: `develop`（`ref: develop` / `--base develop`）。実験用の `future2` は develop へ統合のうえ削除済み。開発フローは feature → develop → main（main マージは保護で `kisayama0725` のみ）。
- **文体を変えたい**: `docs/blog-style-guide.md` を編集するだけで生成トーンが変わります。
