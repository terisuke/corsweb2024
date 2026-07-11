# ADR-0015 横断 ADR の正本配置と参照方式

## ステータス: Accepted (2026-07-11)

## 背景
- corsweb / griftai / cloudia の 3 リポジトリは intent 契約・導線設計・公開順序を共有するが、同一 ADR を各リポにコピー配置すると更新時に必ず同期漏れが発生する。
- 現状すでに intent 正本は corsweb（ADR-0010 → ADR-0014）にあり、griftai / cloudia は事実上これに従っている。

## 決定

### 正本 = corsweb
- クロスリポジトリ契約（intent キー、Cloudia/contact-chat 一極集中、Grift ハンドオフ API 契約、公開順序）の ADR 正本は **corsweb `docs/adr/`** に置く。
- 対象: ADR-0010 / 0013 / 0014 / 0015（以後の横断 ADR も同様）。

### 他リポは「参照 ADR」1 枚のみ
- griftai / cloudia には、正本へのリンク（permalink）と「本リポはこれに従う」旨のみを書いた**参照 ADR を各 1 枚**置く。
- 参照 ADR には正本の内容をコピーしない。実装ガード（check スクリプト・型・テスト）との対応関係のみ記載してよい。

### Issue の配置
- Issue は**実装するリポジトリ**に置く。横断の親子関係は issue 本文の相互参照（`Cor-Incorporated/<repo>#<n>` 形式）で表現する。

### 再検討タイミング
- monorepo カットオーバー（corsweb #255 / cloudia #11）実施時に、正本の配置（monorepo への移設）を再検討する。それまで本方式を維持する。

## 参照
- ADR-0013 / ADR-0014、griftai 参照 ADR、cloudia 参照 ADR
