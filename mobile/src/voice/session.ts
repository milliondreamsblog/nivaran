import { apiBase, LIVE_TOKEN_PATH, withTimeout } from '../config';

const ENDPOINT = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

export type ToolCall = { id: string; name: string; args: unknown };
export type LiveEvents = {
  onOpen?(): void;
  onClose?(reason: string): void;
  onError?(message: string): void;
  onInputTranscript?(text: string, final: boolean): void;
  onOutputTranscript?(text: string, final: boolean): void;
  onAudio?(base64: string): void;
  onToolCall?(calls: ToolCall[]): void;
  onToolCancel?(ids: string[]): void;
  onTurnComplete?(): void;
  onInterrupted?(): void;
  onGoAway?(): void;
};
export type LiveConfig = { token: string; model: string; voice: string; systemInstruction: string; tools: unknown[] };
export type LiveSession = {
  readonly open: boolean;
  startTurn(): void;
  sendAudio(base64: string, rate: number): void;
  endTurn(): void;
  sendText(text: string): void;
  /** Adds context without asking the model to reply. Use after edits made on screen. */
  sendContext(text: string): void;
  sendToolResponses(responses: { id: string; name: string; response: unknown }[]): void;
  close(): void;
};

export async function fetchLiveToken(demoCode: string): Promise<{ token: string; model: string; voice: string; expiresAt: string }> {
  const response = await fetch(`${apiBase()}${LIVE_TOKEN_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-nivaran-demo-key': demoCode },
    body: '{}',
    signal: withTimeout(12_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Voice could not start (${response.status}).`);
  if (typeof data.token !== 'string') throw new Error('Voice could not start: no session token.');
  return data;
}

function decodeUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  try { return decodeURIComponent(escape(out)); } catch { return out; }
}

/** Transcription pieces arrive as fragments; some servers resend the whole text so far. Handle both. */
function merge(sofar: string, piece: string): string {
  if (!piece) return sofar;
  if (piece.startsWith(sofar) && piece.length >= sofar.length) return piece;
  return sofar + piece;
}

const log = (...parts: unknown[]) => console.log('[voice]', ...parts);

export function connectLive(config: LiveConfig, events: LiveEvents): Promise<LiveSession> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${ENDPOINT}?access_token=${encodeURIComponent(config.token)}`);
    try { (ws as unknown as { binaryType: string }).binaryType = 'arraybuffer'; } catch (caught) { log('binaryType not settable', String(caught)); }
    let ready = false, closed = false, inputText = '', outputText = '', audioChunks = 0;
    const send = (message: unknown) => { if (ws.readyState === 1) ws.send(JSON.stringify(message)); };
    const fail = (message: string) => { log('fail', message); if (!ready) reject(new Error(message)); events.onError?.(message); };
    // The handshake must answer within a bounded time or the button would spin forever.
    const handshake = setTimeout(() => { if (!ready) { fail('The voice service did not answer in time.'); try { ws.close(); } catch {} } }, 15_000);
    log('connecting', config.model);

    const session: LiveSession = {
      get open() { return ready && !closed && ws.readyState === 1; },
      startTurn() { inputText = ''; send({ realtimeInput: { activityStart: {} } }); },
      sendAudio(base64, rate) { send({ realtimeInput: { audio: { data: base64, mimeType: `audio/pcm;rate=${rate}` } } }); },
      endTurn() { send({ realtimeInput: { activityEnd: {} } }); },
      sendText(text) { outputText = ''; send({ clientContent: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true } }); },
      sendContext(text) { send({ clientContent: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: false } }); },
      sendToolResponses(responses) { send({ toolResponse: { functionResponses: responses.map(r => ({ id: r.id, name: r.name, response: r.response })) } }); },
      close() { closed = true; try { ws.close(); } catch {} },
    };

    ws.onopen = () => {
      log('socket open, sending setup');
      send({ setup: {
        model: `models/${config.model}`,
        generationConfig: {
          responseModalities: ['AUDIO'],
          temperature: 0.3,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voice } } },
        },
        systemInstruction: { parts: [{ text: config.systemInstruction }] },
        tools: config.tools,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        realtimeInputConfig: { automaticActivityDetection: { disabled: true } },
      } });
    };

    ws.onmessage = async (event: { data: unknown }) => {
      let text: string;
      const data = event.data;
      try {
        if (typeof data === 'string') text = data;
        else if (data instanceof ArrayBuffer) text = decodeUtf8(new Uint8Array(data));
        else if (data && typeof (data as { text?: unknown }).text === 'function') text = await (data as { text(): Promise<string> }).text();
        else if (data && typeof (data as { arrayBuffer?: unknown }).arrayBuffer === 'function') text = decodeUtf8(new Uint8Array(await (data as { arrayBuffer(): Promise<ArrayBuffer> }).arrayBuffer()));
        else { log('unreadable frame', Object.prototype.toString.call(data)); return; }
      } catch (caught) { log('frame decode failed', String(caught)); return; }
      let message: any;
      try { message = JSON.parse(text); } catch { log('non-JSON frame', text.slice(0, 80)); return; }

      if (message.setupComplete) { clearTimeout(handshake); ready = true; log('setup complete'); events.onOpen?.(); resolve(session); return; }
      if (message.error) { fail(message.error.message || 'The voice service reported an error.'); return; }
      const content = message.serverContent;
      if (content) {
        if (content.interrupted) events.onInterrupted?.();
        for (const part of content.modelTurn?.parts ?? []) if (part.inlineData?.data) { if (++audioChunks === 1) log('first audio chunk'); events.onAudio?.(part.inlineData.data); }
        if (content.inputTranscription?.text) { inputText = merge(inputText, content.inputTranscription.text); events.onInputTranscript?.(inputText, false); }
        if (content.outputTranscription?.text) { outputText = merge(outputText, content.outputTranscription.text); events.onOutputTranscript?.(outputText, false); }
        if (content.turnComplete) {
          if (inputText.trim()) events.onInputTranscript?.(inputText, true);
          if (outputText.trim()) events.onOutputTranscript?.(outputText, true);
          inputText = ''; outputText = '';
          events.onTurnComplete?.();
        }
      }
      if (Array.isArray(message.toolCall?.functionCalls)) { log('tool call', message.toolCall.functionCalls.map((c: ToolCall) => c.name).join(',')); events.onToolCall?.(message.toolCall.functionCalls); }
      if (Array.isArray(message.toolCallCancellation?.ids)) events.onToolCancel?.(message.toolCallCancellation.ids);
      if (message.goAway) { log('goAway'); events.onGoAway?.(); }
    };
    ws.onerror = (event: unknown) => { log('socket error', (event as { message?: string })?.message ?? ''); fail('Could not reach the voice service.'); };
    ws.onclose = (event: { code?: number; reason?: string }) => {
      closed = true; clearTimeout(handshake);
      log('socket closed', event?.code ?? '', event?.reason ?? '');
      if (!ready) reject(new Error(event.reason || 'The voice connection closed before it was ready.'));
      events.onClose?.(event.reason || '');
    };
  });
}
