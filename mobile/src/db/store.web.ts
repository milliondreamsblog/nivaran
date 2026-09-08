import { validBundle, type CaseStore } from './types';
const PREFIX = 'nivaran.case.';
export const store: CaseStore = {
  async listCases() {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      let parsed: unknown;
      try { parsed = JSON.parse(localStorage.getItem(key)!); } catch { throw new Error('A saved draft could not be read. Your stored data has not been deleted.'); }
      if (!validBundle(parsed)) throw new Error('A saved draft uses an unsupported format. Your stored data has not been deleted.');
      result.push(parsed);
    }
    return result.sort((a, b) => b.case.updatedAt - a.case.updatedAt);
  },
  async saveCase(bundle) { localStorage.setItem(`${PREFIX}${bundle.case.id}`, JSON.stringify(bundle)); },
  async deleteCase(id) { localStorage.removeItem(`${PREFIX}${id}`); },
};
