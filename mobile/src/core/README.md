# Demo core handoff

Implemented 8 September 2026 for `docs/demo-build-plan.md`. This folder, `mobile/assets/fixtures/`, and `app/api/extract/` are Codex-owned. Screens, storage, audio, token issuance and Expo configuration remain with Claude Code. No React Native imports or network calls exist in the core runtime modules.

`mobile/` now contains the core and fixtures, so the Expo scaffolder may refuse the nonempty directory. Scaffold in a temporary sibling location and merge only the Expo shell/configuration, preserving `src/core/` and `assets/fixtures/`. No Expo app or mobile dependency manifest has been created here yet.

## Import boundary

Import runtime functions and types only from `mobile/src/core/index.ts`. The fixture factory is test/demo setup and can be imported from `fixtures/pf-transfer.ts`. Inputs are immutable; **always store the returned case**, never assume a function changed the input object.

```ts
import {
  createCase, confirmFact, setUnknown, applyProposals, nextQuestion,
  resolveConflict, getReadiness, getUnresolved, makeDraft, markReviewed,
  invalidateReview,
} from '../core/index'; // adjust relative path from the caller

let current = createCase({ id: yourGeneratedId, language: 'hi' });
current = confirmFact(current, 'story', finalCitizenTranscript, { source: 'voice' });
// The call above is a citizen-confirmed action, not automatic approval of model output.

const result = applyProposals(current, message.toolCall.functionCalls, {
  source: 'voice', sourceRef: finalMessageId, cancelledCallIds,
});
current = result.case;
await store.saveCase(current);
// Only now show Saved. Send result's accepted/rejected/conflicts/nextQuestion/
// unresolved fields to the model. Do not send the entire case back unnecessarily.

// User taps Confirm on a proposed value:
current = confirmFact(current, 'service');
// User types a correction directly:
current = confirmFact(current, 'outcome', editedOutcome, { source: 'typed' });
// Explicit unknown answer (allowed only for optional fields):
current = setUnknown(current, 'office');
// User resolves an existing conflict:
current = resolveConflict(current, 'exit_date', 'unknown');

const readiness = getReadiness(current);
const draft = makeDraft(current);
// User has reviewed the exact revision currently displayed:
const reviewed = markReviewed(current, { expectedRevision: displayedRevision });
await store.saveCase(reviewed);
// Show reviewed.review.receipt only after the write succeeds, labelled Simulated.
```

All edit functions throw on invalid explicit input. Catch and display the error beside the relevant control; retain the old case. `applyProposals` reports untrusted input errors in `rejected` instead of throwing. Optional `now` arguments make tests deterministic.

## Public contracts

| Export | Result |
|---|---|
| `createCase({ id, language?, now? })` | Empty `Case` |
| `confirmFact(case, field, value?, { source?, sourceRef?, now? }?)` | New case; omitted value confirms the current proposal; explicit value edits a non-conflicting fact |
| `setUnknown(case, field, options?)` | New case with an explicit unknown fact |
| `resolveConflict(case, field, valueOrUnknown, options?)` | New case; accepts only a displayed alternative or allowed unknown |
| `applyProposals(case, calls, options?)` | `{ case, accepted, rejected, conflicts, nextQuestion, unresolved, invalidateReview }` |
| `nextQuestion(case)` | Question with `field`, `textHi`, `textEn`, `options`, `allowUnknown`, `reason`, `kind`, or null |
| `getReadiness(case)` / `canReview(case)` | Blockers and unresolved facts / boolean |
| `getUnresolved(case)` | Field IDs for optional or required unresolved information |
| `makeDraft(case)` / `dateSummary(case)` | Deterministic text from confirmed facts; date uncertainty stays explicit |
| `routeFor(service)` | Single EPFO transfer route or null |
| `markReviewed(case, { expectedRevision, now? })` | Case with `state: reviewed` and a revision-bound simulated review receipt |
| `invalidateReview(case, { now? }?)` | New revision with review cleared, for attachment changes |

`draftHash` is a lightweight FNV fingerprint for the demo, not a cryptographic document signature. Use revision equality as the review gate. No government submission function exists.

## Deliberate clarifications to the plan

- `facts` is `Partial<Record<FieldId, Fact>>`: absent means not answered. Pre-filling every optional field as unknown would prevent the question graph from asking it.
- `Case` also has `appliedCallIds: string[]` and `review: Review | null`. **Persist both.** Add a JSON column or equivalent for call IDs to the planned SQLite schema; upsert/delete the review row in the same transaction as the case. Web storage can serialize the full case. A reconnect uses new call IDs; session context must use the current revision.
- All accepted calls in one batch compare against the original revision and increment the case revision at most once. Future revisions are rejected too. Replayed/cancelled calls cannot reapply changes.
- Proposals are not confirmations. `Case.service` remains unknown until the user confirms it; a facts card can display `facts.service.value` with its Proposed badge before that. The shooting script must include the confirmation tap.
- The question order is service, story, claim status, conditional rejection reason, exit date, outcome, office. The plan's prose and shooting script put office last, unlike its printed table. Employer names are accepted if stated, never asked as mandatory fields.
- Proposed answers are not asked again as if missing. At the end of the interview a `kind: confirm` question points to the facts card. Resolve conflicts first. Non-conflicting known fields can be confirmed in one visible group action by sequentially calling `confirmFact` then saving once.
- The original story also requires confirmation before review. It is included verbatim without trimming once confirmed. Optional proposed facts are excluded from the rendered draft; show these for confirmation on the facts card.
- Recognize withdrawal, but return a scope blocker rather than pretending the second service is implemented. The only routable/reviewable service here is transfer.
- Unknown office/date does not block preparation review. `state` can correctly be `ready` while `getUnresolved()` includes `office`. Use “Still missing: handling office” as an independent next-action line. Do not force `needs_info` solely to match the filming script.
- Any changed fact invalidates review; identical confirmations preserve it. Call `invalidateReview` on attachment add/remove/replace, and save the resulting case and evidence together. Core cannot delete a SQLite row or guarantee durable file storage itself.
- Resolving a conflicting date as unknown retains alternatives for provenance but renders neither as the accepted date. Selecting a date preserves the selected source reference.

