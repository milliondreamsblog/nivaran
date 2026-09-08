# Nivaran — CPGRAMS, rebuilt for citizens

Proof of concept for Build What Moves India. Describe your problem like you'd tell a friend; an agent routes it to the right department, drafts the formal grievance, files it after your approval, and tracks it in plain language.

## Demo credentials (for judges)

- Email: `citizen@demo.in`
- Password: `nivaran123`

All data is mock: accounts, departments, statuses, timelines. The conversation, routing, and drafting are live.

## Run locally

### Nivaran app (Android and web, one codebase)

The demo build lives in `mobile/` (Expo SDK 57). Plan, shot list and status: [docs/demo-build-plan.md](docs/demo-build-plan.md). Agent guide: [AGENTS.md](AGENTS.md).

```bash
cd mobile && npm install
npm run web          # browser at http://localhost:8081
npm run android      # physical phone over USB; needs JDK 17 and adb reverse tcp:3000 tcp:3000
npm test             # case rules, extraction route and helper tests
npm run export:web   # writes public/app, served by this Next.js app at /app
```

Typing and guided questions work with no keys at all. Voice and document reading need `GEMINI_API_KEY` and `NIVARAN_DEMO_KEY` in `.env.local` (see `.env.example`); the demo code is typed once into the voice screen. Only the fictional PF transfer story and the two sample documents are ever sent to the model.

### Evidence-led research prototype

- `/prototype` — PF preparation, evidence guidance, editable facts, restored drafts and a simulated response exercise. No actual filing or upload; use fictional details.
- `/study` — moderator recorder for paired task observations. Starts empty; dry runs are excluded from user counts.
- [Audit coverage and ranked problems](docs/audit-to-prototype.md)
- [Participant protocol and comparison tasks](docs/usability-study.md)

The new research prototype is separate from the legacy `/file` demo. The legacy deterministic parser and overdue-appeal shortcuts are not verified policy implementations and must not serve as the revised study flow. Research prototype guidance is scripted; it does not use the live model or claim a complete government workflow.

Verify its logic with `node --test tests/research-model.test.mjs`. Browser QA and real participant comparison are pending; no measurable improvement has been claimed.

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
