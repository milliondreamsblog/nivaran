import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudio } from './audio';
import { connectLive, fetchLiveToken, type LiveSession, type ToolCall } from './session';
import { systemInstruction, toolResponse, TOOLS } from './prompt';
import type { Case, ProposalResult } from '../core/index';

export type VoiceState = 'idle' | 'connecting' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'paused' | 'error';
type AudioEngine = Awaited<ReturnType<typeof createAudio>>;
export type VoiceOptions = {
  demoCode: string;
  getCase(): Case;
  /** Applies validated proposals to the case, persists, and returns the result. Must not throw. */
  applyCalls(calls: ToolCall[], cancelledIds: string[]): Promise<ProposalResult>;
  onCitizen(text: string): void;
  onAssistant(text: string): void;
};

export function useVoice(options: VoiceOptions) {
  const [state, setState] = useState<VoiceState>('idle');
  const [error, setError] = useState('');
  const [liveInput, setLiveInput] = useState('');
  const [liveOutput, setLiveOutput] = useState('');
  const [level, setLevel] = useState(0);
  const [connected, setConnected] = useState(false);
  const audio = useRef<AudioEngine | null>(null);
  const session = useRef<LiveSession | null>(null);
  const opts = useRef(options); opts.current = options;
  const cancelled = useRef<string[]>([]);
  const queue = useRef(Promise.resolve());
  const speakingSince = useRef(0);

  const connect = useCallback(async () => {
    setError(''); setState('connecting');
    try {
      if (!audio.current) { audio.current = await createAudio((data, rate, lvl) => { session.current?.sendAudio(data, rate); setLevel(lvl); }); console.log('[voice] audio engine mode', audio.current.mode); }
      const { token, model, voice } = await fetchLiveToken(opts.current.demoCode);
      console.log('[voice] token ok', model, voice);
      const live = await connectLive({ token, model, voice, systemInstruction: systemInstruction(opts.current.getCase()), tools: TOOLS }, {
        onAudio: base64 => {
          speakingSince.current = Date.now();
          if (audio.current?.mode !== 'turn') setState('speaking');
          try { audio.current?.play(base64); } catch (caught) { console.log('[voice] play failed', String(caught)); setError('Playback failed on this device.'); }
        },
        onInputTranscript: (text, final) => { setLiveInput(text); if (final) opts.current.onCitizen(text); },
        onOutputTranscript: (text, final) => { setLiveOutput(text); if (final) opts.current.onAssistant(text); },
        onToolCall: calls => {
          queue.current = queue.current.then(async () => {
            const result = await opts.current.applyCalls(calls, cancelled.current);
            session.current?.sendToolResponses(calls.map(call => ({ id: call.id, name: call.name, response: toolResponse(result) })));
          }).catch(() => {});
        },
        onToolCancel: ids => { cancelled.current = [...cancelled.current, ...ids]; },
        onTurnComplete: () => {
          console.log('[voice] turn complete');
          // In turn mode the reply becomes audible only now, so the state flips to speaking here.
          if (audio.current?.mode === 'turn') setState('speaking');
          audio.current?.finishTurn()
            .catch(caught => { console.log('[voice] finishTurn failed', String(caught)); setError('Playback failed on this device.'); })
            .then(() => setState(current => (current === 'speaking' || current === 'thinking' ? 'ready' : current)));
        },
        onInterrupted: () => { audio.current?.stopPlayback(); },
        onError: message => { setError(message); setState('error'); },
        onClose: () => { session.current = null; setConnected(false); setState(current => (current === 'error' ? current : 'paused')); },
        onGoAway: () => { setState('paused'); },
      });
      session.current = live; setConnected(true); setState('ready');
      return true;
    } catch (caught) {
      console.log('[voice] connect failed', String(caught));
      setError(caught instanceof Error ? caught.message : 'Voice is unavailable right now.'); setState('error');
      return false;
    }
  }, []);

  const pressStart = useCallback(async () => {
    if (!session.current?.open && !(await connect())) return;
    audio.current?.stopPlayback();
    setLiveInput(''); setLiveOutput('');
    try {
      session.current!.startTurn();
      await audio.current!.startCapture();
      console.log('[voice] listening');
      setState('listening');
    } catch (caught) {
      console.log('[voice] capture failed', String(caught));
      // The turn was already opened; close it so the model does not wait for audio that never comes.
      session.current?.endTurn();
      setError(caught instanceof Error ? caught.message : 'The microphone could not start.'); setState('error');
    }
  }, [connect]);

  const pressEnd = useCallback(async () => {
    await audio.current?.stopCapture();
    setLevel(0);
    if (session.current?.open) { session.current.endTurn(); setState('thinking'); }
  }, []);

  const sendText = useCallback((text: string) => {
    if (!session.current?.open) return false;
    audio.current?.stopPlayback();
    setLiveOutput(''); session.current.sendText(text); setState('thinking');
    return true;
  }, []);

  const sendContext = useCallback((text: string) => { session.current?.sendContext(text); }, []);

  const stop = useCallback(() => { audio.current?.stopPlayback(); setState(session.current?.open ? 'ready' : 'idle'); }, []);

  const disconnect = useCallback(async () => {
    session.current?.close(); session.current = null; setConnected(false);
    await audio.current?.close(); audio.current = null;
    setState('idle');
  }, []);

  useEffect(() => () => { session.current?.close(); audio.current?.close(); }, []);

  return { state, error, liveInput, liveOutput, level, connected, connect, pressStart, pressEnd, sendText, sendContext, stop, disconnect };
}
