export type FieldId = 'service' | 'story' | 'claim_status' | 'rejection_reason' | 'exit_date' | 'previous_employer' | 'current_employer' | 'office' | 'outcome';
export type FactStatus = 'proposed' | 'confirmed' | 'unknown' | 'conflicting';
export type FactSource = 'voice' | 'typed' | 'guided' | 'document';
export type FactAlternative = { value: string; source: string; sourceRef?: string };
export type Fact = {
  field: FieldId; value: string; status: FactStatus; source: FactSource;
  sourceRef?: string; quote?: string; alternatives?: FactAlternative[]; revision: number;
};
export type Case = {
  id: string; title: string; service: 'transfer' | 'withdrawal' | 'unknown';
  state: 'draft' | 'needs_info' | 'ready' | 'reviewed'; revision: number;
  language: 'hi' | 'en'; facts: Partial<Record<FieldId, Fact>>;
  createdAt: number; updatedAt: number;
  /** Persist alongside facts. Replayed tool calls stay deduplicated after restart. */
  appliedCallIds: string[];
  /** Persistence adapter must delete its review row when this becomes null. */
  review: Review | null;
};
export type Message = {
  id: string; caseId: string; speaker: 'citizen' | 'assistant' | 'system'; text: string;
  mode: 'voice' | 'typed' | 'guided'; state: 'final' | 'interrupted'; createdAt: number;
};
export type Evidence = {
  id: string; caseId: string; name: string; mime: string; size: number; path: string;
  purpose: string; check: 'pending' | 'ok' | 'unreadable' | 'simulated';
  extracted?: unknown; createdAt: number;
};
export type Review = { caseId: string; revision: number; draftHash: string; receipt: string | null; reviewedAt: number };
export type QuestionOption = { value: string; textHi: string; textEn: string };
export type Question = {
  field: FieldId; textHi: string; textEn: string; options: QuestionOption[];
  allowUnknown: boolean; reason: string; kind: 'answer' | 'confirm' | 'conflict';
};
export type Readiness = { ready: boolean; blockers: { field: FieldId; reason: string }[]; unresolved: FieldId[] };
export type EditOptions = { source?: FactSource; sourceRef?: string; now?: number };
export type ProposalOptions = EditOptions & { cancelledCallIds?: readonly string[] };
export type ProposalResult = {
  case: Case;
  accepted: { callId: string; field: FieldId }[];
  rejected: { callId: string; field?: string; reason: string }[];
  conflicts: FieldId[]; nextQuestion: Question | null; unresolved: FieldId[];
  invalidateReview: boolean;
};
export type Extraction = {
  doc_type: 'relieving_letter' | 'claim_rejection' | 'other'; employer: string | null;
  dates: { label: string; value_iso: string; text: string }[];
  claim_status: 'rejected' | 'pending' | null; rejection_reason: string | null; confidence: number;
};
