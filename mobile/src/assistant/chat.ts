// Typed chat through the model. The model proposes facts with the same tool the voice path uses; the app validates
// them with the core and shows them on the facts card. Nothing the model says becomes a confirmed fact by itself.
import type { CaseBundle } from '../db/types';
import { apiBase, withTimeout } from '../config';
import { addMessage, applyCalls } from './bundle';
import { systemInstruction, toolResponse, TOOLS } from '../voice/prompt';
import { uid } from '../db/uid';

type Part = { text?: string; functionCall?: { name: string; args: unknown }; functionResponse?: { name: string; response: unknown } };
type Content = { role: 'user' | 'model'; parts: Part[] };
type Change = (bundle: CaseBundle) => CaseBundle;
export class ChatUnavailable extends Error {}

function history(bundle: CaseBundle, limit = 12): Content[] {
  return bundle.messages.slice(-limit).map(message => ({ role: message.speaker === 'citizen' ? 'user' : 'model', parts: [{ text: message.text }] } as Content));
}

async function ask(demoCode: string, system: string, contents: Content[]): Promise<Part[]> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-nivaran-demo-key': demoCode },
      body: JSON.stringify({ system, contents, tools: TOOLS }),
      signal: withTimeout(35_000),
    });
  } catch (caught) {
    throw new ChatUnavailable(caught instanceof Error ? caught.message : 'Could not reach the server.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ChatUnavailable(data.error || `Chat failed (${response.status}).`);
  return Array.isArray(data.parts) ? data.parts : [];
}

/**
 * Runs one model turn for the citizen's latest message (already stored in the bundle), applies any proposed facts,
 * and stores the model's reply. Throws ChatUnavailable when the server or key is missing so the caller can fall back.
 */
export async function runChatTurn(demoCode: string, latest: () => CaseBundle, onChange: (change: Change) => Promise<unknown>): Promise<string> {
  if (!demoCode) throw new ChatUnavailable('No demo code.');
  const before = latest();
  const contents = history(before);
  let parts = await ask(demoCode, systemInstruction(before.case), contents);
  let calls = parts.filter(part => part.functionCall).map((part, index) => ({ id: `chat:${uid()}:${index}`, name: part.functionCall!.name, args: part.functionCall!.args }));
  let reply = parts.filter(part => typeof part.text === 'string').map(part => part.text!.trim()).filter(Boolean).join(' ');

  if (calls.length) {
    let result = applyCalls(latest(), calls, { source: 'typed' }).result;
    await onChange(b => { const applied = applyCalls(b, calls, { source: 'typed' }); result = applied.result; return applied.bundle; }).catch(() => {});
    const followUp: Content[] = [
      ...contents,
      { role: 'model', parts: calls.map(call => ({ functionCall: { name: call.name, args: call.args } })) },
      { role: 'user', parts: calls.map(call => ({ functionResponse: { name: call.name, response: toolResponse(result) } })) },
    ];
    parts = await ask(demoCode, systemInstruction(latest().case), followUp);
    const more = parts.filter(part => part.functionCall).map((part, index) => ({ id: `chat:${uid()}:more:${index}`, name: part.functionCall!.name, args: part.functionCall!.args }));
    if (more.length) await onChange(b => applyCalls(b, more, { source: 'typed' }).bundle).catch(() => {});
    reply = parts.filter(part => typeof part.text === 'string').map(part => part.text!.trim()).filter(Boolean).join(' ') || reply;
  }
  if (!reply) reply = latest().case.language === 'hi' ? 'Samajh gaya. Aage batayein.' : 'Understood. Please go on.';
  await onChange(b => addMessage(b, reply, 'assistant', 'typed'));
  return reply;
}
