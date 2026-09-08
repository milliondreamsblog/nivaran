# CPGRAMS audit → priorities → prototype → comparison

Updated 7 September 2026. Nivaran is a standalone CPGRAMS revamp. This work does not assume third-party integration with the existing portal.

## Status against the requested five steps

| Work | Status | Deliverable / dependency |
|---|---|---|
| Finish the original-flow audit | Partial; standard transfer preparation now inspected | Playwright walkthrough reached final details/Submit for one EPFO transfer branch. Categories, office, description, attachment rule, profile fields, Back/Forward and narrow layout observed. Real uploads, submission and downstream case results remain gaps. See [standard-flow audit](cpgrams-standard-flow-audit.md). |
| Observe intended users | Pending | One earlier participant report covers signup; the agent's chatbot tests are not user sessions. A moderator script, task cards and local observation recorder are ready. Additional users have not been recruited or observed. |
| Rank problems | Provisional ranking complete | Evidence table below separates direct observations, participant reports, code review and hypotheses. Prevalence remains unknown. |
| Prototype priority improvements | Implemented, pending browser/participant QA | `/prototype`: focused PF preparation, evidence, review, recovery and simulated response exercise. No real filing, LLM, speech recognition or identity verification. |
| Compare both flows | Study prepared; no participant results | `/study`: record outcomes, elapsed time, errors, help, recovery and comprehension. No invented baseline or percentage improvement. |

## Current-flow audit coverage

| ID / stage | What is actually established | What must still be observed |
|---|---|---|
| A01 Discovery | Homepage and menus inspected in Chrome on 6 Sept | First-time user discovery, mobile layout and language comprehension |
| A02 Signup form | Registration fields inspected; submission reached email-sent confirmation | Field-by-field validation and retry, delayed verification and changed contact details |
| A03 Email / credentials | User reports username/password step, broken visibility control and clearing both passwords after a popup | Reproduction and exact error wording; username uniqueness; no duplicate account creation solely for testing |
| A04 Login | User signed in; dashboard observed | Recovery, session expiry, keyboard and accessibility behavior |
| A05 Filing declaration | User personally accepted initial exclusions and later EPFO 20-day similar-filing declaration on 7 Sept | Comprehension and edge cases not tested |
| A06 Standard department/category tree | Labour → EPFO → PF/Pension transfer → Transfer of PF inspected; required 148-office list; Back reset visible selection, Forward restored details | Other branches, Others behavior, office-selection accuracy and manual user tests |
| A07 Standard description | 2,000-character limit; empty-field errors; Hindi test text carried into final details despite English-character guidance | Manual typing/counter behavior, server acceptance, prolonged interruption recovery |
| A08 Standard attachments | Optional chooser plus Attach; displayed PDF-only up to 4 MB; chooser single-select without accept filter | Actual uploads, count, enforcement, rejection, progress, preview/remove and file retention. Prototype 5 MB remains its own design rule. |
| A09 Standard review | Final details page shows category/office and editable description plus prefilled profile/contact fields, CAPTCHA, truth statement and Submit; no explicit category Edit observed | Attached-document review, any confirmation after Submit, final validation; Submit not clicked |
| A10 Official submission / acknowledgement | Not visited; no test grievance filed | One actual eligible complaint with participant review, receipt, registration ID, delivery and ambiguous-submit recovery |
| A11 Public status lookup | On 7 Sept live browser confirmed registration number, email/mobile and Security Code; grievance dashboard empty | Actual result with authorised case, any OTP, status definitions, transfer history, response access and notifications. No grievance password on inspected lookup screen. |
| A12 Officer clarification / response | Only described by documents and synthetic examples | Authorised pending/disposed case and actual request/reply. Officer workflow also requires authorised officer access; cannot be inferred from citizen screenshots. |
| A13 Feedback / appeal | FAQ documents rules; live appeal dashboard empty; live appeal lookup asks appeal number, email/mobile and Security Code | Eligible disposed case, actual feedback control, appeal gate, field limits, review, acknowledgement and appeal result |
| A14 Chatbot | Six scenarios, ten messages recorded on 6 Sept | Final draft, attachments and actual filing; voice capture, measured mobile usability, case tracking and appeals |

