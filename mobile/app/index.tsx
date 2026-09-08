// Home: open the app and start. Tap the orb to talk, type in the box, or pick step-by-step questions.
// Below that, only a small status strip for existing chats. Bottom bar: Home, Chats, Profile.
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowUp, ListChecks, ShieldCheck } from 'lucide-react-native';
import { useCases } from '../src/db/context';
import { useLanguage } from '../src/i18n';
import { addMessage, withCase } from '../src/assistant/bundle';
import { describe } from '../src/assistant/guided';
import { C, ErrorBox, Frame, Loader, s } from '../src/ui/theme';
import { AnimatedOrb } from '../src/ui/AnimatedOrb';
import { BottomBar } from '../src/ui/BottomBar';

type Mode = 'voice' | 'typed' | 'guided';

export default function Home() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { bundles, ready, error, create, update } = useCases();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const { height, width } = useWindowDimensions();
  // Scale the centrepiece with the screen so short phones keep everything above the bottom bar without scrolling.
  const compactScreen = height < 720;
  const orbSize = Math.round(Math.min(184, Math.max(120, height * 0.2), width * 0.45));
  const gap = compactScreen ? 14 : 22;

  async function start(mode: Mode, story?: string) {
    if (busy) return;
    setBusy(true); setFailure('');
    try {
      const bundle = await create(lang);
      if (story?.trim()) await update(bundle.case.id, b => withCase(addMessage(b, story.trim(), 'citizen', 'typed'), describe(b.case, story.trim())));
      setText('');
      router.push({ pathname: '/case/[id]', params: { id: bundle.case.id, tab: 'conversation', mode } });
    } catch (caught) {
      setFailure(caught instanceof Error ? caught.message : t('Could not start a chat.'));
    } finally {
      setBusy(false);
    }
  }

  const inProgress = bundles.filter(b => b.case.state === 'draft' || b.case.state === 'needs_info').length;
  const readyToReview = bundles.filter(b => b.case.state === 'ready').length;
  const reviewed = bundles.filter(b => b.case.state === 'reviewed').length;
  const tiles: { count: number; label: string; filter: string }[] = [
    { count: inProgress, label: 'in progress', filter: 'Drafts' },
    { count: readyToReview, label: 'ready to review', filter: 'Drafts' },
    { count: reviewed, label: 'reviewed', filter: 'Reviewed' },
  ].filter(tile => tile.count > 0);

  return (
    <Frame compact brand right={<View style={s.circleButton}><ShieldCheck size={19} color={C.green} /></View>} footer={<BottomBar active="home" />}>
      {!ready ? <Loader /> : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={[s.page, { flexGrow: 1, justifyContent: 'center', gap, paddingBottom: 96 }]} keyboardShouldPersistTaps="handled">
            <AnimatedOrb onPress={() => start('voice')} disabled={busy} size={orbSize} label={t('Tap to talk')} accessibilityLabel={t('Talk about your issue')} />
            <Text style={[s.title, { fontSize: compactScreen ? 28 : 34, lineHeight: compactScreen ? 34 : 40, textAlign: 'center' }]}>{t('What happened?')}</Text>
            <View style={[s.row, { backgroundColor: C.surface, borderRadius: 28, paddingLeft: 18, paddingRight: 6, minHeight: 56, gap: 6 }]}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t('Type what happened…')}
                placeholderTextColor="#98A79C"
                multiline
                editable={!busy}
                style={{ flex: 1, minHeight: 44, maxHeight: 120, paddingVertical: 12, fontSize: 16, lineHeight: 22, color: C.ink }}
                accessibilityLabel={t('What happened')}
                onSubmitEditing={() => start('typed', text)}
                blurOnSubmit
              />
              <Pressable accessibilityRole="button" accessibilityLabel={t('Start typing chat')} onPress={() => start('typed', text)} disabled={busy || !text.trim()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: text.trim() ? C.green : '#D9DED4', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowUp size={20} color="white" />
              </Pressable>
            </View>
            <Pressable accessibilityRole="button" onPress={() => start('guided')} disabled={busy} style={[s.row, { alignSelf: 'center', gap: 8, paddingVertical: 6 }]}>
              <ListChecks size={16} color={C.green} /><Text style={{ fontSize: 14, color: C.green, fontWeight: '600' }}>{t('Step-by-step questions instead')}</Text>
            </Pressable>
            <ErrorBox text={error || failure} />
            {tiles.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {tiles.map(tile => (
                  <Pressable key={tile.label} accessibilityRole="button" accessibilityLabel={`${tile.count} ${t(tile.label)}`} onPress={() => router.replace({ pathname: '/chats', params: { filter: tile.filter } })} style={({ pressed }) => [{ flex: 1, backgroundColor: C.surface, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 12, gap: 2, opacity: pressed ? 0.7 : 1 }]}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: C.ink }}>{tile.count}</Text>
                    <Text style={{ fontSize: 12, color: C.muted }}>{t(tile.label)}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Text style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>{t('Prototype · made-up details only · drafts stay on this device')}</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Frame>
  );
}
