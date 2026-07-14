# contact-chat Cloudia–Grift 安全リリース／ロールバック runbook

対象は Cloudflare Worker `cor-contact-chat` と `cor-contact-chat-preview` の Cloudia–Grift handoff だけである。通常のメール受付、D1、通知 Queue、Turnstile、WAF を壊さず、Preview から production へ段階的に昇格する。

この文書の「変更あり」コマンドは、承認されたリリース時間帯に担当者が実行する手順である。read-only 監査では実行しない。secret 値、Authorization header、PII、portal token、内部 tenant ID、D1 のデータ行、Queue message body を画面・ログ・Issue・PR に出してはならない。

## 絶対条件

- `GRIFT_HANDOFF_ENABLED` と Grift 側 `CLOUDIA_HANDOFF_ENABLED` は、準備と feature-off E2E が終わるまで `false` を保つ。
- Preview と production は Worker、D1、Queue、DLQ、secret を混用しない。
- `0005_submission_payload_fingerprint.sql` は Preview、次に production の順で適用する。新コードを先に出さない。
- Bearer は Cloudia route 専用とし、他の internal API 用 token を再利用しない。同じ approved source から Worker と Grift へ設定する。
- Worker は Grift に `tenant_id` を送らない。Grift の `CLOUDIA_HANDOFF_TENANT_ID` が Cor tenant を固定する。
- Grift 障害や設定不一致はメール受付を維持して `handoff.status=fallback` にする。成功表示へ読み替えない。
- production の Turnstile / WAF / Grift public URL / Cor tenant isolation / Nagi UAT のいずれかが未確認なら production handoff を有効化しない。
- Worker rollback は D1 migration、Queue、WAF、Turnstile、Grift の状態を巻き戻さない。各面を別々に扱う。

## 証跡の境界

| 状態          | 言ってよい条件                                                             | 証跡                                               | まだ言ってはいけないこと              |
| ------------- | -------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------- |
| implemented   | 所有コード・文書・テスト・dry-run がローカルで通過                         | commit 前 diff、テスト結果、dry-run 結果           | merged / deployed / live              |
| merged        | 対象 branch に merge commit が存在                                         | repository URL、merge commit SHA                   | deployed / live                       |
| deployed      | Cloudflare deployment が対象 version を 100% 配信                          | environment、deployment ID、version ID、時刻       | health、E2E、UAT 合格                 |
| live-verified | health、remote D1 schema、Queue、synthetic request/fallback を実環境で確認 | HTTP status、schema 列存在、集計値、固定 enum ログ | Nagi UAT 合格                         |
| UAT-approved  | Nagi が実ブラウザで導線・同意・遷移・fallback を確認                       | UAT 記録、対象 version、日時、sanitized screenshot | 別 version や production への自動継承 |

一つの証跡から次の状態を推測しない。特に merge、deploy、live、UAT は別々に記録する。

## 2026-07-14 read-only baseline

この表は本 runbook 作成時の snapshot であり、実行時には必ず再取得する。

| 項目                      | production                              | Preview                                 |
| ------------------------- | --------------------------------------- | --------------------------------------- |
| latest deployment         | `ff1fae23-2ffb-48b8-871f-4ff34481cea3`  | `42b2e9d7-10c5-46ce-ad80-73e7e53a8337`  |
| 100% version              | `e3e7f729-6fae-4497-b553-82ed1252f653`  | `d4776605-f175-4071-aec2-2d55381578d2`  |
| health                    | HTTP 200 / `ok=true`                    | URL 未指定のため未確認                  |
| D1 0005                   | pending、列なし                         | pending、列なし                         |
| handoff secret            | missing                                 | missing                                 |
| Turnstile secret          | missing                                 | missing                                 |
| Vertex / Resend secrets   | names present                           | names present                           |
| Anthropic rollback secret | missing                                 | missing                                 |
| Queue / DLQ               | 2つとも存在                             | 2つとも存在                             |
| deployed Grift vars       | handoff var は absent、実質 feature-off | handoff var は absent、実質 feature-off |

production / Preview の primary Queue は各 Worker の producer / consumer を持つ。DLQ は存在し、consumer なしである。WAF rule、Turnstile widget の hostname/action、Grift tenant/public URL、Nagi UAT は Wrangler だけでは確認できないため、現 snapshot では production gate 未達である。

