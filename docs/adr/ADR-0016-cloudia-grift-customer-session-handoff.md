# ADR-0016 Cloudia から Grift 公開相談セッションへの引継ぎ

## ステータス: Accepted (2026-07-14)

## 背景

- `contract-dev` と Grift LP の既存 3 intent（`grift-team-beta`、`grift-paid-trial`、`estimate-audit`）は受託開発・見積支援の相談であり、Cloudia の初期ヒアリング後も相談者自身が Grift で追加ヒアリングと概算確認を続ける必要がある。
- Grift を社内リード保存先としてだけ使うと、相談者が Grift の公開ポータルを利用せず、Grift が解決する要件整理・見積・変更管理の価値を提供できない。
- Cloudia のブラウザから Grift の内部 API、テナント ID、サービス認証情報へ直接アクセスさせてはならない。
- `workers/contact-chat` の既存メール通知と本人向け受付メールは、Grift 障害時の取りこぼし防止と運用監査のため維持する。

## 決定

### 責務

| コンポーネント | 責務 |
|---|---|
| Cloudia | 初期相談、非 PII の構造化、転送内容の確認、明示同意、Grift への画面遷移 |
| contact-chat Worker | PII の最終検証、サーバー側セッション情報の復元、メール受付、Grift へのサービス間中継 |
| Grift Control API | Cor. テナントに intake submission / case / 顧客ポータルセッションを冪等作成 |
| Grift 顧客ポータル | 追加ヒアリング、非拘束の概算提示、相談者の了承 |
| Grift 管理画面 | Cor. 担当者による内容確認、初回詳細見積の作成・公開、有償変更の承認 |

### フロー

```text
Cloudia 初期相談
  -> 転送内容と利用目的を表示
  -> 相談者が明示同意
  -> POST /api/contact/submit
  -> contact-chat Worker がメール受付を保存
  -> POST /v1/internal/cloudia/intake-sessions
  -> Grift が Cor. テナントの case と公開ポータル URL を発行
  -> Worker は公開 URL だけを Cloudia に返す
  -> Cloudia が相談者を Grift へ遷移
```

- 自動引継ぎは Cloudia の信頼済み session intent が `contract-dev`、`grift-team-beta`、`grift-paid-trial`、`estimate-audit` のいずれかで、送信 payload の正規化済み intent と一致し、`handoffConsent.accepted=true`、`summaryConfirmed=true` の場合だけ実行する。
- Grift LP は既存 3 intent を URL 上で維持する。Worker は Grift 内部契約へ渡す際にだけ `intent=contract-dev`、`source=corsweb-contact-chat` へ固定し、ブラウザ値をそのまま Grift の権限境界へ渡さない。
- 上記以外の intent、未知 intent、session と payload の intent 不一致、同意なしは従来のメール受付を維持し、Grift を呼ばない。
- Grift 引継ぎの成功・失敗にかかわらず、既存の社内通知メールと本人向け受付メールを維持する。
- Grift が失敗した場合は問い合わせ自体を失敗扱いにせず、メール受付済みと fallback 状態を返す。

### Worker の公開契約

既存 `POST /api/contact/submit` に次の任意フィールドだけを追加する。

```json
{
  "handoffConsent": {
    "accepted": true,
    "summaryConfirmed": true,
    "version": "cloudia-grift-v1",
    "acceptedAt": "2026-07-14T00:00:00.000Z"
  }
}
```

- `acceptedAt` はブラウザ側の監査参考値とする。Worker が受信した時刻を同意時刻の正本として D1 と Grift に記録する。
- 要約を編集した場合は `summaryConfirmed` と Grift 引継ぎ同意を解除し、相談者に再確認を求める。
- Grift へ送る `inquiry.summary`、D1 submission、受付メールは、画面で確認された同じ正規化済み要約を使用する。D1 session は intent、locale、構造化項目、active/expiry の信頼境界として利用し、確認済み要約を別文面へ置換しない。
- submission には PII 本文を複製しない payload HMAC を保存する。同一冪等キー・同一 payload だけを replay とし、session、連絡先、要約、同意のいずれかが異なる場合は `409` として Grift を呼ばない。

Grift セッションを発行できた場合、既存応答に次を追加する。

```json
{
  "ok": true,
  "receiptId": "opaque-id",
  "handoff": {
    "status": "ready",
    "url": "https://app.griftai.org/chat/portal/opaque-token",
    "expiresAt": "2026-07-15T00:00:00.000Z"
  }
}
```

Grift 障害時は `handoff.status=fallback` とし、内部エラー、テナント ID、Grift case ID、認証情報をブラウザへ返さない。

### Grift の内部契約

```http
POST /v1/internal/cloudia/intake-sessions
Authorization: Bearer <Cloudia route scoped service secret>
Idempotency-Key: <contact submission id or client idempotency key>
Content-Type: application/json
```

