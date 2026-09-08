# CPGRAMS assisted walkthrough and Nivaran opportunity map

> Latest session, 7 September 2026: Playwright access restored and one standard EPFO transfer branch inspected through final details/Submit. See [exact fields and observed checks](cpgrams-standard-flow-audit.md). The earlier status paragraphs below are historical; actual upload, official submission and populated case lifecycle remain pending.

> 7 September follow-up: Nivaran's scope is a standalone CPGRAMS revamp, not a third-party integration layer. See [audit coverage, priorities and prototype](audit-to-prototype.md) and the [participant study protocol](usability-study.md). Earlier integration observations below are historical research context, not a dependency for this standalone redesign. The full standard filing and post-submission audit remains incomplete.

Started: 6 September 2026. Status: login, empty citizen dashboard and filing eligibility screen verified. Samadhan Didi tested through six fictional scenarios and ten messages; see [conversation stress-test results](cpgrams-chatbot-stress-test.md). Complete complaint details, official submission and subsequent case lifecycle remain pending.

## What the earlier research actually covered

`cpgrams-research.md`, line 5, says the researcher was not logged in, created no account and submitted no forms. Section 3.3 explicitly reconstructs filing from documents and guides. Section 8 identifies the citizen dashboard, live filing fields, upload limits and status-result page as unverified firsthand.

Consequently, that document is background research and a public-route inventory, not an end-to-end citizen usability test. Reported bugs, older officer screens, planned NextGen features and current citizen behavior must remain distinct.

## Evidence for this session

- Opened a visible Chrome window with a separate audit profile; inspected the actual rendered homepage and registration page through Chrome DevTools Protocol.
- Read the current official FAQ, registration, sign-in and sitemap through web retrieval.
- Visually inspected homepage and registration screenshots. Screenshots remain in the local temporary directory; do not commit screenshots containing personal details.
- Homepage: navigation includes View Status, Nodal PG Officers, Redress Process, Grievance, Nodal Authority for Appeal, Mobile App, language and Sign In. A large rotating banner occupies much of the initial viewport.
- Registration: Name; Gender; three address boxes; Country; State; District; Pincode; Mobile number; Phone number; E-mail address; Security Code; Submit. District initially says to select a state first. Address placeholders are Premise Number or Name, Sub-locality and Locality. Phone number mentions an STD code. Required fields have visual asterisks; HTML `required` flags alone do not reflect all visual requirements.
- Sign-in page retrieval: password login, OTP-login link, username/password recovery, citizen signup and a separate officer-login link. It advertises Samadhan Didi voice filing; its post-login destination was subsequently opened (see below).
- The user filled the registration form directly. The assistant clicked Submit once and observed navigation to `/Registration/EmailSent`, titled Registration email sent. The page thanks the user for registering and states that a verification link was sent to the supplied email address (displayed masked). It instructs the user to check email and follow the email instructions, and offers Back To Home Page.
- This verifies initial registration submission and the portal's email-sent confirmation, not actual email delivery or account activation. No intermediate mobile OTP screen was observed between this submission and the confirmation. The earlier research's asserted mobile-OTP-then-email sequence is not established by this observed path.
- Email-link and credential creation were reported by the user. Successful subsequent login is verified by the authenticated dashboard. Any signup mobile OTP step, uploads, grievance submission, tracking result, feedback and appeal remain unverified.

### Registration handoff finding

Observed: submission moves the user out of the portal journey into email. The confirmation exposes no visible resend button or verification-progress control in the inspected page; its explicit continuation is Back To Home Page. The page says to follow instructions in the email without explaining those later steps on this screen.

Potential friction (not measured abandonment): a user must find the message, possibly check spam, switch context and work out how to return. A missing or delayed email could leave the user uncertain about recovery. Nivaran should explain this handoff, retain the user's task and resume after verification; it must not report the account as verified solely from the email-sent screen.

### User-reported email verification and credential creation

The user reports completing signup through the emailed link. The audit browser remained on `/Registration/EmailSent`; the assistant did not observe the credential-creation screen directly. These findings are participant reports, not independently reproduced bugs.

| Item | User observation | Interpretation / next verification |
|---|---|---|
| Additional signup stage | Email link required creating a username and password | Confirms a further credential-creation step in the user's journey; the initial form is not the end of signup |
| Username uniqueness | User suspects the username is not unique | Unverified. Do not conclude duplicate usernames are accepted. Inspect guidance and validation if this screen can be revisited without changing the completed account |
| Password visibility | Password eye icon appeared broken | Check whether icon rendering, click handling or actual visibility toggling failed; precise mechanism not yet established |
| Password confirmation / returning to password | After entering confirmation, returning to the password field to view it triggered a popup and cleared both password fields | User paraphrase suggests a password-mismatch error; exact error wording and trigger remain unverified. Record that both entered passwords were reportedly lost |

