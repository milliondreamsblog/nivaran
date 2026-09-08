import * as SQLite from 'expo-sqlite';
import { validBundle, type CaseStore } from './types';
const database = SQLite.openDatabaseAsync('nivaran-demo.db').then(async db => {
  await db.execAsync('PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS demo_cases (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, updated_at INTEGER NOT NULL);');
  return db;
});
export const store: CaseStore = {
  async listCases() {
    const rows = await (await database).getAllAsync<{ payload: string }>('SELECT payload FROM demo_cases ORDER BY updated_at DESC');
    return rows.map(row => { const value: unknown = JSON.parse(row.payload); if (!validBundle(value)) throw new Error('A saved draft could not be restored. It has not been deleted.'); return value; });
  },
  async saveCase(bundle) {
    await (await database).runAsync('INSERT INTO demo_cases (id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at', bundle.case.id, JSON.stringify(bundle), bundle.case.updatedAt);
  },
  async deleteCase(id) { await (await database).runAsync('DELETE FROM demo_cases WHERE id = ?', id); },
};
