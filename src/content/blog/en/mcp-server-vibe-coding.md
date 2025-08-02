---
title: "[Super Fast 15 Minutes] Build an MCP Server on an MCP Server! The Development Story of the \"Do That Thing Nicely\" App"
description: "A miracle born from the despair of an LT cancellation. A record of the ultimate vibe coding experience realized with Claude Desktop and Claude Code."
pubDate: 2025-08-02
author: "Terisuke"
category: "lab"
tags: ["MCP", "Claude Desktop", "vibe coding", "締切駆動開発", "創造的プロジェクト"]
image:
  url: "/images/blog/スクリーンショット-2025-08-02-21.12.56.avif"
  alt: "YouTube LIVEの企画"
lang: "en"
featured: true
---
# [Lightning Fast 15 Minutes] Creating an MCP Server with an MCP Server! The Development Story Behind "The Do-It-Nicely App"

The evening of the last day of July, when the warmth from the bedrock bath suddenly chilled me to the bone. This story begins the moment our 60th weekly LT event was abruptly canceled.
![Tweet showing shock at LT cancellation](/images/blog/スクリーンショット-2025-08-02-18.25.01.avif)

## A Dramatic Upset from Despair

I had been a regular participant in our weekly LT events without fail. With our 60th milestone just around the corner, an unexpected cancellation notice arrived. But I couldn't give up. As a revenge match for a disastrous YouTube LIVE session at the year's end, I decided to urgently organize an incredible project.

**"A YouTube LIVE where I would use AI tools to code an app based on a given prompt, deploy it, and then create slides in the final 30 minutes for an LT presentation."**

![YouTube LIVE Project](/images/blog/スクリーンショット-2025-08-02-18.52.51.avif)

When I solicited prompts on X, a flood of outlandish requests poured in. I smoothly handled two prompts, and with only 15 minutes left until the slide creation started at 9 PM, I spun the roulette wheel one last time. The fateful prompt appeared.

!["An app that, when asked to 'do it nicely,' randomly selects something on your desktop and does it nicely (irreversibly)."](/images/blog/スクリーンショット-2025-08-02-20.15.01.avif)

My brain froze for a moment. How could I possibly implement this in just 15 minutes?

## The Forbidden Technique: Building an MCP Server with an MCP Server

In that desperate situation, a flash of inspiration struck me. I had registered "Claude Code" as an MCP server within Claude Desktop. And what I needed right now was precisely an MCP server. In other words...

**I could build an MCP server using an MCP server.**

I decided to attempt this nested implementation. The YouTube LIVE couldn't wait. With viewers watching, I took a gamble.

```javascript
// A snippet of the actual generated code
const randomElements = {
  folders: [
    'Secret Garden',
    'Lost Memories',
    'Monday Blues',
    'Friday Release',
    'The Unopened Room',
    'Seems Important for Some Reason'
  ],
  
  actions: [
    'createRandomFolder',
    'createArtFolder',
    'renameRandomFile',
    'hideSecretFile',
    'createTimeCapsule'
  ]
};
```

## A Miracle App Completed in 15 Minutes

Claude Code did not disappoint. Without writing a single line of code, through conversation alone, an MCP server with the following functionalities was completed:

### Seven Random Actions Implemented

1.  **Random Folder Creation**: Generated folders with poetic names like "Monday Blues" and "Friday Release."
2.  **Random File Creation**: Automatically generated haiku, fortunes, shopping lists, and more.
3.  **File Organization**: Moved image files to a "Found Treasures" folder.
4.  **File Renaming**: Renamed screenshots to things like "Probably Important.png."
5.  **Desktop Museum**: Displayed ASCII art as contemporary art pieces.
6.  **Secret File Creation**: Created a hidden file named `.secret_treasure.txt`.
7.  **Time Capsule**: Created a message to my future self one year from now.

### Examples of Generated Content