Potential impact: retyping credentials, uncertainty about whether the two passwords match, reduced confidence in account creation and possible abandonment. Do not deliberately repeat credential creation on the completed account just to reproduce this. If testing becomes possible in a suitable test flow, record focus/click sequence and error text without recording secret values.

Nivaran implication: explain that verification continues into credential creation and preserve the grievance conversation across the handoff. Portal credential-field bugs require a portal fix or a supported alternative authentication route; voice guidance alone cannot correct them. Offer password/OTP login only according to the actual supported portal controls.

### Authenticated dashboard: `/Desk`

Observed after the user completed login:

- A session countdown showed 29:36 at inspection. This establishes a visible timer, not its precise expiry or renewal behavior.
- Grievance Dashboard, Appeal Dashboard, Lodge Public Grievance, Lodge Pension Grievance, Account Activity, Edit Profile, Change Password, Delete Account and Sign out are present in the sidebar.
- The three summary counts (total, pending, closed) were all zero. The table has Registration Number, Received Date, Grievance description and Status columns, with search/pagination and an empty-state message. No existing case is available in this account to inspect processing or appeal.
- Samadhan Didi / Speak Your Grievance is a post-login link to `https://cpgramsaichatbot.com/`, opening a separate tab. The actual link contains a user-specific parameter: omit that parameter from research records and shared links.
- Account-management links establish visible functionality to investigate. In particular, Delete Account links to `/AccountDeletion`; do not conclude that helpdesk email is the only user interface for account deletion from the public FAQ alone. Deletion was not activated or tested.

Potential friction: an empty dashboard emphasizes counts and a table before the user has a case; task discovery depends on navigating the sidebar. Public and pension filing, grievance and appeal dashboards, and the separate AI entry require users to distinguish several routes. The countdown raises a draft/session-recovery question that must be tested separately.

### Standard filing entry: `/NewGrievance`

Observed by following Lodge Public Grievance:

- Page title: Grievance terms and conditions.
- Four exclusions appear: RTI; court/subjudice; religious matters; government-employee service matters unless prescribed channels have been exhausted, referencing the DoPT memorandum.
- A separate instruction directs central-government pension issues to Lodge Pension Grievance.
- Checkbox: I agree that my grievance does not fall in any of the above listed categories.
- The action button is labelled Submit. No complaint-description or evidence-upload fields are visible at this stage.
- The declaration remains unchecked pending the user's issue. No complaint has been submitted.

Potential friction: the citizen has to assess eligibility using administrative terminology before the portal asks what happened. The generic Submit label does not communicate that another filing stage follows. An assistant should first establish the issue, explain eligibility and then make the next action clear. The four exclusions on this live screen should not be replaced with an unqualified union of conflicting historical lists.

### Samadhan Didi entry: `https://cpgramsaichatbot.com/`

Opened the official dashboard link's destination in a separate audit tab and inspected the rendered page and a screenshot. The page title is CPGRAMS AI Chatbot and it displays the signed-in user's first name.

Observed controls/content:

- A welcome message says grievances can be registered by speaking or typing.
- A large microphone control labelled Tap to Speak.
- A text area with guidance to type a query or use the microphone for audio communication, plus a send icon.
- A New Chat action.
- A Sample Grievance Text area; the inspected sample concerns inability to book a passport appointment.
- Large branding/portraits/background imagery; an inner scroll region partially cuts off the sample area at the inspected desktop viewport. Actual usability and mobile behavior remain to be tested.

This corrects the earlier uncertainty about where Samadhan Didi can be reached. Subsequent [conversation tests](cpgrams-chatbot-stress-test.md) exercised six fictional scenarios and ten messages, including Hindi clarification, PF office/UAN fields, repeated state-routing concerns, issue separation and a saved-conversation crash. Microphone capture, official grievance submission, tracking and appeals remain untested. Do not characterize a missing automatic tab during a programmatic link click as a portal bug without reproducing it through ordinary user interaction.

## What citizens use the system for

CPGRAMS receives grievances about public-service delivery and sends them to the responsible authority. It is not a universal service-application system: a complaint about an existing passport application is different from applying for a passport. An assistant must distinguish asking for information, applying for a service, reporting service failure and following an existing grievance.

The following is a research coverage matrix, not a verified exhaustive export of the current category tree. Sector examples come from the prior research; exact eligibility, departments and subcategories require checking the live form and relevant service rules.

