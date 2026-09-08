import { canReview, getReadiness, nextQuestion, FIELD_IDS, type Case, type FieldId } from '../core/index';

export type Tab = 'overview' | 'conversation' | 'documents' | 'review';

/**
 * One pinned next action so nobody has to read the transcript to know what to do.
 * Titles and details are dictionary keys or already in the requested language; screens pass them through t().
 * A `field` is set when the title should be composed with the field's label.
 */
export function nextAction(current: Case, lang: 'hi' | 'en' = current.language): { title: string; detail: string; tab: Tab; field?: FieldId; count?: number } {
  if (current.state === 'reviewed') return { title: 'Reviewed draft saved', detail: 'Edit anything to revise it. The receipt is simulated.', tab: 'review' };
  const conflict = FIELD_IDS.find(field => current.facts[field]?.status === 'conflicting');
  if (conflict) return { title: 'Choose the right', detail: 'Two answers differ. Pick one, or say you are not sure.', tab: 'documents', field: conflict };
  const proposed = FIELD_IDS.filter(field => current.facts[field]?.status === 'proposed');
  if (proposed.length) return { title: 'Confirm what we understood', detail: proposed.length === 1 ? 'answer needs your confirmation.' : 'answers need your confirmation.', tab: 'conversation', count: proposed.length };
  const question = nextQuestion(current);
  if (question) return { title: lang === 'hi' ? question.textHi : question.textEn, detail: question.reason, tab: 'conversation' };
  if (canReview(current)) return { title: 'Review your complaint', detail: 'Read the full draft and save it.', tab: 'review' };
  const blocker = getReadiness(current).blockers[0];
  return { title: blocker?.reason ?? 'Continue', detail: '', tab: 'conversation' };
}

export function missingLine(current: Case): string {
  const office = current.facts.office;
  if (!office || office.status === 'unknown') return 'Still missing: handling office';
  return '';
}
