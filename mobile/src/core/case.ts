import type { Case, EditOptions, Fact, FieldId } from './types.ts';
import { isFieldId, PF_TRANSFER_FIELDS, validateFactValue } from './service-pf-transfer.ts';
import { getReadiness } from './readiness.ts';

export function createCase(input: { id: string; language?: 'hi' | 'en'; now?: number }): Case {
  if (!input.id?.trim()) throw new Error('A case ID is required.');
  const now = input.now ?? Date.now();
  return { id: input.id, title: 'New issue', service: 'unknown', state: 'draft', revision: 0, language: input.language ?? 'hi', facts: {}, createdAt: now, updatedAt: now, appliedCallIds: [], review: null };
}
/** Internal immutable commit. Review deletion must be persisted with this revision. */
export function commitFacts(current: Case, facts: Case['facts'], now = Date.now()): Case {
  const serviceFact = facts.service;
  const service = serviceFact?.status === 'confirmed' && (serviceFact.value === 'transfer' || serviceFact.value === 'withdrawal') ? serviceFact.value : 'unknown';
  const next: Case = { ...current, facts, service, title: service === 'transfer' ? 'PF transfer issue' : service === 'withdrawal' ? 'PF withdrawal — outside demo scope' : 'New issue', revision: current.revision + 1, updatedAt: now, review: null, state: 'needs_info' };
  next.state = getReadiness(next).ready ? 'ready' : 'needs_info';
  return next;
}
export function confirmFact(current: Case, field: FieldId, value?: string, options: EditOptions = {}): Case {
  if (!isFieldId(field)) throw new Error('Unknown field.');
  const old = current.facts[field];
  if (old?.status === 'conflicting') throw new Error('Use resolveConflict before confirming this fact.');
  const chosen = value ?? old?.value;
  const error = validateFactValue(field, chosen);
  if (error) throw new Error(error);
  if (chosen === 'unknown') return setUnknown(current, field, options);
  if (old?.status === 'confirmed' && old.value === chosen) return current;
  const fact: Fact = { field, value: chosen!, status: 'confirmed', source: options.source ?? (value === undefined ? old?.source : 'guided') ?? 'guided', revision: current.revision + 1 };
  if (options.sourceRef) fact.sourceRef = options.sourceRef;
  else if (old && chosen === old.value && old.sourceRef) fact.sourceRef = old.sourceRef;
  if (old && chosen === old.value && old.quote) fact.quote = old.quote;
  return commitFacts(current, { ...current.facts, [field]: fact }, options.now);
}
export function setUnknown(current: Case, field: FieldId, options: EditOptions = {}): Case {
  if (!isFieldId(field) || !PF_TRANSFER_FIELDS[field].allowUnknown) throw new Error('This field cannot be left unknown.');
  const old = current.facts[field];
  if (old?.status === 'unknown') return current;
  const fact: Fact = { field, value: '', status: 'unknown', source: options.source ?? 'guided', revision: current.revision + 1 };
  if (old?.alternatives) fact.alternatives = old.alternatives.map(a => ({ ...a }));
  if (options.sourceRef) fact.sourceRef = options.sourceRef;
  return commitFacts(current, { ...current.facts, [field]: fact }, options.now);
}
export function resolveConflict(current: Case, field: FieldId, chosenValue: string, options: EditOptions = {}): Case {
  const fact = current.facts[field];
  if (!fact || fact.status !== 'conflicting') throw new Error('There is no conflict on this field.');
  if (chosenValue === 'unknown') return setUnknown(current, field, options);
  const alternative = fact.alternatives?.find(item => item.value === chosenValue);
  if (!alternative) throw new Error('Choose one of the displayed alternatives or unknown.');
  const confirmed: Fact = { field, value: chosenValue, status: 'confirmed', source: options.source ?? 'guided', revision: current.revision + 1, sourceRef: alternative.sourceRef, alternatives: fact.alternatives?.map(a => ({ ...a })) };
  return commitFacts(current, { ...current.facts, [field]: confirmed }, options.now);
}

/** Call when attachments change; save the returned case and evidence atomically. */
export function invalidateReview(current: Case, options: { now?: number } = {}): Case {
  return commitFacts(current, current.facts, options.now);
}
