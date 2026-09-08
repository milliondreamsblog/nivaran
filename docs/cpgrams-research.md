# CPGRAMS field research: routes, journeys, rules, numbers, pain points

> Latest live evidence, 7 September 2026: [standard EPFO transfer walkthrough](cpgrams-standard-flow-audit.md) now covers the category tree, office selection, description, stated attachment rule, final details/Submit screen, Back/Forward recovery and narrow layout. Actual uploads, official submission/receipt and populated tracking/response/appeal remain gaps. This updates the local research; the published artifact below has not been updated.

> Follow-up evidence, 6 September 2026: the assisted session has now reached the authenticated citizen dashboard and filing eligibility screen. Samadhan Didi is accessible through a post-login dashboard link to `https://cpgramsaichatbot.com/`; its actual text/voice entry screen was opened. The dashboard also exposes Edit Profile, Change Password and Delete Account (deletion not tested), so the public FAQ does not establish the absence of an account-deletion interface. Initial signup submission led to an email-verification confirmation without an intervening mobile OTP screen in the observed path; the user then reported username/password creation through the email link. The original research below remains a historical record, including its unverified claims. See [assisted walkthrough and current evidence](cpgrams-assisted-walkthrough.md) for scope, user-reported bugs and pending tests.

Published research page (same content, formatted): https://claude.ai/code/artifact/d02974bf-f573-435a-8125-b0e8ad5b078a

> Subsequent live conversational tests: [Samadhan Didi stress-test report](cpgrams-chatbot-stress-test.md) records six fictional scenarios and ten messages, including both successful clarification and observed routing/recovery failures. No official grievance was submitted. The published external artifact has not been updated with these local follow-up findings.

Research date: 6 September 2026. Method: hands-on walk of every public route on pgportal.gov.in in Chrome (not logged in; no account created, no forms submitted), plus the primary documents linked from the portal (DARPG Office Memoranda of 27 July 2022 and 23 August 2024, the CPGRAMS officer manual, the NextGen CPGRAMS Functional Requirement Specification of October 2024, DARPG monthly reports for April 2026 and March 2026), the app-store listings, and press/Parliament coverage. Sources are listed at the end. Anything not verifiable first-hand is marked as such. A separate deep-research pass (five search angles, 19 sources, 95 extracted claims, 25 put to three-vote adversarial verification) confirmed 13 claims and refuted 3; the refutations produced three corrections below (the reopening rule, the exclusion list, and the officer-manual caveat). Nine claims went unverified when the verification agents hit a usage cap.

Why this matters for Nivaran: CPGRAMS is the system Nivaran fronts. The rules below (exclusions, 21-day clock, feedback-then-appeal, single appeal, fresh-filing convention) are the constraints any conversational layer has to honor, and the pain points are the gaps it can close.

---

## 1. What CPGRAMS is, in one paragraph

Centralized Public Grievance Redress and Monitoring System, run by the Department of Administrative Reforms and Public Grievances (DARPG), built and hosted by NIC. Launched 2007; the live portal footer reads `Version 7.0.01092019.0.0`, last updated 21-08-2026, 79.5 lakh visitors since 19-01-2024. One portal connected to 92 central ministries/departments/organisations and 36 States/UTs with role-based access; grievances auto-route to the mapped Grievance Redressal Officer (GRO) at the last mile. Citizens must register and log in to lodge; they get a unique registration number; the department must redress within 21 days (interim reply if longer); after disposal the citizen rates the closure, a "Poor" rating unlocks a one-time appeal to the ministry's Nodal Appellate Authority, disposed within 30 days. A BSNL-run feedback call centre phones citizens after closure. Grievances by email are refused; post, CSC kiosks, the MyGrievance app, UMANG and (since 30 May 2026) the "Samadhan Didi" voice chatbot are the other doors.

---

## 2. Complete route map (as observed on 6 Sept 2026)

### 2.1 Public pages on pgportal.gov.in

