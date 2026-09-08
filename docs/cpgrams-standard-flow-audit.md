# CPGRAMS standard filing walkthrough — 7 September 2026

Direct observation through Playwright in visible Chrome after the user personally logged in and accepted the two displayed declarations. Scope: one EPFO transfer branch through the final details/submission page. This is an agent walkthrough, not a measured intended-user session. No grievance or appeal was submitted; no file was uploaded; no real identifier was entered. Dashboard remained at zero grievances afterward.

## Observed sequence

1. `/Desk`: zero registered/pending/closed grievances; table supports search and page size. User chose the eligibility declaration on `/NewGrievance`.
2. `/NewGrievance/Organisation`: ministry/department selection precedes describing the problem. Prominent choices include Labour and Employment; further departments and State Governments/Others are offered through More. This requires the user to identify the service owner before explaining their issue. Whether intended users choose incorrectly is still unmeasured.
3. Labour and Employment opens the standard registration form. A note suggests Others/Misc. if specific service information is unknown, **if available**.
4. Main category: Employee Provident Fund Organisation, Employee State Insurance Corporation, DGFSALI, CLC or Child Labour. Selecting EPFO opens a declaration that a similar grievance has not been filed with EPFO or its other web portals in the last 20 days. User accepted it personally. This is observed branch wording, not a general eligibility interpretation.
5. EPFO next level: PF related; Pension related; UAN-KYC; PF/Pension transfer; Insurance benefit; Employer's grievance; Technical issues; Coverage/Evasion/Compliance; PM-VBRY; Suggestions.
6. PF/Pension transfer next level: Transfer of PF; Non receipt of Annexure K; Issues related to overlap of service; Others (please specify). We selected Transfer of PF. The repeated label is `Select next level category`, rather than a question about the citizen's problem.
7. Required office dropdown: `RO/ SRO/ Headquarters`, 148 named options plus the blank prompt. No explicit unknown-office option appeared in this branch. We selected Delhi (North) solely to inspect dependent controls, not as a verified destination for a real complaint. No visible UAN field was encountered in this standard branch; do not copy the earlier chatbot's UAN requirement into this finding. A hidden/unrendered Destination input found in DOM metadata is not evidence of a citizen-facing required field.
8. Required `Text of grievance (Remarks)`: 2,000-character maxlength, counter and an English-letter/number/punctuation allowlist message. Optional supporting attachment: `Only PDF file upto 4MB is allowed.` One file chooser and a separate Attach button were present; the chooser had no accept filter and no multiple attribute. These facts do not establish total attachment count or server enforcement.
9. Next opens `/V7/NewGrievance/Details`. It shows the selected category path and office, an editable description, optional previous reference number/date, prefilled personal/contact details, security code, truth declaration and Submit. No dedicated category Edit control was visible. `Back To Home Page` returns to the dashboard. No distinct post-details review screen was observed; whether Submit opens another confirmation remains unknown because it was not clicked.

## Final details fields

| Field | Visible requirement / behavior |
|---|---|
| Information Provided | Category path and office displayed |
| Grievance Description | Required marker; editable; 2,000-character maxlength |
| Reference Number (If Any) | Optional; 20-character maxlength; help explains earlier complaint reference |
| Reference Date | No required marker; Enter Reference Date placeholder |
| Name, Gender | Required markers; profile information prefilled; Male/Female/Transgender options |
| Country, State, District | Required markers; preselected from profile |
| Address | Required marker on first line; three prefilled text lines; second and third lack distinct visible labels |
| Pincode | No required marker; six-character maxlength |
| Email ID | Required marker; prefilled and read-only with Edit control |
| Mobile Number | Required marker; prefilled and read-only with Edit control; explains SMS alerts |
| Phone Number | No required marker; separate from mobile |
| Are you an Ex Servicemen? | Required marker; No/Yes choices |
| Security code | Required marker; CAPTCHA not completed |
| Truth statement and Submit | Final visible boundary; neither affirmed nor submitted by assistant |

Requirements above use rendered markers/label classes; many fields do not use native HTML required attributes. Server validation and email/mobile edit verification were not exercised. Profile values are omitted from research notes.

## Checks and balanced findings

| Check | Observed result | Implication / limit |
|---|---|---|
| Next with office and description empty | Inline required-field messages name both fields | Useful field-specific feedback; tells user a value is missing, not how to identify the office |
| Hindi text | Entered `इंटरफेस परीक्षण। यह वास्तविक शिकायत नहीं है।` (interface test, not a real complaint). Text survived and reached final details after office selection | English-only guidance does not match the observed preparation behavior. Final acceptance is untested; do not claim Hindi filing is either blocked or fully supported |
| Description counter | Still displayed 2,000 remaining with carried Hindi text in final details | Counter mismatch observed for programmatic fill/carried text. Manual typing and other scripts not tested |
| Native browser Back from details | Returned to ministry form with main category blank and deeper controls absent | Correction route resets visible selection; automation navigation timed out but the resulting screen was inspected |
| Browser Forward afterward | Restored details, category path, office and test description | Do not describe the Back observation as irreversible loss; recovery existed through browser history in this run |
| 390 × 844 CSS-pixel viewport | Document width 448 pixels; horizontal scrollbar visible | Responsive layout issue in desktop Chrome viewport simulation; actual phone/touch/keyboard behavior remains untested |
| Profile prefilling | Contact/address fields already populated on final details | Preserve this reduction in repeated entry in the redesign |
| Attachment interaction | Rule and controls inspected only | Actual file rejection, upload progress, remove/preview, file persistence and server limits remain gaps |

[Masked narrow-screen evidence](cpgrams-test-evidence/standard-details-mobile-masked.png). Inputs and selects were masked; the visible description contains only the explicitly labelled test text. The test text was cleared from the final form before navigating away, but no claim is made that server-side intermediate state was deleted.

## Tracking, response and appeal coverage

- Grievance dashboard after inspection still showed zero registered grievances and no table entries.
- `/Appeal`: zero lodged/pending/closed appeals; table columns include Appeal Number, Appeal Received Date, Grievance Registration Number and Appeal Status.
- `/Status`: Registration number, Email id or Mobile number, Security Code, submit. No grievance-password field on this inspected entry screen.
- `/Appeal/Status`: Appeal Number, Email id or Mobile number, Security Code, submit. Navigation initially timed out; a subsequent read confirmed the page rendered. This timeout alone is not a proven citizen-facing failure.
- No authorised existing case was supplied. Actual status results, officer clarification/response, notifications, feedback, appeal eligibility and appeal submission/results remain unvisited. New grievance submission would not immediately expose a disposed-case journey.

## Development priorities supported by this session

1. Explain the proposed department and handling office; provide help and an honest unknown-information path. Do not silently guess an office from residence.
2. Accept citizen evidence in a useful mobile form: camera/gallery/document selection, preview and clear size guidance. PDF-only 4 MB is the observed current-portal rule; the standalone redesign can choose its own justified storage policy. Image support is a proposed improvement whose user benefit still needs testing.
3. Provide explicit Edit actions for category, office and description, preserving the draft without reliance on browser Back/Forward.
4. Make supported languages, validation and counters agree. Verify Hindi manually, not just through automation.
5. Eliminate horizontal scrolling at narrow widths and keep profile prefilling and specific inline errors.

Full evidence ranking: [audit register](audit-to-prototype.md). Proposed build sequence: [mobile development plan](mobile-development-plan.md). Do not generalise this branch to every ministry or claim measured superiority from these observations.
