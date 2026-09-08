# Nivaran: mobile screen and interaction design

Proposed 7 September 2026. This brief translates the agreed product direction into a testable layout. It is not a validated design or a complete CPGRAMS rules specification.

## Navigation and information hierarchy

Use three top-level destinations: **Issues**, **Updates**, **Profile**. Issues is the default landing screen and contains drafts and submitted cases. Avoid separate Home and History destinations that repeat the same content. Use plain citizen-facing words; keep administrative category codes out of the navigation.

On a first visit: language choice, a short explanation, and Speak / Type / Guided questions. Allow preparation before identity is needed. Request microphone, camera and notification permissions when used, not on first launch. Explain device-only versus account-synced draft storage accurately. Account requirements at submission remain a product decision to validate.

## Screen layout

| Screen | Top | Main content | Bottom action |
|---|---|---|---|
| Issues, first use | Nivaran; accessible language control | What problem do you need help with? Speak, Type, Guided questions; scope help | Start an issue; global navigation |
| Issues, returning | Nivaran; Your issues | Needs your attention first, then other recent cases; each shows title, state and next action | Start a new issue; global navigation |
| Case overview | Back to Issues, editable issue title, accurate save state | Next action, editable problem/outcome/authority summary; missing facts; latest update | Stage-appropriate Continue / Review action |
| Conversation | Case title; save state; Overview / Conversation / Documents | Concise recap, conversation, one purposeful question, quick answers, I don't know | Attachment access, text composer, labelled microphone; keyboard-aware |
| Voice session | Back to conversation; recording state and audio output | Live editable transcript, latest question and confirmed facts access | Pause/resume, mute playback, switch to typing, finish |
| Documents | Case title and shared case tabs | Required and helpful evidence separated; reason for each; available alternatives; checks beside each file | Add document; later Continue to review when ready |
| Final review | Review complaint; clear draft state | Destination and handling office; facts; requested outcome; attachments; sender/contact details; Edit on each section | Specific consent and Submit complaint |
| Receipt / progress | Issue title and submission reference | Acknowledgement, what happens next, event timeline, action needed | Relevant next action, not another submission button |
| Updates | Updates | Actionable requests before informational updates; issue title on each | Global navigation; each update opens its case |
| Profile | Profile | Reusable contact information, language, voice preferences, notifications, draft/privacy controls and help | Global navigation |

Within a case, use three local tabs: **Overview**, **Conversation**, **Documents**. Keep the global navigation out of the focused case editor; a clear Back to Issues action restores the list position. Submission progress belongs in Overview. Updates is a cross-case inbox, not a second source of case truth.

## Placement and interaction rules

- Case cards: plain title, state, next action, last activity. Show case reference only after submission. No decorative counters or generic percentage complete without a meaningful denominator.
- Pin one next action near the top of Overview so users do not search the transcript. Show one main button above the safe area for the current task.
- Keep the composer above the keyboard. Use a visible microphone button; voice must be user-initiated. Switch input modes without losing answers. Do not imply live recording in a static preview.
- During voice, show listening, processing and speaking as separate labelled states. Provide transcript correction and pause. Verify actual earpiece/audio-route support on target devices; do not promise a real telephone call based on a visual mockup.
- Do not ask for sensitive details aloud by default. Offer silent entry within the conversation. Provide language selection without resetting the case.
- Ask for information once. Extract facts from the narrative and confirm ambiguities; avoid showing questions already answered. Confirm AI suggestions before promoting them to case facts.
- Each evidence row explains purpose, necessity, alternatives and status. Camera/gallery/files are choices in an add-document sheet. Preserve all other work when a selection, upload or check fails.
- Use precise readiness results: unreadable, missing page, uncertain extraction, conflicting date. Do not equate an AI check with authenticity, eligibility or official acceptance.
- Make source corrections editable from Overview and final review. Material edits invalidate affected confirmations, not unrelated facts. A changed service may require new routing/questions.
- When a conversation contains two separate issues, offer two linked workspaces with an editable split summary. Reuse approved profile information; explicitly assign evidence to each case. Submission and errors stay independent.
- Review after evidence analysis. Show the complete complaint; allow read-aloud or editing. In production, use Submit complaint only for a real submission. In the concept preview use an explicitly labelled preview action and simulated receipt.

## Case states and interruption behavior

Draft, Needs your information, Ready for review, Sending, Submitted, Action requested, Response received, Closed by department. Keep **problem resolved by citizen** distinct from **closed by department**. Any eligible appeal belongs to the same case history; policy gates remain verified rules rather than a timer-only trigger.

Show Saved on this device / Synced / Saving / Couldn't save accurately. Preserve drafts and attachment availability across app restart. Offline users can prepare; queue or block sending with explicit state. After an ambiguous submission, reconcile its result before offering retry to avoid duplicates. Do not falsely mark unsupported/delayed status data as live.

## Visual direction

Calm, readable, restrained: warm neutral backgrounds, dark text, one teal action color, generous spacing and text-labelled status. Avoid government seals or official-endorsement claims. Support native dark appearance, font scaling, screen readers, adequate touch areas and long translated labels. Use icons with labels, not icons alone for essential actions. Use shape/text in addition to color for warnings and status.

The first clickable concept focuses on navigation and placement, not visual branding or a functioning assistant. Sample cases and simulated actions must be labelled. It does not establish real routing, document validation, persistence or submission.

## Next design test

Ask intended users to (1) resume a draft and identify the missing document, (2) correct the proposed office without losing facts, (3) locate an officer request from Updates, and (4) explain whether a sample closed case means the problem is resolved. Observe first taps, hesitation, recovery and comprehension. Test voice versus text separately on actual devices.
