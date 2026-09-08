// Stable public boundary. Screens/storage/voice import only from this file.
export type { FieldId, FactStatus, FactSource, FactAlternative, Fact, Case, Message, Evidence, Review, Question, QuestionOption, Readiness, EditOptions, ProposalOptions, ProposalResult, Extraction } from './types.ts';
export { FIELD_IDS, QUESTION_ORDER, PF_TRANSFER_FIELDS, UNKNOWN_OPTION, isFieldId, isISODate, validateFactValue, routeFor } from './service-pf-transfer.ts';
export { createCase, confirmFact, setUnknown, resolveConflict, invalidateReview } from './case.ts';
export { nextQuestion } from './questions.ts';
export { getReadiness, getUnresolved, canReview } from './readiness.ts';
export { applyProposals } from './proposals.ts';
export { makeDraft, dateSummary, draftHash, markReviewed, UNCONFIRMED_DATE, UNKNOWN_OFFICE } from './draft.ts';
