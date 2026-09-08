// Offline document check: hashes the file and looks it up in the fixture manifest. Only the two sample documents match.
import * as Crypto from 'expo-crypto';
import { toByteArray } from 'base64-js';
import manifest from '../core/fixtures/extractions.json';
import type { LocalDocument } from './types';
import type { Extraction } from '../core/index';
export async function checkDocument(file: LocalDocument): Promise<{ extraction: Extraction | null; simulated: boolean; hash: string }> {
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, new Uint8Array(toByteArray(file.base64)));
  const hash = Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('');
  const entry = (manifest as Record<string, { extraction: Extraction }>)[hash];
  return { extraction: entry?.extraction ?? null, simulated: !!entry, hash };
}
