import type { FieldId } from '../core/index';
import { parseDate } from './dates';

const UNKNOWN = /^(unknown|nahi pata|mujhe nahi pata|pata nahi|i don'?t know|don'?t know|not sure|pakka nahi|skip)\b/i;

/** Turns a typed or spoken answer into a value the core accepts. Ambiguous text is passed through so validation can explain. */
export function interpret(field: FieldId, text: string): string {
  const t = text.trim();
  if (UNKNOWN.test(t)) return 'unknown';
  if (field === 'service') {
    const transfer = /transfer/i.test(t), withdrawal = /withdraw|nikaal|nikal/i.test(t);
    if (transfer && !withdrawal) return 'transfer';
    if (withdrawal && !transfer) return 'withdrawal';
  }
  if (field === 'claim_status') {
    const rejected = /reject/i.test(t), pending = /pending|abhi tak|still/i.test(t);
    if (rejected && !pending) return 'rejected';
    if (pending && !rejected) return 'pending';
  }
  if (field === 'exit_date') return parseDate(t) ?? t;
  return t;
}
