import test from 'node:test';
import assert from 'node:assert/strict';
import { createLiveTokenHandler } from '../app/api/live-token/handler.mjs';

const key = 'demo-code';
const request = (code = key, ip = '10.0.0.1') => new Request('http://localhost/api/live-token', { method: 'POST', headers: { 'x-nivaran-demo-key': code, 'x-forwarded-for': ip } });
const okFetch = async () => Response.json({ name: 'auth_tokens/abc123' });

test('missing configuration, wrong demo code and missing provider key fail closed', async () => {
  const fetchImpl = async () => { throw new Error('must not reach network'); };
  assert.equal((await createLiveTokenHandler({ env: () => ({}), fetchImpl })(request())).status, 503);
  assert.equal((await createLiveTokenHandler({ env: () => ({ NIVARAN_DEMO_KEY: key }), fetchImpl })(request('wrong'))).status, 401);
  assert.equal((await createLiveTokenHandler({ env: () => ({ NIVARAN_DEMO_KEY: key }), fetchImpl })(request())).status, 503);
});

test('a valid request returns the token name, model and voice, and sends the key only as a header', async () => {
  let seen;
  const handle = createLiveTokenHandler({
    env: () => ({ NIVARAN_DEMO_KEY: key, GEMINI_API_KEY: 'secret', LIVE_MODEL: 'gemini-2.5-flash-native-audio-preview-12-2025' }),
    fetchImpl: async (url, options) => { seen = { url, options }; return okFetch(); },
    now: () => 1_000_000,
  });
  const response = await handle(request());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.token, 'auth_tokens/abc123');
  assert.equal(body.model, 'gemini-2.5-flash-native-audio-preview-12-2025');
  assert.equal(body.voice, 'Kore');
  assert.ok(!seen.url.includes('secret'));
  assert.equal(seen.options.headers['x-goog-api-key'], 'secret');
  const sent = JSON.parse(seen.options.body);
  assert.equal(sent.uses, 1);
  assert.equal(sent.liveConnectConstraints, undefined);
  assert.equal(new Date(sent.expireTime).getTime(), 1_000_000 + 30 * 60_000);
});

test('the model lock is opt-in', async () => {
  let sent;
  const handle = createLiveTokenHandler({ env: () => ({ NIVARAN_DEMO_KEY: key, GEMINI_API_KEY: 'k', LIVE_TOKEN_LOCK_MODEL: '1' }), fetchImpl: async (_url, options) => { sent = JSON.parse(options.body); return okFetch(); } });
  await handle(request());
  assert.deepEqual(sent.liveConnectConstraints, { model: 'gemini-3.1-flash-live-preview' });
});

test('provider failures become a 502 with a citizen-readable message and never leak the key', async () => {
  for (const fetchImpl of [async () => new Response('', { status: 429 }), async () => { throw new Error('boom'); }, async () => Response.json({})]) {
    const response = await createLiveTokenHandler({ env: () => ({ NIVARAN_DEMO_KEY: key, GEMINI_API_KEY: 'secret' }), fetchImpl })(request());
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes('secret'));
  }
});

test('ten tokens an hour per network, then 429, then the window resets', async () => {
  let now = 0;
  const handle = createLiveTokenHandler({ env: () => ({ NIVARAN_DEMO_KEY: key, GEMINI_API_KEY: 'k' }), fetchImpl: okFetch, now: () => now });
  for (let i = 0; i < 10; i++) assert.equal((await handle(request())).status, 200);
  assert.equal((await handle(request())).status, 429);
  assert.equal((await handle(request(key, '10.0.0.2'))).status, 200);
  now += 3_600_000;
  assert.equal((await handle(request())).status, 200);
});
