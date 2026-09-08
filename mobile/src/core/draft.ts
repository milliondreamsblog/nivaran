import type { Case } from './types.ts';
import { routeFor } from './service-pf-transfer.ts';
import { canReview } from './readiness.ts';

export const UNCONFIRMED_DATE = 'The employment exit date needs verification; I have not confirmed an exact date.';
export const UNKNOWN_OFFICE = 'The responsible field office has not yet been identified.';
export function dateSummary(current: Case): string {
  const fact = current.facts.exit_date;
  return fact?.status === 'confirmed' ? `Employment exit date confirmed by me: ${fact.value}.` : UNCONFIRMED_DATE;
}
export function makeDraft(current: Case): string {
  const confirmed = (field: keyof Case['facts']) => current.facts[field]?.status === 'confirmed' ? current.facts[field]!.value : '';
  const route = routeFor(confirmed('service'));
  const rejection = confirmed('claim_status') === 'rejected' ? confirmed('rejection_reason') : '';
  const office = confirmed('office');
  return [
    `To: ${route?.department ?? 'Authority to be confirmed'}`,
    `Subject: Request for examination of ${route ? 'pf transfer' : 'service not confirmed'} difficulty`,
    // Never trim or rewrite the citizen's original account.
    confirmed('story'),
    confirmed('claim_status') ? `Transfer claim status supplied by me: ${confirmed('claim_status')}.` : '',
    rejection ? `The rejection wording I have supplied is: ${rejection}` : confirmed('claim_status') === 'rejected' && current.facts.rejection_reason?.status === 'unknown' ? 'I do not currently have the exact rejection wording.' : '',
    confirmed('previous_employer') ? `Previous employer supplied by me: ${confirmed('previous_employer')}.` : '',
    confirmed('current_employer') ? `Current employer supplied by me: ${confirmed('current_employer')}.` : '',
    dateSummary(current), office ? `Office identified by me: ${office}.` : UNKNOWN_OFFICE,
    confirmed('outcome') ? `Action requested: ${confirmed('outcome')}` : '',
  ].filter(Boolean).join('\n\n');
}
/** Stable synchronous draft fingerprint, NOT a cryptographic signature. Revision is the review gate. */
export function draftHash(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619) >>> 0;
  return `fnv1a32:${hash.toString(16).padStart(8, '0')}`;
}
export function markReviewed(current: Case, options: { expectedRevision: number; now?: number }): Case {
  if (current.revision !== options.expectedRevision) throw new Error('The case changed. Review the latest draft.');
  if (!canReview(current)) throw new Error('Resolve the review blockers first.');
  return { ...current, state: 'reviewed', review: { caseId: current.id, revision: current.revision, draftHash: draftHash(makeDraft(current)), receipt: `SIM-${current.id}-${current.revision}`, reviewedAt: options.now ?? Date.now() } };
}
