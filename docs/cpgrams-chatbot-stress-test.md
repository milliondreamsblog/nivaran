# Samadhan Didi conversational stress test

Date: 6 September 2026. Six fictional scenarios, ten messages, in the real post-login CPGRAMS chatbot. No official grievance was submitted. The user authorized typed conversation and stress testing; these were sequential semantic/usability checks, not a traffic/load test.

## Main finding

The assistant can ask clarifying questions and separate two unrelated problems, but this session exposed inconsistent routing, a form gate that prevents follow-up, limited information assistance, and a conversation-specific crash that recurred when reopening history. Nivaran should be evaluated on resolving these specific failures, not on the presence of a chat box or microphone alone.

## Evidence and limits

- [Captured messages and page results](cpgrams-test-evidence/chat-results.json). The first result is an explicitly labelled observation summary; subsequent results contain captured rendered page text and controls. The account name is redacted from text. No credentials, OTPs, UANs, email verification links or user-specific chatbot URL parameters are included.
- [Observed full-page error](cpgrams-test-evidence/hindi-thread-error.png).
- Browser: visible Chrome, opened through the official authenticated dashboard link. Messages entered into the real text composer and sent with its Send control; no direct backend requests, endpoint manipulation or form-gate bypass.
- Each scenario disclosed that it was hypothetical or information-only and instructed the assistant not to register a grievance. This is an intentional submission-control test and also a limitation: the wording may affect answers compared with an ordinary real complaint.
- English, Hinglish and Hindi cases were not exact translations or randomized paired tests. Different outcomes cannot be attributed to language alone.
- Speech recognition, microphone permissions, audio playback quality, actual uploads, final drafting/submission, status synchronisation, appeal and mobile layouts were not tested.
- No UAN, applicant identity details or invented reference numbers were supplied. The office/UAN form was left incomplete. No official grievance-submit control was activated. Chat history was created in the user's chatbot account and left available.
- A technical error is observed behavior; no source-code/backend investigation establishes its cause. References on the error page do not establish that a human incident report was filed. We did not activate the report/export control.
- Outcomes are observations from one account/session. They identify defects and hypotheses about abandonment, not prevalence or completion-rate statistics.

## Scenario results

| Test | Input and sequence | Observed result | Assessment |
|---|---|---|---|
| T01: vague Hinglish PF problem | Changed jobs, PF transfer rejected twice, employer and EPFO redirecting the person to each other; requested guidance only | Initial progress indicator identified a ministry-selection step. Final response labelled language English and required RO/SRO/Headquarters plus UAN. The conversational composer disappeared. | PF-specific fields appeared, but no explanation, evidence coaching, rejection clarification or visible follow-up route was provided at this stage. |
| T02: information only | Asked the difference between transfer and withdrawal, what applies on changing jobs, and requested simple Hindi | Generic English refusal saying the query was outside its grievance scope and asking the user to describe a grievance. Composer remained. | Did not mistakenly file; failed the desired educational/help-before-filing experience. It may intentionally have a narrower product scope. |
| T03a: Hindi with missing identifiers | Same general PF difficulty, unknown UAN and office, requested preparatory guidance | Detected Hindi, translated the surrounding interface and asked whether the employer was government/public-sector or private. | Positive: real Hindi clarification, not just a static translated menu. Did not yet help locate missing identifiers. |
| T03b: private employer clarification | Explained both employers were private, the grievance concerned EPFO's transfer rejection rather than wages, and exact rejection/UAN were unavailable | Stated the grievance concerned a state-government matter and requested the state. | Routing concern: the stated service owner was EPFO; private employment alone does not establish state ownership of the EPFO service. No reasoning for the classification was given. |
| T03c: explicitly correct routing | Clarified that this was EPFO's service and asked about Labour and Employment before choosing a state | Full-page Root component error, with Try Again, Go Home, an untranslated errorBoundary.reload label and a report/export control. | The user could not continue the conversation. Cause unproven. |
| T04a: conflicting facts and guarantee | Corrected withdrawal to transfer, gave conflicting March/May exit dates, lacked documents and asked whether payment within 24 hours could be guaranteed | Asked whether employer was public-sector or private. | No fabricated date or guarantee was observed, but those questions were not addressed in this response. Final fact reconciliation remains untested. |
| T04b: clarify English case | Explained both employers were private and that EPFO rejected the transfer; repeated unresolved date discrepancy and asked what evidence to check | Again stated state-government matter and requested a state. | Reproduced the problematic classification in a second conversation, in English. Evidence guidance remained unanswered. |
| T05a: two unrelated problems | PF transfer rejection plus passport appointment difficulty; explicitly requested choosing one issue first | Asked which issue to address first. | Pass for the explicitly requested disambiguation. Spontaneous issue separation without this instruction was not tested. |
| T05b: choose passport | Selected passport; specified a paid existing application, no appointment slots, and missing reference/screenshots | Asked for name, birth date, application type, payment date/method, reference/receipt, location/office and exact error wording. Kept the response focused on passport. | Positive topic selection and relevant fact gathering. Long bundled question adds cognitive load; need for identity details at this preliminary stage is unexplained. Its wording about locating the application does not prove an actual lookup integration. |
| T06: excluded request and override | Explicit RTI request for ministry file notes; asked whether it could be submitted as a normal CPGRAMS complaint anyway | Generic out-of-scope refusal; asked the user to rephrase as a grievance. | Refused the override and did not invent a complaint. Did not explain the RTI distinction or offer an appropriate alternative route. |

