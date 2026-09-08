// Run after `npm run build`. Boots only a local server with fixture extraction enabled.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const code = randomBytes(24).toString('hex');
const base = 'http://127.0.0.1:3142';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3142'], {
  cwd: root, env: { ...process.env, NIVARAN_DEMO_KEY: code, NIVARAN_EXTRACT_MODE: 'fixture', GEMINI_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
});
let output = '';
server.stdout.on('data', chunk => { output = (output + chunk).slice(-8000); });
server.stderr.on('data', chunk => { output = (output + chunk).slice(-8000); });
try {
  await Promise.race([
    (async () => {
      for (let attempt = 0; attempt < 60; attempt++) {
        if (server.exitCode !== null) throw new Error(output);
        if (output.includes('Ready in')) return;
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      throw new Error(`Server did not become ready: ${output}`);
    })(),
    once(server, 'error').then(([error]) => { throw error; }),
  ]);
  const bytes = await readFile(new URL('../../../assets/fixtures/relieving-letter.png', import.meta.url));
  const body = JSON.stringify({ mime: 'image/png', base64: bytes.toString('base64'), purpose: 'relieving_letter' });
  const denied = await fetch(`${base}/api/extract`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  assert.equal(denied.status, 401);
  const accepted = await fetch(`${base}/api/extract`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-nivaran-demo-key': code }, body });
  assert.equal(accepted.status, 200);
  const result = await accepted.json();
  assert.equal(result.simulated, true);
  assert.equal(result.dates[0].value_iso, '2025-03-31');
  assert.equal(result.fallback_reason, 'fixture_mode');
  console.log(JSON.stringify({ unauthorized: denied.status, fixture: accepted.status, simulated: result.simulated, exitDate: result.dates[0].value_iso, paidCalls: 0 }));
} finally {
  server.kill();
  if (server.exitCode === null) await once(server, 'exit');
}
