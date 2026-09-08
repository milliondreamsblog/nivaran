// One case as a chat-list row: avatar, title, the line that matters, time, and a dot when something needs the person.
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { CaseBundle } from '../db/types';
import { nextAction } from '../assistant/next';
import { useLanguage } from '../i18n';
import { Avatar, C, s } from './theme';

function when(timestamp: number, now: string): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return now;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function CaseRow({ bundle, tab = 'conversation' }: { bundle: CaseBundle; tab?: string }) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const current = bundle.case;
  const last = bundle.messages[bundle.messages.length - 1];
  const action = nextAction(current, lang);
  const preview = current.state === 'reviewed' ? t('Reviewed draft saved · simulated receipt') : last?.text ?? t(action.title);
  const attention = current.state !== 'reviewed';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${t('Open')} ${current.title}`} onPress={() => router.push({ pathname: '/case/[id]', params: { id: current.id, tab } })} style={({ pressed }) => [s.rowItem, { opacity: pressed ? .7 : 1 }]}>
      <Avatar />
      <View style={{ flex: 1, gap: 3 }}>
        <View style={s.between}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.ink, flex: 1 }} numberOfLines={1}>{t(current.title)}</Text>
          <Text style={{ fontSize: 12, color: C.muted }}>{when(current.updatedAt, t('now'))}</Text>
        </View>
        <View style={s.between}>
          <Text style={{ fontSize: 14, color: C.muted, flex: 1, lineHeight: 20 }} numberOfLines={1}>{preview}</Text>
          {attention && <View style={{ width: 10, height: 10, borderRadius: 10, backgroundColor: C.green }} accessibilityLabel={t('Needs your attention')} />}
        </View>
      </View>
    </Pressable>
  );
}
