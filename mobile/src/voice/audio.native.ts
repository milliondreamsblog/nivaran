import { AudioModule, createAudioPlayer, requestRecordingPermissionsAsync, setAudioModeAsync, type AudioPlayer, type AudioStream, type AudioStreamBuffer } from 'expo-audio';
import * as FS from 'expo-file-system/legacy';
import { fromByteArray, toByteArray } from 'base64-js';

/**
 * Phone audio. Capture: expo-audio AudioStream at 16 kHz int16 mono (works in Expo Go and dev builds).
 * Playback, two modes:
 *  - 'stream': react-native-audio-api scheduled buffers at 24 kHz, gapless. Needs a dev build.
 *  - 'turn': Expo Go fallback. The reply is collected into one WAV and played when the turn ends.
 * Same shape as audio.web.ts so the voice hook does not know the platform.
 */
type StreamContext = {
  currentTime: number; destination: unknown;
  createBuffer(channels: number, length: number, rate: number): { duration: number; copyToChannel(data: Float32Array, channel: number, start?: number): void };
  createBufferSource(): { buffer: unknown; connect(node: unknown): void; start(when?: number): void; stop(): void; onEnded: null | (() => void) };
  close(): Promise<void>;
};

function loadStreamContext(): StreamContext | null {
  try {
    // Lazy so Expo Go, which lacks the native module, falls back instead of crashing at import time.
    const api = require('react-native-audio-api') as { AudioContext: new (options: { sampleRate: number }) => StreamContext };
    const context = new api.AudioContext({ sampleRate: 24000 });
    // Probe once: a context without its native half throws here rather than later, mid-reply.
    context.createBuffer(1, 8, 24000);
    return context;
  } catch (caught) {
    console.log('[voice] streaming playback unavailable, using per-turn playback:', String(caught).slice(0, 120));
    return null;
  }
}

function wavFromPcm16(chunks: Uint8Array[], rate: number): Uint8Array {
  const dataLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(44 + dataLength);
  const view = new DataView(out.buffer);
  const ascii = (offset: number, text: string) => { for (let i = 0; i < text.length; i++) out[offset + i] = text.charCodeAt(i); };
  ascii(0, 'RIFF'); view.setUint32(4, 36 + dataLength, true); ascii(8, 'WAVE');
  ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  ascii(36, 'data'); view.setUint32(40, dataLength, true);
  let offset = 44;
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length; }
  return out;
}

export async function createAudio(onChunk: (data: string, rate: number, level: number) => void) {
  const context = loadStreamContext();
  const mode: 'stream' | 'turn' = context ? 'stream' : 'turn';
  let stream: AudioStream | null = null;
  let subscription: { remove(): void } | null = null;
  let nextTime = 0;
  const sources = new Set<ReturnType<StreamContext['createBufferSource']>>();
  let pending: Uint8Array[] = [];
  let player: AudioPlayer | null = null;
  let turn = 0;

  const stopMic = async () => {
    subscription?.remove(); subscription = null;
    try { stream?.stop(); } catch {}
    try { (stream as unknown as { release?(): void } | null)?.release?.(); } catch {}
    stream = null;
  };
  const stopPlayback = () => {
    for (const source of sources) { try { source.stop(); } catch {} }
    sources.clear(); nextTime = 0; pending = [];
    if (player) { try { player.pause(); player.remove(); } catch {} player = null; }
  };

  return {
    mode,
    async startCapture() {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error('Microphone access is off. You can type instead.');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, shouldRouteThroughEarpiece: false, interruptionMode: 'doNotMix', shouldPlayInBackground: false });
      const created = new AudioModule.AudioStream({ sampleRate: 16000, channels: 1, encoding: 'int16' });
      stream = created;
      subscription = created.addListener('audioStreamBuffer', (buffer: AudioStreamBuffer) => {
        const samples = new Int16Array(buffer.data, 0, Math.floor(buffer.data.byteLength / 2));
        let energy = 0;
        for (let i = 0; i < samples.length; i++) energy += samples[i] * samples[i];
        const level = samples.length ? Math.sqrt(energy / samples.length) / 32768 : 0;
        onChunk(fromByteArray(new Uint8Array(buffer.data)), buffer.sampleRate || 16000, level);
      });
      await created.start();
    },
    stopCapture: stopMic,
    play(data: string) {
      const bytes = toByteArray(data);
      if (!context) { pending.push(bytes); return; }
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const samples = new Float32Array(bytes.length / 2);
      for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
      const buffer = context.createBuffer(1, samples.length, 24000);
      buffer.copyToChannel(samples, 0, 0);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      sources.add(source);
      source.onEnded = () => { sources.delete(source); };
      const start = Math.max(context.currentTime + 0.05, nextTime);
      source.start(start);
      nextTime = start + buffer.duration;
    },
    async finishTurn() {
      if (context) {
        const remaining = Math.max(0, nextTime - context.currentTime);
        await new Promise(resolve => setTimeout(resolve, remaining * 1000));
        return;
      }
      if (!pending.length) return;
      const wav = wavFromPcm16(pending, 24000);
      pending = [];
      const path = `${FS.cacheDirectory}nivaran-reply-${++turn}.wav`;
      await FS.writeAsStringAsync(path, fromByteArray(wav), { encoding: FS.EncodingType.Base64 });
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true, shouldRouteThroughEarpiece: false, interruptionMode: 'doNotMix', shouldPlayInBackground: false });
      const current = createAudioPlayer({ uri: path });
      player = current;
      await new Promise<void>(resolve => {
        const done = () => { try { listener.remove(); } catch {} resolve(); };
        const listener = current.addListener('playbackStatusUpdate', status => { if (status.didJustFinish) done(); });
        // Safety net: a WAV of n bytes at 48 kB/s cannot take longer than this.
        setTimeout(done, Math.ceil((wav.length / 48000) * 1000) + 1500);
        current.play();
      });
      if (player === current) { try { current.remove(); } catch {} player = null; }
      FS.deleteAsync(path, { idempotent: true }).catch(() => {});
    },
    stopPlayback,
    async close() {
      await stopMic();
      stopPlayback();
      try { await context?.close(); } catch {}
    },
  };
}
