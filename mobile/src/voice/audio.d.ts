// Type-only contract for the platform-split audio engine (audio.native.ts, audio.web.ts).
// Metro picks the platform file at bundle time; TypeScript reads this declaration.
export type AudioEngine = {
  /** 'stream' plays chunks as they arrive; 'turn' (Expo Go) collects the reply and plays it when the turn ends. */
  mode: 'stream' | 'turn';
  /** Asks for the microphone, then streams 16 kHz int16 mono chunks to onChunk until stopCapture. */
  startCapture(): Promise<void>;
  stopCapture(): Promise<void>;
  /** Queues one base64 chunk of 24 kHz int16 PCM for gapless playback. */
  play(data: string): void;
  /** Resolves when everything queued so far has finished playing. */
  finishTurn(): Promise<void>;
  stopPlayback(): void;
  close(): Promise<void>;
};

export declare function createAudio(onChunk: (data: string, rate: number, level: number) => void): Promise<AudioEngine>;