## 安全な自動確認

```bash
cd workers/contact-chat

# parser と mutation guard だけ。ネットワークなし。
node scripts/verify-release-readiness.mjs --self-test

# production / Preview の bundle 検証だけ。upload なし。
node scripts/verify-release-readiness.mjs --local-only

# production と Preview の read-only 監査。Preview URL は環境の実URLを渡す。
node scripts/verify-release-readiness.mjs \
  --preview-url "https://<preview-worker-host>/api/contact/health"
```

スクリプトは次だけを許可する。

- `wrangler deploy --dry-run`
- deployment / version / secret name の一覧・参照
- D1 migration 一覧、schema 列確認、outbox 集計の `SELECT`
- Queue / DLQ の metadata 参照
- health の HTTPS `GET`

child command の生出力は表示しない。`[BLOCK]` が1件でもあれば昇格しない。`AUTOMATED CHECKS PASS` でも、WAF、Turnstile、Grift、Nagi の manual gate は別途必須である。

## Preview リリース

### 1. 入力を固定する

1. 対象 merge commit、Worker source commit、migration checksum を記録する。
2. `wrangler.toml` の Preview D1 / Queue / DLQ が Preview 専用品であることを確認する。
3. Preview の `GRIFT_API_ORIGIN` は Grift dev/staging の HTTPS origin のみ、`GRIFT_PUBLIC_URL_ORIGINS` は Preview で実際に返す public portal origin のみとする。path、query、fragment、userinfo、IP literal を含めない。
4. `GRIFT_HANDOFF_ENABLED="false"` を確認する。production vars はこの段階で変更しない。
5. dry-run と通常テストを実行する。

```bash
cd workers/contact-chat
npm run typecheck
npm run test
node scripts/verify-release-readiness.mjs --local-only
```

### 2. Preview D1 に 0005 を適用する（変更あり）

Wrangler 4.110.0 では複数 account 認証時に `d1 migrations list` が `account_id` を選べない場合があるため、config の値を process environment にだけ渡す。値を表示しない。

```bash
cd workers/contact-chat
export CLOUDFLARE_ACCOUNT_ID="$(awk -F'"' '/^account_id = /{print $2; exit}' wrangler.toml)"

# read-only: 0005 が pending であることを確認
npm exec -- wrangler d1 migrations list DB --env preview --remote

# 変更あり: 対象が Preview DB であることを対話表示で再確認して承認
npm exec -- wrangler d1 migrations apply DB --env preview --remote

# read-only: pending から消え、列が1つ存在することを確認
npm exec -- wrangler d1 migrations list DB --env preview --remote
npm exec -- wrangler d1 execute DB --env preview --remote --json \
  --command "SELECT COUNT(*) AS column_count FROM pragma_table_info('submission_intake') WHERE name='payload_fingerprint'"

unset CLOUDFLARE_ACCOUNT_ID
```

合格条件は `0005` が pending 一覧に無く、`column_count=1` であること。migration apply の backup / 実行時刻も証跡へ記録する。失敗時は Worker を deploy せず、D1 の結果を確認して停止する。

### 3. Preview Bearer を Grift staging と一致させる（変更あり）

同じ shell 変数を標準入力で双方へ渡す。値を引数、履歴、ファイル、stdout に出さない。次は `zsh` 用である。Grift project 名と secret resource は Grift 側 runbook の承認済み値を使う。

```bash
cd workers/contact-chat
: "${GRIFT_STAGING_PROJECT:?set the approved Grift staging project}"
read -r -s 'CLOUDIA_HANDOFF_AUTH_TOKEN?Preview route-scoped Bearer: '
printf '\n' >&2
trap 'unset CLOUDIA_HANDOFF_AUTH_TOKEN' EXIT INT TERM

# 変更あり: Grift staging の Google Secret Manager に同じ値を追加
printf '%s' "$CLOUDIA_HANDOFF_AUTH_TOKEN" | \
  gcloud secrets versions add CLOUDIA_HANDOFF_AUTH_TOKEN \
    --project="$GRIFT_STAGING_PROJECT" --data-file=- >/dev/null

# 変更あり: Preview Worker secret に同じ値を設定
printf '%s' "$CLOUDIA_HANDOFF_AUTH_TOKEN" | \
  npm exec -- wrangler secret put CLOUDIA_HANDOFF_AUTH_TOKEN --env preview >/dev/null

unset CLOUDIA_HANDOFF_AUTH_TOKEN
trap - EXIT INT TERM
```