| Route | Menu label | What it does / what we saw |
|---|---|---|
| `/` | Home | 8-slide carousel (slide 1 = Samadhan Didi AI chatbot; others: process flow, "bottom-up redress / automated routing" listing Post, DoT, Banking, Insurance, School Education, Road Transport, Health, External Affairs, Petroleum; track status). Red notice: "Any Grievance sent by email will not be attended to / entertained." About text, exclusions list, DPG note, "Government is not charging fee ... money paid ... is going only to M/s CSC only". What's New: the 2022 and 2024 OM PDFs. Quick tiles: Register/Login, View Status, Contact Us. |
| `/Signin` | Sign In | "User Login": Mobile No / Email Id / Username + Password + Security code (captcha with refresh and audio). Links: Forgot Username, Forgot Password, "Click here to sign up". Buttons: PG OFFICER LOGIN (`/cpgoffice`), DIGITAL SEVA CONNECT (`/Signin/CscLogin`). Side panel: Samadhan Didi banner (static image; the mic icon is not a control), app QR codes, technical support email. |
| `/Signin/Login` | Login with OTP | Identifier + captcha + "Get OTP". Link back to "Login with password". |
| `/Signin/CscLogin` | Digital Seva Connect | Redirects to `connect.csc.gov.in/account/authorize` (CSC OAuth) and back to `/Signin/CscResponse`. This is the Village Level Entrepreneur path. |
| `/Registration` | Sign up | Name*, Gender* (Male/Female/Transgender), Address* (Premise number or name, Sub-locality, Locality), Country* (India), State*, District* (loads after State), Pincode, Mobile number*, Phone number, E-mail address*, Security Code*, Submit. Mobile OTP and email link verification follow (per third-party guides; not exercised). |
| `/ForgetPassword`, `/ForgotUsername` | Recovery | Recovery by registered mobile/email + captcha. |
| `/Home/LodgeGrievance` | Grievance > Lodge Public Grievance | Login wall: "Grievance can now be lodged only by registered users.." with User Login and "Click here to register" links. The actual form is post-login (see 3.3). |
| (menu item, JS) | Grievance > Lodge Pension Grievance | Opens the CPENGRAMS pension module (`/pension/`). |
| `/Status` (also `/status/Index/<token>` = "Rate Grievance") | View Status > Grievance Status | Registration number* + (Grievance password OR Email id/Mobile number) + Security Code. The result page is where feedback/rating and appeal are triggered. |
| `/Appeal/Status` | View Status > Appeal Status | Appeal Number* OR Email/Mobile + captcha. |
| `/Reminder` | Grievance > Reminder Clarification | "Send Reminder": same lookup fields as status (registration number, grievance password or email/mobile, captcha), then a message to the handling office. |
| `/Home/NodalPgOfficers` | Nodal PG Officers > Central Government | Table of 92 ministries/departments with Nodal PG Officer name, designation, address, phone/email (emails obfuscated as `[at]`/`[dot]`). |
| `/Home/NodalPgOfficersState` | Nodal PG Officers > State Government | 37 State/UT nodal officers (Haryana listed as VACANT on the day). |
| `/Home/NodalAuthorityForAppeal` | Nodal Authority for Appeal | 88 appellate authorities with contacts. |
| `/Home/ProcessFlow` | Redress Process > Redress Process Flow | One image (`/Images/flowChart.jpg`): citizen → one-time registration & login → registration with department details, unique ID → transmission to PGO/field office → resolution (21 days) → ATR to citizen by SMS/email → feedback → satisfied? closure : Nodal/Sub Appellate Authority → final resolution. Side entry: "Portals of President Secretariat; PMO; CS". |
| `/Home/Faq` | FAQs/Help | 18 questions (summarised in section 4). |
| `/Home/ContactUs` | Contact Us | DARPG officers with landline numbers; technical support `cpgrams-darpg[at]nic[dot]in`; no citizen helpline number. |
| `/Home/AboutUs` | About Us | Role of DARPG; links to IGMS 2.0 (`dashboard-pmopg.nic.in/igms2`) and Tree Dashboard (`treedashboard.in`) built with IIT Kanpur: spam/repeat detection, semantic analysis of text and PDFs, topic clusters, spatio-temporal filters. Officer-only. |
| `/Sitemap` | Site Map | Lists all of the above plus Registration/Forgot pages and social links. |
| `/Culture/Index/{code}` | Language | 23 choices: en, hi, gu, mr, bn, te, as, or, ta, ml, ur, sd, br (Bodo), ko (Konkani), ne, mn (Manipuri), pa, kn, da (Dogri), mt (Maithili), ks, sa, st (Santhali). Sets a sticky culture cookie. |
| Mobile App (modal `#qrModal`) | Mobile App / Download | QR + links: Android "MyGrievance" (`play.google.com/store/apps/details?id=nic.org.mygrievance`), iOS "CPGRAMS" (`apps.apple.com/in/app/cpgrams/id6746528698`). |
| `/Home/Disclaimer`, `/Home/WebsitePolicies` | Footer | Standard NIC disclaimer, privacy, hyperlinking, copyright. "Best Viewed in 1440 x 900 resolution." |
| `/Home/Preview/<base64>.pdf` | What's New | 27-07-2022 OM "Strengthening of Machinery for Redressal of Public Grievances"; 23-08-2024 OM "Comprehensive Guidelines for Handling Public Grievances". |
| `/cpgoffice` | PG Officer login | Officer/GRO interface (username, password, captcha). |
| `/ccfeedback/` | (not linked for citizens) | "CPGRAMS Feedback Portal 2.0": call-centre feedback with call recordings; nodal-officer login only. |

External links from the portal: `dpg.gov.in` (Directorate of Public Grievances, Cabinet Secretariat), `darpg.gov.in`, social (Facebook DARPGIndia, X DARPG_GoI, YouTube), `gandhi.gov.in`, `digitalindiaawards.gov.in`, `goidirectory.nic.in`, `india.gov.in`, `nic.in`.

