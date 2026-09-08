import test from 'node:test';
import assert from 'node:assert/strict';
import { createChatHandler } from '../app/api/chat/handler.mjs';

const key = 'demo-code';
const good = { system: 'You are Nivaran.', contents: [{ role: 'user', parts: [{ text: 'Mera PF transfer reject ho gaya' }] }], tools: [{ functionDeclarations: [{ name: 'propose_facts' }] }] };
const request = (body = good, code = key) => new Request('http://localhost/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-nivaran-demo-key': code }, body: JSON.stringify(body) });

test('fails closed without configuration, demo code or provider key', async () => {
  const fetchImpl = async () => { throw new Error('must not reach network'); };
  assert.equal((await createChatHandler({ env: () => ({}), fetchImpl })(request())).status, 503);
  assert.equal((await createChatHandler({ env: () => ({ NIVARAN_DEMO_KEY: key }), fetchImpl })(request(good, 'wrong'))).status, 401);
  assert.equal((await createChatHandler({ env: () => ({ NIVARAN_DEMO_KEY: key }), fetchImpl })(request())).status, 503);
});

test('rejects malformed conversations before calling the model', async () => {
  let calls = 0;
  const handle = createChatHandler({ env: () => ({ NIVARAN_DEMO_KEY: key, GEMINI_API_KEY: 'k' }), fetchImpl: async () => { calls++; } });
  for (const body of [{}, { system: '', contents: [] }, { system: 'x', contents: [{ role: 'system', parts: [{ text: 'no' }] }] }, { system: 'x', contents: [{ role: 'user', parts: [] }] }]) {
    assert.equal((await handle(request(body))).status, 400);
  }
  assert.equal(calls, 0);
});

test('forwards the conversation with the key in a header and returns text and function-call parts only', async () => {
  let seen;
  const handle = createChatHandler({ env: () => ({ NIVARAN_DEMO_KEY: key, GEMINI_API_KEY: 'secret' }), fetchImpl: async (url, options) => {
    seen = { url, body: JSON.parse(options.body), headers: options.headers };
    return Response.json({ candidates: [{ content: { parts: [{ functionCall: { name: 'propose_facts', args: { revision: 0, facts: [] } } }, { text: 'Samajh gaya.' }, { thought: true }] } }] });
  } });
  const response = await handle(request());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(!seen.url.includes('secret'));
  assert.equal(seen.headers['x-goog-api-key'], 'secret');
  assert.equal(seen.body.systemInstruction.parts[0].text, 'You are Nivaran.');
  assert.deepEqual(seen.body.contents, good.contents);
  assert.deepEqual(body.parts, [{ functionCall: { name: 'propose_facts', args: { revision: 0, facts: [] } } }, { text: 'Samajh gaya.' }]);
});

test('provider failures become 502 with a readable message', async () => {
  for (const fetchImpl of [async () => new Response('', { status: 429 }), async () => { throw new Error('boom'); }, async () => Response.json({})]) {
    const response = await createChatHandler({ env: () => ({ NIVARAN_DEMO_KEY: key, GEMINI_API_KEY: 'secret' }), fetchImpl })(request());
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes('secret'));
  }
});
