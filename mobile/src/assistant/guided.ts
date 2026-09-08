// Deterministic helper for typed and guided input when no AI session is open.
// `describe` confirms the story and proposes obvious facts from keywords; `answer` commits one guided answer.
import { applyProposals, confirmFact, nextQuestion, setUnknown, isISODate, type Case, type FieldId } from '../core/index';

export const SAMPLE_STORY = 'Mera PF transfer claim reject ho gaya hai. Purani company Meridian Textiles thi, Surat mein. Naya employer Pune mein hai. Mujhe nahi pata kaun sa EPFO office dekh raha hai.';
export const FIELD_LABELS: Record<FieldId, string> = { service: 'Service', story: 'What happened', claim_status: 'Claim status', rejection_reason: 'Rejection wording', exit_date: 'Employment exit date', previous_employer: 'Previous employer', current_employer: 'Current employer', office: 'Handling office', outcome: 'Requested action' };
export function describe(current: Case, text: string): Case {
  let changed = confirmFact(current, 'story', text, { source: 'typed' });
  const facts: { field: FieldId; value: string; quote: string }[] = [];
  const find = (field: FieldId, expression: RegExp, value: string) => { const match = text.match(expression); if (match) facts.push({ field, value, quote: match[0] }); };
  const transfer = /transfer|ट्रांसफर/i.test(text), withdrawal = /withdraw|निकाल/i.test(text);
  if (transfer !== withdrawal) find('service', transfer ? /transfer|ट्रांसफर/i : /withdraw\w*|निकाल/i, transfer ? 'transfer' : 'withdrawal');
  const rejected = /reject|रिजेक्ट/i.test(text), pending = /pending|पेंडिंग/i.test(text);
  if (rejected !== pending) find('claim_status', rejected ? /reject\w*|रिजेक्ट/i : /pending|पेंडिंग/i, rejected ? 'rejected' : 'pending');
  find('office', /(?:nahi pata|don['’]?t know|do not know|नहीं पता)[^.\n]*(?:office|ऑफिस)|(?:office|ऑफिस)[^.\n]*(?:unknown|nahi pata|नहीं पता)/i, 'unknown');
  // This is a visibly labelled guided helper, not a general language model.
  if (facts.length) changed = applyProposals(changed, [{ id: `guided:${changed.id}:${changed.revision}`, name: 'propose_facts', args: { revision: changed.revision, facts } }], { source: 'typed' }).case;
  return changed;
}
export function answer(current: Case, field: FieldId, value: string): Case {
  return value === 'unknown' ? setUnknown(current, field) : confirmFact(current, field, value, { source: 'typed' });
}
/** Question wording in the app language. Screens translate the ready sentence themselves. */
export function questionText(current: Case, lang: 'hi' | 'en' = current.language) { const q = nextQuestion(current); return q ? lang === 'hi' ? q.textHi : q.textEn : 'Your draft is ready to review. You can still edit any answer.'; }
/** Human-readable value. The strings returned here are dictionary keys, so screens pass them through t(). */
export function displayValue(field: FieldId, value: string): string {
  if (value === 'unknown' || !value) return 'Not yet known';
  if (field === 'service') return value === 'transfer' ? 'PF transfer' : 'PF withdrawal';
  if (field === 'claim_status') return value;
  if (field === 'exit_date' && isISODate(value)) return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return value;
}
