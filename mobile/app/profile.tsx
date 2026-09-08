// Profile: the app language, the voice demo code, and what this prototype does with data. Bottom bar: Home, Chats, Profile.
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Languages, Mic, ShieldCheck, Sparkles } from 'lucide-react-native';
import { getSetting, setSetting } from '../src/settings';
import { AI_CHAT_SETTING, DEFAULT_DEMO_CODE, DEMO_CODE_SETTING } from '../src/config';
import { useCases } from '../src/db/context';
import { useLanguage } from '../src/i18n';
import { Avatar, Body, Button, C, Card, Frame, Label, Segmented, s } from '../src/ui/theme';
import { BottomBar } from '../src/ui/BottomBar';

export default function Profile() {
  const { bundles } = useCases();
  const { t, lang, setLang } = useLanguage();
  const [code, setCode] = useState('');
  const [saved, setSaved] = useState('');
  const [aiChat, setAiChat] = useState('on');
  useEffect(() => { getSetting(DEMO_CODE_SETTING).then(setSaved); getSetting(AI_CHAT_SETTING).then(value => setAiChat(value === 'off' ? 'off' : 'on')); }, []);
  const voiceOn = !!(saved || DEFAULT_DEMO_CODE);
  function chooseAi(value: string) { setAiChat(value); setSetting(AI_CHAT_SETTING, value === 'off' ? 'off' : '').catch(() => {}); }
  function saveCode() { const value = code.trim(); setSetting(DEMO_CODE_SETTING, value).then(() => { setSaved(value); setCode(''); }).catch(() => {}); }
  return (
    <Frame title={t('Profile')} footer={<BottomBar active="profile" />}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={[s.row, { gap: 14, paddingVertical: 6 }]}>
          <Avatar size={64} />
          <View style={{ gap: 2 }}>
            <Text style={s.subtitle}>{t('Demo citizen')}</Text>
            <Text style={{ fontSize: 13, color: C.muted }}>{bundles.length} {t(bundles.length === 1 ? 'chat on this device' : 'chats on this device')}</Text>
          </View>
        </View>

        <Card>
          <View style={s.row}><Languages size={18} color={C.green} /><Label color={C.green}>{t('LANGUAGE')}</Label></View>
          <Segmented options={['hi', 'en']} labels={['Hinglish', 'English']} value={lang} onChange={value => setLang(value === 'en' ? 'en' : 'hi')} />
          <Body style={{ fontSize: 13, lineHeight: 20 }}>{t('The whole app, the questions, and new chats use this language. You can answer in either.')}</Body>
        </Card>

        <Card>
          <View style={s.row}><Sparkles size={18} color={C.green} /><Label color={C.green}>{t('TYPED CHAT')}</Label></View>
          <Segmented options={['on', 'off']} labels={[t('Assistant replies'), t('Scripted questions')]} value={aiChat} onChange={chooseAi} />
          <Body style={{ fontSize: 13, lineHeight: 20 }}>{t('With the assistant on, the model talks with you and proposes facts for you to confirm. Scripted questions work offline and never call a model.')}</Body>
        </Card>

        <Card>
          <View style={s.row}><Mic size={18} color={C.green} /><Label color={C.green}>{t('VOICE DEMO CODE')}</Label></View>
          <Body style={{ fontSize: 13, lineHeight: 20 }}>{voiceOn ? t('A demo code is saved on this device. Voice is on.') : t('Voice uses a shared free quota. Enter the demo code once to turn it on. Typing works without it.')}</Body>
          <TextInput value={code} onChangeText={setCode} placeholder={voiceOn ? t('Replace the saved code') : t('Demo code')} placeholderTextColor="#98A79C" autoCapitalize="none" style={s.input} accessibilityLabel={t('Demo code')} />
          <Button disabled={!code.trim()} onPress={saveCode}>{t('Save code')}</Button>
        </Card>

        <Card>
          <View style={s.row}><ShieldCheck size={18} color={C.green} /><Label color={C.green}>{t('YOUR DATA')}</Label></View>
          <Body style={{ fontSize: 13, lineHeight: 20 }}>{t('Drafts stay on this device. Nothing is filed with a department. This is a prototype for a made-up PF transfer story; only the sample story and the two sample documents are ever sent to the model.')}</Body>
        </Card>
      </ScrollView>
    </Frame>
  );
}