Grift が secret を environment variable として読む場合は、Grift 手順に従って新 revision を出し、active secret version を取り込ませる。値を読まずに次を確認する。

```bash
# opaque version name と state だけ。secret payload は返さない。
gcloud secrets versions describe latest \
  --secret=CLOUDIA_HANDOFF_AUTH_TOKEN \
  --project="$GRIFT_STAGING_PROJECT" \
  --format='value(name,state)'

# Worker 側は名前の存在だけ。
npm exec -- wrangler secret list --env preview --format json
```

Cloudflare は設定済み secret の値を返さないため、値の digest 比較を後から行うことはできない。整合の証明は「同一 approved source からの設定」「Grift の active secret version」「正 token で 2xx、誤 token で 401/403」「Worker positive E2E」の組み合わせとする。

### 4. feature-off version を Preview に deploy する（変更あり）

D1 と secret の確認後、`GRIFT_HANDOFF_ENABLED=false` のまま deploy する。`--strict` で remote 競合時に停止させる。

```bash
npm exec -- wrangler deploy --env preview --dry-run

# 変更あり
npm exec -- wrangler deploy --env preview --strict \
  --message "cloudia-grift preview feature-off"
```

deploy 後、read-only script に Preview URL を渡し、deployment / version / health / D1 / Queue / secret names を再取得する。

### 5. `false → E2E → true` を守る

順序は次のとおり。

1. **両系 false**: Worker `GRIFT_HANDOFF_ENABLED=false`、Grift `CLOUDIA_HANDOFF_ENABLED=false`。
2. **feature-off E2E**: synthetic contact で通常メール受付と Queue 登録が成功し、対象 intent＋同意ありでも `handoff.status=fallback`、Grift case 増加なしを確認する。
3. **Grift staging だけ ready**: Worker は false のまま、Grift staging の tenant固定、route-scoped Bearer、intake endpoint、public URL を Grift の integration test で確認する。誤 token は 401/403、正 token は Cor tenant にだけ作成する。
4. **Grift staging を true**: Grift 側だけ `CLOUDIA_HANDOFF_ENABLED=true` にする。Worker false のため public traffic からの handoff はまだ発生しない。
5. **Worker Preview を true**: 承認済み release change で Preview の `GRIFT_HANDOFF_ENABLED=true` にして dry-run 後に deploy する。
6. **positive browser E2E**: 4 intent を synthetic data で実行し、`ready`、許可 origin、正確な `/chat/portal/<opaque-token>`、24時間以内 expiry、Grift portal 継続を確認する。
7. 1件でも失敗したら Worker を先に false へ戻し、その後 Grift staging を false に戻す。

feature-off E2E と positive E2E を同じ「E2E済み」にまとめない。前者は安全停止、後者は実際の handoff を証明する。

### 6. Preview E2E matrix

実在人物の情報を使わず、予約済み synthetic alias を使う。receipt ID、portal token、内部 case / tenant ID は記録しない。

| ケース                                                               | 期待                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 4つの対象 intent、genuine、active D1 session、確認済み要約、同意あり | `handoff.status=ready`、同一 Cor tenant、同じ idempotency key で case 増加なし |
| 同意なし                                                             | `handoff` なし、メール受付継続                                                 |
| sessionなし / intent不一致 / sales / spam                            | `fallback` または非handoff、Grift caseなし                                     |
| feature off / auth不一致 / Grift 4xx・5xx・timeout / URL契約違反     | HTTP 200 の `fallback`、メール・Queue 継続                                     |
| 同じ idempotency key、同じ payload                                   | duplicate replay、case増加なし                                                 |
| 同じ idempotency key、異なる payload                                 | 409、Grift未呼出し                                                             |
| Turnstile 成功 token                                                 | `/submit` 成功                                                                 |
| Turnstile 欠落・失敗・再利用                                         | `/submit` 拒否。token は1回ごとに新規発行                                      |
| Queue consumer 一時失敗                                              | retry 後に送信、上限超過時は DLQ。本文は見ない                                 |

