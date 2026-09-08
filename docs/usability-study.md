# Nivaran moderated comparison study

Status: ready to run; zero new participant sessions completed. Do not treat agent stress tests, unit tests or facilitator dry runs as user research.

## Research question

Can the revised preparation and recovery flow help citizens preserve accurate facts, progress despite missing information and understand the next action with less assistance than the current flow?

## Participants and consent

Recruit 3–5 willing adults resembling intended users: vary familiarity with government portals, comfort with English and experience filing grievances. Record these characteristics in broad categories, without names or identifiers. This is a small formative sample, not statistically representative research.

Recruitment is a task for the researcher; the assistant has not contacted anyone. Obtain consent to observe and separately consent to recording if desired. No recording is necessary. Participants can stop at any time. They enter their own credentials and verification codes; the researcher does not copy them into notes. Use P01–P05. Keep case evidence private and only retain de-identified behavioral notes.

Opening script: “We are testing the interface, not you. Please try the task as you normally would and tell me what you expect when something is unclear. You can ask for help or stop. I may wait briefly before helping so we can see where the interface needs improvement.”

## Conditions and task equivalence

- A: current CPGRAMS standard flow, or the chatbot when that is the explicitly chosen baseline. Record which; do not pool them as one interface.
- B: `/prototype`, a scripted PF preparation prototype. Voice and chatbot intelligence are not under test.
- Use the same device, language and starting point for each paired task. The new prototype is currently English text only; do not claim a Hindi comparison or voice advantage.
- P01/P03/P05: A then B. P02/P04: B then A. This mitigates but does not eliminate learning effects. Report order effects.
- Standard filing preparation and chatbot preparation are separate comparisons. Once the exact standard form is audited, align review stopping points. If the baseline never reaches review, record why rather than inventing a surrogate screen.
- Real CPGRAMS: use a participant's genuine eligible case or an expressly authorised sandbox/test environment. Do not submit made-up grievances, upload fabricated proof or make false declarations. If neither is available, mark the affected A task blocked by research access and run B only as formative testing, not a completed A/B comparison.
- Use equivalent facts and documentary complexity. If the same real case is used twice, record learning risk. If equivalent alternate fixtures are used in an authorised sandbox, counterbalance fixtures as well as interface order.
- Do not build a deliberately poor imitation of CPGRAMS and call that the baseline.

## Task cards (participant wording)

### T1 — Prepare a complaint

“You are trying to transfer PF between employment accounts. Your transfer request was rejected and you want the rejection explained and any incorrect records identified. Prepare an accurate complaint for review. You do not know the handling office or UAN at the moment. Stop before official submission.”

For a genuine baseline case, replace those facts with the participant's actual facts before the task. Do not coach the controls or reveal the intended office. Ask the participant what information they believe is still missing and where they would go next.

Prototype/sandbox variant X: the person remembers leaving on 1 March 2026, while the test relieving letter says 1 May 2026. Neither is yet confirmed. The exact rejection response is unavailable. Do not decide the correct date for the person.

Equivalent prototype/sandbox variant Y: remembered exit 1 June 2026, test letter 1 July 2026, same missing rejection and office information. These are fictional research fixtures, never actual filings.

### T2 — Evidence and interruption

“Add the provided test document if it is accepted. If you see an error, recover and continue. Then close and reopen this draft when asked. Check whether your information and document are still available. Reach the review step without losing the case facts.”

Use a non-sensitive valid PDF and an invalid empty/unsupported file only in the prototype or authorised sandbox. Files have not been provided by a real participant in this session. On the live portal, test only with participant-approved genuine documents and allowed actions. Do not cut the user's network or trigger security settings. A normal page reload/back action is sufficient to examine recovery when they agree.

### T3 — Understand closure

“Read this case response. Explain what the office has done, whether your original problem is resolved, and what you can do next.”

Prototype fixture: a simulated central-government case is closed with an instruction to contact the previous employer to verify the exit date, with no confirmation that the transfer completed. Ask the participant whether that resolves their issue and what remains unanswered. Baseline requires an actual authorised disposed case or an equivalent sandbox fixture; a public lookup page is not the response state.

## Moderator scoring key — keep separate from participant instructions

| Task | Completion without help means | Critical errors |
|---|---|---|
| T1 | Reaches the agreed review boundary with transfer preserved, entered narrative intact, uncertain date explicitly unconfirmed and proposed authority understood | Transfer changed to withdrawal; invented delay/prior attempts; unsupported exact date; unexplained state classification accepted as settled |
| T2 | Explains validation error, preserves narrative, reopens the draft and accurately identifies attachment availability | Lost facts; silently claims lost files are attached; cannot recover or needs facilitator to reconstruct |
| T3 | Distinguishes administrative closure from transfer completion and identifies the unresolved verification/action | Treats closed as guaranteed resolution; assumes a pending overdue case automatically has the same appeal path |

Comprehension score: Understood = explains case state and appropriate next action correctly; Partly understood = only one correct; Did not understand = neither correct; Not asked = question omitted. Record the explanation verbatim when non-sensitive.

## Recording with `/study`

1. Enter participant code, flow A/B and task. Keep Facilitator dry run checked while learning the recorder; uncheck only for an actual consenting participant.
2. Begin timing when the participant receives the task, with the agreed starting screen ready.
3. Log observable behavior using Hesitation, Wrong choice, Asked for help, Moderator assisted, Lost work, Recovered, Error or Task paused. Notes should say what happened, not assume emotion or diagnose ability.
4. Define hesitation consistently before the first session, e.g. roughly ten seconds without progress accompanied by scanning/re-reading or an expressed uncertainty. A pause is not automatically abandonment.
5. Record every intervention. Do not silently reclassify an assisted completion as independent completion. The recorder prevents independent completion when a moderator-assistance event exists.
6. Stop at the agreed boundary or participant decision to stop. Outcome: Completed without help, Completed with help, Blocked, Abandoned. Distinguish access block, unavailable case state, product error and missing evidence in notes.
7. Ask the comprehension question and score it. The timer is wall-clock and includes pauses; note interruption durations for analysis. The recorder does not claim active-task timing.
8. Export JSON after each session. Observations persist only on that browser/device; they are not sent to a server.

## Analysis template

Report by matched participant × task pairs. Separate standard-flow and chatbot baselines, dry runs, access blocks and unpaired observations.

| Participant/task | Order | A outcome/time/help/errors | B outcome/time/help/errors | Next-step comprehension | Recovery/lost work | Important confound |
|---|---|---|---|---|---|---|
| Not yet observed | — | — | — | — | — | No participant data |

For 3–5 users, report raw counts, individual differences and representative de-identified quotes. If useful, report median paired time differences for tasks completed under comparable conditions. Do not hide blocked or abandoned attempts from completion counts; do not count research-access blocks as product failures. Do not claim population-level superiority or statistical significance.

Predefined revision decision: any introduced factual error or unrecoverable loss is a release blocker. A proposed improvement needs correct facts and successful task recovery, then fewer observed blocks/help requests without worse comprehension on the matched tasks. If evidence is mixed or insufficient, revise and retest rather than declaring a win.

## Session completion checklist

- Real participant and consent distinguished from dry run.
- Baseline type, device/language and interface order recorded.
- Actual stopping points match; unvisited states remain gaps.
- No official fictional complaint submitted.
- Behavior and outcome separated from inference.
- Notes exported without private identifiers or account tokens.
- Findings update the priority register rather than automatically validating every prototype feature.
