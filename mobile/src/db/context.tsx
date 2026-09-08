// In-memory list of case bundles plus a serialised write queue to the platform store.
// `update(id, change)` publishes the new bundle immediately and flips the save status only after the write resolves.
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { store } from './store';
import type { CaseBundle } from './types';
import { createCase, type Case, type Message } from '../core/index';
import { uid } from './uid';

export { uid };
export function message(caseId: string, text: string, speaker: Message['speaker'] = 'assistant', mode: Message['mode'] = 'guided'): Message {
  return { id: uid(), caseId, text, speaker, mode, state: 'final', createdAt: Date.now() };
}
type ContextValue = {
  bundles: CaseBundle[]; ready: boolean; error: string; statuses: Record<string, 'saving' | 'saved' | 'error'>;
  create(language?: 'hi' | 'en'): Promise<CaseBundle>;
  update(id: string, change: (bundle: CaseBundle) => CaseBundle): Promise<CaseBundle>;
  retry(id: string): Promise<void>;
};
const Context = createContext<ContextValue | null>(null);
export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [bundles, setBundles] = useState<CaseBundle[]>([]), [ready, setReady] = useState(false), [error, setError] = useState('');
  const [statuses, setStatuses] = useState<ContextValue['statuses']>({});
  const current = useRef<CaseBundle[]>([]), tail = useRef(Promise.resolve());
  useEffect(() => { store.listCases().then(data => { current.current = data; setBundles(data); setReady(true); }).catch(e => { setError(String(e.message)); setReady(true); }); }, []);
  function persist(bundle: CaseBundle): Promise<void> {
    setStatuses(s => ({ ...s, [bundle.case.id]: 'saving' }));
    const operation = tail.current.catch(() => {}).then(() => store.saveCase(bundle));
    tail.current = operation;
    return operation.then(() => { if (current.current.find(b => b.case.id === bundle.case.id) === bundle) setStatuses(s => ({ ...s, [bundle.case.id]: 'saved' })); }).catch(e => { setStatuses(s => ({ ...s, [bundle.case.id]: 'error' })); setError('Couldn’t save this draft. Keep this screen open and retry.'); throw e; });
  }
  function publish(bundle: CaseBundle) {
    current.current = [bundle, ...current.current.filter(b => b.case.id !== bundle.case.id)];
    setBundles(current.current);
  }
  const value: ContextValue = {
    bundles, ready, error, statuses,
    async create(language = 'en') {
      if (error && current.current.length === 0) throw new Error(error);
      const caseData: Case = createCase({ id: uid(), language });
      const bundle: CaseBundle = { version: 1, case: caseData, messages: [], evidence: [] };
      publish(bundle); await persist(bundle); return bundle;
    },
    async update(id, change) {
      const previous = current.current.find(b => b.case.id === id);
      if (!previous) throw new Error('This draft could not be found.');
      const bundle = change(previous);
      if (bundle.case.id !== id) throw new Error('Cannot change case identity.');
      publish(bundle); await persist(bundle); return bundle;
    },
    async retry(id) { const bundle = current.current.find(b => b.case.id === id); if (bundle) { await persist(bundle); setError(''); } },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCases() { const value = useContext(Context); if (!value) throw new Error('Missing cases provider'); return value; }
