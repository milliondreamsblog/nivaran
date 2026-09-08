import { timingSafeEqual } from 'node:crypto';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const MAX_BODY_BYTES = 256 * 1024;
const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });

function sameKey(given, expected) {
  const actual = Buffer.from(given || ''), wanted = Buffer.from(expected);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validPart = part => record(part) && (typeof part.text === 'string' || record(part.functionCall) || record(part.functionResponse));
const validContent = item => record(item) && (item.role === 'user' || item.role === 'model') && Array.isArray(item.parts) && item.parts.length > 0 && item.parts.every(validPart);

/**
 * One typed chat turn: the app sends the system instruction, the tool declarations and the conversation in Gemini's
 * own content format; the server adds the key and returns the model's parts (text and function calls) unchanged.
 * The app validates every proposed fact itself; nothing here can change a case.
 */
export function createChatHandler({ env = () => process.env, fetchImpl = (...args) => fetch(...args), now = Date.now } = {}) {
  let windowStarted = 0, attempts = 0;
  return async function POST(request) {
    const config = env();
    if (!config.NIVARAN_DEMO_KEY) return json({ error: 'Chat is not configured on this server.' }, 503);
    if (!sameKey(request.headers.get('x-nivaran-demo-key'), config.NIVARAN_DEMO_KEY)) return json({ error: 'Demo code required.' }, 401);
    if (!config.GEMINI_API_KEY) return json({ error: 'Chat is not enabled on this server.' }, 503);
    if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return json({ error: 'Request too large.' }, 413);
    const timestamp = now();
    if (timestamp - windowStarted >= 60_000) { windowStarted = timestamp; attempts = 0; }
    if (++attempts > 60) return json({ error: 'Too many messages. Please wait a minute.' }, 429);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON request.' }, 400); }
    if (!record(body) || typeof body.system !== 'string' || !body.system.trim() || !Array.isArray(body.contents) || !body.contents.length || body.contents.length > 40 || !body.contents.every(validContent) || (body.tools !== undefined && !Array.isArray(body.tools))) {
      return json({ error: 'Send system, contents and optional tools.' }, 400);
    }
    // CHAT_FALLBACK_MODEL may list several models separated by commas. A backup key from a second Google project
    // has its own free quota; it is used only when a model answers 429 on the primary key.
    const fallbacks = (config.CHAT_FALLBACK_MODEL || '').split(',').map(m => m.trim()).filter(Boolean);
    const models = [config.CHAT_MODEL || DEFAULT_MODEL, ...fallbacks];
    const keys = [config.GEMINI_API_KEY, ...(config.GEMINI_API_KEY_BACKUP ? [config.GEMINI_API_KEY_BACKUP] : [])];
    // gemini-2.5 models think before answering by default, which took up to 30 s here; a two-sentence chat reply does not need it.
    const payloadFor = model => JSON.stringify({
      systemInstruction: { parts: [{ text: body.system }] },
      contents: body.contents,
      tools: body.tools,
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024, ...(model.startsWith('gemini-2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}) },
    });
    // Gemini sometimes answers 503 (overloaded), 429 (quota) or hangs; a chat reply is useless after ~12 s, so each
    // attempt is bounded and the next model gets its turn. Every model is tried on the primary key, then on the backup.
    const order = keys.flatMap(key => models.map(model => ({ key, model })));
    let response = null, model = models[0], lastFailure = 'Could not reach the model.';
    for (const [index, attempt] of order.entries()) {
      model = attempt.model;
      if (index > 0) await new Promise(resolve => setTimeout(resolve, 600));
      try {
        response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': attempt.key },
          signal: AbortSignal.timeout(12_000),
          body: payloadFor(model),
        });
      } catch {
        response = null; lastFailure = 'The model took too long to answer.';
        continue;
      }
      if (response.ok || (response.status !== 503 && response.status !== 429 && response.status !== 404)) break;
      lastFailure = response.status === 429 ? 'The free chat quota is used up for now.' : `The model refused the request (${response.status}).`;
      response = null;
    }
    try {
      if (!response) return json({ error: lastFailure }, 502);
      if (!response.ok) {
        return json({ error: response.status === 429 ? 'The free chat quota is used up for now.' : `The model refused the request (${response.status}).` }, 502);
      }
      const payload = await response.json();
      const parts = payload?.candidates?.[0]?.content?.parts;
      if (!Array.isArray(parts)) return json({ error: 'The model returned no reply.' }, 502);
      return json({ model, parts: parts.filter(validPart).map(part => (typeof part.text === 'string' ? { text: part.text } : part.functionCall ? { functionCall: { name: String(part.functionCall.name || ''), args: record(part.functionCall.args) ? part.functionCall.args : {} } } : null)).filter(Boolean) });
    } catch {
      return json({ error: 'Could not reach the model.' }, 502);
    }
  };
}
