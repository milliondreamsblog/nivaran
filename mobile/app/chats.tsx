// Chats: every case as a conversation row, filtered All / Drafts / Reviewed. Bottom bar: Home, Chats, Profile.
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageCircle, Plus } from 'lucide-react-native';
import { useCases } from '../src/db/context';
import { useLanguage } from '../src/i18n';
import { Body, C, ErrorBox, Frame, Loader, Segmented, s } from '../src/ui/theme';
import { BottomBar } from '../src/ui/BottomBar';
import { CaseRow } from '../src/ui/CaseRow';

const FILTERS = ['All', 'Drafts', 'Reviewed'];

export default function Chats() {
  const router = useRouter();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ filter?: string }>();
  const { bundles, ready, error } = useCases();
  const [filter, setFilter] = useState(FILTERS.includes(params.filter ?? '') ? (params.filter as string) : 'All');
  const shown = bundles.filter(b => filter === 'All' || (filter === 'Reviewed' ? b.case.state === 'reviewed' : b.case.state !== 'reviewed'));
  return (
    <Frame title={t('Chats')} right={<Pressable accessibilityRole="button" accessibilityLabel={t('New chat')} onPress={() => router.push('/new')} style={s.circleButton}><Plus size={20} color={C.ink} /></Pressable>} footer={<BottomBar active="chats" />}>
      {!ready ? <Loader /> : (
        <ScrollView contentContainerStyle={s.page}>
          <Segmented options={FILTERS} labels={FILTERS.map(t)} value={filter} onChange={setFilter} />
          <ErrorBox text={error} />
          {!shown.length && (
            <View style={{ paddingVertical: 40, alignItems: 'center', gap: 12 }}>
              <MessageCircle size={30} color="#9CAA9E" />
              <Body>{bundles.length ? t('Nothing here yet.') : t('Your first chat starts here.')}</Body>
              <Text style={{ textAlign: 'center', color: C.muted, fontSize: 13, lineHeight: 21 }}>{t('You won’t have to tell your story twice.')}</Text>
            </View>
          )}
          <View style={{ gap: 10 }}>{shown.map(bundle => <CaseRow key={bundle.case.id} bundle={bundle} />)}</View>
        </ScrollView>
      )}
    </Frame>
  );
}