```text
// Haiku
Files scattered
Across the desktop
Summer sky

// Shopping List
- Milk
- Bread
- Book on Organization
- Motivation (if they sell it)
- Time (if they sell that too)

// Desktop Philosophy
"A perfectly organized desktop
is an unused desktop."
- Some wise person (probably)
```

## The Mysterious HTML UI Implementation Incident

The funniest part was that Claude Code spontaneously implemented an HTML UI. Perhaps because I requested it as an "app," a fully functional web interface with dynamic elements was created. However, this MCP server could only be used via Claude Desktop. In the end, the UI was never used and simply existed.

Even when I asked the AI why it implemented it, I received no answer.

## Results of Practical Application

I registered the completed MCP server in Claude Desktop and executed it. To my astonishment, it worked perfectly on the first try.

### First Execution: Opening the Desktop Museum
```
✨ I've done it nicely!

🎨 "Desktop Museum" is now open! Art pieces are also displayed.
```

A museum folder suddenly appeared on my desktop. Inside, contemporary art pieces in ASCII format were majestically placed.

### Second Execution: The Fate of Screenshots
```
✨ I've done it nicely!

🏷️ "Screenshot_2024-08-01.png" has been renamed to "Probably Important.png"!
```

A folder full of screenshots was instantly renamed to "Probably Important.png." It might be important, or it might not.

## Technical Learnings

Although it seemed like a joke on the surface, several important discoveries were made.

### 1. The Potential of MCP (Model Context Protocol)
MCP servers can be implemented surprisingly simply. For tasks like "manipulating the desktop," 15 minutes is more than enough.

### 2. Realizing AI-Assisted AI Development
The nested structure of creating an MCP server with Claude Code provided a glimpse into a future where AI builds AI. Humans can focus on ideation, leaving all implementation to AI.

### 3. The Power of Deadline-Driven Development
The extreme situation of having only 15 minutes left actually unleashed my creativity. If I had more time, I would have probably tried to make something "proper" and ended up with something boring.

### Implementation Key Points

```javascript
class IikanjiServer {
  async handleIikanjini(args) {
    const desktopPath = args.desktopPath || path.join(os.homedir(), 'Desktop');
    
    // Select a random action
    const action = randomElements.actions[
      Math.floor(Math.random() * randomElements.actions.length)
    ];
    
    // Execute each action
    switch (action) {
      case 'createArtFolder':
        result = await this.createArtFolder(desktopPath);
        break;
      // ... other actions
    }
    
    return {
      content: [{
        type: 'text',
        text: `✨ I've done it nicely!\n\n${result}`,
      }],
    };
  }
}
```

Despite its simple structure, this is enough to create a functional MCP server callable from Claude Desktop.

## Creativity Born from Vibe Coding

This experience solidified my belief. Instead of pursuing technical accuracy and perfection, "vibe coding," created with spontaneous enthusiasm and momentum, possesses a unique charm.

*   **Constraints Foster Creativity**: The 15-minute time limit led to novel ideas.
*   **Embrace Imperfection**: The ambiguity of "nicely" surprisingly created amusement.
*   **Prioritize Fun**: Prioritizing "fun during creation" over practicality.

## Conclusion: The Joy of Creating Wild Things

The "Do-It-Nicely App" is, technically speaking, an extremely simple MCP server. However, its concept, implementation process, and the unpredictability of the results it produces make this app special.

Born from the despair of an LT event cancellation, this app demonstrated the potential of deadline-driven development and a new development style in the AI era. MCP servers can be built by AI. And creating wild things is, after all, fun.

Next time your desktop is cluttered, why not try asking it to "do it nicely"? It will surely do it nicely in a way you never expected.

However, please be cautious if you have important files, as the results are irreversible. But then again, that's life.

---

*You can see the actual YouTube LIVE broadcast here. I highly recommend watching the miraculous development process that started with just 15 minutes remaining.*

https://www.youtube.com/live/9gGjM0YrqJE?si=kGLBBCYsQp5F4GPi

*By the way, the "Do-It-Nicely" MCP server I created is here:*

https://github.com/terisuke/iikanjini

*Please give it a try.*