### 2.2 Pension module (CPENGRAMS 5.0, `pgportal.gov.in/pension/`)

Separate ASP.NET application of the Department of Pension & Pensioners' Welfare, English/Hindi only. Menu: Home (`Default.aspx`), Lodge Your Grievance (`RegistrationForm.aspx`), Send Reminder/Clarification (`ClarificationForm.aspx`), View Grievance/Appeal Status (`GrievanceStatus.aspx`), Feedback (`GrievanceStatus.aspx?Action=F`), Appeal (`GrievanceStatus.aspx?Action=A`), Contact Us, Help, What's New; Pensioners' Association login at `/cpengrams/Login.aspx`. Toll-free 1800-11-1960, email `care[dot]dppw[at]nic[dot]in`. Observed defect: "Lodge Your Grievance" returned "ERROR — Sorry, We are unable to process your request !!!" on three attempts (direct and via the home page). Pension grievances can be lodged without a CPGRAMS account (form collects pensioner type, PPO number, disbursing office, category, description, uploads, per the ex-servicemen guides).

### 2.3 Other doors into the same system

- MyGrievance Android app (DARPG/NIC). Play Store on 6 Sept 2026: 2.7 stars, 5.64K reviews, 10L+ installs, updated 10 Jun 2026. Features: one-time sign-up, dashboard (Total/Pending/Disposed), real-time tracking, reminders, feedback, SMS+email acknowledgements. iOS "CPGRAMS" app: 1.8 stars, 184 ratings, v4.5.10.
- UMANG app: CPGRAMS is a service inside UMANG; sign-up can be done from UMANG.
- Common Service Centres: integrated with the CSC portal; 5 lakh+ CSCs, 2.5 lakh VLEs; 8,001 grievances lodged via CSC in April 2026 (12,763 in March, 20,151 in November 2025). Government charges nothing; CSC's own promotion says VLEs charge Rs 50 per complaint.
- Post: plain paper or postcard to DARPG or the ministry; the GRO registers it ("Lodge Local Grievance") and the citizen gets the registration number by post/SMS.
- PMO (`pmindia.gov.in` "Write to PM"), President's Secretariat helpline portal, Cabinet Secretariat DPG: separate front doors whose grievances land in CPGRAMS with their own prefixes (e.g. PMOPG).
- Samadhan Didi voice chatbot: launched 30 May 2026 by MoS Dr Jitendra Singh; built by DARPG with Bhashini (speech-to-text, TTS, translation, transliteration); citizen speaks in any of the 22 scheduled languages, the bot asks clarifying questions and identifies ministry/department/category/sub-category itself. On the website it is only advertised; the mic icon on `/Signin` is a static image and the site loads no chat script or iframe. Its actual channel (app, post-login web, phone) could not be confirmed from the portal.
- NextGen CPGRAMS (FRS dated 1 Oct 2024; DARPG said at NCeG Nov 2025 it was expected live by March 2026): WhatsApp, chatbot and IVRS lodging/tracking/feedback/appeal, registration via Google/Facebook/X/Jan Parichay, voice-to-text, save-as-draft, AI mapping to department, solution-suggestion engine. As of this walk the portal still runs 7.0.

---

## 3. Citizen journeys, step by step

### 3.1 Register (one time)

1. `/Registration`: 11 fields (see route table). Address is three boxes; State then District (dependent dropdown); Pincode is not marked mandatory but Mobile and Email are.
2. Submit → mobile OTP and email confirmation link (per guides and store reviews). Reviews complain that the password policy is strict (officer-side policy in the manual: 8-15 chars, upper, lower, digit, special) and that sign-up does not log you in.
3. Account deactivation only by emailing `cpgrams-darpg[at]nic[dot]in` from the registered email; a deactivated email/mobile cannot be reused for a new account (FAQ 16).

### 3.2 Log in

Password + captcha, or "Login with OTP" (identifier + captcha + Get OTP). Captcha has audio playback. Recovery via Forgot Username / Forgot Password. CSC operators use Digital Seva Connect.

### 3.3 Lodge a public grievance (post-login; reconstructed from the officer manual, FAQ, FRS and citizen guides; not exercised)