| Service area to explore | Example reason for coming | Evidence the assistant may need to ask about |
|---|---|---|
| EPFO / labour | Settlement delayed; member details or KYC correction stuck | Claim reference, submission date, employer/office, previous response |
| Pensions | Payment delayed, incorrect pension, processing difficulty | Pension scheme/type, office, application/payment dates; check the separate pension route |
| Banking / financial services | Service refusal, staff conduct, unresolved banking complaint | Bank/branch, complaint reference, dates, response; determine correct specialist channel |
| Insurance | Claim or policy-service grievance | Insurer, claim reference, relevant correspondence |
| Income tax | Refund delayed or disputed demand | Assessment context, reference and response; identify any separate statutory process |
| Agriculture / PM-KISAN | Benefit instalment missing or verification pending | Scheme, status, dates, responsible office |
| Housing / PMAY | Existing scheme/application problem | Scheme/application details and decision; distinguish grievance from a new benefit demand |
| Telecom | Coverage or service problem | Provider/location, prior complaint, dates |
| Posts | Postal-service failure | Consignment/service reference, date, earlier complaint |
| Railways / transport | Service or administrative grievance | Service, location/date and reference; check any more suitable direct channel |
| Passport / external affairs | Existing application or office-service problem | Application reference, dates and office |
| UIDAI | Aadhaar-related service or correction difficulty | Type of service, acknowledgement and dates; avoid unnecessary identity-document collection |
| Health / public institutions | Government health-service or administrative problem | Institution, service, dates and prior response |
| Education | Public education institution/service grievance | Institution, application/service and dates |
| Petroleum | LPG or related service problem | Provider/distributor, service reference and dates |
| State / UT / local public services | State-administered service failure | Location, service owner and existing state/local complaint; determine routing rather than assuming every issue follows the same path |

Across these areas, recurring complaint reasons include delay, nonreceipt of an entitled service/payment, incorrect records, an unexplained rejection, poor service, staff conduct, failure to respond and an unsatisfactory earlier closure. These are a synthesis for interview coverage, not official category labels.

Official purpose: https://pgportal.gov.in/

## Citizen services and journeys to inspect

Public routes and the FAQ establish these entry points; their post-authentication behavior remains to be tested where applicable.

1. Understand whether the problem belongs here; read eligibility/exclusions and process guidance.
2. Register a citizen account.
3. Sign in by password or OTP; recover username/password.
4. Lodge a public grievance and obtain an acknowledgement/reference.
5. Use the separate pension grievance route where appropriate.
6. Look up a grievance and read its status and any departmental response.
7. Send a reminder or clarification; inspect how additional information is requested/provided.
8. Give feedback on closure.
9. File an eligible appeal and track the appeal.
10. Find grievance officers, appellate authorities and help contacts.
11. Understand other access routes such as CSC, post, mobile app and UMANG.
12. Manage account problems, including the documented helpdesk route for deactivation; do not perform deactivation as a research test.

Sources: https://pgportal.gov.in/Sitemap ; https://pgportal.gov.in/Home/Faq ; https://pgportal.gov.in/Signin

## Screen-level friction register

An observed interface is not proof of user abandonment. The possible consequences below are hypotheses until participant behavior or analytics supports them. Priority indicates proposed test importance, not measured prevalence.

