import type { Case, FieldId, Question } from './types.ts';
import { FIELD_IDS, PF_TRANSFER_FIELDS, QUESTION_ORDER, UNKNOWN_OPTION } from './service-pf-transfer.ts';

export function nextQuestion(current: Case): Question | null {
  for (const field of FIELD_IDS) {
    const fact = current.facts[field];
    if (fact?.status === 'conflicting') {
      const definition = PF_TRANSFER_FIELDS[field];
      return { ...definition, field, kind: 'conflict',
        textHi: 'Do alag jawab mile hain. Kaunsa sahi hai? Pakka nahi hai toh batayein.',
        textEn: 'These answers differ. Which is correct? You can say you are not sure.',
        options: [...(fact.alternatives || []).map(a => ({ value: a.value, textHi: a.value, textEn: a.value })), ...(definition.allowUnknown ? [{ ...UNKNOWN_OPTION, textHi: 'Pakka nahi hai', textEn: "I'm not sure" }] : [])],
      };
    }
  }
  // Withdrawal is recognized but intentionally not implemented as a second service.
  if (current.facts.service?.status === 'confirmed' && current.facts.service.value === 'withdrawal') return null;
  for (const field of QUESTION_ORDER) {
    if (field === 'rejection_reason' && current.facts.claim_status?.value !== 'rejected') continue;
    if (!current.facts[field]) {
      const definition = PF_TRANSFER_FIELDS[field];
      const options = field === 'outcome' ? definition.options.filter(option => current.facts.claim_status?.value === 'pending' ? option.value.includes('pending') : current.facts.claim_status?.value === 'rejected' ? !option.value.includes('pending') : false) : definition.options;
      return { ...definition, options, field, kind: 'answer' };
    }
  }
  // Proposed answers are shown in a facts card, not asked as if never supplied.
  const proposed = FIELD_IDS.find(field => current.facts[field]?.status === 'proposed');
  if (proposed) return confirmationQuestion(proposed);
  return null;
}
function confirmationQuestion(field: FieldId): Question {
  return { ...PF_TRANSFER_FIELDS[field], field, kind: 'confirm', options: [], textHi: 'Samjhe hue jawab ko Confirm ya Fix karein.', textEn: 'Confirm or fix the answer in your facts card.' };
}