On 7 Sept, web retrieval of `/NewGrievance` redirected to Unauthorized Access. The original browser connector returned no browsers and Windows computer-use failed with native-pipe error 2. Later, following the user's explicit request to try Playwright, a temporary Playwright driver connected to a visible separate audit Chrome profile. The user logged in personally. `/Desk` showed zero registered, pending and closed grievances; `/NewGrievance` displayed the same exclusions and agreement checkbox. The declaration remains unchecked pending the user's review and an eligible case. Access is restored, but no downstream gaps have been relabelled complete. Empty account history cannot establish actual tracking, response or appeal behavior.

Sources: [status lookup](https://pgportal.gov.in/Status), [appeal lookup](https://pgportal.gov.in/Appeal/Status), [official FAQ](https://pgportal.gov.in/Home/Faq). Earlier first-hand evidence: [assisted walkthrough](cpgrams-assisted-walkthrough.md), [chatbot tests](cpgrams-chatbot-stress-test.md).

For each unvisited screen, capture: URL without account tokens; case state; participant goal; exact field/button wording; required/optional status; dependency; attempted input; error text; whether data survived; recovery route; observed hesitation; evidence location. A missing credential or unavailable case is an access block, not a UX failure.

The later authenticated session continued after the user accepted both declarations. See [standard-flow audit](cpgrams-standard-flow-audit.md) for exact fields and tests; the earlier access/gate notes above describe historical states, not the current blocker. The remaining dependency is genuine case/document access for upload, submission and downstream case observation.

## Provisional priority register

Priority is judgment based on consequence and current evidence, not measured frequency. P0 = incorrect case or unrecoverable work; P1 = blocks or substantially complicates preparation; P2 = readability/discovery hypothesis needing validation. Confidence refers to the observation, not a population estimate.

| ID | Problem / evidence | Priority and reason | Confidence / reach | Intervention and test |
|---|---|---|---|---|
| F01 | EPFO transfer classified as state matter after private-employer answer in T03b and T04b | P0: an unsupported route could send the case incorrectly | Direct, repeated across two chats; final routing not submitted; prevalence unknown | Service-owner explanation and explicit editable service. Test that private employment does not silently imply state ownership. |
| F02 | Hindi thread hit Root error and reopening saved history hit it again | P0: conversation became unusable | Direct screenshot and retry observation; root cause unknown | Separate structured case from UI; recover persisted answers. Test actual reload with edited facts. |
| F03 | Existing Nivaran fallback PF branch hardcodes withdrawal and facts such as two months, despite input possibly describing transfer; shared draft adds unprovided earlier complaints | P0: the revamp itself must not invent facts | Direct code review of `lib/fallback.js`, not a user observation | New prototype uses only entered facts and selected service. Regression checks cover omitted hardship/delay/prior attempts. Legacy `/file` remains outside this study. |
| F04 | T01 office/UAN form replaced composer and office options lacked explanation | P1: user cannot ask how to proceed at a required field | Direct in one branch; cannot generalise to all chatbot paths | Persistent help, optional office during preparation and I don't know guidance. Test unknown office/UAN. |
| F05 | User reported mismatch popup cleared both passwords; visibility icon broken | P1: repeated entry and onboarding uncertainty | Participant report; mechanism not reproduced | Carry into signup redesign backlog. Not implemented in this preparation prototype; test separately after controlled reproduction. |
| F06 | T04 conflicting dates not reconciled during observed exchange | P1: uncertainty could become an inaccurate draft | Observed omission; final draft not reached | Separate remembered/document dates; explicit confirmation; otherwise draft marks uncertainty. |
| F07 | T02/T06 generic refusal without useful education or onward route | P1 for the proposed broad assistance scope | Direct; might match original bot's narrower scope | Persistent explainers; explicit supported scope. Full RTI/other-service journeys remain future work. |
| F08 | T05b asked many passport questions including identity details in one response | P2: cognitive load / unexplained early data collection | Interface observed; overload is a hypothesis | Short groups of purposeful questions and no identity collection in the research prototype. Passport journey not implemented. |
| F09 | Standard transfer form displays PDF-only up to 4 MB; a citizen's camera photo cannot directly meet that stated rule | P1 design opportunity; conversion effort not measured | Rule/control directly observed; actual upload not tested | Native image/document selection with clear size handling; test real evidence tasks before claiming gains. |
| F10 | Existing demo offers appeal merely because a case is overdue | P0 review risk if reused as a policy baseline | Direct code review of legacy grievance page; official FAQ differentiates delay follow-up from post-disposal appeal | Study exercise exposes appeal preparation only for a simulated closed central case with poor feedback. Legacy route is not a verified rule implementation. |
| F11 | Standard office dropdown requires one of 148 offices; generic Others guidance does not explain office discovery in selected branch | P1: unknown office can prevent preparation | Direct controls and empty-field validation; user frequency unknown | Explain service office, searchable choices, persistent help and unresolved-office draft state |
| F12 | Browser Back resets visible category selection; Forward restores details; final page lacks explicit category Edit | P1: correction path uncertain | One direct Back/Forward check, not permanent loss | Explicit edit sections that preserve case state |
| F13 | English-character guidance accompanies Hindi text carried successfully to details; counter remained at 2,000 | P1 language clarity; counter impact provisional | Direct automated-fill observation; manual/server behavior untested | Consistent language support, validation and counts; manual Hindi test |
| F14 | Final details page overflows to 448 pixels at 390-pixel viewport | P1 for mobile use | Direct CSS viewport measurement and masked screenshot; not physical-phone test | Responsive/native layout, text scaling and actual-device QA |

## Prototype boundaries and traceability

Open `/prototype`. It is deliberately separate from the existing `/file` demo so participants do not accidentally use the older hardcoded model flow. It is a responsive web research artifact for testing the future React Native journey.

| Prototype behavior | Evidence / hypothesis | Implementation |
|---|---|---|
| Select transfer, withdrawal or unsure; explanation stays accessible | F01, F04 | Explicit service selection and persistent help panel |
| Own words plus requested outcome; no invented narrative | F03 | Deterministic draft from source answers |
| Keep two dates separate and choose neither | F06 | `dateSummary`, review before local save |
| Optional office and no UAN collection during preparation | F04 | No identifier gate in research prototype; formal submission requirements remain to be designed |
| Explain relevant proof, validate selected files without erasing work | F09 hypothesis | Local PDF/PNG/JPG selection; 5 MB prototype rule; no upload |
| Restore case but mark file contents unavailable after reload | F02 | Versioned local state; remembered attachment metadata must be reselected/removed before local save |
| Confirm destination and facts separately | F01/F03 | Source corrections invalidate review; service changes invalidate route confirmation |
| Show visibly simulated receipt | Audit A10 gap | `SIM-` identifier; no official submission or deadline claim |
| Separate office closure from real-world resolution | Research hypothesis, A12/A13 gaps | Fictional response exercise; feedback then appeal preparation, no appeal submission |

Not implemented: automated conversation/voice, full multilingual flow, registration redesign, full department taxonomy, real citizen/officer backend, actual notifications, real file storage, production identity or appeal eligibility logic. The narrower prototype lets us test the ranked interventions before claiming those broader capabilities.

## Verification and next work

Run `node --test tests/research-model.test.mjs`, then `npm run build`. Browser visual/interaction QA and participant comparison must be performed when computer access returns; passing logic checks does not establish user benefit.

Verification performed on 7 September: ten model/state invariant tests passed; Next.js production build compiled and generated `/prototype` and `/study`; both local routes returned HTTP 200. Production preview was started on `http://127.0.0.1:3010`. No visual, keyboard or browser end-to-end pass is claimed while the browser connection is unavailable. Start again with `npm run start -- --hostname 127.0.0.1 --port 3010` after a machine restart (run `npm run build` first if code changed).

Next live action: browser access is restored and standard EPFO transfer preparation has been inspected. Bring genuine supporting documents and an eligible reviewed case to examine actual upload/submission; use authorised pending/closed cases for tracking, response and appeal. Do not replay signup or submit fictional research scenarios. The next development step remains the bounded mobile preparation/recovery flow in the [development plan](mobile-development-plan.md).

Run the [study protocol](usability-study.md). The `/study` recorder starts with no observations. Dry runs stay labelled and excluded. No users have been observed by this new study and no improvement claim is currently justified.