1. Dashboard → "Lodge Public Grievance".
2. Read and accept the exclusions/declaration (RTI, sub-judice, religious, service matters, suggestions).
3. Choose where it goes: Ministry/Department or State Government → organisation/sub-organisation → grievance category / sub-category. This choice decides which GRO gets the file ("the step that decides who actually works the file"). The category tree was standardised in 2024-26: 39 ministries analysed, 33 live with "uniform key categories" (Banking, Telecom, Posts, Labour/EPFO, Income Tax, Railways, MEA, UIDAI, ...).
4. Describe the grievance. Limit reported by multiple guides and by an app review's validation message: 4,000 characters (NextGen spec raises it to 5,000 and adds voice-to-text and save-as-draft). Guides advise dates, reference numbers, office names, and the specific action requested.
5. Attach proof: PDF only in the current app/portal (reviews complain about this); size cap quoted as 1 MB in some guides, 4 MB per file (up to 5 files) in others; NextGen spec says PDF/Word/JPEG up to 5 MB. Treat the live form as authoritative.
6. Submit → unique registration number + SMS/email acknowledgement. Format `ORGCODE/LETTER/YEAR/SEQUENCE`, e.g. `PMOPG/D/2023/0115357` (organisation code, channel letter, year, 7-digit serial). The FAQ does not fix a length; older notes call it a 16-digit ID.
7. Behind the screen (per the CPGRAMS 6.0 officer manual; the live portal is 7.0, so officer screens may differ) the GRO's first action is one of four: "Examined at our level", "Taken up with subordinate organisation" (up to 5 at once), "No Action Required" (with a reasoned reply), or "Not pertaining to this organisation" (returns it upward; the 2024 OM now bans closing on this ground). A grievance can be transferred horizontally to another ministry/state at most three times in its life. The NextGen spec lists the officer's actions as Disposed / Reject / Transfer / Forward to citizen / Forward to officer / Remark / Mark as Suggestion, and enumerates the "No Action Required" closure reasons: Duplicate, Suggestion, Clutter/Spam, Invalid: Service Matter, Invalid: Sub Judice Matter, Invalid: Beyond Entitlement, Systematic Limitation, Complaint details inadequate or not legible, Case already taken up, Others. That list is the closure vocabulary a status translator has to explain.

### 3.4 Track status

1. `/Status`: registration number + grievance password, or registration number + registered email/mobile, + captcha.
2. Result shows complainant name, date of receipt, receiving organisation, the officer/office it was forwarded to with designation and contact, current status, and the reply/Action Taken Report document when disposed (per the officer manual's correspondence-letter and ATR features and citizen guides).
3. Status vocabulary in use: Pending / Under Process / Case Closed / Disposed / Reopened / Appeal; NextGen spec: Submitted / In process / Forwarded to Citizen / Forwarded to Officer (for clarification) / Resolved, where "Submitted" becomes "In process" once the GRO enters an Estimated Time for Resolution that is sent to the citizen by SMS/email. "Disposed" means the office answered and closed the file, not that the ask was granted.
4. Notifications: SMS/email on registration and on disposal; the 2024 OM requires an SMS/email on resolution. One Aug-2026 review says no SMS arrived at closure but a feedback call did.

### 3.5 Remind or clarify

`/Reminder` after the same lookup. The GRO side has "Clarification / Supplementary information sought from complainant"; the 2024 OM forbids closing for missing information without a genuine attempt to reach the citizen (portal request, phone call, or the call centre).

### 3.6 Feedback, then appeal (the order matters)

1. On disposal, rate the closure (Excellent/Good/Average/Poor on the portal; Satisfied/Not satisfied in the call-centre survey). Feedback window: 30 days from resolution.
2. A "Poor" rating enables "Appeal" (FAQ 15, About text). The BSNL feedback call centre also records feedback and can file the appeal on the citizen's behalf (FAQ 18). NextGen spec: call within 5 days of closure; appeal allowed even after "Satisfied".
3. Appeal must be filed within 30 days; one appeal per grievance; goes to the Nodal Appellate Authority (Addl/Joint Secretary rank; 90 NAAs and 1,597 sub-appellate authorities) who must decide within 30 days. Appeals are for central ministries only; state grievances have no CPGRAMS appeal tier.
4. Track at `/Appeal/Status` with the appeal number (or email/mobile).
5. Reopening: the citizen cannot reopen a closed grievance on the portal to ask why it was closed without details; the FAQ (Q7) says to lodge a fresh grievance that cites the closed number. But the 2024 OM (Annexure, para 1.3) says an unsatisfied citizen "has the option to reopen / file an appeal through feedback call", and "Reopened" exists as a status, so the call centre is the one door back into a closed file.

### 3.7 Beyond CPGRAMS

- Director of Public Grievances in the ministry (JS rank) hears citizens in person every Wednesday from 10:00 and can call for files pending more than three months.
- Directorate of Public Grievances (Cabinet Secretariat) for 14 organisations (Railways, Posts, Telecom/MTNL, public sector banks, LIC/GIC, Urban Affairs/DDA/CPWD, Surface Transport, Civil Aviation, Regional Passport Offices, EPFO, CGHS, ESIC hospitals, Petroleum, central universities/KVs) when the internal machinery fails; it can call files (six weeks) and its recommendations must be implemented within a month; it excludes policy, service matters, commercial contracts, sub-judice cases.
- RTI to the ministry's CPIO for the action-taken record on a registration number (community guides; one documented case where a "resolved in 4 days" grievance's order had never been dispatched).
- PMO/President portals, MPs, social media (the 2024 OM asks nodal officers to act suo motu on press/social complaints).