## production の明示ゲート

すべて `PASS` になるまで production handoff を有効化しない。

### Turnstile

- production 専用 widget で `cor-jp.com` / `www.cor-jp.com` の必要 hostname だけを許可する。
- Cloudia の production sitekey と Worker `TURNSTILE_SECRET` が同じ widget pair である。
- server-side Siteverify を `/submit` で通し、成功・失敗・期限切れ・再利用を実ブラウザで確認する。
- `/chat` には token を再利用しない。Turnstile token は単回使用・短時間有効である。
- 現実装は secret 不在時に Turnstile だけ fail-open なので、運用ゲートは fail-closed とし、secret name 不在なら production deploy / enable を停止する。

### WAF

- zone `cor-jp.com` の rate limiting rule が `cor-jp.com/api/contact/*` を対象に enabled である。
- `/chat` の LLM cost abuse と `/submit` の濫用を区別し、現行 traffic を Security Analytics で観測して threshold を決める。
- 新規 threshold は最初に Log で誤検知を確認し、承認後に Block / Managed Challenge へ昇格する。
- rule ID、expression、characteristics、period、threshold、action、mitigation timeout、承認者を記録する。Security Events は path / rule / status の集計だけを保存し、request body や header を保存しない。
- Worker 内 rate limit は isolate 単位の best-effort であり、WAF の代替にしない。

### Grift public base URL

- production `GRIFT_API_ORIGIN` は Grift internal API の plain HTTPS origin だけである。
- `GRIFT_PUBLIC_URL_ORIGINS` は承認済み public portal origin と一致する。現契約では `https://app.griftai.org`。
- E2E の `chat_url` は allowlist origin、exact `/chat/portal/<safe-token>`、query / fragment / userinfo なし、expiry は未来かつ24時間以内である。
- URL 全体や opaque token を証跡へ貼らず、origin / path-contract / TTL の PASS だけを記録する。

### Cor tenant / intake link

- Grift `CLOUDIA_HANDOFF_TENANT_ID` が Cor tenant に固定され、request body の tenant 値を受理しない。
- Cloudia route token は intake endpoint 以外の internal API を操作できない。
- 作成された intake / case / portal session は Cor tenant から参照でき、別 tenant から読めない。
- 同一 payload replay は同一 submission / case / portal session を返し、異なる payload は 409 になる。
- Grift portal で追加ヒアリングと概算確認へ継続できる。

### Nagi UAT

- Preview の対象 deployment / version を固定して Nagi が実ブラウザで確認する。
- 4 intent、要約編集後の同意解除・再確認、Turnstile、ready 遷移、fallback 表示、メール受付継続を確認する。
- screenshot は氏名、メール、本文、receipt ID、portal token、内部 ID をマスクする。
- 証跡には UAT 実施者、日時、environment、deployment ID、version ID、各 case の PASS / BLOCK だけを残す。
- Nagi の明示 sign-off がない、または sign-off 後に version が変わった場合は production gate を閉じる。

## production rollout

### 1. feature-off deployment を作る

1. Preview の positive E2E と Nagi UAT を固定 version で完了する。
2. production の WAF / Turnstile / Grift / Cor tenant gate を完了する。
3. 現在の 100% version を `PRE_RELEASE_VERSION_ID`（全体 rollback 用）として記録する。
4. production vars に承認済み API / public origins を設定し、`GRIFT_HANDOFF_ENABLED=false` を保つ。
5. production dry-run を実行する。

### 2. production D1 0005（変更あり）

Preview と同じ read-only list → apply → list → schema query を、`--env preview` なしで実行する。Preview の migration / E2E 証跡が無い場合は実行しない。

```bash
export CLOUDFLARE_ACCOUNT_ID="$(awk -F'"' '/^account_id = /{print $2; exit}' wrangler.toml)"
npm exec -- wrangler d1 migrations list DB --remote

# 変更あり
npm exec -- wrangler d1 migrations apply DB --remote

npm exec -- wrangler d1 migrations list DB --remote
npm exec -- wrangler d1 execute DB --remote --json \
  --command "SELECT COUNT(*) AS column_count FROM pragma_table_info('submission_intake') WHERE name='payload_fingerprint'"
unset CLOUDFLARE_ACCOUNT_ID
```