## Routing ground truth

The scenario concerns EPFO processing an EPF transfer. EPFO identifies itself as under the Ministry of Labour and Employment, Government of India. That supports challenging the chatbot's unsupported state-government classification in T03b/T04b. It does not establish what final destination the chatbot would choose after the next answer, because no state was supplied and no complaint was filed. [EPFO official description](https://www.epfindia.nic.in/site_en/AboutEPFO.php)

RTI matters are outside CPGRAMS grievance redress under its public FAQ. T06 therefore tested both respecting the exclusion and providing useful onward guidance; those are separate criteria. [CPGRAMS FAQ](https://pgportal.gov.in/Home/Faq)

## Crash and recovery sequence

1. Hindi conversation: initial issue → public/private clarification → explicit objection to state routing.
2. The page displayed an unexpected-error screen naming component Root. Both chat and composer were unavailable.
3. Clicking Try Again restored the welcome page in English. Recent Chats still listed the earlier conversations; this did not resume the interrupted conversation automatically.
4. Other new English conversations could be started and answered afterward.
5. Selecting the saved Hindi conversation from Recent Chats caused the full-page Root error again, with a new error reference.
6. On a subsequent inspection, the app was back at its welcome page and the retry control was no longer present. This second return was not independently attributed to an operator click. The history entry was not deleted by the assistant.

Evidence supports a saved conversation that was not usable when reopened during this test. It does not prove all Hindi conversations fail, that the correction text caused the underlying defect, or that stored data was lost.

## Concrete friction and Nivaran requirements

| Friction observed | Potential user consequence | Proposed Nivaran behavior |
|---|---|---|
| Office/UAN form replaces conversation | User cannot ask what RO/SRO means, how to find UAN or which office applies | Keep a help/follow-up input alongside structured fields; support I don't know and return to earlier steps |
| Long office list without selection guidance | User guesses jurisdiction or stops | Explain how to identify the responsible office from relevant records; do not equate residence with office jurisdiction automatically |
| Generic rejection of information request | User cannot learn enough to decide whether to file | Distinguish information, service application, grievance and follow-up; provide source-backed guidance or a clear handoff |
| Private employer followed by state classification | User trusts an unsupported route and proceeds incorrectly | Identify the complained-about service owner separately from employer type; show reasons and support correction |
| Contradictory facts not yet reconciled | Inaccurate draft if uncertain facts are later treated as settled | Mark unknown/conflicting facts explicitly and ask for confirmation before drafting assertions |
| Many questions at once in passport case | User cannot answer all fields and abandons | Ask a small number of high-value questions per turn; separate missing evidence from required identity information |
| Error screen replaces conversation; history reopens error | User feels forced to start over and loses confidence | Recover to a safe usable conversation state, retain the last confirmed facts and isolate rendering errors |
| Technical component name and untranslated key in error UI | Recovery options feel broken or incomprehensible | Plain-language recovery choices and an optional diagnostic reference |
| Exclusion refusal without next route | User rewords an ineligible request rather than finding the right service | Explain the exclusion and offer a verified destination; do not coach circumvention |

## What worked and should be preserved

- Hindi text produced a Hindi clarification and translated surrounding UI in T03a.
- Clarifying questions were possible in several paths; it is inaccurate to say the system never supports multi-turn conversation.
- The two-topic case respected the user's request to choose an issue first and kept the next response focused on passport.
- Passport follow-up requested concrete facts rather than immediately inventing a complete grievance.
- The explicit RTI override did not produce a complaint in the observed response.
- A visible recovery button restored access to the app, and unaffected conversations continued to work.
- No official receipt or registration number was displayed during these tests, and the operator did not activate any grievance-submit action.

## Pending before claiming an end-to-end solution

Use a real, eligible case with the user's verified facts to examine office/category selection, identifier validation, evidence attachment, correction of the generated draft and final review. Separately inspect pending and disposed cases to assess status explanations, evidence requests, feedback and appeals. A supported submission/status integration still needs independent verification. These conversation tests do not establish API access or reliable unattended filing.
