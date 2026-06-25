# 読みものCMS バックエンド（Cloudflare Worker / `cor-yomimono`）

凪沙さんが **main マージ権限なしで毎日記事を投稿**できるようにする、サーバーレス・バックエンド。
記事は DB を使わず **.md として git にコミット**され、既存の静的デプロイでそのまま公開される（A案：記事bot方式）。

```
情報収集(/api/collect) → テーマ選定(人) → 生成(/api/generate) → レビュー(人) → 公開(/api/publish)
                                    Claude                Claude＋ガードレール        記事botがmainへcommit
```

## エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| GET  | `/health` | 死活確認（認証不要） |
| POST | `/api/collect` | 直近約27hのAI/DX/ローカルLLM記事から候補テーマを10〜15件返す |
| POST | `/api/generate` | 選んだテーマで記事を1本生成（社長の文体）＋ガードレール検査結果を同梱 |
| POST | `/api/publish` | 記事botが `src/content/blog/ja/<slug>.md` を `main` にコミット |

`/health` 以外は **Cloudflare Access**（cor-jp.com 限定）で認証。Worker は `Cf-Access-Jwt-Assertion`（JWT）をチームの公開鍵で**暗号検証**し、`aud`/`iss`/`exp`/メールドメインを全て確認する（ヘッダ盲信はしない＝workers.dev 直叩きでも突破不可）。`CF_ACCESS_TEAM_DOMAIN` / `CF_ACCESS_AUD` 未設定時は全リクエストを拒否（fail closed）。

## デプロイ手順（初回）

```bash
cd workers/yomimono
npm install
npx wrangler login        # 初回のみ（Cloudflareアカウントでブラウザ認証）

# シークレット登録（値は対話で入力。コード/gitには残らない）
npx wrangler secret put ANTHROPIC_API_KEY      # Claude（既存 blog-autodraft 用と同じでOK）
npx wrangler secret put GH_APP_PRIVATE_KEY     # cor-yomimono-bot.*.private-key.pem の中身を貼り付け

npm run deploy            # 公開（*.workers.dev のURLが発行される）
```

`wrangler.toml` の `[vars]` に App ID / Installation ID 等の非シークレット設定が入っている（編集不要）。

## 認証（Cloudflare Access）— デプロイ後に設定

1. Cloudflare ダッシュボード → **Zero Trust** → **Access → Applications → Add an application → Self-hosted**
2. アプリのドメインに Worker の URL（`cor-yomimono.<account>.workers.dev`）を指定
3. ポリシー: **Action=Allow**, **Include → Emails ending in → `@cor-jp.com`**
4. ログイン方法に Google（または One-time PIN）を追加 → 保存
5. アプリ設定の **Application Audience (AUD) タグ** をコピーし、`wrangler.toml` の `CF_ACCESS_AUD` に貼る。`CF_ACCESS_TEAM_DOMAIN` にはチームドメイン（例 `cor.cloudflareaccess.com`）を入れて `npm run deploy` で再デプロイ。

これで cor-jp.com のメンバーだけがログインでき、Worker は JWT を暗号検証してメールを得る。

### コスト保護（推奨）

`/api/collect` `/api/generate` は Opus + web_search を呼ぶため高コスト。認証済み社内ユーザーのみが叩ける前提だが、念のため Cloudflare ダッシュボード → **Security → WAF → Rate limiting rules** で当 Worker のパスに「1メール/分あたり N 回」の制限を1本入れておくと安全。

## 記事botを main の許可プッシャーに追加（公開を通すため）

main はブランチ保護で push 制限がかかっている。記事bot（GitHub App）を許可リストに追加する:

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

- 設計: `docs/adr/ADR-0008-yomimono-ai-workflow.md`（A案：静的＋記事bot）
- セットアップ全体: `docs/yomimono-cms-setup.md`
- 文体の正本: `docs/blog-style-guide.md`（生成時に Worker が取得）
- ガードレール正本: `scripts/blog-guardrails.mjs`（本Workerの `src/guardrails.ts` と同期）
