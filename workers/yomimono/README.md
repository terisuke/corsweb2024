# 読みものCMS バックエンド（Cloudflare Worker / `cor-yomimono`）

凪沙さんが **GitHub のマージ操作なしで毎日記事を投稿**できるようにする、サーバーレス・バックエンド＋管理画面。
記事は DB を使わず **.md として git にコミット**され、管理対象 branch の静的デプロイでそのまま公開される（A案：記事bot方式）。

> **コレクション拡張（ADR-0009）**: 記事bot は **blog / news / cases の3コレクション配下**に書く（`src/content/{blog/ja,news,cases}/`）。3コレクションとも投稿・一覧・読み込み・更新に対応する。切り替えは `body.collection` / `?collection=`（既定 `'blog'`）。詳細は `docs/adr/ADR-0009-news-cases-cms-expansion.md`。

管理画面は **HP と同じドメインの隠しページ `https://cor-jp.com/blog-admin`** で開ける（cor-jp.com は Cloudflare の裏にいるため、`/blog-admin*` だけを Cloudflare Worker のルートに流す）。HP本体（静的・Firebase）はそのまま。

```
情報収集(/blog-admin/api/collect) → テーマ選定(人) → 生成(/blog-admin/api/generate) → レビュー(人) → 公開(/blog-admin/api/publish)
                                       Claude                  Claude＋ガードレール          記事botが管理対象branchへcommit
```

## エンドポイント（`BASE_PATH=/blog-admin` のため実URLは `cor-jp.com/blog-admin...`）

| Method | 論理Path | 説明 |
|--------|------|------|
| GET  | `/` | 管理画面HTML（凪沙さん用） → `cor-jp.com/blog-admin` |
| GET  | `/health` | 死活確認 → `cor-jp.com/blog-admin/health` |
| GET  | `/api/recent` | 既存記事スラッグ一覧（重複テーマ回避・`?collection=` で切替） |
| GET  | `/api/articles` | 既存コンテンツ一覧（`?collection=blog/news/cases`） |
| GET  | `/api/article` | 既存コンテンツ読み込み（`?collection=blog/news/cases&slug=...`、`sha` 付き） |
| POST | `/api/collect` | 直近約27hのAI/DX/ローカルLLM記事から候補テーマを10〜15件返す |
| POST | `/api/generate` | 選んだテーマで記事を1本生成（社長の文体）＋ガードレール検査結果を同梱 |
| POST | `/api/validate` | コミットせずガードレール再チェック（編集後の確認用・`body.collection` 対応） |
| POST | `/api/publish` | 記事botが `body.collection`（既定 `'blog'`）に応じて `src/content/{blog/ja,news,cases}/<slug>.md` を `PUBLISH_BRANCH` にコミット |
| POST | `/api/update` | 既存コンテンツを同じ slug のまま `sha` 付きで更新（競合検出あり） |
| GET  | `/manual` | ブログ投稿UI（blog / `src/content/blog/ja/<slug>.md` へ公開） |
| GET  | `/manual/news` | ニュース投稿UI（news / `src/content/news/<slug>.md` へ公開） |
| GET  | `/manual/cases` | 実績投稿UI（cases / `src/content/cases/<slug>.md` へ公開） |
| GET  | `/edit` | 既存コンテンツ編集UI（blog/news/cases 切替） |

Worker は受信パスから `BASE_PATH`(=`/blog-admin`) を剥がして上記の論理パスにルーティングする。`BASE_PATH` 空ならルート直下（`*.workers.dev/` でのテスト）でもそのまま動く。

`/health`・ログイン関連以外はログインセッション必須（下記「ログイン」参照）。

## デプロイ手順（初回）

```bash
cd workers/yomimono
npm install
npx wrangler login        # 初回のみ（Cloudflareアカウントでブラウザ認証）

# シークレット登録（値は対話で入力。コード/gitには残らない）
npx wrangler secret put ANTHROPIC_API_KEY      # Claude（既存 blog-autodraft 用と同じでOK）
npx wrangler secret put GH_APP_PRIVATE_KEY     # cor-yomimono-bot.*.private-key.pem の中身を貼り付け
npx wrangler secret put ACCESS_PASSWORD        # ログインの合言葉（チーム共通）
npx wrangler secret put SESSION_SECRET         # セッション署名鍵。`openssl rand -hex 32` の出力を貼る

npm run deploy            # cor-jp.com/blog-admin* に公開（routes 設定済）
```

