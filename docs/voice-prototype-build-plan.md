# Nivaran: build plan for assisted complaint preparation

Superseded for 8 to 11 September 2026 by [demo-build-plan.md](demo-build-plan.md), which orders the work around the demo video. The constraints below still apply to anything kept after the video.

Prepared 8 September 2026. Status: implementation plan, not completed implementation. This expands the [mobile development plan](mobile-development-plan.md) and [screen design brief](mobile-design-brief.md). Nivaran is a standalone grievance platform with a React Native citizen app; government portal integration is outside this plan.

**Product promise:** explain a problem in your own words, understand what information is needed, review an accurate complaint, and resume without repeating work. Voice is one way to accomplish this. Success means correct, independently completed cases and clear next steps.

## 1. Decisions to build around

| Decision | Choice and reason |
|---|---|
| First supported journey | PF transfer difficulty, because this has the strongest local audit evidence. Other services can be saved as unsupported drafts; they must not acquire invented routing or document rules. |
| First platform | Android on a physical phone, using React Native, TypeScript and an Expo development build. Keep iOS-compatible boundaries, but do not claim iOS validation from Windows/Android tests. |
| Input | Guided questions first; typed conversation and voice update the same case. Users can switch at any point. |
| Case memory | Structured facts, conversation, evidence and revisions stored separately. A chat transcript is not the case database. |
| AI authority | AI suggests facts and wording. Validated application rules choose missing questions, govern readiness and accept explicit user confirmations. |
| Voice provider | Gemini Live through a replaceable adapter, subject to account availability, current free-tier eligibility and the native audio experiment below. |
| Spending | No billing activation, paid model fallback, paid hosting or paid SMS for this prototype. Exhausted free quota ends AI assistance gracefully. |
| Data | Synthetic cases and generated sample documents in the connected prototype. Real citizen data requires a separate deployment decision. |
| First completion boundary | A reviewed preparation package saved locally, with a clearly simulated receipt exercise. Actual standalone backend submission comes later. |
| Expansion | Add a second verified service only after the first journey passes correctness, recovery and usability checks. |

