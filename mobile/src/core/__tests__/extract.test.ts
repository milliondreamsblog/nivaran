import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createExtractHandler, validateExtraction } from '../../../../app/api/extract/handler.mjs';

const manifest = JSON.parse(readFileSync(new URL('../fixtures/extractions.json', import.meta.url), 'utf8'));
const bytes = readFileSync(new URL('../../../assets/fixtures/relieving-letter.png', import.meta.url));
const base64 = bytes.toString('base64');
const fixture = manifest[createHash('sha256').update(bytes).digest('hex')];
const key = 'test-demo-code';
const request = (body: unknown = { mime: 'image/png', base64, purpose: 'relieving_letter' }, code = key) => new Request('http://localhost/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-nivaran-demo-key': code }, body: JSON.stringify(body) });

test('both PNG fixture hashes match the manifest and extraction schema', () => {
  assert.equal(Object.keys(manifest).length, 2);
  for (const [hash, entry] of Object.entries(manifest) as [string, any][]) {
    const file = readFileSync(new URL(`../../../assets/fixtures/${entry.file}`, import.meta.url));
    assert.equal(createHash('sha256').update(file).digest('hex'), hash);
    assert.equal(validateExtraction(entry.extraction), true);
  }
});
test('missing configuration and wrong demo code fail closed without provider calls', async () => {
  const fetchImpl = async () => { throw new Error('Must not reach network'); };
  assert.equal((await createExtractHandler({ env: () => ({}), fetchImpl })(request())).status, 503);
  const handle = createExtractHandler({ env: () => ({ NIVARAN_DEMO_KEY: key }), fetchImpl });
  assert.equal((await handle(request(undefined, 'wrong'))).status, 401);
  assert.equal((await handle(request(undefined, ''))).status, 401);
});
test('fixture mode is the default even if an API key exists', async () => {
  let calls = 0;
  const handle = createExtractHandler({ env: () => ({ NIVARAN_DEMO_KEY: key, GEMINI_API_KEY: 'not-a-real-key' }), fetchImpl: async () => { calls++; } });
  const response = await handle(request());
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.simulated, true);
  assert.equal(result.dates[0].value_iso, '2025-03-31');
  assert.equal(result.fallback_reason, 'fixture_mode');
  assert.equal(calls, 0);
});
test('invalid base64, spoofed MIME, oversized requests and unknown documents fail without guesses', async () => {
  let calls = 0;
  const handle = createExtractHandler({ env: () => ({ NIVARAN_DEMO_KEY: key, NIVARAN_EXTRACT_MODE: 'live', GEMINI_API_KEY: 'test' }), fetchImpl: async () => { calls++; } });
  assert.equal((await handle(request({ mime: 'image/png', base64: 'not base64', purpose: 'other' }))).status, 400);
  assert.equal((await handle(request({ mime: 'image/jpeg', base64, purpose: 'other' }))).status, 400);
  const differentBytes = Buffer.concat([bytes, Buffer.from('changed')]);
  assert.equal((await handle(request({ mime: 'image/png', base64: differentBytes.toString('base64'), purpose: 'other' }))).status, 422);
  const oversized = new Request('http://localhost/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-nivaran-demo-key': key, 'content-length': '5000000' }, body: '{}' });
  assert.equal((await handle(oversized)).status, 413);
  assert.equal(calls, 0);
});
test('valid mocked live response is marked actual, missing key and provider failures use labelled fixture fallback', async () => {
  const live = { NIVARAN_DEMO_KEY: key, NIVARAN_EXTRACT_MODE: 'live', GEMINI_API_KEY: 'test' };
  let calls = 0;
  const handle = createExtractHandler({ env: () => live, fetchImpl: async (url: string, options: any) => {
    calls++;
    assert.ok(!url.includes('key='));
    assert.equal(options.headers['x-goog-api-key'], 'test');
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(fixture.extraction) }] } }] });
  } });
  const result = await (await handle(request())).json();
  assert.equal(result.simulated, false);
  assert.equal(calls, 1);
  for (const fetchImpl of [async () => new Response('', { status: 429 }), async () => { throw new Error('timeout'); }, async () => Response.json({ candidates: [{ finishReason: 'MAX_TOKENS' }] })]) {
    const fallback = await (await createExtractHandler({ env: () => live, fetchImpl })(request())).json();
    assert.equal(fallback.simulated, true);
    assert.equal(fallback.dates[0].value_iso, '2025-03-31');
  }
  assert.equal((await (await createExtractHandler({ env: () => ({ ...live, GEMINI_API_KEY: '' }) })(request())).json()).simulated, true);
});
test('schema rejects impossible dates, out-of-range confidence and injected extra fields', async () => {
  for (const invalid of [
    { ...fixture.extraction, confidence: 2 }, { ...fixture.extraction, instruction: 'submit' },
    { ...fixture.extraction, dates: [{ label: 'exit date', value_iso: '2025-02-30', text: '30 Feb' }] },
  ]) assert.equal(validateExtraction(invalid), false);
  const handle = createExtractHandler({ env: () => ({ NIVARAN_DEMO_KEY: key, NIVARAN_EXTRACT_MODE: 'live', GEMINI_API_KEY: 'test' }), fetchImpl: async () => Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"invented":true}' }] } }] }) });
  assert.equal((await (await handle(request())).json()).fallback_reason, 'invalid_response');
});
test('per-instance request brake expires rather than retrying the provider indefinitely', async () => {
  let now = 60_000;
  const handle = createExtractHandler({ env: () => ({ NIVARAN_DEMO_KEY: key }), now: () => now });
  for (let count = 0; count < 20; count++) assert.equal((await handle(request())).status, 200);
  assert.equal((await handle(request())).status, 429);
  now += 60_000;
  assert.equal((await handle(request())).status, 200);
});
