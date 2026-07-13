# Cloudia Vertex Gateway

Cloud Run service identityのADCで `cor-jp-web/global/gemini-3.5-flash` を呼び出す専用Gateway。
Cloudflare Workerからのリクエストは `VERTEX_GATEWAY_SECRET` によるHMAC-SHA256、
30秒のtimestamp、nonceで検証する。サービスアカウントJSON鍵は使用しない。

Cloud Runは `service.yaml` の専用サービスアカウントで実行し、Secret Managerの
`cloudia-gateway-hmac` だけを参照させる。Worker側にはGateway URLと同じsecretを
`wrangler secret put` で設定する。

## Deploy

```bash
gcloud config set project cor-jp-web
gcloud builds submit services/vertex-gateway \
  --tag asia-northeast1-docker.pkg.dev/cor-jp-web/cloudia/vertex-gateway:latest
gcloud secrets add-iam-policy-binding cloudia-gateway-hmac \
  --member='serviceAccount:cloudia-vertex-gateway@cor-jp-web.iam.gserviceaccount.com' \
  --role='roles/secretmanager.secretAccessor'
gcloud run services replace services/vertex-gateway/service.yaml --region asia-northeast1
gcloud run services add-iam-policy-binding cloudia-vertex-gateway \
  --region asia-northeast1 --member='allUsers' --role='roles/run.invoker'
GATEWAY_URL="$(gcloud run services describe cloudia-vertex-gateway \
  --region asia-northeast1 --format='value(status.url)')/generateContent"
cd workers/contact-chat
printf '%s' "$GATEWAY_URL" | npx wrangler secret put VERTEX_GATEWAY_URL
npx wrangler secret put VERTEX_GATEWAY_SECRET
npx wrangler deploy
```

GatewayとWorkerの `VERTEX_GATEWAY_SECRET` はSecret Manager
`cloudia-gateway-hmac` の同じ値にする。nonce cacheはCloud Runプロセス内のため、
`maxScale=1` と30秒の署名有効期限でリプレイ窓を制限する。再起動をまたぐ永続nonceではない。

## Rollback

Workerを先に `LLM_PROVIDER = "anthropic"` へ戻し、`ANTHROPIC_API_KEY` を設定して
`npx wrangler deploy` する。Gatewayは後から停止する。前リビジョンへ戻す場合は
`gcloud run services update-traffic cloudia-vertex-gateway --region asia-northeast1 --to-revisions REVISION=100`
を使う。
