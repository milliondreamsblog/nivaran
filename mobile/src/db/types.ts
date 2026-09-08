import type { Case, Message, Evidence } from '../core/index';
export type CaseBundle = { version: 1; case: Case; messages: Message[]; evidence: Evidence[] };
export type CaseStore = { listCases(): Promise<CaseBundle[]>; saveCase(bundle: CaseBundle): Promise<void>; deleteCase(id: string): Promise<void> };
export function validBundle(value: unknown): value is CaseBundle {
  const b = value as CaseBundle;
  return !!b && b.version === 1 && typeof b.case?.id === 'string' && Number.isSafeInteger(b.case.revision) && !!b.case.facts && Array.isArray(b.case.appliedCallIds) && Array.isArray(b.messages) && Array.isArray(b.evidence);
}