0005 は additive column なので、rollback 時も down migration は行わない。

### 3. production secrets と feature-off deploy（変更あり）

production の Grift secret と Worker secret も、Preview とは別の approved source から同じ標準入力方式で設定する。Turnstile secret も対話入力または approved secret-manager pipe で設定し、値を表示しない。

```bash
# 変更あり。各値は対話で入力し、stdoutへ出さない。
npm exec -- wrangler secret put CLOUDIA_HANDOFF_AUTH_TOKEN
npm exec -- wrangler secret put TURNSTILE_SECRET

npm exec -- wrangler deploy --dry-run

# 変更あり。まだ GRIFT_HANDOFF_ENABLED=false。
npm exec -- wrangler deploy --strict \
  --message "cloudia-grift production feature-off"
```

health、deployment/version、D1、Queue/DLQ、secret names を read-only script で確認する。feature-off synthetic submit でメール / Queue が継続し、handoff は fallback、Grift case は増えないことを確認する。合格した feature-off version を `OFF_VERSION_ID`（handoff 即時停止用）として記録する。

### 4. enable（変更あり）

1. Grift production の `CLOUDIA_HANDOFF_ENABLED=true` を先に反映し、Grift health / auth / Cor tenant / public URL を確認する。
2. Worker はまだ false のため、失敗しても public handoff は発生しない。
3. production `GRIFT_HANDOFF_ENABLED=true` の承認済み version を dry-run 後に deploy する。
4. deployment が新 version 100% であることを確認する。
5. synthetic positive smoke を1件だけ行い、ready / portal / idempotency / email / Queue を確認する。
6. 15分、1時間、翌営業日に error/fallback rate、Queue backlog、DLQ、email delivery aggregate を確認する。

## fail-closed / feature-off の判定

| 異常                                                                        | 外向き挙動                         | リリース判断                                              |
| --------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| Resend 未設定、D1保存失敗、Queue未設定/登録失敗                             | `/submit` を 5xx、成功を装わない   | fail closed、即停止                                       |
| Turnstile production secret 不在                                            | 現実装は検証skip                   | 運用ゲートで fail closed、deploy/enable禁止               |
| Grift flag false、config/secret不足、auth/network/4xx/5xx/timeout、不正応答 | メール受付を維持し `fallback`      | handoff feature-off、原因解消まで再enable禁止             |
| public URL origin/path/expiry/submission相関違反                            | `fallback`、URL非公開              | security incident として停止                              |
| Queue retry 増加 / DLQ backlog                                              | handoffとは独立して通知遅延        | Worker false、通知復旧を優先                              |
| WAF誤検知                                                                   | `/chat` / `/submit` が edge で拒否 | ruleを安全な前状態へ戻す。Worker rollbackだけでは直らない |

## rollback

### A. handoff だけ即時停止する

1. Worker を先に `GRIFT_HANDOFF_ENABLED=false` の既知 version へ戻す、または false の新 version を deploy する。
2. deployment が off version 100% であることを read-only 確認する。
3. Grift production の `CLOUDIA_HANDOFF_ENABLED=false` を反映する。
4. synthetic submit がメール / Queue を維持し `fallback` になることを確認する。

既知の off version へ戻す場合:

```bash
# 変更あり。事前に versions view で target が feature-off と確認済みであること。
npm exec -- wrangler rollback "$OFF_VERSION_ID" \
  --message "disable cloudia-grift handoff"
```

Preview は同じコマンドに `--env preview` を付ける。version ID を省略した対話 rollback は、意図しない version を選ぶ危険があるため使わない。

### B. Worker 全体を rollback する

- health、通常 chat/submit、D1/Queue binding、email に回帰がある場合だけ、記録済みの known-good version へ rollback する。
- D1 0005 は残す。旧コードは追加列を無視できることを Preview で確認してから production rollback する。
- Cloudflare resource が削除・変更されて target version の binding と不整合なら rollback は成立しない。先に `versions view` と resource existence を確認する。

### C. Bearer rotation を戻す

1. Worker / Grift flags を両方 false にする。
2. Grift の known-good secret version を active revision に戻す。
3. 同じ known-good source を Worker secret に再設定する。
4. 誤 token 401/403、正 token contract test、feature-off E2E、positive E2E の順で再確認する。

