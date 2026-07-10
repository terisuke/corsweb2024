# ADR-0005 Contact を段階移行（Phase1 SSGFORM 継続、Phase2 Cloudia UI + contact-chat Worker・LLM 非依存）

## ステータス: Accepted (2026-06-13) / **改訂 2026-07-10**（実装実態・Cloudia 統合方針を反映）

## 背景
- 当初 `ContactForm.astro` は外部フォーム SSGFORM に PII を送信。Phase1 で同意導線・PP 明記・相談種別更新を実施済み（または進行中）。
- 2026-06 時点の ADR は Phase2 を「GCP Cloud Run の自社チャットボット」と記載していたが、実装は **Cloudflare Workers `workers/contact-chat`**（`cor-jp.com/api/contact/*`）に収束している。
- 2026-07-10 監査（`Cor_Grift_サイト刷新提案`）により、Contact の最終 UI は **Cloudia（3d-emotional-chat-ai）をフォーム代用のチャットボット** とし、同一オリジンで corsweb に統合する方針が確定した。
- 3D 表示不具合・別ドメイン・Netlify 配置・個人リポ（`terisuke`）のままでは B2B 受付に使えない。

## 決定

### Phase1（維持）
- SSGFORM 継続は **fallback / JS 無効時の最小連絡手段** として残す。
- 利用目的明示・PP リンク・同意導線・現行事業の相談種別を維持。

### Phase2（改訂後の正本）
Contact の本線を次の二層で構成する。

| 層 | 正本 | 役割 |
|---|---|---|
| **API** | `workers/contact-chat`（Cloudflare Worker） | `/api/contact/chat`（会話・分類・PII 非保存）・`/api/contact/submit`（PII はメールのみ・LLM 非経由） |
| **UI** | Cloudia（旧 3d-emotional-chat-ai） | お問い合わせフォーム代用のチャット UI。3D アバターは任意・失敗時はテキストのみで完走 |

追加決定:

1. **GCP Cloud Run は Phase2 の前提から外す**（本 ADR の 2026-06 記載を撤回）。
2. **LLM プロバイダ非依存**は維持（現状 Anthropic 既定・抽象化レイヤで他プロバイダ追加可）。
3. **intent 初期化**: `?intent=confidential-ai-assessment|local-llm-poc|grift-team-beta|grift-paid-trial|estimate-audit|press-speaking-other` を受け取り、初回選択肢をプリセット。
4. **構造化リード**: 目的 → 業種・役割 → データ機密度（具体本文は入力させない）→ 進捗段階 → 時期・予算帯 → 連絡先・同意 → 要約の利用者修正 → 送信。
5. **記録方針**: 生会話全文の無期限保存はしない。要約と必要項目を主記録。全文は短期または非保存（PP と整合、ADR-0012 参照）。
6. **フォールバック必須**: JS 無効・Cloudia 障害時はメール/電話/最小フォーム。3D 緑画面等でもチャット本体は動作。
7. **統合ロードマップ**（詳細は ADR-0012）:
   - A: B2B 受付 UI・intent（現行 Cloudia リポ）
   - B: GitHub Transfer → `Cor-Incorporated`
   - C: Netlify → Cloudflare
   - D: corsweb `/contact/` 主 UI = Cloudia カットオーバー

### 受付トーン
- Contact / B2B 受付: **敬語**（「おっす！」等の SNS 口調は使わない）。
- SNS アンバサダー用途は別モードとして分離可。

## 理由
- 実装済みの contact-chat Worker を捨てて GCP に寄せ直すコストが高く、PII を「メールのみ・LLM 非経由」にできる現状設計が ADR 当初の越境最小化意図と整合する。
- 監査で「無料相談・汎用フォーム・別ドメイン Cloudia」が導線の真実性を損なっているため、**同一ドメインの構造化チャット**が公開前〜公開直後の本線になる。
- フォーム即廃止は a11y / 障害時リスクがあるため fallback を残す。

## 影響
- Issue #59 および関連 Issue を本改訂に合わせて更新する。
- `CONTACT_CHAT_ENABLED` や Contact ページは、最終的に **Cloudia 主 UI + フォーム fallback** に置き換える（中間段階では既存 ContactChat ウィジェットを API 接続の試験に使ってよい）。
- PP を contact-chat / Cloudia の処理フローに合わせて再更新する。
- チャットボット PII は CMS DB（ADR-0003 Supabase）に置かない（従来どおり）。
- Cloudia リポ移管・CF ホスティングは ADR-0012 / Cloudia 側 ADR-0004 に従う。

## 代替案
- **GCP Cloud Run に寄せ直す**: 既存 Worker と二重投資になるため却下。
- **SSGFORM を本線のまま据え置き**: 構造化リード・intent・同一ドメイン体験が得られず、監査 P0 を満たせないため却下。
- **3D なしのテキストウィジェットのみ**: 短期は可。最終ブランド UI としては Cloudia 統合を目標に残す。

## 参照
- ADR-0012 Cloudia 統合・org 移管・CF
- 監査資料: `Cor_Grift_サイト刷新提案_2026-07-10.md` §6, §12
- `workers/contact-chat/README.md`
