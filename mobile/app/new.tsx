// First-run choice: Speak, Type or Guided. Creates the case in the app language, then opens its chat with that mode.
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mic, MessageSquare, ListChecks } from 'lucide-react-native';
import { useCases } from '../src/db/context';
import { useLanguage } from '../src/i18n';
import { Frame, C, s, Body, Button, Label, Orb, ErrorBox } from '../src/ui/theme';

export default function NewIssue() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { create } = useCases();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function start(mode: string) {
    setBusy(true);
    try {
      const bundle = await create(lang);
      router.replace({ pathname: '/case/[id]', params: { id: bundle.case.id, tab: 'conversation', mode } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('Could not start a chat.')); setBusy(false);
    }
  }
  useEffect(() => { if (params.mode === 'voice') start('voice'); }, []);
  return (
    <Frame back={() => router.back()} title={t('New chat')}>
      <ScrollView contentContainerStyle={[s.page, { paddingTop: 18 }]}>
        <View style={{ alignItems: 'center', marginVertical: 10 }}><Orb /></View>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Label color={C.green}>{t('WE’RE HERE TO HELP')}</Label>
          <Text style={[s.title, { textAlign: 'center' }]}>{t('Tell me\nwhat happened.')}</Text>
          <Body style={{ textAlign: 'center' }}>{t('Start wherever feels easiest.\nWe’ll work out the next step together.')}</Body>
        </View>
        <ErrorBox text={error} />
        <View style={{ gap: 10, marginTop: 12 }}>
          <Button disabled={busy} onPress={() => start('voice')} icon={<Mic size={19} color="white" />}>{t('Speak about your issue')}</Button>
          <Button secondary disabled={busy} onPress={() => start('typed')} icon={<MessageSquare size={18} color={C.green} />}>{t('I’d rather type')}</Button>
          <Button secondary disabled={busy} onPress={() => start('guided')} icon={<ListChecks size={18} color={C.green} />}>{t('Guide me with questions')}</Button>
        </View>
        <Body style={{ fontSize: 12, textAlign: 'center', marginTop: 6 }}>{t('Prototype · Use made-up details.\nYou can switch how you answer at any time.')}</Body>
      </ScrollView>
    </Frame>
  );
}
