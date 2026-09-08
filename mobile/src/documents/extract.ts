import { checkDocument } from './check';
import { apiBase, EXTRACT_PATH, withTimeout } from '../config';
import type { LocalDocument } from './types';
import type { Check } from '../assistant/bundle';

/**
 * Local fixture match first: instant, offline, always labelled simulated.
 * With a demo code the backend is tried too; in live mode it returns a real extraction from gemini-2.5-flash.
 */
export async function extractDocument(file: LocalDocument, purpose: string, demoCode: string): Promise<Check> {
  const local = await checkDocument(file);
  if (!local.extraction) return { ...local, source: 'none' };
  if (!demoCode || !['image/png', 'image/jpeg'].includes(file.mime)) return { ...local, source: 'fixture' };
  try {
    const response = await fetch(`${apiBase()}${EXTRACT_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-nivaran-demo-key': demoCode },
      body: JSON.stringify({ mime: file.mime, base64: file.base64, purpose }),
      signal: withTimeout(15_000),
    });
    if (!response.ok) return { ...local, source: 'fixture' };
    const { simulated, sha256, fallback_reason: _reason, ...extraction } = await response.json();
    return { extraction, simulated: !!simulated, hash: sha256 || local.hash, source: 'backend' };
  } catch {
    return { ...local, source: 'fixture' };
  }
}
