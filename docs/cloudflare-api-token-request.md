# Cloudflare API token 発行依頼

## 現在の確認結果

2026-07-09 時点で、以下を確認しました。

- GitHub repo secret に `CLOUDFLARE_API_TOKEN` / `WRANGLER_*` / `CF_*` 系の secret は見つかりませんでした。
- ローカル環境変数にも `CLOUDFLARE_*` / `WRANGLER_*` / `CF_*` 系の値はありませんでした。
- ローカル `wrangler whoami` では `company@cor-jp.com` の OAuth セッションが有効でした。手動 deploy は可能ですが、GitHub Actions の自動 deploy には使えません。

この token が無い場合、GitHub Actions から `cor-yomimono` Worker を自動 deploy できません。`develop` では `PUBLISH_BRANCH=develop`、`main` では `PUBLISH_BRANCH=main` を注入して deploy するため、repo secret `CLOUDFLARE_API_TOKEN` の追加が必要です。

## 依頼したいこと

Cloudflare Dashboard で Worker deploy 用の API token を発行し、GitHub repository secret として `CLOUDFLARE_API_TOKEN` を登録してください。

トークン値はチャットや issue に貼らないでください。登録後に「secret 追加済み」とだけ共有してください。

## 発行手順

1. Cloudflare Dashboard に、`cor-jp.com` と Worker `cor-yomimono` を管理できるアカウントでログインします。
2. 右上のユーザーアイコンから **My Profile** を開きます。
3. **API Tokens** を開き、**Create Token** を押します。
4. **Custom token** を選びます。
5. Token name は `corsweb-yomimono-worker-deploy` など、用途が分かる名前にします。
6. Permissions には、Wrangler deploy に必要な権限を付けます。
   - Account: Workers Scripts: Edit
   - Zone: Workers Routes: Edit
   - Zone: Zone: Read
   - Cloudflare UI の表記が変わっている場合は、Worker script deploy と route 更新に相当する Edit 権限を選んでください。
7. Resources は、対象を絞ります。
   - Account: Cor.Inc. が使っている Cloudflare account
   - Zone: `cor-jp.com`
8. TTL は 90〜180 日などの期限付き推奨です。期限なしにする場合は、別途ローテーション日を決めてください。
9. 作成後、表示される token を一度だけコピーします。
10. GitHub の `Cor-Incorporated/corsweb2024` を開きます。
11. **Settings → Secrets and variables → Actions → New repository secret** を開きます。
12. Name に `CLOUDFLARE_API_TOKEN`、Secret にコピーした token を入れて保存します。
13. 保存後、Actions の **Deploy Yomimono Worker** を手動実行し、`publish_branch=develop` で deploy が通ることを確認します。

## 登録後の確認方法

登録後、以下のいずれかで確認します。

```bash
gh secret list -R Cor-Incorporated/corsweb2024 | rg CLOUDFLARE_API_TOKEN
```

GitHub Actions が成功した後は、以下が `develop` を返せば CMS と develop preview の参照先が一致しています。

```bash
curl -s https://cor-jp.com/blog-admin/health
```

期待値:

```json
{"ok":true,"publishBranch":"develop"}
```

## 暫定対応

token 登録前に緊急で反映する必要がある場合は、Cloudflare にログイン済みのローカル環境から以下を実行します。

```bash
cd workers/yomimono
npm exec -- wrangler deploy --var PUBLISH_BRANCH:develop --keep-vars
```

この暫定 deploy は CI/CD 証跡ではないため、issue close の最終証跡には GitHub Actions の成功ログを別途残してください。
