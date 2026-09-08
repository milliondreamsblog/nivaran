// One case. The chat is the main screen, styled like a messaging thread. Overview, Documents and Review open from
// the "more" menu in the header, with a small switcher to get back to the chat.
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileText, LayoutList, MessageCircle, MoreHorizontal, ShieldCheck, X } from 'lucide-react-native';
import { useCases } from '../../src/db/context';
import type { CaseBundle } from '../../src/db/types';
import { getSetting, setSetting } from '../../src/settings';
import { DEFAULT_DEMO_CODE, DEMO_CODE_SETTING } from '../../src/config';
import { useLanguage } from '../../src/i18n';
import type { Tab } from '../../src/assistant/next';
import { Body, Button, C, Frame, Label, Loader, s } from '../../src/ui/theme';
import { Overview } from '../../src/screens/Overview';
import { Conversation } from '../../src/screens/Conversation';
import { Documents } from '../../src/screens/Documents';
import { Review } from '../../src/screens/Review';

// Dot colours echo the hero's stage pill: sky for the chat, leaf for documents, rose for review.
const TABS: { key: Tab; label: string; Icon: typeof FileText; dot: string }[] = [
  { key: 'conversation', label: 'Chat', Icon: MessageCircle, dot: '#7FB3D5' }, { key: 'overview', label: 'Overview', Icon: LayoutList, dot: '#B8A8D9' }, { key: 'documents', label: 'Documents', Icon: FileText, dot: '#5FA57C' }, { key: 'review', label: 'Review', Icon: ShieldCheck, dot: '#D98A8A' },
];

export default function CaseScreen() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const params = useLocalSearchParams<{ id: string; tab?: string; mode?: string }>();
  const { bundles, ready, update, statuses, retry, error } = useCases();
  const [tab, setTab] = useState<Tab>((TABS.some(item => item.key === params.tab) ? params.tab : 'conversation') as Tab);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoCode, setDemoCodeState] = useState(DEFAULT_DEMO_CODE);
  const bundle = bundles.find(b => b.case.id === params.id);

  useEffect(() => { getSetting(DEMO_CODE_SETTING).then(value => setDemoCodeState(value || DEFAULT_DEMO_CODE)); }, []);
  const setDemoCode = (code: string) => { setDemoCodeState(code || DEFAULT_DEMO_CODE); setSetting(DEMO_CODE_SETTING, code).catch(() => {}); };

  // The app language leads; a case created in the other language follows it so questions and prompts agree.
  useEffect(() => {
    if (bundle && bundle.case.language !== lang) update(bundle.case.id, b => ({ ...b, case: { ...b.case, language: lang } })).catch(() => {});
  }, [lang, bundle?.case.id, bundle?.case.language]);

  const status = bundle ? statuses[bundle.case.id] : undefined;
  const subtitle = status === 'saving' ? t('Saving…') : status === 'error' ? t('Couldn’t save · tap Retry') : tab === 'conversation' ? t('Nivaran · saved on this device') : t('Saved on this device');

  const right = (
    <View style={s.row}>
      {status === 'error' && (
        <Pressable accessibilityRole="button" accessibilityLabel={t('Retry')} onPress={() => bundle && retry(bundle.case.id)} style={[s.circleButton, { backgroundColor: '#FAEAE2', width: 'auto', paddingHorizontal: 12 }]}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.red }}>{t('Retry')}</Text>
        </Pressable>
      )}
      <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={() => setMenuOpen(true)} style={s.circleButton}><MoreHorizontal size={20} color={C.ink} /></Pressable>
    </View>
  );

  if (!ready) return <Frame back={() => router.replace('/chats')}><Loader text={t('Opening your drafts…')} /></Frame>;
  if (!bundle) {
    return (
      <Frame back={() => router.replace('/chats')} title={t('Not found')}>
        <View style={s.page}><Body>{t('This chat could not be found on this device.')}</Body><Button onPress={() => router.replace('/chats')}>{t('Back to chats')}</Button></View>
      </Frame>
    );
  }

  const onChange = (change: (b: CaseBundle) => CaseBundle) => update(bundle.case.id, change);
  const hint = (key: Tab) => key === 'conversation' ? t('Talk or type') : key === 'overview' ? t('Every answer, editable') : key === 'documents' ? `${bundle.evidence.length} ${t('attached')}` : bundle.case.state === 'reviewed' ? t('Reviewed draft saved') : t('Read the full complaint');

  return (
    <Frame back={() => router.replace('/chats')} title={t(bundle.case.title)} subtitle={subtitle} avatar online={tab === 'conversation'} right={right}>
      {tab !== 'conversation' && (
        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 8, padding: 4, borderRadius: 30, backgroundColor: C.surface }}>
          {TABS.map(item => (
            <Pressable key={item.key} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: tab === item.key }} onPress={() => setTab(item.key)} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 9, borderRadius: 30, backgroundColor: tab === item.key ? C.white : 'transparent', elevation: tab === item.key ? 1 : 0 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.dot }} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: tab === item.key ? C.ink : C.muted }}>{t(item.label)}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {!!error && status === 'error' && <View style={{ paddingHorizontal: 20 }}><Label color={C.red}>{error}</Label></View>}
      {tab === 'overview' && <Overview bundle={bundle} onCase={next => { onChange(b => ({ ...b, case: next })).catch(() => {}); }} goTo={setTab} />}
      {tab === 'conversation' && <Conversation bundle={bundle} onChange={onChange} initialMode={params.mode} demoCode={demoCode} setDemoCode={setDemoCode} goTo={setTab} />}
      {tab === 'documents' && <Documents bundle={bundle} onChange={onChange} demoCode={demoCode} />}
      {tab === 'review' && <Review bundle={bundle} onChange={onChange} saved={status !== 'saving' && status !== 'error'} />}

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable accessibilityLabel={t('Close menu')} onPress={() => setMenuOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} />
        <View style={{ backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30, gap: 4, width: '100%', maxWidth: 520, alignSelf: 'center' }}>
          <View style={[s.between, { marginBottom: 8 }]}>
            <Label color={C.green}>{t('THIS CHAT')}</Label>
            <Pressable accessibilityRole="button" accessibilityLabel={t('Close')} onPress={() => setMenuOpen(false)} style={s.circleButton}><X size={18} color={C.ink} /></Pressable>
          </View>
          {TABS.map(item => (
            <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => { setTab(item.key); setMenuOpen(false); }} style={({ pressed }) => [s.row, { paddingVertical: 12, gap: 14, opacity: pressed ? 0.7 : 1 }]}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: tab === item.key ? C.green : C.mint, alignItems: 'center', justifyContent: 'center' }}><item.Icon size={19} color={tab === item.key ? 'white' : C.deep} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: C.ink }}>{t(item.label)}</Text>
                <Text style={{ fontSize: 12, color: C.muted }}>{hint(item.key)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Modal>
    </Frame>
  );
}
