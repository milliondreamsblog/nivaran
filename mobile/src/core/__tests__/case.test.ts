import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCase, confirmFact, setUnknown, resolveConflict, applyProposals, nextQuestion, canReview, makeDraft, markReviewed, routeFor, getUnresolved, isISODate, draftHash, invalidateReview } from '../index.ts';
import { createTransferFixture, FIXTURE_TIME, FIXTURE_STORY } from '../fixtures/pf-transfer.ts';

const fresh = () => createCase({ id: 'test', now: FIXTURE_TIME });
const call = (revision: number, field: string, value: unknown, id = 'call-1') => ({ id, name: 'propose_facts', args: { revision, facts: [{ field, value, quote: String(value) }] } });

test('spoken transfer story retains service and private employer cannot reroute it', () => {
  const current = createTransferFixture();
  assert.equal(current.service, 'transfer');
  assert.match(routeFor(current.service)!.department, /EPFO/);
  assert.equal(routeFor('private employer'), null);
  assert.match(makeDraft(current), /pf transfer/);
  assert.doesNotMatch(makeDraft(current), /withdrawal|two months|financial hardship|previous complaint/i);
});
test('reject unknown/prototype fields, malformed date, missing quote, stale and future revisions without mutation', () => {
  const current = createTransferFixture();
  for (const item of [call(current.revision, '__proto__', 'bad'), call(current.revision, 'uan', '123'), call(current.revision, 'exit_date', '2025-02-30'), call(current.revision - 1, 'outcome', 'stale'), call(current.revision + 1, 'outcome', 'future'), { ...call(current.revision, 'outcome', 'x'), args: { revision: current.revision, facts: [{ field: 'outcome', value: 'x' }] } }]) {
    const result = applyProposals(current, [item]);
    assert.equal(result.case, current);
    assert.equal(result.accepted.length, 0);
    assert.equal(result.rejected.length, 1);
  }
});
test('bad dates include leap-year errors but a real leap day passes', () => {
  for (const value of ['2025-02-29', '2025-04-31', '2025-13-01', '15 April 2025', '2025-4-15', '0000-01-01']) assert.equal(isISODate(value), false, value);
  assert.equal(isISODate('2024-02-29'), true);
});
test('disagreeing proposal records both dates and blocks review without mutating the original', () => {
  const original = createTransferFixture('confirmed');
  const before = structuredClone(original);
  const result = applyProposals(original, [call(original.revision, 'exit_date', '2025-03-31')], { source: 'document', sourceRef: 'letter' });
  assert.deepEqual(original, before);
  assert.equal(result.case.facts.exit_date!.status, 'conflicting');
  assert.deepEqual(result.case.facts.exit_date!.alternatives!.map(a => a.value), ['2025-04-15', '2025-03-31']);
  assert.equal(result.nextQuestion!.kind, 'conflict');
  assert.equal(canReview(result.case), false);
  assert.doesNotMatch(makeDraft(result.case), /2025-04-15|2025-03-31/);
});
test('a third proposal cannot overwrite an existing conflict', () => {
  const current = createTransferFixture('conflicting');
  const result = applyProposals(current, [call(current.revision, 'exit_date', '2025-05-01')]);
  assert.equal(result.case.facts.exit_date!.alternatives!.length, 3);
  assert.equal(result.case.facts.exit_date!.status, 'conflicting');
});
test('unknown resolves the conflict, keeps provenance and leaves verification in the draft', () => {
  const current = resolveConflict(createTransferFixture('conflicting'), 'exit_date', 'unknown');
  assert.equal(current.facts.exit_date!.status, 'unknown');
  assert.equal(current.facts.exit_date!.alternatives!.length, 2);
  assert.equal(canReview(current), true);
  assert.match(makeDraft(current), /The employment exit date needs verification; I have not confirmed an exact date\./);
  assert.doesNotMatch(makeDraft(current), /2025-03-31|2025-04-15/);
});
test('explicit date choice is restricted to alternatives and records confirmation', () => {
  const current = createTransferFixture('conflicting');
  assert.throws(() => resolveConflict(current, 'exit_date', '2025-06-01'));
  assert.throws(() => confirmFact(current, 'exit_date', '2025-03-31'));
  const updated = resolveConflict(current, 'exit_date', '2025-03-31');
  assert.equal(updated.facts.exit_date!.status, 'confirmed');
  assert.match(makeDraft(updated), /2025-03-31/);
});
test('duplicate calls apply once within a batch and after JSON persistence', () => {
  const current = fresh();
  const proposal = call(current.revision, 'service', 'transfer');
  const result = applyProposals(current, [proposal, proposal]);
  assert.equal(result.accepted.length, 1);
  assert.equal(result.case.revision, 1);
  assert.match(result.rejected[0].reason, /Duplicate/);
  const restored = JSON.parse(JSON.stringify(result.case));
  const retry = applyProposals(restored, [{ ...proposal, args: { ...proposal.args, revision: restored.revision } }]);
  assert.equal(retry.case, restored);
  assert.match(retry.rejected[0].reason, /Duplicate/);
});
test('accepted batch increments revision once and assigns same revision to facts', () => {
  const current = fresh();
  const result = applyProposals(current, [call(0, 'service', 'transfer', 'a'), call(0, 'story', FIXTURE_STORY, 'b')]);
  assert.equal(result.case.revision, 1);
  assert.equal(result.case.facts.service!.revision, 1);
  assert.equal(result.case.facts.story!.revision, 1);
  assert.equal(result.case.facts.service!.status, 'proposed');
  assert.equal(result.case.service, 'unknown');
});
test('cancelled calls and malformed tool arguments cannot change a case', () => {
  const current = fresh();
  assert.equal(applyProposals(current, [call(0, 'service', 'transfer')], { cancelledCallIds: ['call-1'] }).case, current);
  for (const calls of [null, {}, [null], [{ id: 'x', name: 'submit', args: {} }]]) assert.equal(applyProposals(current, calls).case, current);
});
test('editing outcome invalidates review and preserves every other fact', () => {
  const ready = createTransferFixture();
  const reviewed = markReviewed(ready, { expectedRevision: ready.revision, now: FIXTURE_TIME });
  assert.match(reviewed.review!.receipt!, /^SIM-/);
  const updated = confirmFact(reviewed, 'outcome', 'Please explain which employment record needs correction.');
  assert.equal(updated.review, null);
  assert.equal(updated.state, 'ready');
  assert.equal(updated.revision, reviewed.revision + 1);
  for (const field of Object.keys(reviewed.facts).filter(f => f !== 'outcome')) assert.deepEqual(updated.facts[field as keyof typeof updated.facts], reviewed.facts[field as keyof typeof reviewed.facts]);
});
test('unchanged confirmations and redundant proposals preserve review', () => {
  const ready = createTransferFixture();
  const reviewed = markReviewed(ready, { expectedRevision: ready.revision });
  assert.equal(confirmFact(reviewed, 'outcome'), reviewed);
  const result = applyProposals(reviewed, [call(reviewed.revision, 'service', 'transfer')]);
  assert.equal(result.case.review, reviewed.review);
  assert.equal(result.case.revision, reviewed.revision);
  assert.equal(result.invalidateReview, false);
});
test('attachment changes invalidate review without changing facts', () => {
  const current = createTransferFixture();
  const reviewed = markReviewed(current, { expectedRevision: current.revision });
  const updated = invalidateReview(reviewed);
  assert.equal(updated.review, null);
  assert.equal(updated.facts, reviewed.facts);
  assert.equal(updated.revision, reviewed.revision + 1);
});
test('review rejects stale revisions, unconfirmed narratives and unsupported withdrawal', () => {
  const ready = createTransferFixture();
  assert.throws(() => markReviewed(ready, { expectedRevision: ready.revision - 1 }));
  assert.throws(() => markReviewed(fresh(), { expectedRevision: 0 }));
  const withdrawal = confirmFact(ready, 'service', 'withdrawal');
  assert.equal(canReview(withdrawal), false);
  assert.equal(nextQuestion(withdrawal), null);
  const proposedStory = applyProposals(fresh(), [call(0, 'story', FIXTURE_STORY)]).case;
  assert.equal(canReview(proposedStory), false);
  assert.doesNotMatch(makeDraft(proposedStory), /Meridian/);
});
test('question graph skips rejection wording when pending and optional employers always', () => {
  let current = confirmFact(fresh(), 'service', 'transfer');
  current = confirmFact(current, 'story', 'My transfer is pending.');
  current = confirmFact(current, 'claim_status', 'pending');
  assert.equal(nextQuestion(current)!.field, 'exit_date');
  current = setUnknown(current, 'exit_date');
  assert.equal(nextQuestion(current)!.field, 'outcome');
  assert.ok(nextQuestion(current)!.options.every(o => !o.value.includes('rejected')));
  current = confirmFact(current, 'outcome', 'Please provide a status update.');
  assert.equal(nextQuestion(current)!.field, 'office');
  current = setUnknown(current, 'office');
  assert.equal(nextQuestion(current), null);
  assert.ok(getUnresolved(current).includes('office'));
});
test('known first-turn fields are not asked again, next question asks for rejection wording', () => {
  const current = fresh();
  const result = applyProposals(current, [{ id: 'first', name: 'propose_facts', args: { revision: 0, facts: [
    { field: 'service', value: 'transfer', quote: 'PF transfer' }, { field: 'story', value: FIXTURE_STORY, quote: FIXTURE_STORY },
    { field: 'claim_status', value: 'rejected', quote: 'reject ho gaya' }, { field: 'office', value: 'unknown', quote: 'Mujhe nahi pata' },
  ] } }]);
  assert.equal(result.nextQuestion!.field, 'rejection_reason');
});
test('missing required fields cannot become unknown and empty values fail', () => {
  assert.throws(() => setUnknown(fresh(), 'service'));
  assert.throws(() => setUnknown(fresh(), 'outcome'));
  assert.throws(() => confirmFact(fresh(), 'story', '  '));
});
test('fixture draft matches the checked-in expected text exactly', () => {
  const expected = readFileSync(new URL('../fixtures/pf-transfer.expected.txt', import.meta.url), 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, '');
  assert.equal(makeDraft(createTransferFixture()), expected);
});
test('citizen story preserves whitespace and confirmed-only draft does not invent current employer', () => {
  const current = confirmFact(createTransferFixture(), 'story', '  My words.\nMy second line.  ');
  assert.ok(makeDraft(current).includes('  My words.\nMy second line.  '));
  assert.equal(current.facts.current_employer, undefined);
  assert.doesNotMatch(makeDraft(current), /Current employer supplied/);
  assert.equal(draftHash(makeDraft(current)), draftHash(makeDraft(current)));
});
