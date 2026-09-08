import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Keyboard, Mic, Square } from 'lucide-react-native';
import type { useVoice } from '../voice/useVoice';
import { useLanguage } from '../i18n';
import { Body, Button, C, ErrorBox, Label, s } from '../ui/theme';

type Voice = ReturnType<typeof useVoice>;
type Props = { voice: Voice; demoCode: string; setDemoCode(code: string): void; onClose(): void };

const STATE_TEXT: Record<Voice['state'], string> = {
  idle: 'Voice off', connecting: 'Connecting…', ready: 'Hold to speak', listening: 'Listening…', thinking: 'Thinking…', speaking: 'Speaking', paused: 'Paused', error: 'Voice unavailable',
};
const STATE_COLOR: Record<Voice['state'], string> = {
  idle: '#E8E9E0', connecting: '#E8E9E0', ready: C.mint, listening: '#CFEBD6', thinking: '#F3E9CF', speaking: '#D7E6F5', paused: '#EDE6D6', error: '#FAEAE2',
};

/** Full-screen voice surface: one state pill, the transcript, a waveform and a single hold-to-talk button. */
export function VoicePanel({ voice, demoCode, setDemoCode, onClose }: Props) {
  const { t } = useLanguage();
  const [levels, setLevels] = useState<number[]>(() => Array(28).fill(0));
  const [seconds, setSeconds] = useState(0);
  const [code, setCode] = useState('');
  const startedAt = useRef(0);
  const listening = voice.state === 'listening';

  useEffect(() => {
    if (!listening) return;
    setLevels(previous => [...previous.slice(1), Math.min(1, voice.level * 4)]);
  }, [voice.level, listening]);

  useEffect(() => {
    if (!listening) { setSeconds(0); return; }
    startedAt.current = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
    return () => clearInterval(timer);
  }, [listening]);

  const busy = voice.state === 'connecting';
  const showOutput = !!voice.liveOutput && (voice.state === 'speaking' || voice.state === 'ready' || voice.state === 'thinking');

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 20, gap: 16 }}>
      <View style={s.between}>
        <View style={{ borderRadius: 30, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: STATE_COLOR[voice.state], flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: listening ? C.green : C.muted }} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.ink }}>{t(STATE_TEXT[voice.state])}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onClose} style={[s.row, { paddingVertical: 8 }]}><Keyboard size={17} color={C.muted} /><Text style={{ color: C.muted, fontWeight: '600', fontSize: 13 }}>{t('Switch to typing')}</Text></Pressable>
      </View>

      {!demoCode ? (
        <View style={[s.card, { gap: 10 }]}>
          <Label color={C.green}>{t('DEMO CODE')}</Label>
          <Body style={{ fontSize: 14, lineHeight: 21 }}>{t('Voice uses a shared free quota. Enter the demo code once to turn it on. Typing works without it.')}</Body>
          <TextInput value={code} onChangeText={setCode} placeholder={t('Demo code')} placeholderTextColor="#98A79C" autoCapitalize="none" style={s.input} accessibilityLabel={t('Demo code')} />
          <Button disabled={!code.trim()} onPress={() => setDemoCode(code.trim())}>{t('Save and continue')}</Button>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', gap: 22 }}>
          <View style={{ minHeight: 120, justifyContent: 'center' }}>
            {voice.liveInput ? (
              <Text style={{ fontSize: 24, lineHeight: 34, color: C.ink, fontWeight: '500' }}>{voice.liveInput}</Text>
            ) : (
              <Text style={{ fontSize: 24, lineHeight: 34, color: '#9AA79E', fontWeight: '500' }}>{listening ? t('Go ahead, I am listening.') : t('Hold the button and tell me what happened.')}</Text>
            )}
          </View>
          {showOutput && (
            <View style={{ backgroundColor: C.deep, borderRadius: 20, padding: 18, gap: 6 }}>
              <Label color="#9FD3B4">NIVARAN</Label>
              <Text style={{ fontSize: 16, lineHeight: 24, color: '#EAF3EE' }}>{voice.liveOutput}</Text>
            </View>
          )}
          <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }} accessibilityElementsHidden>
            {levels.map((value, index) => <View key={index} style={{ width: 3, borderRadius: 3, height: 4 + value * 40, backgroundColor: listening ? C.green : '#C9D3C8' }} />)}
          </View>
        </View>
      )}

      <ErrorBox text={t(voice.error)} />
      {voice.state === 'error' && <Button secondary onPress={() => voice.connect()}>{t('Try voice again')}</Button>}

      {!!demoCode && (
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 13, color: C.muted }}>{listening ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : voice.state === 'speaking' ? t('Tap the square to stop') : t('Press and hold')}</Text>
          {voice.state === 'speaking' ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t('Stop speaking')} onPress={voice.stop} style={[bigButton, { backgroundColor: C.deep }]}><Square size={26} color="white" fill="white" /></Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={listening ? t('Release to finish') : t('Hold to speak')}
              disabled={busy}
              onPressIn={voice.pressStart}
              onPressOut={voice.pressEnd}
              style={({ pressed }) => [bigButton, { backgroundColor: listening || pressed ? C.green : C.white, borderWidth: 3, borderColor: listening || pressed ? '#9FD3B4' : C.mint, opacity: busy ? 0.5 : 1, transform: [{ scale: listening ? 1.06 : 1 }] }]}
            >
              <Mic size={30} color={listening ? 'white' : C.green} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const bigButton = { width: 84, height: 84, borderRadius: 84, alignItems: 'center' as const, justifyContent: 'center' as const };