```json
{
  "schema_version": "cloudia-grift-handoff.v1",
  "intent": "contract-dev",
  "source": "corsweb-contact-chat",
  "locale": "ja",
  "contact": {
    "name": "相談者名",
    "email": "client@example.com",
    "company": "Example Inc."
  },
  "inquiry": {
    "message": "相談者が送信前に確認した補足",
    "summary": "相談者が画面で確認した正規化済み要約",
    "structured_lead": {
      "purpose": "...",
      "industry_role": "...",
      "data_sensitivity": "...",
      "stage": "...",
      "timing_budget": "..."
    }
  },
  "consent": {
    "version": "cloudia-grift-v1",
    "accepted_at": "2026-07-14T00:00:00.000Z"
  }
}
```

- リクエストに `tenant_id` を含めない。Grift は `CLOUDIA_HANDOFF_TENANT_ID` で Cor. テナントへ固定する。
- Worker と Grift の双方で `CLOUDIA_HANDOFF_AUTH_TOKEN` を Cloudia route 専用 secret とし、他の internal API を操作できる共通 token を再利用しない。secret は Cloudflare Worker secret と Google Secret Manager で保持し、設定ファイル・ログ・レスポンスへ出さない。
- 生の会話全文は送らない。contact-chat が保持する信頼済み要約、構造化項目、相談者が確認した補足だけを送る。
- 同じ `Idempotency-Key` と同じ canonical payload は同じ submission / case / portal session / expiry を返し、ケースを重複作成しない。同じキーで payload が異なる場合は `409` とする。
- Grift は既存 IntakeService、RLS transaction、portal token 発行を再利用する。
- 成功応答は `submission_id`, `case_id`, `chat_url`, `expires_at`, `duplicate` を Worker に返す。Worker は `chat_url` と有効期限以外をブラウザへ公開しない。
- `structured_lead` の各項目は未取得の場合に省略可能とし、未知フィールドは拒否する。
- Cloudia 専用 portal token の TTL は発行から 24 時間とし、再送時も同じ expiry を返す。DB には raw token を保存せず、token secret の key version とローテーション方針を Grift ADR に記録する。
- browser へ返せる URL は許可済み HTTPS origin の `/chat/portal/<opaque-token>` に限定し、userinfo、任意 port、query、fragment、別 path を Worker、Cloudia、埋め込み親の各層で拒否する。

### 見積と有償変更の境界

- Grift チャット内の概算は非拘束の参考値とする。
- 相談者が概算を了承した後、Cor. 管理画面で担当者が確認した初回詳細見積を 1 回無料で公開する。
- 初回詳細見積の公開後に発生する仕様変更、追加調査、代替案比較、再見積は有償とする。
- 2 回目以降は既存 change request に `required -> requested -> approved` の有償確認状態を持たせる。
- 未承認の再見積は `PAID_REESTIMATE_REQUIRED` で停止する。Stripe は今回の境界に含めず、Cor. の契約確認後に管理画面から 1 回分を解放する。

### Rollout

- Worker の `GRIFT_HANDOFF_ENABLED` と Grift の `CLOUDIA_HANDOFF_ENABLED` は既定 `false` とする。
- Preview で 4つの引継ぎ対象 intent、contract / tenant isolation / browser E2E を通した後に両方を有効化する。
- 一方だけ有効、secret 不足、タイムアウト、Grift 4xx/5xx はメール fallback とし、転送成功と表示しない。

## 理由

- 相談者を Grift に移動させることで、Grift を単なる社内 CRM ではなく、ヒアリング・概算・変更管理の顧客体験として利用できる。
- browser -> Worker -> Grift の順に trust boundary を置くことで、内部 API と固定テナント設定を公開しない。
- 既存 IntakeService とメール受付を再利用し、新しいリードモデルや別の通知基盤を増やさない。

## 影響

- corsweb: #259。Worker の送信・fallback と本 ADR の正本を担当する。
- cloudia: Cor-Incorporated/cloudia#25。明示同意と Grift 遷移を担当する。
- griftai: #55〜#58 は横断 Epic / 契約 / E2E の追跡として残し、Grift 本体のコード変更は `Cor-Incorporated/Grift` の実装 Issue で追跡する。
- Grift LP は `contract-dev` を CTA として使用せず、既存の製品 intent を維持する。

## 受入基準

- 4つの対象 intent は引継ぎでき、同意なし、対象外・未知 intent、信頼済み session と payload の intent 不一致では Grift が呼ばれない。
- 同一冪等キーの再送で Grift case が増えない。
- Cor. 以外のテナントへ作成できず、他テナントから読み取れない。
- browser、URL、ログ、メールに service secret や内部 tenant ID が出ない。
- Grift 障害時もメール受付が完了し、Cloudia は fallback 状態を表示する。
- 成功時は相談者が Grift 公開ポータルへ遷移し、追加ヒアリングと概算確認を継続できる。
- 初回詳細見積は無料で公開でき、2 回目以降は有償確認前に停止する。

## 参照

- ADR-0012 / ADR-0013 / ADR-0014 / ADR-0015
- Grift ADR-0022 / ADR-0023 / ADR-0024 / ADR-0025