| Stage / control | Evidence status | Possible hesitation or failure to investigate | Nivaran response to test | Priority |
|---|---|---|---|---|
| Homepage: Grievance menu and rotating banner | Seen in Chrome | Cannot find where to start; confuses explanatory banner with an action | Start with Explain your problem, then show the resulting task | High |
| Homepage: administrative terminology | Seen in Chrome | Does not understand grievance, redress or nodal authority | Use familiar words and explain official terms alongside them | High |
| Eligibility before registration | Public guidance read; triage not exercised | Registers before discovering the issue belongs elsewhere | Ask what outcome is needed before collecting account details | High |
| Citizen versus officer login | Sign-in page retrieved | Takes the wrong login route | Give one citizen continuation action | Medium |
| Signup: Name | Seen in Chrome | Unsure whose name to enter when assisting another person | Clarify complainant identity and representation rules | Medium |
| Signup: Gender | Seen in Chrome | Unclear why required; options may not fit | Explain requirement without inferring or inventing a value | Medium |
| Signup: three address boxes | Seen in Chrome | Cannot distinguish premise, sub-locality and locality | Accept an address naturally; show proposed split for correction | High |
| Signup: State then District | Seen in Chrome | District is unavailable until another field is completed | Ask in dependency order and explain loading failures | Medium |
| Signup: Mobile versus Phone number | Seen in Chrome | Thinks a landline is also necessary | Explain the optional landline field and required mobile field | Medium |
| Signup: E-mail address | Seen in Chrome | Has no email or cannot access it | Explain the actual requirement and investigate supported assistance routes | High |
| Signup: Security Code | Seen in Chrome | Does not understand captcha or cannot read it | Explain and hand control to the person; inspect accessible alternatives | High |
| Signup: Submit | Seen; not activated by assistant | Does not know whether next action creates account or starts verification | Explain next step after observing it | High |
| OTP request, delivery, expiry and resend | Pending | Wrong destination, delayed OTP, unclear retry or lost progress | Clear verification handoff and resumable conversation | High |
| Password creation and recovery | Pending | Requirements appear only after rejection; recovery fails | Explain verified rules at the point of entry | High |
| Dashboard: locate new complaint | Seen in authenticated Chrome dashboard | Cannot distinguish new complaint from tracking or pension route | Present task choices based on intent | High |
| Declaration / exclusions | Seen in authenticated Chrome filing entry | Legal terminology discourages proceeding or is accepted without understanding | Explain accurately and check eligibility | High |
| Ministry / organisation choice | Reconstructed in earlier research | Knows the problem but not who owns it | Suggest route with reasons and allow correction | High |
| Category / subcategory | Reconstructed in earlier research | Several labels seem plausible; none match everyday wording | Ask a short discriminating question; show chosen category | High |
| Grievance description | Reconstructed in earlier research | Does not know relevant facts, tone, length or requested remedy | Ask for dates, references, prior attempts and desired action; draft for review | High |
| Evidence upload | Live restrictions unverified | Has photos but format/size rejected; upload erases progress | Guide evidence selection and prepare compliant files after checking real limits | High |
| Review / final submission | Pending | Fears wrong routing, changed meaning or duplicate filing | Show exact complaint and attachments; require informed final review | High |
| Failure during submission | Pending | Cannot tell whether grievance was registered | Verify receipt before suggesting any retry | High |
| Acknowledgement / reference storage | Pending | Loses reference; mistakes local draft for official registration | Store official receipt distinctly from a draft | High |
| Status lookup | Public route documented; result pending | Does not know which reference/password to use | Preserve reference and explain the verified lookup requirements | High |
| Status vocabulary and transfer | Result pending | Interprets administrative movement as resolution | Explain the actual response, source and last checked time | High |
| Reminder / additional information | Result pending | Cannot find action or understand what documents are needed | Turn actual request into a short checklist and reviewed reply | High |
| Closure and response document | Result pending | Cannot understand whether the problem was addressed | Summarize the reply and ask if the real-world issue is resolved | High |
| Feedback then appeal | Official guidance read; action pending | Appeal undiscoverable; feedback's consequences unclear | Explain actual eligibility and next step from current policy and case state | High |
| Appeal decision / further options | Pending | Assumes unlimited appeals or has no next step | Explain the verified remaining options without promising an outcome | High |
| Language, keyboard and screen-reader access | Pending systematic testing | Translated menu but unreadable error/reply; inaccessible control | Test entire journey in selected languages and assistive technologies | High |
| Mobile viewport, interrupted connection, session expiry | Pending | Hidden button, lost text or repeated login | Preserve draft and make recovery explicit | High |

## Assisted session protocol

The user enters credentials, captcha, OTP and personal registration data directly into the official browser tab. Pause navigation while the user is typing. Record interface labels and behavior without collecting passwords or OTPs in research notes.

Use a real issue and accurate facts for any actual submission. If there is no real issue, explore the form without sending a fabricated grievance. Review the exact final complaint and destination before filing. A new grievance can verify filing and acknowledgement; a pending case is needed to inspect subsequent processing, and a disposed eligible case is needed to inspect closure/feedback/appeal. Do not manufacture those states or call an unvisited branch complete.

For every step record: starting URL and case state; user goal; visible label; action; expected result; actual result; validation wording; whether input survives; recovery route; observed hesitation; proposed assistant response; evidence and test status.

A complete category inventory requires enumerating the current organisation/category branches after login, not extrapolating from a single sample complaint. Compare a few materially different service journeys before deciding which fields can be shared.

## Product assessment to validate

Proposed experience: explain by voice or text; determine information request versus grievance; ask only missing facts; suggest the right route; prepare evidence and complaint; let the user review; complete authentication and filing through a supported mechanism; retain receipt; explain verified updates; help with an eligible next action.

Conversational drafting and explaining are separate capabilities from automatic official submission and background tracking. This research has not established a supported third-party CPGRAMS integration, session lifetime or unattended status access. A supervised browser walkthrough can reveal the workflow but cannot establish reliable production integration by itself.

Samadhan Didi's post-login entry point, text/voice controls and limited conversational behavior are now verified; see the linked stress-test results for both successful clarifications and failures. Full drafting, filing, voice recognition and follow-up still need testing. Nivaran's potential advantage is reducing incomplete/incorrect filings and helping citizens act on responses; voice input alone is insufficient differentiation.

Measure unaided versus assisted completion, routing errors, missing evidence, time spent, corrections to generated drafts, understanding of the reply and successful completion of the next action. A single expert walkthrough identifies likely friction; observing intended users is needed to validate abandonment claims.
