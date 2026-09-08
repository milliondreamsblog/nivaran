# Nivaran mobile development plan

Detailed next build: [assisted preparation and Gemini voice prototype plan, 8 September 2026](voice-prototype-build-plan.md). It defines the shared case engine, native app milestones, free-tier boundaries, recovery behavior and evaluation gates. The evidence and audit gaps below remain applicable.

Updated 7 September 2026. Product: a standalone CPGRAMS redesign, with a React Native citizen app. This is a proposed development scope, not evidence that the redesign already improves outcomes.

## What we know

- Observed: in two chatbot exchanges, a private-employer answer led an EPFO service complaint toward state routing. No final submission was reached.
- Observed: a Hindi conversation failed, and reopening that history failed again. The cause is unknown.
- Observed: an office/UAN form displaced the conversation input in one branch, removing the visible way to ask for help at that point.
- Reported by the user: password visibility and mismatch handling created signup friction and cleared entered passwords. Reproduction remains pending.
- Observed in our own legacy code: fallback drafting invents facts, and a demo presents appeal on overdue cases. These behaviors must not be carried into the mobile app.
- Built: a separate web research prototype at `/prototype`, a study recorder at `/study`, and ten passing model tests. Browser interaction QA and intended-user comparison have not happened.

Detailed evidence and priorities: [audit register](audit-to-prototype.md). Participant protocol: [study](usability-study.md).

## What remains unknown

Playwright access is restored. One standard EPFO transfer branch has now been inspected through the final details/Submit page: category hierarchy, 148-office selection, 2,000-character description, PDF-only 4 MB attachment rule, prefilled profile fields, Back/Forward behavior and narrow layout. See [standard-flow evidence](cpgrams-standard-flow-audit.md). Actual file uploads, server validation, official submission/receipt, populated tracking, officer response and appeal filing remain unvisited. Those downstream states require authorised cases; a new complaint cannot expose them immediately.

There are no measured completion gains, abandonment rates or representative user findings. Voice, a conversation-first interface and native versus responsive-web usability have not been compared.

## First development milestone

Build one complete mobile **complaint preparation and recovery** journey for an EPFO transfer issue. This is the best-covered research scenario, not a promise of coverage for every government service.

1. Start: explain the supported scope; allow starting or resuming a draft. Defer account creation until a task actually needs identity, subject to later requirements validation.
2. Describe: collect the problem in the citizen's words and the outcome they want. Use short guided fields with help available throughout.
3. Clarify: distinguish transfer from withdrawal; preserve conflicting or unknown dates explicitly; provide an `I don't know` path and explain what must be obtained before filing.
4. Destination: show a proposed authority, its reason and an editable choice. Uncertain classification stays unresolved instead of silently becoming a confident route.
5. Evidence: explain why evidence helps; select images/documents; show preview, removal and recoverable errors. Current standard branch states PDF-only up to 4 MB. Choose and test a justified image/document policy for the standalone app; its limits need not copy the portal.
6. Review: show the complete draft, destination and attachment state. Allow corrections and require renewed review after material changes. Never add unprovided facts.
7. Save/resume: persist structured answers independently of the screen or conversation. Make missing attachment contents explicit after interruption. Use a clearly labelled simulated receipt during development.

Acceptance: the transfer issue stays a transfer issue; unknown information is not invented; back/reload/restart preserves answers; attachment failure does not erase the draft; help remains accessible; the user can explain the proposed destination and next step. Verify these on an actual phone before calling the milestone complete.

## Implementation order

1. Visually exercise the existing `/prototype` once browser access works. Fix the preparation flow before duplicating avoidable problems in mobile screens.
2. Create the React Native app alongside the existing web research artifact. Select and verify the current tooling at implementation time. Reuse framework-independent model behavior from `lib/research-model.mjs` after checking platform assumptions; implement native screens and storage adapters separately.
3. Implement navigation, reusable inputs, structured case state, versioned draft persistence and the seven preparation steps. Use synthetic data locally. Do not reuse legacy fallback drafting or overdue-appeal logic.
4. Exercise missing office, conflicting dates, service correction, invalid attachment and interruption recovery. Review accessibility, keyboard behavior, text scaling and small-screen layout.
5. Add conversational assistance against the same structured case model only after the guided flow works. Suggested changes require review; conversation cannot silently overwrite confirmed facts. Add voice and Hindi as explicit later milestones with transcription correction and language-specific testing.
6. Implement identity, real case storage/submission, citizen tracking and an officer workspace as separate milestones. Their screen details and state rules depend on the remaining audit and explicit standalone product decisions. Mock tracking and response exercises must stay labelled.

## Return to the audit efficiently

- Resume with genuine supporting documents and an authorised case at the upload/submission boundary; standard EPFO preparation has now been visited. Avoid replaying signup or chatbot stress tests.
- Capture exact labels, required fields, category dependencies, validation and back behavior through review using a genuine eligible case or authorised sandbox.
- Observe real submission only with an actual reviewed complaint and appropriate authorization. Do not submit fictional research cases.
- Use authorised existing pending and disposed cases to examine tracking, clarification, response, feedback and appeal. If unavailable, retain those gaps.
- Record each issue as observation, user report or hypothesis, with its consequence and recovery path.

## Evidence before expanding scope

Run the prepared tasks with 3–5 willing intended users. Compare equivalent preparation boundaries on the current flow and the prototype; distinguish research-access blocks from product failures. Measure completion without assistance, factual errors, lost work/recovery and understanding of the next step. Use time only alongside those outcomes.

Start mobile foundations and the bounded preparation flow now if desired. Keep full-service taxonomy, production filing rules and appeal eligibility provisional until verified. Do not claim that native, AI or voice is inherently better: the improvement must appear in task outcomes.
