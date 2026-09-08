import type { CaseBundle } from '../db/types';
import { uid } from '../db/uid';
import { applyProposals, invalidateReview, type Case, type Evidence, type Extraction, type Message, type ProposalOptions, type ProposalResult } from '../core/index';
import type { LocalDocument } from '../documents/types';

export const withCase = (bundle: CaseBundle, next: Case): CaseBundle => (next === bundle.case ? bundle : { ...bundle, case: next });

export function addMessage(bundle: CaseBundle, text: string, speaker: Message['speaker'], mode: Message['mode']): CaseBundle {
  const entry: Message = { id: uid(), caseId: bundle.case.id, text, speaker, mode, state: 'final', createdAt: Date.now() };
  return { ...bundle, messages: [...bundle.messages, entry] };
}

export function applyCalls(bundle: CaseBundle, calls: unknown, options: ProposalOptions): { bundle: CaseBundle; result: ProposalResult } {
  const result = applyProposals(bundle.case, calls, options);
  return { bundle: withCase(bundle, result.case), result };
}

/** A final citizen transcript becomes a proposed story when none exists yet. The citizen still confirms it on the facts card. */
export function proposeStory(bundle: CaseBundle, transcript: string, messageId: string): CaseBundle {
  if (bundle.case.facts.story || !transcript.trim()) return bundle;
  const call = { id: `transcript:${messageId}`, name: 'propose_facts', args: { revision: bundle.case.revision, facts: [{ field: 'story', value: transcript.trim(), quote: transcript.trim() }] } };
  return applyCalls(bundle, [call], { source: 'voice', sourceRef: messageId }).bundle;
}

export type Check = { extraction: Extraction | null; simulated: boolean; hash: string; source: 'fixture' | 'backend' | 'none' };

export function attachEvidence(bundle: CaseBundle, file: LocalDocument, purpose: string, check: Check | null): CaseBundle {
  const evidence: Evidence = {
    id: uid(), caseId: bundle.case.id, name: file.name, mime: file.mime, size: file.size, path: file.path, purpose,
    check: !check ? 'unreadable' : !check.extraction ? 'unreadable' : check.simulated ? 'simulated' : 'ok',
    extracted: check?.extraction ? { ...check.extraction, simulated: check.simulated, source: check.source, base64: file.base64 } : { base64: file.base64 },
    createdAt: Date.now(),
  };
  let next: CaseBundle = { ...bundle, evidence: [...bundle.evidence, evidence] };
  const dates = check?.extraction?.dates.filter(d => d.label.toLowerCase() === 'date of exit') ?? [];
  let changed = false;
  if (dates.length) {
    const call = { id: `document:${evidence.id}:${check!.hash}`, name: 'propose_facts', args: { revision: next.case.revision, facts: dates.map(d => ({ field: 'exit_date', value: d.value_iso, quote: d.text })) } };
    const applied = applyCalls(next, [call], { source: 'document', sourceRef: evidence.id });
    changed = applied.result.invalidateReview;
    next = applied.bundle;
  }
  return changed ? next : withCase(next, invalidateReview(next.case));
}

export function removeEvidence(bundle: CaseBundle, id: string): CaseBundle {
  const next: CaseBundle = { ...bundle, evidence: bundle.evidence.filter(e => e.id !== id) };
  return withCase(next, invalidateReview(next.case));
}

export function evidenceImage(evidence: Evidence): string | null {
  const data = evidence.extracted as { base64?: string } | undefined;
  return data?.base64 && evidence.mime.startsWith('image/') ? `data:${evidence.mime};base64,${data.base64}` : null;
}

/** What a document check found, as pieces the screens translate: the exit date text if any, and how it was checked. */
export function evidenceParts(evidence: Evidence): { unreadable: boolean; date: string | null; simulated: boolean } {
  const data = evidence.extracted as (Partial<Extraction> & { simulated?: boolean }) | undefined;
  const date = data?.dates?.find(d => d.label.toLowerCase() === 'date of exit');
  return { unreadable: evidence.check === 'unreadable', date: date?.text ?? null, simulated: !!data?.simulated };
}

export function evidenceSummary(evidence: Evidence, t: (text: string) => string = text => text): string {
  const parts = evidenceParts(evidence);
  if (parts.unreadable) return t('No details could be read from this file.');
  return [parts.date ? `${t('Date of exit found:')} ${parts.date}` : t('No exit date found'), parts.simulated ? t('Simulated check') : t('AI check')].join(' · ');
}