---

## 4. The rulebook citizens are subject to (DARPG OM of 23 Aug 2024, plus FAQ)

- Timelines: 21 days maximum (60 days originally, then 45, then 30 from July 2022, then 21 from August 2024; DARPG's own darpg.gov.in FAQ, last updated January 2024, and the October 2024 NextGen spec still say 30); interim ATR with reason and expected date if longer; priority/urgent-tagged grievances within 3 days; misrouted grievances forwarded to the right GRO within 48 hours; appeals within 30 days.
- Whole-of-government: no closure with "does not pertain to this Ministry"; the receiver must transfer. Multi-issue grievances: the first GRO coordinates within 21 days. Central schemes run by states stay with the ministry.
- Closure quality: detailed ATR; upload the relied-upon order/letter; speaking reasons when refusing; reply in the language the grievance was filed in (portal auto-translation). Frivolous cases get a short ATR and no feedback loop.
- Not grievances (closed by clarifying the rule, no ATR, no feedback loop). The three official lists differ: the home page names four (RTI; court/sub-judice; religious; government employees' service matters unless channels are exhausted per DoPT OM 31.08.2015), the portal FAQ (Q10) names four (sub-judice; personal and family disputes; RTI; territorial integrity or foreign relations), and the 2024 OM annexure names six (RTI; sub-judice; religious; service matters; suggestions; territorial integrity). The union is seven categories, and only the OM's list is what GROs are instructed to apply. Also: scheme "demands" bulk-closed with a rule position; spam/abusive filtered by AI into a spam box; habitual false complainants blocked; corruption complaints go the CVC/DoPT route with only an interim reply to the citizen.
- Insufficient information: GRO must try the portal request, a phone call, or the call centre before closing under "Closed due to insufficient information", and the citizen is told what was missing and can refile.
- Monitoring: monthly DARPG reports rank ministries on the Grievance Redressal Assessment Index (GRAI: Efficiency 45%, Feedback 30%, Domain 15%, Organisational commitment 10%; 11 indicators including % resolved within 21 days, % appeals filed, % "satisfied", % "Others" category use). Secretaries review grievances in a dedicated module (398 review meetings by July 2026).
- Cost: free. Email is not a channel. Post, CSC, app, UMANG, web are.
- FAQ contact: DARPG, 5th floor Sardar Patel Bhavan, Sansad Marg, New Delhi 110001; telefax 011-23741006.

---

## 5. Numbers (latest available)

| Metric | Value | Source |
|---|---|---|
| Grievances received, Jan 1 - Jul 15 2026 | 15,20,576 | Parliament reply, July 2026 |
| Monthly volume, central (Jul 2026) | 2,20,909 received; 2,16,827 disposed; 83,866 pending; 12-day average | DARPG 51st report via press |
| Monthly volume, central (Apr 2026) | 1,88,577 received; 1,88,969 disposed; 81,847 pending (65% under 21 days) | DARPG April 2026 report |
| Monthly volume, states (Mar 2026) | 83,365 received; 75,245 disposed; 2,01,088 pending (+4% m/m); 22 States/UTs with >1,000 pending | DARPG States report, March 2026 |
| Average disposal time, central | 28 days (2019) → 16 (mid-2025) → 13 (Mar-May 2026) → 12 (Jul 2026) | Parliament / DARPG reports |
| Redressed 2022 - Jun 2025 | 80,36,042 | Rajya Sabha reply, Aug 2025 |
| Calendar 2024 | 29,23,445 received (incl. 3,08,124 carried forward); 26,45,869 redressed (90.5%) | Lok Sabha reply, 2025 |
| Calendar 2023 / 2022 | 26,15,798 received, 23,07,674 disposed / 28,06,209 received, 21,43,468 redressed | Lok Sabha reply, 2025 |
| Cumulative 2020 - 2024 | 1,15,52,503 redressed | Lok Sabha reply, 2025 |
| FY 2025-26 (central) | 18,33,972 received; 18,12,923 disposed | Lok Sabha reply (ThePrint) |
| Pending on 28 Feb 2025 | 59,946, 63.86% within 21 days | Lok Sabha reply, 2025 |
| Appeals (Apr 2026) | 31,018 received; 31,338 disposed; 20,976 pending | DARPG April 2026 |
| Appeals resolved 2022 - Jun 2025 | 7,75,240 | Rajya Sabha reply |
| GROs mapped | ~1.1 lakh; 90 NAAs; 1,597 sub-appellate authorities | DARPG / Parliament |
| Call-centre feedback, central, Jan-Apr 2026 | 1,77,787 calls; 57% said resolved; of those 76% satisfied (so roughly 43% of everyone called was satisfied) | DARPG April 2026 |
| Call-centre feedback, states, Mar 2026 | 28,095 calls; 44% resolved; 63% of those satisfied | DARPG March 2026 |
| New user registrations | 67-77k per month in 2026; 1,07,186 in Jul 2026 (UP, WB, Maharashtra top) | DARPG |
| Via CSC | 8,001 (Apr 2026), 12,763 (Mar), 20,151 (Nov 2025) | DARPG |
| Top receivers, Apr 2026 | Labour & Employment 27,979; Financial Services (Banking) 24,759; Petroleum & Natural Gas 14,038 (35% of the month) | DARPG |
| Top recurring categories 2022-25 | PM-KISAN instalments stopped / not received / documents pending with state; income-tax refund or wrong demand; PF final settlement delay; bank fraud; bank staff misbehaviour/harassment; telecom network coverage; PMAY requests; EPF member details correction | DARPG April 2026 "priority area" chapter |
| State portals integrated with CPGRAMS | 15 (by Nov 2025) | DARPG annual report 2025 |
| App ratings | Android 2.7 (5.64K reviews); iOS 1.8 (184) | Stores, 6 Sept 2026 |

---

## 6. Pain points, with evidence

Ordered by how much a conversational front end can change them.

1. The citizen must do the routing. Web filing requires picking ministry → department/organisation → category before describing the problem; wrong picks produce transfers, "not pertaining" bounces (now banned but still occurring) and multi-portal duplicates. DARPG's own NextGen objective A ("reduce the need for lengthy forms and excessive information") and the entire premise of Samadhan Didi ("without needing to know which ministry, department, category or sub-category") confirm this is the core failure. The state-portal landscape (28 state systems, phone-first ones like MP 181, TN 1100, Karnataka 1902) adds a first question the portal never asks: central or state?
2. "Disposed" is not "resolved". The call centre finds only 57% (central) / 44% (states) of closed grievances actually resolved, and a quarter to a third of those citizens are still unsatisfied. Store reviews: "closed my case with no reasoned order", "unilaterally closed without any reply", "no follow-up system". Template dismissals ("request/suggestion/query, not a grievance") are documented in the RBI case study. The Parliamentary Standing Committee on Personnel, Public Grievances, Law and Justice found the same in December 2021 (grievances "disposed of with suggestions to approach another agency", some "sent back to the agency against which the complaint was made", closures without reasons) and in 2022 ("disposed off in a routine and ad-hoc manner"). IMPRI's 2025 critique calls it "disposal-at-all-costs" with satisfaction "barely above 50%" and no consequence architecture. The portal shows the status word, not what it means or what to do next.
3. Registration friction before any value: 11-field form, dependent dropdowns, captcha, strict password policy, OTP plus email link, no auto-login after sign-up, account deactivation only by email. Lodging is impossible without an account; status lookup needs a registration number plus a "grievance password" or the registered contact, a concept citizens do not recognise.
4. Form limits and bugs reported by users: 4,000-character limit tripping at 477 characters because HTML tags were counted; PDF-only uploads; on mobile the Submit button disappears when files are attached; "something went wrong" outages; feedback cannot be given in the app, only on the website; no SMS on closure.
5. Language is skin-deep on the web. The chrome translates into 22 languages (menus, labels, buttons), but banners, notices, the FAQ, officer directories and replies stay English; reply-in-filed-language is policy, not a guarantee. Voice and true multilingual understanding exist only in the chatbot channel.
6. Localisation defect observed: on six pages (`/`, `/Status`, `/Reminder`, `/Home/LodgeGrievance`, `/Appeal/Status`, `/Home/NodalPgOfficers`) the page intermittently rendered with every label, menu caption and table header blank (only icons, empty inputs and the captcha visible) until reloaded. The pension module's "Lodge Your Grievance" page errored on every attempt. Desktop-first ("Best viewed in 1440 x 900").
7. Opaque time. The 21-day clock, the 3-day priority tag, the 48-hour forwarding rule, the 30-day feedback and appeal windows and the interim-reply obligation are all invisible to the citizen on the portal; nothing counts down or tells them when they may escalate. Older third-party guides still advertise 45/60/90-day limits and unofficial helplines (1800-110-000, 1964, support-pg@nic.in), and even DARPG's own website FAQ (last updated January 2024) still says 30 days, so citizens are misinformed off-portal too.
8. Appeal is gated and single-shot: only after rating, only "Poor" unlocks it, within 30 days, once, central ministries only, and the appellate authority is the next officer up. Closed files cannot be reopened; the sanctioned workaround (fresh grievance citing the old number) is unknown to most citizens and risks the IGMS duplicate/spam filter.
9. Evidence gathering is on the citizen: no guidance on what proof a category needs, no structured fields for reference numbers (PAN, UAN, PPO, consumer number), and the 2024 OM still sees closures for "documents not available".
10. Discovery and trust: no citizen helpline on the site (only a technical-support email; pensions have a toll-free number), email refused, look-alike paid "filing agents" and CSC fees (Rs 50) confuse people about cost, and the store ratings (2.7 / 1.8) shape expectations before first use.
11. Excluded matters are stated but not detected: RTI, sub-judice, personal disputes, service matters, suggestions and scheme "demands" are quietly closed with a rule position after the citizen has done all the work; nothing triages them up front, and the home page, the FAQ and the OM each publish a different exclusion list.

---

## 7. Implications for Nivaran

Constraints to mirror exactly (these are policy, not UI):

- Triage exclusions and central-vs-state before drafting; explain the sanctioned alternative (RTI portal, court, state portal, suggestion channel).
- Route to ministry → organisation → category/sub-category using the live taxonomy (33 ministries on the uniform categories); show confidence and reasons; never file without review.
- Produce a draft that fits the live limits (4,000 characters today, PDF attachments) and front-loads dates, reference numbers, office names and the specific action requested.
- Keep the registration number as the citizen's handle and render status in plain words: what "Under Process / Forwarded / Disposed" means and what the citizen may do now.
- Run the clocks: 21 days (3 for urgent), interim-reply obligation, 48-hour forwarding, then the 30-day feedback and appeal windows. Nivaran's "deadline breached" state maps to this directly.
- One appeal only, after rating, central ministries only; for states, escalate to the state portal or DPG instead; for closed files, draft the "fresh grievance citing the earlier number" and avoid duplicate-looking text.
- Offer the offline fallbacks the system already honours: Wednesday hearing with the Director of Grievances, DPG for the 14 organisations, RTI for the file, CSC kiosk, post.
- Start with the volume: PM-KISAN, income-tax refunds, EPF settlement and KYC corrections, bank fraud and bank staff conduct, telecom coverage, PMAY, pensions. These eight categories are over five lakh grievances in four years and have known root causes in DARPG's own analysis.

What the government is building (so Nivaran positions against it rather than duplicating): Samadhan Didi voice filing (22 languages, auto-categorisation), NextGen channels (WhatsApp/IVRS/chatbot, social logins, drafts, voice-to-text), AI mapping and solution suggestions for officers. None of these yet give the citizen plain-language status, clock awareness, evidence coaching, or an appeal drafted from the ATR; that is the open space.

---

## 8. Things not verified first-hand

- The post-login "Lodge Public Grievance" form and the citizen dashboard (no account was created). Field list, limits and the status-result page are reconstructed from the officer manual, FRS, FAQ and multiple citizen guides, which disagree on attachment size (1 MB vs 4 MB vs 5 MB; the NextGen spec itself says 5 MB in its use case and "up to 50 MB" in its workflow figure).
- Where Samadhan Didi is actually reachable (app, post-login web, or phone). The website only advertises it.
- Whether the "grievance password" is still issued for web-lodged grievances or only for post/CSC/pension filings.
- Whether status lookup triggers an OTP after the captcha (the NextGen spec says it will).
- The blank-label rendering defect may be tied to the culture cookie being set on first load; it recurred across a fresh tab, so it is reported as observed.

---

## 9. Sources

Portal pages (all read 6 Sept 2026): https://pgportal.gov.in/ , /Signin , /Signin/Login , /Signin/CscLogin , /Registration , /Home/LodgeGrievance , /Status , /Appeal/Status , /Reminder , /Home/NodalPgOfficers , /Home/NodalPgOfficersState , /Home/NodalAuthorityForAppeal , /Home/ProcessFlow , /Home/Faq , /Home/ContactUs , /Home/AboutUs , /Sitemap , /Home/Disclaimer , /Home/WebsitePolicies , /pension/ , /ccfeedback/

Primary documents:
- DARPG OM 23-08-2024, Comprehensive Guidelines for Handling the Public Grievances (with Annexure A SOP): https://pgportal.gov.in/Home/Preview/Q29tcHJlaGVuc2l2ZUd1aWRlbGluZXNGb3JIYW5kbGluZ1RoZVB1YmxpY0dyaWV2YW5jZXMucGRm
- DARPG OM 27-07-2022, Strengthening of Machinery for Redressal of Public Grievances: https://pgportal.gov.in/Home/Preview/U3RyZW5ndGhlbmluZ29mTWFjaGluZXJ5Zm9yUmVkcmVzc2Fsb2ZQdWJsaWNHcmlldmFuY2VDUEdSQU1TLnBkZg%3d%3d
- CPGRAMS User Manual (officer interface, v6.0/7.0): https://pgportal.gov.in/CPGOFFICE/Documents/CPGRAMS-Help.pdf
- Organisational set-up chapter: https://pgportal.gov.in/Home/Preview/SW50cm9kdWN0aW9uLnBkZg==
- NextGen CPGRAMS Functional Requirement Specification v0.2 (1 Oct 2024), via Wayback: https://darpg.gov.in/sites/default/files/Updated%20Detailed%20Functional%20Requirement%20Specification_NextGen%20CPGRAMS_DARPG.pdf
- DARPG CPGRAMS Monthly Report, Central Ministries, April 2026: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/may/doc2026522874601.pdf
- DARPG CPGRAMS Monthly Report, States/UTs, March 2026: https://darpg.gov.in/sites/default/files/DARPG_State-UTs_Monthly_Report_March_2026.pdf
- PIB, CPGRAMS: 3 Years, 70 Lakh Grievances Solved (30 Dec 2024): https://www.pib.gov.in/PressReleasePage.aspx?PRID=2088830
- 28th National Conference on e-Governance 2025 report (DARPG): https://www.darpg.gov.in/static/uploads/2025/11/dfc0c05e73e33226a57e839d0fcd6dde.pdf

Press, Parliament, analysis:
- Rajya Sabha reply, 7 Aug 2025 (The Week): https://www.theweek.in/wire-updates/national/2025/08/07/des25-rsq-personnel-grievances.html
- Parliament reply, July 2026 (Asianet Newsable): https://newsable.asianetnews.com/india/grievance-disposal-time-cut-to-13-days-over-15-2-lakh-received-govt-articleshow-zb36a1f
- July 2026 monthly report coverage: https://observervoice.com/july-2026-sees-record-grievance-redressals-in-india-225350/
- May 2026 coverage: https://www.cavalier.in/cds-ota-current-affairs/2026-06-23/cpgrams-grievance-redress-2026
- CPGRAMS Annual Report 2025 summary: https://www.policyedge.in/p/cpgrams-annual-report-2025-advancing
- Samadhan Didi launch: https://newsonair.gov.in/union-minister-jitendra-singh-launches-ai-enabled-cpgrams-voice-chatbot-samadhan-didi/ ; https://www.drishtiias.com/state-pcs-current-affairs/samadhan-didi-ai-voice-chatbot-launched ; PIB PRID 2266985
- Comprehensive guidelines coverage (staffnews): https://www.staffnews.in/2024/09/comprehensive-guidelines-for-handling-the-public-grievances.html
- MyGrievance on Google Play: https://play.google.com/store/apps/details?id=nic.org.mygrievance ; CPGRAMS on App Store: https://apps.apple.com/in/app/cpgrams/id6746528698
- CSC fee post: https://x.com/CSCegov_/status/1969267458797117802
- Citizen guides: https://righttoinformation.wiki/file-cpgrams-grievance-2026 ; https://righttoinformation.wiki/state-grievance-portals-comparison-india-2026 ; https://www.righttoinformation.wiki/cpgrams-rti ; https://filemyrti.com/grievance-help/cpgrams-complaint-ignored ; https://kustodian.life/resources/provident-fund/epf-grievance-not-resolved ; https://esmcorner.com/understanding-cpgrams-a-comprehensive-faq/ ; https://www.statusin.in/2607.html
- Critique: https://www.taxtmi.com/tmi_blog_details?id=635488
- IMPRI, Beyond digital box-ticking: a critical analysis of India's CPGRAMS (2025): https://www.impriindia.com/insights/policy-update/beyond-digital-box-ticking-a-critical-analysis-of-indias-cpgrams/
- PRS summary of the Standing Committee report on strengthening grievance redressal mechanisms (Dec 2021): https://prsindia.org/policy/report-summaries/strengthening-of-grievance-redressal-mechanisms
- Standing Committee 2022 observations (ThePrint): https://theprint.in/india/every-endeavour-should-be-made-to-resolve-public-grievances-to-complainant-satisfaction-parl-panel/913292/
- Lok Sabha reply on 2024 figures (DT Next): https://www.dtnext.in/news/national/905-per-cent-of-public-grievances-received-in-2024-redressed-govt-in-ls-828625
- Lok Sabha reply on FY 2025-26 (ThePrint): https://theprint.in/india/over-18-lakh-public-grievances-in-2025-26-against-central-govt-depts-jitendra-singh-in-lok-sabha/3012682/
- PIB, timeline cut from 45 to 30 days (July 2022): https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1846752
- DARPG website FAQ (still states 30 days; Wayback capture): https://web.archive.org/web/20260306202447id_/https://darpg.gov.in/faq-cpgrams
- World Bank blog on AI-powered grievance redress in India (CIVIC sprint, June 2025): https://blogs.worldbank.org/en/governance/civic--amplifying-citizens--voice-through-ai-powered-grievance-r
- Academic: IJRPR Vol 6 Issue 11 (Nov 2025), implementation study in Andhra Pradesh: https://ijrpr.com/uploads/V6ISSUE11/IJRPR56033.pdf
- Prior art for conversational grievance filing: https://docs.jugalbandi.opennyai.org/building-with-jugalbandi/technical-guide/references/example-grievance-bot/index