`wrangler.toml` の `[vars]` に App ID / Installation ID 等の非シークレット設定が入っている（編集不要）。`PUBLISH_BRANCH` は既定 `develop`。main release 用に同じ Worker を main 管理へ戻す場合は、CI/CD または deploy 時に `PUBLISH_BRANCH=main` を指定する。

## ルート（`cor-jp.com/blog-admin`）について

`wrangler.toml` の `routes = [{ pattern = "cor-jp.com/blog-admin*", zone_name = "cor-jp.com" }]` により、`npm run deploy` で **cor-jp.com の `/blog-admin*` だけがこの Worker に流れる**。cor-jp.com は Cloudflare の裏にいる（NS が `*.ns.cloudflare.com`）ため、HP本体（Firebase 配信）はそのまま、`/blog-admin` だけ Worker が応答する。`zone_name` の cor-jp.com が同じ Cloudflare アカウントにある必要がある。

## ログイン（Worker内蔵セッション）

Cloudflare Access は使わず、Worker 自身がログインを管理する（Access は zone と同一アカウントの Zero Trust 管理権限が要るため、会社アカウントの権限事情で採用）。

- `cor-jp.com/blog-admin` を開く → **合言葉（`ACCESS_PASSWORD`）の入力画面**（`/blog-admin/login`）
- 正しければ **HMAC署名つきセッションCookie**（HttpOnly / Secure / SameSite=Lax / 48時間）を発行
- 以降は `verifySession()` がCookieを検証（署名鍵 = `SESSION_SECRET`）
- `ACCESS_PASSWORD` と `SESSION_SECRET` の両方が未設定だと全リクエスト拒否（fail closed）

署名鍵は `openssl rand -hex 32 | npx wrangler secret put SESSION_SECRET` で登録。HP の一般訪問者には `/blog-admin` は見えない（リンクを置かない限り）。チーム共通パスワード方式（個人別SSOではない）。セッションは48時間有効。

### セキュリティ運用（重要）

合言葉がこのツール（管理対象 branch 書込み＋API予算）の唯一の鍵なので、**高エントロピー必須**:

- `ACCESS_PASSWORD` は**ランダム生成**して password manager で配布する（覚えやすい語句は不可）。例:
  ```bash
  openssl rand -base64 24 | npx wrangler secret put ACCESS_PASSWORD
  ```
  Worker は16文字未満の合言葉を拒否（503）する。
- **総当たり対策（推奨）**: Cloudflare ダッシュボード → **Security → WAF → Rate limiting rules** で `cor-jp.com/blog-admin/api/login` の POST を「5回/10分/IP → block」に。Worker内にも簡易レート制限＋失敗遅延を実装済みだが、エッジのWAFルールが本命。
- **緊急時の全ログアウト**: `SESSION_SECRET` を再生成して再デプロイすると、発行済みの全セッションが無効化される（合言葉漏洩時のキルスイッチ）。

### コスト保護（推奨）

`/api/collect` `/api/generate` は Opus + web_search を呼ぶため高コスト。認証済み社内ユーザーのみが叩ける前提だが、念のため Cloudflare ダッシュボード → **Security → WAF → Rate limiting rules** で当 Worker のパスに「1メール/分あたり N 回」の制限を1本入れておくと安全。

## main release 時: 記事botを main の許可プッシャーに追加

通常の develop 運用では `PUBLISH_BRANCH=develop` を読む。main release 後に同じ `/blog-admin` route を `PUBLISH_BRANCH=main` として使う場合、main はブランチ保護で push 制限がかかっているため、記事bot（GitHub App）を許可リストに追加する:

```bash
gh api -X POST repos/Cor-Incorporated/corsweb2024/branches/main/protection/restrictions/apps \
  -f "apps[]=cor-yomimono-bot"
```

## ローカル開発

```bash
npm run dev          # wrangler dev（ローカルでルーティング確認。Claude/GitHub 実呼び出しにはシークレットが必要）
npm run typecheck    # tsc --noEmit
```

## 関連

- 設計: `docs/adr/ADR-0008-yomimono-ai-workflow.md`（A案：静的＋記事bot・ブログ単機能）
- 拡張: `docs/adr/ADR-0009-news-cases-cms-expansion.md`（blog/news/cases の3コレクション拡張 + 非エンジニア向けUI改善 + OGP PNG化）
- セットアップ全体: `docs/yomimono-cms-setup.md`
- 文体の正本: `docs/blog-style-guide.md`（生成時に Worker が取得）
- ガードレール正本: `scripts/blog-guardrails.mjs`（本Workerの `src/guardrails.ts` と同期）
