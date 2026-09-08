import type { FieldId, QuestionOption } from './types.ts';

export const FIELD_IDS: readonly FieldId[] = ['service', 'story', 'claim_status', 'rejection_reason', 'exit_date', 'previous_employer', 'current_employer', 'office', 'outcome'];
export const QUESTION_ORDER: readonly FieldId[] = ['service', 'story', 'claim_status', 'rejection_reason', 'exit_date', 'outcome', 'office'];
export const UNKNOWN_OPTION: QuestionOption = { value: 'unknown', textHi: 'Mujhe nahi pata', textEn: "I don't know" };
type Definition = { textHi: string; textEn: string; reason: string; allowUnknown: boolean; options: QuestionOption[] };
export const PF_TRANSFER_FIELDS: Record<FieldId, Definition> = {
  service: { textHi: 'Aap PF transfer kar rahe the ya paise nikaal rahe the?', textEn: 'Were you transferring PF or withdrawing money?', reason: 'The service determines which preparation journey applies.', allowUnknown: false, options: [
    { value: 'transfer', textHi: 'PF transfer', textEn: 'Transfer PF' }, { value: 'withdrawal', textHi: 'Paise nikaalna', textEn: 'Withdraw PF' },
  ] },
  story: { textHi: 'Kya hua tha? Apne shabdon mein batayein.', textEn: 'What happened? Describe it in your own words.', reason: 'The complaint preserves your own account.', allowUnknown: false, options: [] },
  claim_status: { textHi: 'Claim reject hua hai ya abhi pending hai?', textEn: 'Was the claim rejected, or is it still pending?', reason: 'Only a rejected claim needs rejection wording.', allowUnknown: true, options: [
    { value: 'rejected', textHi: 'Reject hua', textEn: 'Rejected' }, { value: 'pending', textHi: 'Pending hai', textEn: 'Pending' }, UNKNOWN_OPTION,
  ] },
  rejection_reason: { textHi: 'Rejection message mein kya likha tha?', textEn: 'What did the rejection message say?', reason: 'Use the supplied wording rather than guessing why it was rejected.', allowUnknown: true, options: [UNKNOWN_OPTION] },
  exit_date: { textHi: 'Aapne purani company kab chhodi thi?', textEn: 'When did you leave the previous employer?', reason: 'Keep the date unconfirmed if you cannot verify it.', allowUnknown: true, options: [UNKNOWN_OPTION] },
  previous_employer: { textHi: 'Purani company ka naam', textEn: 'Previous employer', reason: 'Optional; captured only if supplied.', allowUnknown: true, options: [UNKNOWN_OPTION] },
  current_employer: { textHi: 'Nayi company ka naam', textEn: 'Current employer', reason: 'Optional; captured only if supplied.', allowUnknown: true, options: [UNKNOWN_OPTION] },
  office: { textHi: 'Kaun sa EPFO office claim dekh raha hai? Nahi pata toh chhod sakte hain.', textEn: 'Which EPFO office is handling the claim? You can leave this unknown.', reason: 'Your employer being private or your home address does not identify a field office.', allowUnknown: true, options: [UNKNOWN_OPTION] },
  outcome: { textHi: 'Aap office se kya karwana chahte hain?', textEn: 'What would you like the office to do?', reason: 'The requested action must be chosen by you.', allowUnknown: false, options: [
    { value: 'Explain why the transfer was rejected and identify the records that need correction.', textHi: 'Rejection samjhayein aur galat record batayein', textEn: 'Explain the rejection and identify corrections' },
    { value: 'Provide an update on my pending transfer claim.', textHi: 'Pending transfer ka update dein', textEn: 'Provide a transfer status update' },
  ] },
};
export function isFieldId(value: unknown): value is FieldId {
  return typeof value === 'string' && FIELD_IDS.includes(value as FieldId);
}
export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}
/** null means valid. Never normalizes or invents user wording. */
export function validateFactValue(field: FieldId, value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return 'A nonempty string is required.';
  if (value.length > (field === 'story' ? 12000 : 2000)) return 'Value is too long.';
  if (value === 'unknown') return PF_TRANSFER_FIELDS[field].allowUnknown ? null : 'This field needs an answer.';
  if (field === 'service' && !['transfer', 'withdrawal'].includes(value)) return 'Choose transfer or withdrawal.';
  if (field === 'claim_status' && !['rejected', 'pending'].includes(value)) return 'Choose rejected, pending or unknown.';
  if (field === 'exit_date' && !isISODate(value)) return 'Use a real calendar date in YYYY-MM-DD format.';
  return null;
}
export function routeFor(service: string) {
  if (service !== 'transfer') return null;
  return {
    department: 'Employees’ Provident Fund Organisation (EPFO)', ministry: 'Ministry of Labour & Employment',
    reason: 'PF transfer is an EPFO service. A private employer does not by itself make it a state-government service.',
  };
}
