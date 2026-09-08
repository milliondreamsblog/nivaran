import { fromByteArray, toByteArray } from 'base64-js';
export async function createAudio(onChunk: (data: string, rate: number, level: number) => void) {
  const playback = new AudioContext({ sampleRate: 24000 }); await playback.resume();
  let mic: MediaStream | null = null, capture: AudioContext | null = null, processor: AudioWorkletNode | null = null;
  let nextTime = 0; const sources = new Set<AudioBufferSourceNode>();
  const stopMic = async () => { mic?.getTracks().forEach(t => t.stop()); mic = null; processor?.disconnect(); processor = null; await capture?.close(); capture = null; };
  const stopPlayback = () => { for (const source of sources) { try { source.stop(); } catch {} } sources.clear(); nextTime = 0; };
  return {
    mode: 'stream' as const,
    async startCapture() {
      mic = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      try {
        capture = new AudioContext({ sampleRate: 16000 }); await capture.resume();
        const code = `class PCM extends AudioWorkletProcessor { process(inputs) { const input=inputs[0]?.[0]; if(input){const pcm=new Int16Array(input.length);for(let i=0;i<input.length;i++)pcm[i]=Math.max(-1,Math.min(1,input[i]))*32767;this.port.postMessage(pcm.buffer,[pcm.buffer]);}return true;} } registerProcessor('pcm', PCM);`;
        const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
        try { await capture.audioWorklet.addModule(url); } finally { URL.revokeObjectURL(url); }
        processor = new AudioWorkletNode(capture, 'pcm');
        processor.port.onmessage = e => {
          const samples = new Int16Array(e.data);
          let energy = 0; for (let i = 0; i < samples.length; i++) energy += samples[i] * samples[i];
          onChunk(fromByteArray(new Uint8Array(e.data)), capture?.sampleRate || 16000, samples.length ? Math.sqrt(energy / samples.length) / 32768 : 0);
        };
        capture.createMediaStreamSource(mic).connect(processor); const silent = capture.createGain(); silent.gain.value = 0; processor.connect(silent).connect(capture.destination);
      } catch (error) { await stopMic(); throw error; }
    },
    stopCapture: stopMic,
    play(data: string) {
      const bytes = toByteArray(data), view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const samples = new Float32Array(bytes.length / 2); for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
      const buffer = playback.createBuffer(1, samples.length, 24000); buffer.copyToChannel(samples, 0);
      const source = playback.createBufferSource(); source.buffer = buffer; source.connect(playback.destination); sources.add(source); source.onended = () => sources.delete(source);
      const start = Math.max(playback.currentTime + .035, nextTime); source.start(start); nextTime = start + buffer.duration;
    },
    async finishTurn() { const remaining = Math.max(0, nextTime - playback.currentTime); await new Promise(resolve => setTimeout(resolve, remaining * 1000)); },
    stopPlayback,
    async close() { await stopMic(); stopPlayback(); await playback.close(); },
  };
}
