# 読みものCMS（A案）立ち上げ手順 — 諫山さん用 1回だけのセットアップ

ADR-0008(rev.2) / Epic #130 の **A案（静的＋記事bot・DBなし・Cloudflare Workers バックエンド）** を動かすために、**諫山さん（org 管理者）の側で一度だけ**用意するものをまとめます。ここが揃えば、以降のコードは私（実装側）が組みます。**シークレットは諫山さんの管理下に置き、私はコードから参照する形**にします（鍵を私が保持しません）。

---

## 1. 記事公開bot（GitHub App）を作る ＝ 公開の要
1. GitHub の **Cor-Incorporated org → Settings → Developer settings → GitHub Apps → New GitHub App**
2. 設定:
   - **Repository permissions → Contents: Read and write**（他は不要）
   - Webhook: 不要（オフ）
   - Where can this be installed: Only this account
3. 作成後:
   - **App ID** を控える
   - **Generate a private key**（.pem をダウンロード＝秘密鍵）
4. **Install App** → `corsweb2024` のみを選択 → **Installation ID** を控える（インストール後のURLに含まれる）
5. **main のブランチ保護に bot を許可pusherとして追加**（コード保護は維持・記事のみ書ける信頼アクター）:
   ```bash
   # 現在の restrictions に App を追加（apps はアプリの slug を指定）
   gh api -X POST repos/Cor-Incorporated/corsweb2024/branches/main/protection/restrictions/apps \
     --input - <<'JSON'
   ["<github-app-slug>"]
   JSON
   ```
   ※ App slug は作成時のURLスラッグ（例: `cor-yomimono-bot`）。
   → 人のマージ権限は `kisayama0725` のまま、bot は記事パスのみコミット。

## 2. Cloudflare Workers（バックエンドの置き場・無料枠）
1. **Cloudflare アカウント**（無料）を作成 or 既存利用
2. `npm i -g wrangler` → `wrangler login`
3. （Worker のコードは私がリポジトリ `workers/yomimono/` に用意します。デプロイは `wrangler deploy`。）

## 3. シークレット（Cloudflare Worker に登録）
Worker 用意後、`wrangler secret put` で登録（値は諫山さんが入力＝コードに出ない）:
- `ANTHROPIC_API_KEY` … Claude（**既存 blog-autodraft 用と同じキーでOK**）
- `GH_APP_ID` … 手順1の App ID
- `GH_APP_PRIVATE_KEY` … 手順1の .pem の中身
- `GH_INSTALLATION_ID` … 手順1の Installation ID
- （認証用）`GOOGLE_OAUTH_CLIENT_ID` 等 … 手順4

## 4. ログイン認証（管理UIは秘密URLでなく認証必須）
**Firebase Auth（Google プロバイダ・cor-jp.com ドメイン限定）** を推奨（既に Firebase 利用中のため最短）:
1. Firebase コンソール → Authentication → Google を有効化
2. 凪沙さんの cor-jp.com アカウントを許可（ドメイン制限）
3. 管理UI はログイン必須・Worker 側で ID トークン検証
- ※ Google OAuth を直接使う場合は client id / secret を発行 → Worker に登録

---

## 揃ったら私がやること（実装）
1. `workers/yomimono/` に Worker（`/api/collect` `/api/generate` `/api/publish` ＋認証検証）を実装（#133）
2. 情報収集（Claude+web_search・27h・ランキング）#134 / 生成（社長文体・ガードレール）#135 — 既存 `scripts/generate-blog-draft.mjs`・`blog-guardrails.mjs`・`docs/blog-style-guide.md` を再利用
3. 公開（bot が `src/content/blog/` へコミット→自動デプロイ）#131/#136
4. 管理ダッシュボードUI（モック済のフロー）#137
5. 各段 ja不変・ガードレール・レビュー・PR・CI緑の規律で develop へ。本番反映の初回だけ動作をスクショ提示。

## コスト
- 固定インフラ費: **ほぼ¥0**（GitHub App 無料・Cloudflare Workers 無料枠・サイトは静的のまま）
- 継続費: **Claude 生成料のみ**（1本あたり概ね数十円・使った分だけ）
