---
title: "[Marp×VOICEVOX×VTubeStudio] Zundamon Gave an LT Presentation"
description: "Creative use of technology! An experimental project building an automated LT presentation system using Zundamon with a combination of Marp, VOICEVOX, and VTubeStudio."
pubDate: 2024-01-30
author: "Terisuke"
category: "lab"
tags: ["Marp", "VOICEVOX", "VTubeStudio", "自動化", "創造的プロジェクト"]
image:
  url: "/images/blog/zundamon-project.avif"
  alt: "ずんだもんLTプロジェクト"
lang: "en"
---
# Marp × VOICEVOX × VTubeStudio:  Having Zundamon Deliver a Lightning Talk

This project, born from a pure curiosity to "do something silly with AI," involved building a system to have Zundamon automatically deliver a lightning talk.  It served as an experiment in the fun and creative application of technology.

## Project Components

### 1. Marp - Presentation Creation

```markdown
---
marp: true
theme: default
class: lead
---

# Zundamon's Lightning Talk
## Let's Play with Technology!

---

# Today's Talk
- Automation is fun!
- Let's enjoy technology together!
```

### 2. VOICEVOX - Speech Synthesis

```python
import requests
import json

def generate_zundamon_voice(text):
    # Generate Zundamon's voice using the VOICEVOX API
    query_payload = {"text": text, "speaker": 3}  # Zundamon (Normal)
    
    # Create voice query
    query_response = requests.post(
        "http://localhost:50021/audio_query",
        params=query_payload
    )
    
    # Speech synthesis
    synthesis_response = requests.post(
        "http://localhost:50021/synthesis",
        params={"speaker": 3},
        data=query_response.content
    )
    
    return synthesis_response.content
```

### 3. VTubeStudio - Character Control

```javascript
// Animation control using the VTubeStudio API
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
    // Lip-sync animation according to the audio
    audioTimestamps.forEach(timestamp => {
      setTimeout(() => {
        this.triggerExpression("mouth_animation");
      }, timestamp);
    });
  }
}
```

## System Integration

### Automated Workflow

```bash
#!/bin/bash
# Automated LT generation script

# 1. Generate slides from Markdown
marp presentation.md -o slides.html

# 2. Generate speech from slide content
python generate_voice.py

# 3. Control character in VTubeStudio
node control_vtube.js

# 4. Record and stream with OBS
obs-cli start-recording
```

## Collaboration with Claudia

This project also utilized "Claudia," another persona of mine (a character who speaks in the Hakata dialect), aiming for a more approachable technical presentation.

## Lessons Learned

- **The Fun of Combining Technologies**: The joy of linking different tools.
- **Community Interaction**: The value of sharing "interesting" things.
- **The Importance of Creativity**: Technology is a means; what matters is what you express.

## Project Development

This system continues to evolve, with plans for the following additions:

- **Real-time Q&A**: Integration with the ChatGPT API
- **Improved Emotional Expression**: Richer animations
- **Multilingual Support**: English presentation functionality

This project reaffirmed the value of using technology not just "seriously," but also "fun."

---

*If you have any interesting technical experiment ideas, please let me know via [contact](/contact)!*