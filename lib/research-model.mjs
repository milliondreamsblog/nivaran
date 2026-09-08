// Deterministic research prototype. No model, government API or submission side effects.
export const DRAFT_KEY = 'nivaran_research_draft_v1';
export const OBSERVATIONS_KEY = 'nivaran_research_observations_v1';
export const emptyCase = () => ({ version: 1, step: 0, service: '', story: '', rejection: '', rejectionUnknown: false, rememberedDate: '', documentDate: '', dateChoice: 'unknown', outcome: '', office: '', evidence: [], confirmedRoute: false, reviewed: false, receipt: null, responseShown: false, feedback: '', appeal: '' });

export function restoreCase(raw) {
  const base = emptyCase();
  if (!raw || raw.version !== 1 || typeof raw.story !== 'string') return base;
  const next = { ...base };
  for (const key of ['service', 'story', 'rejection', 'rememberedDate', 'documentDate', 'dateChoice', 'outcome', 'office', 'feedback', 'appeal']) {
    if (typeof raw[key] === 'string') next[key] = raw[key].slice(0, 12000);
  }
  for (const key of ['rejectionUnknown', 'confirmedRoute', 'reviewed', 'responseShown']) next[key] = raw[key] === true;
  next.step = Number.isInteger(raw.step) ? Math.min(3, Math.max(0, raw.step)) : 0;
  next.receipt = typeof raw.receipt === 'string' && raw.receipt.startsWith('SIM-') ? raw.receipt : null;
  if (next.step === 3 && !next.receipt) next.step = 2;
  next.evidence = Array.isArray(raw.evidence) ? raw.evidence.filter(e => e && typeof e.name === 'string' && typeof e.size === 'number').map(e => ({ name: e.name.slice(0, 200), size: e.size, type: String(e.type || ''), available: false })) : [];
  return next;
}

export function updateCase(state, patch) {
  return { ...state, ...patch, reviewed: false, confirmedRoute: Object.hasOwn(patch, 'service') && patch.service !== state.service ? false : state.confirmedRoute };
}

export function dateSummary(state) {
  const selected = state.dateChoice === 'document' ? state.documentDate : state.dateChoice === 'remembered' ? state.rememberedDate : '';
  if (selected) return `Employment exit date confirmed by me: ${selected}.`;
  if (state.rememberedDate || state.documentDate) return 'The employment exit date needs verification; I have not confirmed an exact date.';
  return '';
}

export function routeFor(service) {
  if (!['transfer', 'withdrawal'].includes(service)) return null;
  return { department: 'Employees’ Provident Fund Organisation (EPFO)', ministry: 'Ministry of Labour & Employment', reason: 'The service you selected is administered by EPFO. Whether your employer is private or public does not by itself make this a state-government service.' };
}

export function makeDraft(state) {
  const route = routeFor(state.service);
  const title = state.service === 'transfer' ? 'PF transfer' : state.service === 'withdrawal' ? 'PF withdrawal' : 'Service not confirmed';
  return [
    `To: ${route?.department || 'Authority to be confirmed'}`,
    `Subject: Request for examination of ${title.toLowerCase()} difficulty`,
    state.story.trim(),
    state.rejection.trim() ? `The rejection wording I have supplied is: ${state.rejection.trim()}` : state.rejectionUnknown ? 'I do not currently have the exact rejection wording.' : '',
    dateSummary(state),
    state.office.trim() ? `Office identified by me: ${state.office.trim()}.` : 'The responsible field office has not yet been identified.',
    state.outcome.trim() ? `Action requested: ${state.outcome.trim()}` : '',
  ].filter(Boolean).join('\n\n');
}

export function validateCase(state, stage = 'details') {
  const errors = {};
  if (!routeFor(state.service)) errors.service = 'Choose transfer or withdrawal, or use the help panel to understand the difference.';
  if (!state.story.trim()) errors.story = 'Describe what happened. A short explanation is enough.';
  if (!state.outcome.trim()) errors.outcome = 'Tell us what you want the office to do.';
  if (state.dateChoice === 'document' && !state.documentDate) errors.documentDate = 'Enter the date on the document or keep the date unconfirmed.';
  if (state.dateChoice === 'remembered' && !state.rememberedDate) errors.rememberedDate = 'Enter the date you remember or keep the date unconfirmed.';
  if (stage === 'review') {
    if (!state.confirmedRoute) errors.confirmedRoute = 'Review the proposed department before continuing.';
    if (!state.reviewed) errors.reviewed = 'Read the draft and confirm it reflects your test case.';
    if (state.evidence.some(e => !e.available)) errors.evidence = 'Reselect the remembered files, or remove them to continue without attachments.';
  }
  return errors;
}

export function validateFile(file) {
  if (!/\.(pdf|png|jpe?g)$/i.test(file.name)) return 'Choose PDF, PNG or JPG for this prototype.';
  if (file.size > 5 * 1024 * 1024) return 'This file exceeds the prototype’s 5 MB limit. Choose a smaller copy.';
  if (file.size === 0) return 'This file is empty. Choose another copy.';
  return '';
}

export function guidance(topic) {
  return {
    service: 'Transfer means moving PF funds or service records between employment accounts. Withdrawal means taking money out. Choose based on what you attempted. This prototype does not decide entitlement or payment eligibility.',
    office: 'You can continue preparing the draft without choosing an office. Look for the handling office on the claim response or relevant EPFO records. Your home district is not enough to establish the responsible office.',
    uan: 'You do not need to share a UAN in this research prototype. In a real case, consult your EPFO member records or employer for the identifier. Never share passwords or OTPs in a complaint.',
    evidence: 'The rejection record helps explain what the office decided. A relieving letter may help verify employment dates. Add only documents relevant to your issue. If something is missing, keep it on your checklist instead of inventing details.',
    dates: 'The dates conflict only if you have supplied different values. Check the relevant record before confirming one. Keeping the date unconfirmed preserves that uncertainty in the draft.',
    scope: 'This study prototype covers PF transfer and withdrawal complaints. RTI information requests and passport cases need their own journeys. The original research report records those gaps; this screen does not automatically route other subjects.',
  }[topic] || 'Choose a question below. Your draft stays visible and editable while you get help.';
}

export function canPrepareAppeal(state) {
  return Boolean(state.receipt && state.responseShown && state.feedback === 'poor');
}

export function finishObservation(session, outcome, understanding, now = Date.now()) {
  return { ...session, endedAt: now, elapsedSeconds: Math.max(0, Math.round((now - session.startedAt) / 1000)), outcome, understanding, source: 'moderator-entered; not inferred from click events' };
}