### D. WAF / Turnstile / Queue

- handoff rollback を理由に WAF や Turnstile を無効化しない。
- WAF 誤検知時は直前の approved rule/actionへ戻し、Security Events で確認する。
- Turnstile widget/secret pair 不一致時は `/submit` を公開したまま bypass せず、production enable を停止して pair を復旧する。
- DLQ message を手動 pull / replay すると外部状態が変わる。read-only 監査では Queue metadata と backlog 集計だけを見る。replay は別承認にする。

## read-only 運用確認

通常は安全確認スクリプトを使う。個別確認が必要な場合も、secret names、aggregate、固定 enum だけを扱う。

### deployment / version / health

```bash
node scripts/verify-release-readiness.mjs \
  --preview-url "https://<preview-worker-host>/api/contact/health"
```

記録するのは environment、deployment ID、version ID、traffic percentage、timestamp、health status だけ。`versions view` の author や他の vars をそのまま貼らない。

### D1 migration / schema / outbox aggregate

```bash
export CLOUDFLARE_ACCOUNT_ID="$(awk -F'"' '/^account_id = /{print $2; exit}' wrangler.toml)"

npm exec -- wrangler d1 migrations list DB --remote
npm exec -- wrangler d1 execute DB --remote --json \
  --command "SELECT COUNT(*) AS column_count FROM pragma_table_info('submission_intake') WHERE name='payload_fingerprint'"
npm exec -- wrangler d1 execute DB --remote --json \
  --command "SELECT status, delivery_status, COUNT(*) AS item_count FROM notification_outbox GROUP BY status, delivery_status ORDER BY status, delivery_status"

unset CLOUDFLARE_ACCOUNT_ID
```

Preview は3コマンドに `--env preview` を加える。submission / session / audit event の個別行、ciphertext、email HMAC、provider message ID、last_error の原文を取得しない。

### Queue / DLQ

```bash
npm exec -- wrangler queues info cor-contact-notifications
npm exec -- wrangler queues info cor-contact-notifications-dlq
npm exec -- wrangler queues info cor-contact-notifications-preview
npm exec -- wrangler queues info cor-contact-notifications-preview-dlq
```

Cloudflare Dashboard の Queues metrics で backlog count / bytes / oldest message age、delivery / retry / failure を集計で見る。message body は開かない。primary backlog 増加、oldest age 上昇、DLQ > 0 は release blocker とする。

### fallback / logs

Workers Observability では `event=contact_chat_grift_handoff_failed` を filter し、次の固定 reason の件数だけを見る。

- `config`, `network`, `timeout`
- `http_4xx`, `http_5xx`, `http_other`
- `response_oversize`, `response_not_json`, `response_invalid`
- `url_not_allowed`
- `unexpected`

request body、URL、submission ID、exception message、Authorization、tenant ID は query / export 対象にしない。feature-off や eligibility 不成立は reason なし fallback のため、エラーログ件数だけで成功率を計算しない。synthetic E2E の browser response と Grift case aggregate を合わせる。

### WAF / Turnstile

- WAF: Cloudflare Dashboard の Security rules / Security Events で enabled rule と aggregate match を read-only 確認する。
- Turnstile: widget hostname/action と token validation の成功/失敗集計を確認する。token 自体は保存しない。
- Dashboard の変更権限を使う操作は release step と分離し、read-only 証跡取得中には行わない。

## リリース記録テンプレート

```text
environment:
source commit:
merge commit:
deployment ID:
version ID / traffic:
D1 0005 backup + column_count:
secret names present (values omitted):
Grift active secret version name/state (value omitted):
Worker flag / Grift flag:
health:
Queue / DLQ aggregate:
fallback fixed-reason aggregate:
WAF rule ID/action/aggregate:
Turnstile widget hostname/action aggregate:
Cor tenant isolation:
public URL contract:
Nagi UAT record:
PRE_RELEASE_VERSION_ID:
OFF_VERSION_ID:
decision: PASS / BLOCK / ROLLED_BACK
```

## 公式参照

- [Wrangler Workers commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/)
- [Workers versions and rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
- [D1 Wrangler migration commands](https://developers.cloudflare.com/d1/wrangler-commands/)
- [Queues dead-letter queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)
- [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Turnstile testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
- [WAF rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
