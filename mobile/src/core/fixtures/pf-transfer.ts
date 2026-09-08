import { createCase, confirmFact, setUnknown, resolveConflict } from '../case.ts';
import { applyProposals } from '../proposals.ts';

export const FIXTURE_TIME = Date.UTC(2026, 8, 8, 12);
export const FIXTURE_STORY = 'Mera PF transfer claim reject ho gaya hai. Purani company Meridian Textiles thi, Surat mein. Naya employer Pune mein hai. Mujhe nahi pata kaun sa EPFO office dekh raha hai.';
export const FIXTURE_OUTCOME = 'Explain why the transfer was rejected and identify the records that need correction.';
export function createTransferFixture(stage: 'confirmed' | 'conflicting' | 'unknown' = 'unknown') {
  let current = createCase({ id: 'demo-pf-transfer', now: FIXTURE_TIME });
  for (const [field, value] of [
    ['service', 'transfer'], ['story', FIXTURE_STORY], ['claim_status', 'rejected'],
    ['rejection_reason', 'date of exit mismatch'], ['exit_date', '2025-04-15'],
    ['previous_employer', 'Meridian Textiles'], ['outcome', FIXTURE_OUTCOME],
  ] as const) current = confirmFact(current, field, value, { source: 'voice', now: FIXTURE_TIME });
  current = setUnknown(current, 'office', { now: FIXTURE_TIME });
  if (stage === 'confirmed') return current;
  current = applyProposals(current, [{ id: 'document-relieving-letter', name: 'propose_facts', args: { revision: current.revision, facts: [{ field: 'exit_date', value: '2025-03-31', quote: 'relieved from services with effect from 31 March 2025' }] } }], { source: 'document', sourceRef: 'relieving-letter.png', now: FIXTURE_TIME }).case;
  return stage === 'conflicting' ? current : resolveConflict(current, 'exit_date', 'unknown', { now: FIXTURE_TIME });
}
