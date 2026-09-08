import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyCase, restoreCase, updateCase, makeDraft, routeFor, validateCase, validateFile, canPrepareAppeal, finishObservation } from '../lib/research-model.mjs';

const example = () => ({ ...emptyCase(), service: 'transfer', story: 'The transfer was rejected. I do not know why.', outcome: 'Explain the rejection and identify the correction needed.' });

test('a transfer never becomes a withdrawal or acquires invented history', () => {
  const draft = makeDraft(example());
  assert.match(draft, /pf transfer/);
  assert.doesNotMatch(draft, /withdrawal|two months|financial hardship|Despite|no action/i);
  assert.match(draft, /I do not know why/);
});
test('conflicting dates stay unconfirmed until the person explicitly chooses', () => {
  const data = { ...example(), rememberedDate: '2026-03-01', documentDate: '2026-05-01' };
  assert.doesNotMatch(makeDraft(data), /2026-03-01|2026-05-01/);
  assert.match(makeDraft(data), /needs verification/);
  assert.match(makeDraft({ ...data, dateChoice: 'document' }), /2026-05-01/);
});
test('a correction invalidates review and a service change invalidates routing', () => {
  const data = { ...example(), reviewed: true, confirmedRoute: true };
  assert.equal(updateCase(data, { story: 'Corrected facts.' }).reviewed, false);
  assert.equal(updateCase(data, { service: 'withdrawal' }).confirmedRoute, false);
});
test('missing UAN and office do not block preparing a draft; unknown service does', () => {
  assert.deepEqual(validateCase(example()), {});
  assert.ok(validateCase({ ...example(), service: 'unsure' }).service);
  assert.equal(routeFor('private employer'), null);
  assert.match(routeFor('transfer').ministry, /Labour/);
});
test('reload restores facts but never pretends to restore file contents', () => {
  const restored = restoreCase({ ...example(), step: 2, evidence: [{ name: 'letter.pdf', type: 'application/pdf', size: 42, available: true }], reviewed: true, confirmedRoute: true });
  assert.equal(restored.story, example().story);
  assert.equal(restored.evidence[0].available, false);
  assert.ok(validateCase(restored, 'review').evidence);
});
test('bad or old storage cannot manufacture a receipt', () => {
  assert.deepEqual(restoreCase({ version: 99, story: 'old' }), emptyCase());
  assert.equal(restoreCase({ ...example(), step: 3, receipt: 'OFFICIAL-123' }).receipt, null);
  assert.equal(restoreCase({ ...example(), step: 3 }).step, 2);
});
test('file validation checks format, empty files and the prototype limit', () => {
  assert.equal(validateFile({ name: 'test.pdf', size: 1024 }), '');
  assert.ok(validateFile({ name: 'test.exe', size: 10 }));
  assert.ok(validateFile({ name: 'test.pdf', size: 6 * 1024 * 1024 }));
  assert.ok(validateFile({ name: 'test.png', size: 0 }));
});
test('a pending or merely delayed case cannot trigger the appeal exercise', () => {
  assert.equal(canPrepareAppeal({ ...example(), receipt: 'SIM-123', feedback: 'poor' }), false);
  assert.equal(canPrepareAppeal({ ...example(), receipt: 'SIM-123', responseShown: true, feedback: 'poor' }), true);
});
test('final review requires both routing and fact confirmation', () => {
  assert.ok(validateCase(example(), 'review').reviewed);
  assert.deepEqual(validateCase({ ...example(), confirmedRoute: true, reviewed: true }, 'review'), {});
});
test('observation outcome is explicit and duration includes interruptions', () => {
  const result = finishObservation({ startedAt: 1000, events: [] }, 'Blocked', 'Not asked', 61000);
  assert.equal(result.elapsedSeconds, 60);
  assert.equal(result.outcome, 'Blocked');
  assert.match(result.source, /moderator/);
});
