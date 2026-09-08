import type { Case, FieldId, Readiness } from './types.ts';
import { FIELD_IDS } from './service-pf-transfer.ts';

export function getUnresolved(current: Case): FieldId[] {
  return FIELD_IDS.filter(field => {
    if (['previous_employer', 'current_employer'].includes(field) && !current.facts[field]) return false;
    if (field === 'rejection_reason' && current.facts.claim_status?.value !== 'rejected') return false;
    return !current.facts[field] || current.facts[field]?.status !== 'confirmed';
  });
}
export function getReadiness(current: Case): Readiness {
  const blockers: Readiness['blockers'] = [];
  const service = current.facts.service;
  if (service?.status !== 'confirmed' || service.value !== 'transfer') {
    blockers.push({ field: 'service', reason: service?.value === 'withdrawal' ? 'This demo only prepares PF transfer complaints.' : 'Confirm that this is a PF transfer issue.' });
  }
  if (!current.facts.story?.value.trim() || current.facts.story.status !== 'confirmed') blockers.push({ field: 'story', reason: 'Confirm your account before reviewing it.' });
  if (current.facts.outcome?.status !== 'confirmed' || !current.facts.outcome.value.trim()) blockers.push({ field: 'outcome', reason: 'Confirm the action you want.' });
  for (const field of FIELD_IDS) {
    if (current.facts[field]?.status === 'conflicting' && !blockers.some(item => item.field === field)) blockers.push({ field, reason: 'Resolve the conflicting answers, or leave the fact unknown where allowed.' });
  }
  return { ready: blockers.length === 0, blockers, unresolved: getUnresolved(current) };
}
export function canReview(current: Case): boolean { return getReadiness(current).ready; }
