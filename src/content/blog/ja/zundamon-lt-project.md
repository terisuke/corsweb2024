---
title: "【Marp×VOICEVOX×VTubeStudio】ずんだもんにLT発表してもらった話"
description: "技術の創造的活用！Marp、VOICEVOX、VTubeStudioを組み合わせて、ずんだもんによる自動LT発表システムを構築した実験プロジェクト"
pubDate: 2024-01-30
author: "Terisuke"
category: "lab"
tags: ["Marp", "VOICEVOX", "VTubeStudio", "自動化", "創造的プロジェクト"]
image:
  url: "/images/blog/zundamon-project.avif"
  alt: "ずんだもんLTプロジェクト"
lang: "ja"
---

# 【Marp×VOICEVOX×VTubeStudio】ずんだもんにLT発表してもらった話

「AIでくだらないことをやりたい！」という純粋な好奇心から始まったこのプロジェクト。技術を楽しく創造的に活用する実験として、ずんだもんに自動でLT発表してもらうシステムを構築しました。

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
import json

def generate_zundamon_voice(text):
    # VOICEVOX APIを使用してずんだもんの声を生成
    query_payload = {"text": text, "speaker": 3}  # ずんだもん（ノーマル）
    
    # 音声クエリ作成
    query_response = requests.post(
        "http://localhost:50021/audio_query",
        params=query_payload
    )
    
    # 音声合成
    synthesis_response = requests.post(
        "http://localhost:50021/synthesis",
        params={"speaker": 3},
        data=query_response.content
    )
    
    return synthesis_response.content
```

### 3. VTubeStudio - キャラクター制御

```javascript
// VTubeStudio APIを使用したアニメーション制御
class VTubeStudioController {
  async triggerExpression(expressionFile) {
    const message = {
      "apiName": "VTubeStudioPublicAPI",
      "apiVersion": "1.0",
      "requestID": "MyIDWithRandomString",
      "messageType": "HotkeyTriggerRequest",
      "data": {
        "hotkeyID": expressionFile
      }
    };
    
    this.websocket.send(JSON.stringify(message));
  }
  
  async syncWithAudio(audioTimestamps) {
    // 音声に合わせて口パクアニメーション
    audioTimestamps.forEach(timestamp => {
      setTimeout(() => {
        this.triggerExpression("mouth_animation");
      }, timestamp);
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

このプロジェクトでは、私のもう一つのペルソナである「クラウディア」（博多弁を話すキャラクター）も活用し、より親しみやすい技術発表を目指しました。

## 得られた学び

- **技術の組み合わせの面白さ**: 異なるツールを連携させる楽しさ
- **コミュニティとの交流**: 「面白い」を共有する価値
- **創造性の重要性**: 技術は手段、大切なのは何を表現するか

## プロジェクトの発展

このシステムは現在も進化し続けており、以下の機能追加を予定しています：

- **リアルタイム質疑応答**: ChatGPT APIとの連携
- **感情表現の向上**: より豊かなアニメーション
- **多言語対応**: 英語での発表機能

技術を「真面目」に使うだけでなく、「楽しく」使うことの価値を改めて感じたプロジェクトでした。

---

*面白い技術実験のアイデアがあれば、ぜひ[お問い合わせ](/contact)から教えてください！*