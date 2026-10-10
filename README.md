# Md Hussain · Portfolio

Personal portfolio of **Md Hussain**, Senior AI Product Engineer building production LLM, voice AI and agentic systems.

It's a hand-built site with no framework: one HTML page, plain CSS and vanilla JS, plus one serverless function for the "Ask my AI" chat.

## What's on it

- **Selected work.** Echo (a voice AI platform), YEAPP for KRAFTON India, Scribe for Narayana Health, voice moderation for Ludo Star, Agent Studio and Dr. Jivi at Jivi AI, the Jivi Health Coach, Sudoviz, camera heart-rate monitoring and PakkaProfile.
- **More projects.** Agentsman, echo-voice, ClauCat, Pulse and more. Each card has a 12×12 glyph-matrix animal drawn on a canvas, borrowed from [ClauCat](https://github.com/HUSS41N/claucat).
- **Ask my AI.** A chat widget, "AI Hussain", that answers questions about my work. It streams replies from Claude and can scroll the page to the part it's talking about.
- **⌘K command menu**, light/dark theme, reduced-motion support, and a layout that works from 360 px phones up.

## Run it locally

Needs Node 20.12 or newer.

```bash
npm install
npm start        # http://127.0.0.1:8080
```

The site works without a key. To turn on the chat, put an Anthropic API key in `.env`; it's gitignored and never served:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Without a key, the chat shows a friendly error and points people to email instead.

## How it's put together

| Path | What it is |
|---|---|
| `index.html` | The whole page: content, page-specific styles, the glyph renderer and the video player |
| `style.css` | Base design: tokens, layout, cards, timeline |
| `main.js` | Scroll reveal, the dot-field background, ⌘K menu, theme toggle, email sheet |
| `agent.js` | The "Ask my AI" widget: streaming chat, read-aloud, page pointing |
| `lib/chat.js` | The chat: what the AI knows about me (its system prompt) and the streaming call to Claude |
| `api/` | Vercel functions: `chat.js` streams replies; `tts.js` and `lead.js` tell the widget to fall back to browser speech and email |
| `dev-server.js` | Local server: serves the site (with byte ranges, so video works in Safari) and the same `/api/*` routes |
| `vercel.json` | Tells Vercel this is a static site plus functions, not a Node app |
| `images/` | Card media: screenshots, short looping clips and their posters |
| `fonts/` | Self-hosted Inter, Instrument Serif and JetBrains Mono |

### Editing what the AI knows

The chat only states facts from the profile in the `SYSTEM` prompt in `lib/chat.js`. When the page changes, update that profile too. If you add or rename a card's `data-focus` key, also update the `FOCUS` map in `agent.js` and the list of valid keys in the prompt.

## Deploying

**Vercel:** import the repo with no build settings; `vercel.json` handles it. Vercel serves the static files from its CDN and runs `api/` as functions. To turn on the chat, add `ANTHROPIC_API_KEY` under Project → Settings → Environment Variables, then redeploy.

**Anywhere else:** the static files work on any host. The chat needs `api/chat.js`, or `dev-server.js`, running with `ANTHROPIC_API_KEY` set.

## Contact

[hussainakhtar1111@gmail.com](mailto:hussainakhtar1111@gmail.com) · [LinkedIn](https://linkedin.com/in/md-hussain-baa178136) · [GitHub](https://github.com/HUSS41N)
