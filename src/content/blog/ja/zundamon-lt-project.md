---
title: "【Marp×VOICEVOX×VTubeStudio】ずんだもんにLT発表してもらった話"
description: "技術の創造的活用！Marp、VOICEVOX、VTubeStudioを組み合わせて、ずんだもんによる自動LT発表システムを構築した実験プロジェクト"
pubDate: 2024-01-30
author: "Terisuke"
category: "lab"
tags: ["Marp", "VOICEVOX", "VTubeStudio", "自動化", "創造的プロジェクト"]
# image:
#   url: "/images/blog/zundamon-project.avif"
#   alt: "ずんだもんLTプロジェクト"
lang: "ja"
---

# 【Marp×VOICEVOX×VTubeStudio】ずんだもんにLT発表してもらった話

「AIでくだらないことをやりたい！」という純粋な好奇心から始まったこのプロジェクト。技術を楽しく創造的に活用する実験として、ずんだもんに自動でLT発表してもらうシステムを構築した。

もう自分で発表するのも飽きたから、ずんだもんに丸投げしてみた。結果、自分より人気が出たのは内緒だ。

## プロジェクトの構成要素

### 1. Marp - プレゼンテーション作成

```markdown
---
marp: true
theme: default
class: lead
---

# ずんだもんのLT
## 技術で遊ぼう！

---

# 今日のお話
- 自動化って楽しいのだ！
- みんなで技術を楽しむのだ！
```

### 2. VOICEVOX - 音声合成

```python
import requests

API_URL = "http://localhost:50021"

def generate_zundamon_voice(text: str) -> bytes:
    """VOICEVOX API を呼び出して音声データ (wav) を取得する"""

    query_params = {"text": text, "speaker": 3}

    # 音声クエリ生成
    query_resp = requests.post(f"{API_URL}/audio_query", params=query_params, timeout=10)
    if query_resp.status_code != 200:
        raise RuntimeError(f"audio_query failed → {query_resp.status_code}: {query_resp.text}")

    # 音声合成
    synth_resp = requests.post(
        f"{API_URL}/synthesis",
        params={"speaker": 3},
        data=query_resp.content,
        timeout=30
    )
    if synth_resp.status_code != 200:
        raise RuntimeError(f"synthesis failed → {synth_resp.status_code}: {synth_resp.text}")

    return synth_resp.content
```

### 3. VTubeStudio - キャラクター制御

```javascript
// VTubeStudio API を使ったキャラクター制御
class VTubeStudioController {
  constructor(wsUrl = "ws://localhost:8001") {
    this.wsUrl = wsUrl;
    this.isOpen = false;
    this.websocket = new WebSocket(this.wsUrl);

    this.websocket.addEventListener("open", () => {
      this.isOpen = true;
      console.log("✅ VTubeStudio WebSocket connected");
    });

    this.websocket.addEventListener("error", (err) => {
      console.error("❌ WebSocket error", err);
    });

    this.websocket.addEventListener("close", () => {
      this.isOpen = false;
      console.warn("⚠️ WebSocket closed");
    });
  }

  send(data) {
    if (!this.isOpen) {
      console.warn("WebSocket is not open. Message skipped.");
      return;
    }
    this.websocket.send(JSON.stringify(data));
  }

  triggerExpression(expressionFile) {
    const message = {
      apiName: "VTubeStudioPublicAPI",
      apiVersion: "1.0",
      requestID: crypto.randomUUID(),
      messageType: "HotkeyTriggerRequest",
      data: { hotkeyID: expressionFile }
    };
    this.send(message);
  }

  syncWithAudio(audioTimestamps) {
    // 音声タイムスタンプに合わせて口パクをトリガー
    audioTimestamps.forEach((ts) => {
      setTimeout(() => this.triggerExpression("mouth_animation"), ts);
    });
  }
}
```

## システム統合

### 自動化ワークフロー

```bash
#!/bin/bash
# 自動LT生成スクリプト

# 1. Markdownからスライド生成
marp presentation.md -o slides.html

# 2. スライド内容から音声生成
python generate_voice.py

# 3. VTubeStudioでキャラクター制御
node control_vtube.js

# 4. OBSで録画・配信
obs-cli start-recording
```

## クラウディアとの共演

このプロジェクトでは、もう一つのペルソナである「クラウディア」（博多弁を話すキャラクター）も活用し、より親しみやすい技術発表を目指した。

「ずんだもんとクラウディアの漫才」みたいな感じになって、意外とウケた。技術発表なのに。

## 得られた学び

- **技術の組み合わせの面白さ**: 異なるツールを連携させる楽しさ（APIつなげまくりの極み）
- **コミュニティとの交流**: 「面白い」を共有する価値（「くだらない」とは褒め言葉）
- **創造性の重要性**: 技術は手段、大切なのは何を表現するか（と言いつつ、ずんだもんが可愛いからやっただけ）

## プロジェクトの発展

このシステムは現在も進化し続けており、以下の機能追加を予定している：

- **リアルタイム質疑応答**: ChatGPT APIとの連携（ずんだもんが質問に答える未来）
- **感情表現の向上**: より豊かなアニメーション（怒ったずんだもんも見たい）
- **多言語対応**: 英語での発表機能（グローバルずんだもんの誕生）

技術を「真面目」に使うだけでなく、「楽しく」使うことの価値を改めて感じたプロジェクトだった。

結局、エンジニアリングって「いかにバカらしいことを真剣にやるか」が大事なのかもしれない。

---

*面白い技術実験のアイデアがあれば、ぜひ[お問い合わせ](/contact)から教えてくれ！

「ずんだもんにラップさせたい」とか「初音ミクにコードレビューさせたい」とか、そういうバカらしいアイデアが世界を面白くするのだ。*