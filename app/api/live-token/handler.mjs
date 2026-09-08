import { timingSafeEqual } from 'node:crypto';

const DEFAULT_MODEL = 'gemini-3.1-flash-live-preview';
const DEFAULT_VOICE = 'Kore';
const TOKENS_PER_HOUR = 10;
const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });

function sameKey(given, expected) {
  const actual = Buffer.from(given || ''), wanted = Buffer.from(expected);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}

/**
 * Issues a short-lived Gemini Live ephemeral token. The permanent API key never leaves the server.
 * Dependencies are injectable so tests never touch the network.
 */
export function createLiveTokenHandler({ env = () => process.env, fetchImpl = (...args) => fetch(...args), now = Date.now } = {}) {
  // Per-instance brake: the web bundle carries the demo code, so one network cannot drain the free quota.
  const buckets = new Map();
  return async function POST(request) {
    const config = env();
    if (!config.NIVARAN_DEMO_KEY) return json({ error: 'Voice demo is not configured on this server.' }, 503);
    if (!sameKey(request.headers.get('x-nivaran-demo-key'), config.NIVARAN_DEMO_KEY)) return json({ error: 'Demo code required.' }, 401);
    if (!config.GEMINI_API_KEY) return json({ error: 'Voice is not enabled on this server.' }, 503);

    const timestamp = now();
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
    const bucket = buckets.get(ip);
    if (!bucket || timestamp - bucket.start >= 3_600_000) buckets.set(ip, { start: timestamp, count: 1 });
    else if (++bucket.count > TOKENS_PER_HOUR) return json({ error: 'Too many voice sessions from this network. Try again in an hour.' }, 429);
    if (buckets.size > 1000) buckets.clear();

    const model = config.LIVE_MODEL || DEFAULT_MODEL;
    const voice = config.LIVE_VOICE || DEFAULT_VOICE;
    const expireTime = new Date(timestamp + 30 * 60_000).toISOString();
    const newSessionExpireTime = new Date(timestamp + 2 * 60_000).toISOString();
    const body = { uses: 1, expireTime, newSessionExpireTime };
    if (config.LIVE_TOKEN_LOCK_MODEL === '1') body.liveConnectConstraints = { model };
    try {
      // A backup key from a second Google project has its own free quota; used only after a 429 on the primary key.
      const keys = [config.GEMINI_API_KEY, ...(config.GEMINI_API_KEY_BACKUP ? [config.GEMINI_API_KEY_BACKUP] : [])];
      let response = null;
      for (const key of keys) {
        response = await fetchImpl('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10_000),
        });
        if (response.status !== 429) break;
      }
      if (!response.ok) {
        return json({ error: response.status === 429 ? 'The free voice quota is used up for now. Keep typing or use guided questions.' : `The voice service refused to start a session (${response.status}).` }, 502);
      }
      const data = await response.json();
      if (typeof data?.name !== 'string' || !data.name) return json({ error: 'Unexpected token response.' }, 502);
      return json({ token: data.name, model, voice, expiresAt: expireTime });
    } catch {
      return json({ error: 'Could not reach the voice service.' }, 502);
    }
  };
}
