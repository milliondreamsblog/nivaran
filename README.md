# Nivaran — CPGRAMS, rebuilt for citizens

Proof of concept for Build What Moves India. Describe your problem like you'd tell a friend; an agent routes it to the right department, drafts the formal grievance, files it after your approval, and tracks it in plain language.

## Demo credentials (for judges)

- Email: `citizen@demo.in`
- Password: `nivaran123`

All data is mock: accounts, departments, statuses, timelines. The conversation, routing, and drafting are live.

## Run locally

```bash
npm install
npm run dev
```

Works with zero configuration: without an API key the app runs in offline mode, where a deterministic parser answers the suggested golden-path prompts. To use a real model, copy `.env.example` to `.env.local` and set one provider (Gemini free-tier key needs no card; any OpenAI-compatible endpoint also works: Groq, Sarvam, OpenRouter).

## Suggested demo prompts

- "Mere mohalle mein 2 hafte se paani nahi aa raha, municipal office complaint nahi le raha"
- "My PF withdrawal claim has been pending for 2 months and no reason is given"
- "Road ke gaddhe se roz accident ho rahe hain, koi repair nahi hua"

Voice input (mic button) uses the browser's speech recognition — Chrome or Edge, EN/HI toggle next to the mic.

## What to look at

1. Dashboard: three seeded grievances showing on-time, deadline-breached, and template-reply-disposal states.
2. File new: the split screen — chat on the left, the official form filling itself on the right. Routing card shows department, confidence, and reasons. Nothing files without your review.
3. Any breached grievance: the one-tap appeal, already drafted.
4. Ops: the freshness pipeline — watchers catch rule changes (gazette, circulars), a human approves, the agent's knowledge updates. The agent never quotes last year's rules.
