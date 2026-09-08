import type { Case, Fact, FactAlternative, FieldId, ProposalOptions, ProposalResult } from './types.ts';
import { isFieldId, validateFactValue, FIELD_IDS } from './service-pf-transfer.ts';
import { commitFacts } from './case.ts';
import { nextQuestion } from './questions.ts';
import { getUnresolved } from './readiness.ts';

const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
export function applyProposals(current: Case, calls: unknown, options: ProposalOptions = {}): ProposalResult {
  const accepted: ProposalResult['accepted'] = [], rejected: ProposalResult['rejected'] = [];
  const facts = { ...current.facts };
  const seen = new Set(current.appliedCallIds ?? []);
  const cancelled = new Set(options.cancelledCallIds ?? []);
  let changed = false;
  const list = Array.isArray(calls) && calls.length <= 32 ? calls : [];
  if (!Array.isArray(calls) || calls.length > 32) rejected.push({ callId: '', reason: 'Expected at most 32 function calls.' });
  for (const call of list) {
    const id = record(call) && typeof call.id === 'string' ? call.id : '';
    const reject = (reason: string, field?: string) => rejected.push({ callId: id, ...(field ? { field } : {}), reason });
    if (!record(call) || !id || id.length > 256 || call.name !== 'propose_facts' || !record(call.args)) { reject('Malformed propose_facts call.'); continue; }
    if (cancelled.has(id)) { reject('Cancelled call.'); continue; }
    if (seen.has(id)) { reject('Duplicate call ID.'); continue; }
    // All calls in one batch compare with the incoming revision, not intermediate edits.
    if (!Number.isSafeInteger(call.args.revision) || call.args.revision !== current.revision) { reject('Revision mismatch. Refresh the case before proposing facts.'); continue; }
    if (!Array.isArray(call.args.facts) || !call.args.facts.length || call.args.facts.length > 32) { reject('Expected between 1 and 32 facts.'); continue; }
    let acceptedCall = false;
    for (const proposal of call.args.facts) {
      if (!record(proposal) || !isFieldId(proposal.field)) { reject('Unknown field.', record(proposal) && typeof proposal.field === 'string' ? proposal.field : undefined); continue; }
      const field: FieldId = proposal.field;
      const error = validateFactValue(field, proposal.value);
      if (error || typeof proposal.quote !== 'string' || !proposal.quote.trim() || proposal.quote.length > 12000) { reject(error ?? 'A source quote is required.', field); continue; }
      const value = proposal.value as string;
      accepted.push({ callId: id, field }); acceptedCall = true;
      const old = facts[field];
      if (old?.value === value && (old.status === 'confirmed' || old.status === 'proposed')) continue;
      if (old?.status === 'unknown' && value === 'unknown') continue;
      const source = options.source ?? 'voice';
      const sourceRef = options.sourceRef ?? id;
      let fact: Fact = { field, value, status: 'proposed', source, sourceRef, quote: proposal.quote, revision: current.revision + 1 };
      if (old && (old.status === 'conflicting' || ((old.status === 'confirmed' || old.status === 'proposed') && old.value !== value))) {
        const alternatives: FactAlternative[] = old.status === 'conflicting' ? [...(old.alternatives ?? [])] : [{ value: old.value, source: old.source, sourceRef: old.sourceRef }];
        if (!alternatives.some(a => a.value === value)) alternatives.push({ value, source, sourceRef });
        fact = { ...old, value: '', status: 'conflicting', alternatives, revision: current.revision + 1 };
      }
      facts[field] = fact; changed = true;
    }
    if (acceptedCall) seen.add(id);
  }
  let updated = changed ? commitFacts(current, facts, options.now) : current;
  if (seen.size !== (current.appliedCallIds ?? []).length) updated = { ...updated, appliedCallIds: [...seen] };
  return { case: updated, accepted, rejected, conflicts: FIELD_IDS.filter(field => updated.facts[field]?.status === 'conflicting'), nextQuestion: nextQuestion(updated), unresolved: getUnresolved(updated), invalidateReview: changed };
}