Google currently lists free input/output for `gemini-2.5-flash-native-audio-preview-12-2025`. This is a candidate, not a claim that our account has access or unlimited quota. Check the exact model and account before implementation; do not copy a different model from a quickstart without checking its pricing. [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing#gemini-2.5-flash-native-audio), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

## 2. What evidence this addresses

| Evidence from this project | Intended improvement | Proof required |
|---|---|---|
| Chatbot proposed state routing after private-employer answers | Ask about the service and explain the proposed authority | PF transfer remains a transfer case; employer ownership alone cannot change its service owner |
| Hindi conversation failed and could not be reopened | Persist case facts independently of a live AI session | Resume saved work after killing the app or losing the connection |
| Office/UAN controls displaced the chat composer | Keep help, typing and an unknown-answer path available | Complete preparation without guessing an office or supplying an identifier |
| Standard form starts with administrative categories; office list has 148 entries | Describe first; ask targeted questions; show an editable destination | User understands the proposed destination and identifies unresolved routing |
| Conflicting dates were not resolved in the observed chat | Preserve both sources and ask for correction | Draft contains no silently chosen date |
| Standard branch displayed PDF-only, 4 MB attachment rules | Accept camera images and documents in our own workflow | Preview, remove, retry and resume without losing the case |
| Standard correction path was unclear; narrow viewport overflowed | Editable review sections and native layouts | Corrections preserve unrelated facts; phone and text-scaling checks pass |
| User reported signup password visibility/reset problems | Allow preparation before identity; test identity separately | No unnecessary account gate; later signup errors preserve permissible input |

These are observed defects, user reports and design hypotheses, not measured population frequencies. Actual uploads, official receipt, populated tracking, officer response and appeal remain audit gaps. No new intended-user sessions have been completed. See [audit register](audit-to-prototype.md) and [standard walkthrough](cpgrams-standard-flow-audit.md).

## 3. The first complete user journey

Use one synthetic task: a PF transfer request was rejected, the person does not know the handling office, and two supplied records contain different employment-exit dates. The requested outcome is an explanation of the rejection and identification of records needing correction. Dates and documents are fixtures, not real proof.

1. **Open Issues.** First use offers Speak, Type and Guided questions, with a visible prototype/synthetic-data notice. Returning users see saved issues and the next action for each. No microphone permission on launch.
2. **Explain the problem.** Accept the narrative and desired outcome. Extract facts already mentioned instead of asking every question in a fixed sequence.
3. **Clarify one useful thing.** If transfer versus withdrawal is unclear, explain the distinction. If rejection wording is missing, ask whether the user has the response. Always offer “I don't know” where appropriate.
4. **Show what was understood.** Present a short editable recap. Ask the user to resolve ambiguous dates, service and outcome; group straightforward facts into one recap rather than requiring confirmation after every sentence.
5. **Explain the destination.** Show a proposed authority with a reason. An unknown field office remains unresolved. The user can save preparation and see how to find it; readiness for actual sending uses separately verified platform rules.
6. **Prepare evidence.** Show each document's purpose, whether required by a verified rule or merely helpful, alternatives and current state. Use fixture files in the connected prototype.
7. **Check readiness.** Detect unreadable files, unavailable contents or conflicting extracted facts. Return findings to the user; do not claim document authenticity or official acceptance.
8. **Review the whole package.** Show narrative, requested action, destination, unresolved items and attachments. Corrections update the same case and invalidate only affected confirmations.
9. **Save the reviewed draft.** The initial app saves locally and can exercise a labelled simulated receipt. It never says a department received a case merely because an AI response finished.
10. **Resume.** Reopening starts with “Your draft is saved. The rejection response is still missing,” rather than asking the whole interview again.

For two problems in one conversation, propose a split with editable summaries. On acceptance create linked case IDs, ask which to continue, and assign documents explicitly. Reuse only user-approved shared information. An unsupported second problem can be retained without pretending we support its full filing journey.

## 4. Screen and interaction contract

Keep the previously proposed navigation: **Issues / Updates / Profile**. Inside one issue: **Overview / Conversation / Documents**. Updates and profile can initially contain minimal, clearly labelled prototype functionality.

| Surface | Essential behavior |
|---|---|
| Issues | Resume cards show title, accurate draft state and next action. New issue remains easy to find. |
| Overview | Editable confirmed facts, proposed facts, missing information and one clear next action. Never require searching chat history for the current state. |
| Conversation | One purposeful question, quick answers, visible help, typing and microphone. Corrections do not reset history. |
| Voice | Distinct connecting/listening/processing/speaking/paused/error states; stop and switch-to-text controls; editable transcript and summary. |
| Documents | Preview, purpose, readiness status, remove/replace and retry. Failure affects the file, not the whole draft. |
| Review | Complete complaint and attachment list with section-level Edit. Show unresolved facts explicitly. |
| Progress, later | Receipt and events from the case backend; officer requests distinguishable from assistant messages. |

Use the existing cream/green visual direction with strong text contrast and readable Hindi. Support text scaling, TalkBack, labelled touch controls, keyboard-safe actions and status text beyond color. Check small Android screens and long translated labels. Voice starts only after a user action. Default public-place behavior to headphones or silent reading; an in-app voice UI must not imply a real telephone call or guaranteed earpiece routing.

## 5. Architecture: one app, one case engine, one small backend

| Part | Initial responsibility | Later extension |
|---|---|---|
| React Native app | Screens, capture/playback, local drafts, file previews, correction/review | Account sync, notifications and real receipt/progress |
| Shared TypeScript case engine | Schemas, facts, rule evaluation, readiness, deterministic draft, revision handling | Additional versioned service definitions |
| Local SQLite and app-owned files | Durable cases, messages, file contents and pending operations | Offline edits reconciled with server revisions |
| Next.js backend already in repository | Restricted prototype session access, ephemeral token issuance, validation endpoints, provider configuration | Authenticated case API and officer interface |
| Gemini Live adapter | Streaming audio, transcript events and proposed case changes | Replace provider after measured comparison |
| Deterministic assistant adapter | Guided questions, fixture responses and safe draft generation with no network | Permanent fallback when AI is unavailable |
| Standalone database/files, later | Local development PostgreSQL and private file store | Selected hosted infrastructure when needed and separately budgeted |

Keep the existing root Next.js app and research routes. Add `mobile/` and `packages/case-core/`; do not move the entire repository during the first milestone. Use a minimal workspace configuration so native and server code share the same schemas and tests. Keep browser APIs out of the shared package.

The suggested native setup is an Expo development build because custom native audio libraries may be necessary. Expo documents native-library support and local builds; verify compatible dependency versions when scaffolding. Use `expo-sqlite` for durable structured storage, with explicit write errors and migrations. [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/), [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).

For audio, the app obtains a short-lived, restricted token from our backend, then streams directly to Gemini over WSS. The permanent API key stays server-side. This avoids carrying every audio chunk through our Next.js backend. Case changes still go through our application validation. This is a WebSocket design; direct Gemini Live is not itself a WebRTC endpoint. [Live API architecture](https://ai.google.dev/gemini-api/docs/live-api), [ephemeral tokens](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens).

Do not introduce a vector database, multiple AI agents, an orchestration platform or a separate voice server in milestone one. A small curated service definition and one backend are sufficient until observed constraints justify more infrastructure.

## 6. Case data and rules

Proposed entities:

| Entity | Essential fields |
|---|---|
| Case | ID, local owner, schema version, revision, service-definition version, preparation state, language, linked case IDs, timestamps |
| Fact | Field ID, value, status, source message/document reference, confirmation revision; status is proposed/confirmed/unknown/conflicting |
| Message | Case ID, message ID, speaker, text, input mode, turn/session ID, draft/final/interrupted state |
| Route proposal | Service/authority/office, rationale, rule reference, unresolved requirements, user confirmation |
| Evidence | Case/file IDs, private local location, content hash, MIME, size, page count when known, selection/upload/check states, extraction provenance |
| Review | Exact reviewed revision, draft hash, attachment hashes, acknowledged unresolved items and confirmation time |
| Operation | Unique operation ID, case ID, expected revision, type, pending/acknowledged/failed state |
| Case event, later | Server event ID, actor and role, action, case revision, timestamp, citizen-visible explanation |

Use separate state machines for preparation, voice connection and later service handling. “Voice disconnected” is not “case failed”; “department closed” is not “citizen resolved.”

Preparation states: Draft, Needs information, Ready for review, Reviewed. Sending/Submitted exist only when an actual standalone submission endpoint is implemented. Unknown optional facts need not block review; mandatory unresolved requirements block sending and explain why.

The first service definition contains versioned field IDs, question wording in English/Hindi, dependencies, unknown paths, routing rules, evidence purposes, readiness requirements and source references with verification dates. Label unverified entries as research assumptions. A prototype evidence example is not an official mandatory checklist.

Question selection is a decision graph:

1. Read the current facts and selected service.
2. Resolve contradictions or service uncertainty first.
3. Find missing information needed for the next meaningful decision.
4. Skip answered and irrelevant questions.
5. Return the question, answer options, reason and unknown path.
6. Recompute affected dependencies after an edit; retain unrelated information.

For example, “rejected transfer” may make the response wording relevant; “still pending” should not ask for a rejection reason. Rules decide that dependency. The AI can express the question naturally and explain it without inventing requirements. A new service or unfamiliar question returns an honest unsupported/uncertain state.

## 7. AI contract and trustworthy drafting

Give the model the selected service definition, confirmed facts, unresolved items and a bounded recent conversation. Do not send the full profile, all other cases or entire historic chats by default.

Expose narrow proposed tools, not unrestricted database writes:

- `propose_facts`: field/value/source proposals tied to a case revision.
- `get_next_question`: returns the rule engine's next question and reason.
- `get_evidence_checklist`: returns the current curated checklist.
- `propose_case_split`: returns suggested issue summaries for citizen approval.

Final submission is a citizen UI action calling the backend, not an AI tool in the first version. A spoken “yes” during clarification cannot submit a complaint.

Validate tool names, schemas, allowed fields, case ownership, session/case binding and expected revision. Reject unknown fields, malformed values and stale proposals. Deduplicate call IDs. A tool proposal is untrusted even when it comes through our app. A cancelled call must not later apply an update. [Live tool support](https://ai.google.dev/gemini-api/docs/live-api/tools).

The UI, not model wording, displays whether information was actually saved. Confirmed facts cannot be silently overwritten by another model turn. A stale voice session must refresh the case revision after a typed correction. If a response says “saved” before the write succeeds, correct the status and count this as an assistant failure in evaluation.

Start with deterministic complaint rendering from confirmed facts and explicit uncertainties. Preserve the citizen's original description. An optional later rewrite must show an editable comparison and cannot become the approved draft without review. Do not infer dates, delay duration, hardships, previous complaints, rejection reasons or requested compensation.

Treat document text and user narrative as data. Instructions inside them cannot change system rules, request secrets or authorize actions. Critical fields such as a date or reference must have provenance and an explicit correction path; a model confidence number is not proof.

## 8. Voice engineering and latency

First perform a bounded native audio experiment before committing to a library: microphone capture, streaming PCM, response playback, interruption, text switching and reconnect on one actual Android device. Library selection remains open until this passes. A library that merely records a complete audio file does not establish support for live chunk streaming.

Gemini's current documented audio format is raw little-endian 16-bit PCM, normally 16 kHz input and 24 kHz output. Implement suitable capture/resampling and a bounded playback queue. On interruption stop playback and clear queued audio; do not merely hide the speaking animation. [Audio formats and interruption handling](https://ai.google.dev/gemini-api/docs/live-api/capabilities).

Implementation sequence:

1. Prove tap-to-speak and finish-turn behavior. Show the transcript for correction.
2. Add streamed responses and a visible stop button.
3. Add automatic end-of-turn detection and barge-in only after echo/false-interruption checks pass.
4. Handle permission denial, route changes, screen lock, incoming calls, backgrounding and noisy rooms. Pause the microphone on backgrounding in the prototype.
5. Persist finalized messages and case facts independently of the connection; partial audio/transcripts must not become confirmed facts.
6. Handle connection expiry, provider shutdown notices and bounded reconnection. Resume when possible; otherwise start a fresh session from a compact case summary and tell the user. Never replay an entire microphone buffer automatically. [Session management](https://ai.google.dev/gemini-api/docs/live-api/session-management).

Initial engineering targets, not measured claims:

| Measurement | Proposed target and test |
|---|---|
| Tap acknowledgement | Under 100 ms on the target device; visual response does not wait for AI |
| Visible local draft restoration | Under 500 ms for ordinary fixture cases |
| End of speech to first meaningful audible response | Median at most 1.5 seconds, p95 at most 3 seconds across at least 30 controlled turns; report device/network and separate cold starts |
| Stop/interrupt to playback silence | Under 250 ms on the target device |
| Saved status | Only after durable write succeeds; measure save latency separately |
| Slow AI | After roughly 5 seconds show a useful waiting/fallback action; bounded timeout ends the attempt without discarding work |

Measure capture, end-of-turn detection, network, model and playback separately where observable. Avoid attributing all delay to the model. Batch transcript rendering rather than rerendering the entire case per audio chunk. Keep responses short and defer document analysis until documents are added.

If the audio experiment fails, keep the native guided app progressing and use a clearly labelled web audio experiment to investigate the provider. That is not a completed mobile voice milestone.

## 9. Saving, offline behavior and evidence

Persist edits promptly in SQLite; flush at important transitions and show unsaved status until committed. Test storage-full and migration failures instead of swallowing errors. Keep revisions so a correction cannot be overwritten by a delayed response. Offline guided preparation and deterministic drafting must work without a token or AI session.

Copy selected fixture files into app-owned storage; picker URIs alone may not remain available. Persist metadata only after a successful copy, and verify file availability on resume. Test partial copies, removed files and interrupted app processes. Maintain temporary-file cleanup without deleting evidence still referenced by a case.

Initial proposed file policy: JPEG/PNG/PDF, up to five files of 5 MB each. These are our test limits, subject to device and usability validation, not CPGRAMS requirements. Check actual format and size; extensions alone are inadequate. Let users preview and remove files before any upload. Preserve originals if generating a smaller derivative.

Build file handling in layers:

1. Local selection, persistence, preview and truthful error recovery.
2. Deterministic checks: empty, corrupt, unsupported or oversized files.
3. A document-check adapter using labelled synthetic fixtures; scripted outputs must be visibly marked as simulated.
4. Optional actual extraction from synthetic documents through a separately verified free model or local OCR. It needs its own cost/data checks; a Live audio connection does not automatically solve PDF extraction.
5. Compare extracted facts to confirmed facts, show source page/region when available, and request correction. A readiness result cannot automatically alter the complaint.

Later server uploads use private storage, ownership checks, content validation and bounded workers. Associate an upload with a specific case and version, track progress and retry safely. Document processing failure cannot erase or submit the case.

## 10. Free-tier and data boundaries

Use a separate prototype configuration that defaults to the deterministic provider. Enable Gemini only after checking the project is eligible for free usage and billing is not activated. Never infer this from a key existing or a model appearing in a dropdown. No OpenAI-compatible fallback should be inherited from the legacy route.

Suggested prototype controls: one active voice session per tester, a five-minute session limit with an explicit continue action, short idle timeout, limited token issuance and a global AI-disable switch. Track session duration, failures and available usage metadata. App timers and budgets are not a billing guarantee; direct provider connections cannot be fully controlled by a client timer. The no-spend boundary depends on verified unpaid account configuration and stopping rather than upgrading when unavailable.

On quota failure: preserve work, stop recording, explain that voice is temporarily unavailable and offer guided questions or typing. Free-form typed AI is not promised offline; guided answers and safe draft rendering remain available. Do not open a new Live session for every typed keystroke.

Google's unpaid-service terms say not to submit personal, confidential or sensitive information and describe use of inputs/outputs to improve products and possible human review. Therefore do not send real grievances, identification, resumes or citizen documents to this prototype. [Unpaid-service terms](https://ai.google.dev/gemini-api/terms#unpaid-services).

Use generated sample documents and synthetic audio for initial automated provider tests. A fictional script does not necessarily anonymize a human voice: before participant voice testing, resolve the applicable treatment of that audio and obtain appropriate consent; consent alone does not override provider restrictions. If unresolved, run participant tasks using text/guided input or local audio processing. Limit the study to consenting adults and use participant codes.

Do not collect real signup details in this phase. Restrict token issuance to provisioned test sessions; an unauthenticated public token endpoint would expose our quota. No API keys, tokens, raw audio, full transcripts or documents in analytics/crash logs. Local deletion must remove the case, associated files and messages; do not promise it deletes copies already processed by a provider.

## 11. Standalone submission and officer workflow, after preparation

This is a later implementation stage and does not require government portal integration. It needs explicit Nivaran operating policies, not assumptions copied from unvisited CPGRAMS screens.

Implement authenticated citizen/officer roles, server-side ownership checks, PostgreSQL case storage, private evidence and an immutable event history. Define triage, assignment, clarification, response and appeal policies with the intended service operator. An unresolved office may go to a real staffed triage queue only if that queue and policy exist.

Submission accepts an idempotency key and exact reviewed revision. In a transaction, verify required fields, route, attachments and review; create one receipt and event. A timeout triggers receipt reconciliation before retry. Retries must not create multiple cases. Notification delivery can fail independently of successful submission.

An officer can see assigned cases, request clarification and issue a response with an actor/time record. The citizen sees the request and replies in the same case. Distinguish departmental closure from citizen-reported resolution. Appeals reference the response and follow a versioned eligibility policy; elapsed time alone is not an appeal rule.

Before presenting these as realistic workflows, close the remaining citizen audit gaps with authorized genuine cases and examine officer work with an authorized operator. Until then use labelled synthetic workflows, not claims about how every CPGRAMS department operates.

## 12. Build sequence and exit criteria

Estimates are focused engineering days for one developer, excluding waiting for participants, credentials or policy decisions. They are planning ranges, not commitments. Expect roughly 17–29 engineering days to reach the first measured prototype through M6; reassess after the native audio experiment.

| Milestone | Work | Estimate | Exit criterion |
|---|---|---|---|
| M0: Freeze scope and establish baseline | Inspect existing prototype on a phone; define fixtures and scoring; run existing checks; document provider/account gate | 1–2 days | A reproducible PF task and known baseline; no invented gain claims |
| M1: Case engine and recovery | Shared schemas, revisioned facts, service graph, deterministic drafting, SQLite adapter and migrations | 3–4 days | Corrections, unknowns and restart recovery pass with no provider connection |
| M2: Native guided journey | Issues, case tabs, questions, summary, file selection, review, language foundations | 3–5 days | Complete and resume the synthetic PF preparation task on a physical Android phone |
| M3: Native audio experiment | Ephemeral-token route, PCM capture/playback, transcript, stop/reconnect and failure states | 2–3 days | Audio works on phone with measured latency and no permanent client key; otherwise record failure and keep guided work usable |
| M4: Conversation tied to cases | Validated tools, proposed facts, corrections, concise recaps and case-split proposal | 3–5 days | Switching voice/text/guided preserves facts; malformed, stale or cancelled calls cannot mutate confirmed state |
| M5: Evidence and failure hardening | Durable file contents, readiness checks, interrupted writes, offline/quota handling, accessibility | 3–5 days | Stress matrix passes; actual and simulated document checks are unmistakable |
| M6: Observe and revise | 3–5 intended users, guided/text comparison, eligible voice comparison, fixes and targeted retest | 2–5 engineering days plus recruiting | Findings and limitations recorded; correctness and recovery gates pass; layout/mode choice follows evidence |
| M7: Standalone workflow | Identity, server persistence, submission receipt, officer requests/responses and policy-gated appeals | Estimate after M6 and operator discovery | End-to-end internal synthetic case with role isolation and duplicate-safe submission; real-data launch remains a separate gate |

M0 can include early voice feasibility preparation, but M4 depends on M1. The audio experiment must be completed before polishing a full-screen voice experience. Do not spend a week on animations while storage or correction behavior remains unreliable.

## 13. Verification and user comparison

Automated checks should focus on consequential behavior:

- PF transfer cannot become withdrawal because a provider failed or employer is private.
- Missing dates, hardship and previous complaints never appear as supplied facts.
- Conflicting dates remain unresolved until the user chooses; edits invalidate affected review.
- Duplicate/out-of-order/cancelled tool calls and stale revisions are rejected or reconciled.
- Restart restores multiple cases and actual file availability; storage errors remain visible.
- Quota errors and permission denial preserve the draft and stop microphone activity.
- Two-case splitting does not leak facts or documents between cases.
- Later submission retries produce one receipt; unauthorized case access fails.

Physical-device checks include Hindi/Hinglish names and dates, quiet/noisy audio, interruptions, headset disconnect, small screen, large fonts, TalkBack, slow network, airplane mode, background/restart and low storage. Fake timers or browser emulation alone cannot validate native audio behavior.

Extend the existing [study protocol](usability-study.md) and `/study` recorder. Use 3–5 consenting intended users for an initial formative round; this is not a representative sample. Compare Nivaran guided input against Nivaran voice using equivalent alternate synthetic tasks and counterbalanced order, only once the voice-data boundary is resolved. This isolates whether voice helps within our design.

Compare to real CPGRAMS only with an authorized environment and an appropriate genuine task. Do not feed that genuine case into Gemini free tier. If equivalent privacy-compatible comparison is unavailable, report the limitation and run formative prototype tests; do not call a deliberately degraded replica the baseline.

Measure:

| Measure | Definition |
|---|---|
| Independent completion | Accurate reviewed preparation package without moderator intervention |
| Critical factual error | Wrong service, invented fact, silently resolved conflict or incorrect approved destination |
| Time to reviewed draft | Task start to agreed review boundary, including corrections; annotate external interruptions |
| Active effort | Observable interaction time recorded separately if feasible; never subtract AI waits silently |
| Recovery | Can the person resume after interruption without re-entering confirmed information? |
| Help and hesitation | Help requests, assisted steps, wrong choices and consistently defined pauses |
| Next-step understanding | Person explains what will happen next and what is still missing |
| Voice reliability | Incorrect extracted critical fields, repetitions, interruptions and mode switches |

Do not label preparation time “submission time.” Measure actual end-to-end submission separately once a real endpoint exists. Report failures and abandoned attempts alongside completion times so fast successes do not hide blocked users.

Release blockers: introduced critical factual errors, unrecoverable confirmed work, false submission/saved states, unintended microphone use, or unauthorized cross-case access. A first study supports iteration, not a population-level superiority claim. Prefer the mode that reduces blocks and repeated effort without worsening accuracy or understanding; voice may help some users and slow others.

## 14. Immediate implementation backlog

The next build session should deliver M0 and begin M1:

1. Run `node --test tests/research-model.test.mjs` and `npm run build` to establish current health. Check `/prototype` on the actual phone.
2. Add synthetic PF fixtures: straightforward transfer, unknown office, missing rejection response, conflicting dates and a second unsupported issue. Define expected facts and prohibited invented content.
3. Introduce `packages/case-core/` with schemas, service definitions, revisioned updates, question selection, readiness and draft rendering. Port useful behavior from `lib/research-model.mjs` deliberately rather than treating its prototype API as production-complete.
4. Scaffold `mobile/` with an Expo development build, native navigation and SQLite. Build Issues, Overview and one complete guided path before wiring an AI provider.
5. Add a provider interface with deterministic mode enabled by default; prepare server-only configuration documentation without putting secrets in tracked files.
6. Replace the legacy fallback behavior only through an explicitly tested migration. New mobile routes must never call `lib/fallback.js`. The legacy `app/api/agent/route.js` currently validates only a few response keys and silently falls back; it is not our trusted case engine.
7. Replace silent-save patterns from `lib/store.js` in all new code with explicit success/failure and recovery. Existing browser mock data is not authenticated server storage.
8. Once free-tier account access is verified, execute M3 with synthetic audio. Record device, dependency versions, model, observed quota and latency before choosing the final audio library.

First demo acceptance: open the Android app, describe or enter a fictional PF problem, keep an unknown office, correct conflicting information, attach a sample document, review a factual draft, kill/reopen the app and continue from the saved state. Turn AI off and verify the same case can still be completed through guided input.

## 15. What has and has not been done by this planning task

Reviewed the repository, existing case model, legacy agent/storage behavior, audit and study notes, and current official Gemini/Expo documentation. Wrote this plan. No dependency installation, model session, key creation, account/billing change, app implementation, participant recruitment or government submission was performed. Account-specific free quota, native audio compatibility, latency and usability gains remain unverified.
