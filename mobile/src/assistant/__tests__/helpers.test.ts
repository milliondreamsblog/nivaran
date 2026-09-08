import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDate } from '../dates.ts';
import { interpret } from '../answers.ts';
import { attachEvidence, evidenceSummary, proposeStory, removeEvidence, type Check } from '../bundle.ts';
import { missingLine, nextAction } from '../next.ts';
import { createCase, confirmFact, markReviewed } from '../../core/index.ts';
import { createTransferFixture, FIXTURE_STORY } from '../../core/fixtures/pf-transfer.ts';
import type { CaseBundle } from '../../db/types.ts';

const bundleOf = (current = createCase({ id: 'b', now: 0 })): CaseBundle => ({ version: 1, case: current, messages: [], evidence: [] });
const file = { name: 'relieving-letter.png', mime: 'image/png', size: 12, path: 'file:///x', base64: 'AAAA' };
const letter: Check = { extraction: { doc_type: 'relieving_letter', employer: 'Meridian Textiles Pvt Ltd', dates: [{ label: 'date of exit', value_iso: '2025-03-31', text: '31 March 2025' }], claim_status: null, rejection_reason: null, confidence: 1 }, simulated: true, hash: 'h1', source: 'fixture' };
const noDates: Check = { extraction: { doc_type: 'other', employer: null, dates: [], claim_status: null, rejection_reason: null, confidence: 0.2 }, simulated: false, hash: 'h2', source: 'backend' };

test('parseDate accepts the spoken and typed forms people use and rejects impossible dates', () => {
  for (const input of ['15 April 2025', '15/04/2025', '15-04-2025', '2025-04-15', '2025-4-15', 'April 15, 2025', '15th april 2025']) assert.equal(parseDate(input), '2025-04-15', input);
  for (const input of ['31 February 2025', 'yesterday', '15 April', '15/13/2025']) assert.equal(parseDate(input), null, input);
});

test('interpret maps answers to core values without inventing anything', () => {
  assert.equal(interpret('service', 'maine transfer kiya tha'), 'transfer');
  assert.equal(interpret('service', 'paise nikaalne the'), 'withdrawal');
  assert.equal(interpret('service', 'transfer and withdrawal both'), 'transfer and withdrawal both');
  assert.equal(interpret('claim_status', 'reject ho gaya'), 'rejected');
  assert.equal(interpret('claim_status', 'abhi tak pending hai'), 'pending');
  assert.equal(interpret('office', 'mujhe nahi pata'), 'unknown');
  assert.equal(interpret('rejection_reason', "I don't know"), 'unknown');
  assert.equal(interpret('exit_date', '15 April 2025'), '2025-04-15');
  assert.equal(interpret('exit_date', 'some day in spring'), 'some day in spring');
  assert.equal(interpret('outcome', 'Please explain the rejection.'), 'Please explain the rejection.');
});

test('a final transcript becomes a proposed story once, never a confirmed one', () => {
  const first = proposeStory(bundleOf(), FIXTURE_STORY, 'm1');
  assert.equal(first.case.facts.story?.status, 'proposed');
  assert.equal(first.case.facts.story?.value, FIXTURE_STORY);
  assert.equal(first.case.facts.story?.source, 'voice');
  const second = proposeStory(first, 'something else', 'm2');
  assert.equal(second, first);
  assert.equal(proposeStory(bundleOf(), '   ', 'm3').case.facts.story, undefined);
});

test('a relieving letter with a different exit date creates a conflict and keeps both dates', () => {
  const before = bundleOf(createTransferFixture('confirmed'));
  assert.equal(before.case.facts.exit_date?.value, '2025-04-15');
  const after = attachEvidence(before, file, 'relieving_letter', letter);
  assert.equal(after.evidence.length, 1);
  assert.equal(after.evidence[0].check, 'simulated');
  assert.equal(after.case.facts.exit_date?.status, 'conflicting');
  assert.deepEqual(after.case.facts.exit_date?.alternatives?.map(a => a.value), ['2025-04-15', '2025-03-31']);
  assert.equal(after.case.state, 'needs_info');
  assert.match(evidenceSummary(after.evidence[0]), /31 March 2025/);
  assert.match(evidenceSummary(after.evidence[0]), /Simulated check/);
  assert.equal(before.evidence.length, 0, 'input bundle is untouched');
});

test('a document without dates still invalidates a review, and removing it does too', () => {
  const ready = createTransferFixture('confirmed');
  const reviewed = bundleOf(markReviewed(ready, { expectedRevision: ready.revision, now: 1 }));
  assert.equal(reviewed.case.state, 'reviewed');
  const attached = attachEvidence(reviewed, file, 'other', noDates);
  assert.equal(attached.case.review, null);
  assert.equal(attached.case.revision, reviewed.case.revision + 1);
  assert.equal(attached.case.facts.exit_date?.value, '2025-04-15', 'facts untouched');
  assert.equal(attached.evidence[0].check, 'ok');
  const again = bundleOf(markReviewed(attached.case, { expectedRevision: attached.case.revision, now: 2 }));
  const removed = removeEvidence({ ...again, evidence: attached.evidence }, attached.evidence[0].id);
  assert.equal(removed.evidence.length, 0);
  assert.equal(removed.case.review, null);
});

test('an unreadable file is kept with the draft and marked as not read', () => {
  const after = attachEvidence(bundleOf(), { ...file, name: 'photo.jpg', mime: 'image/jpeg' }, 'other', null);
  assert.equal(after.evidence[0].check, 'unreadable');
  assert.match(evidenceSummary(after.evidence[0]), /could be read/);
});

test('the pinned next action follows conflicts, then proposals, then questions, then review', () => {
  const empty = createCase({ id: 'n', now: 0, language: 'en' });
  assert.equal(nextAction(empty).tab, 'conversation');
  assert.match(nextAction(empty).title, /transferring PF or withdrawing/);
  assert.match(nextAction(createCase({ id: 'h', now: 0 })).title, /PF transfer kar rahe the/);
  const conflicting = createTransferFixture('conflicting');
  assert.equal(nextAction(conflicting).tab, 'documents');
  assert.equal(nextAction(conflicting).field, 'exit_date');
  const proposed = proposeStory(bundleOf(), FIXTURE_STORY, 'm').case;
  assert.equal(nextAction(proposed).tab, 'conversation');
  assert.match(nextAction(proposed).title, /Confirm what we understood/);
  assert.equal(nextAction(proposed).count, 1);
  const ready = createTransferFixture('confirmed');
  assert.equal(nextAction(ready).tab, 'review');
  assert.equal(missingLine(ready), 'Still missing: handling office');
  const withOffice = confirmFact(ready, 'office', 'Regional Office Pune');
  assert.equal(missingLine(withOffice), '');
  const reviewed = markReviewed(ready, { expectedRevision: ready.revision, now: 1 });
  assert.equal(nextAction(reviewed).tab, 'review');
  assert.match(nextAction(reviewed).title, /Reviewed draft saved/);
});