## Tool format

Pass Gemini `functionCalls` directly:

```json
[{"id":"session-1-turn-2","name":"propose_facts","args":{"revision":4,"facts":[{"field":"exit_date","value":"2025-04-15","quote":"Pandrah April do hazaar pachees"}]}}]
```

Only the nine declared fields are accepted. Dates must be real ISO calendar dates. Unknown is the string `unknown` in a proposal; `confirmFact` turns an approved unknown proposal into status `unknown` with an empty stored value. Service/story/outcome cannot be unknown. `quote` is mandatory but a quote alone does not prove semantic correctness: the citizen still reviews proposed values.

Construct document calls from the extraction result, with an evidence-specific ID and trusted source metadata:

```ts
const dates = extraction.dates.filter(d => d.label.toLowerCase() === 'date of exit');
if (dates.length) {
  const result = applyProposals(current, [{
    id: `document:${evidenceId}:${extraction.sha256}`, name: 'propose_facts',
    args: { revision: current.revision, facts: dates.map(d => ({
      field: 'exit_date', value: d.value_iso, quote: d.text,
    })) },
  }], { source: 'document', sourceRef: evidenceId });
  current = result.case;
}
```

Do not turn letter issue dates into exit dates. Preserve the extraction's `simulated` flag on the evidence and visibly label the check. Do not silently approve a document's date. This example deliberately avoids interpreting other unfamiliar labels.

## Extraction endpoint

`POST /api/extract` accepts JSON `{ mime, base64, purpose }`, header `x-nivaran-demo-key`. Purpose is `relieving_letter`, `claim_rejection` or `other`. Return shape is the plan's extraction fields **at the top level**, plus `simulated`, `sha256`, and `fallback_reason` for fallback results.

No key is needed for deterministic extraction. Set `NIVARAN_DEMO_KEY` in the backend to protect the endpoint. Default mode is fixture; even an existing Gemini key does not enable network usage. Only after unpaid account access has been verified should the operator opt in:

```dotenv
NIVARAN_EXTRACT_MODE=live
EXTRACT_MODEL=gemini-2.5-flash
GEMINI_API_KEY=<server-only value>
```

No `.env` file was written by Codex. Live extraction has not been exercised. Do not create extra projects/keys to bypass provider quota; keep fixture mode available when the quota is exhausted.

The endpoint accepts only the two known synthetic PNG fixture hashes, including when live mode is enabled. Unknown or modified files get 422 rather than fabricated extraction or automatic upload to the free provider. Wrong demo code gets 401; missing server demo-code configuration gets 503; malformed data gets 400; non-JSON gets 415; over 2 MB gets 413; the per-instance 20/minute brake gets 429. This is intentionally smaller than the future file policy. There is no distributed quota guarantee from the in-memory counter and a shared demo code is not citizen authentication.

Successful actual extraction is schema-validated, not treated as authenticated evidence. Provider failure or invalid output falls back only to the matching known fixture and sets `simulated: true`. Tests mock the provider, including 429 and malformed results; no real API calls were made.

Provider request format references: [Gemini image input](https://ai.google.dev/gemini-api/docs/image-understanding), [structured output](https://ai.google.dev/gemini-api/docs/structured-output).

## Fixtures and checks

- `mobile/assets/fixtures/relieving-letter.png`: 31 March 2025, clearly labelled synthetic.
- `mobile/assets/fixtures/claim-rejection.png`: 15 April 2025, clearly labelled synthetic.
- `fixtures/extractions.json`: SHA-256 to filename/MIME/extraction mapping.
- `createTransferFixture('confirmed' | 'conflicting' | 'unknown')`: reproducible case stages.
- `fixtures/pf-transfer.expected.txt`: checked-in expected reviewed-draft text.

The asset PNGs are rendered from their adjacent core fixture HTML sources by `fixtures/render.mjs`. Supply `PLAYWRIGHT_MODULE` and `CHROME_PATH` if Playwright/Chrome are outside default locations. Rendering regenerates the manifest; changing even one PNG byte changes its fixture identity.

On Node 22.13 or newer:

```powershell
node --experimental-strip-types --test mobile/src/core/__tests__/*.test.ts
npx tsc -p mobile/src/core/tsconfig.json
node --test tests/research-model.test.mjs
npm run build
node mobile/src/core/__tests__/smoke-next.mjs
```

This machine currently has Node 20 globally. An isolated Node 22.22.0 and TypeScript 5.9.3 were installed under `$env:TEMP\nivaran-core-tools` for tests, without replacing global Node or changing root dependencies:

```powershell
& "$env:TEMP\nivaran-core-tools\node_modules\node\bin\node.exe" --experimental-strip-types --test mobile/src/core/__tests__/*.test.ts
& "$env:TEMP\nivaran-core-tools\node_modules\node\bin\node.exe" "$env:TEMP\nivaran-core-tools\node_modules\typescript\bin\tsc" -p mobile/src/core/tsconfig.json
```

Core logic and API tests do not establish process-kill storage recovery, native microphone/playback behavior, a deployed web export or a completed video. Those remain screen/storage/voice/device integration work.
