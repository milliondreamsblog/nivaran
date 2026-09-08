import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, Pencil } from 'lucide-react-native';
import { FIELD_IDS, confirmFact, resolveConflict, type Case, type FieldId } from '../core/index';
import { FIELD_LABELS, displayValue } from '../assistant/guided';
import { useLanguage } from '../i18n';
import { Button, C, ErrorBox, Label, s } from '../ui/theme';
import { FactEditor } from './FactEditor';

type Props = { current: Case; onChange(next: Case): void };

/** Proposed facts wait here. Nothing becomes confirmed without a tap. */
export function FactsCard({ current, onChange }: Props) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState<FieldId | null>(null);
  const [error, setError] = useState('');
  const proposed = FIELD_IDS.filter(field => current.facts[field]?.status === 'proposed');
  if (!proposed.length) return null;

  function run(change: () => Case) {
    try { setError(''); onChange(change()); } catch (caught) { setError(caught instanceof Error ? t(caught.message) : t('That could not be saved.')); }
  }
  function confirmAll() {
    run(() => proposed.reduce((next, field) => (next.facts[field]?.status === 'proposed' ? confirmFact(next, field) : next), current));
  }

  return (
    <View style={[s.card, { backgroundColor: C.white, borderWidth: 1, borderColor: C.line }]}>
      <Label color={C.green}>{t('WHAT WE UNDERSTOOD')}</Label>
      <Text style={{ fontSize: 13, color: C.muted, lineHeight: 19 }}>{t('Proposed from your words. Confirm or fix each one.')}</Text>
      {proposed.map(field => (
        <View key={field} style={{ gap: 8 }}>
          {editing === field ? (
            <FactEditor field={field} current={current} onCancel={() => setEditing(null)} onDone={next => { setEditing(null); onChange(next); }} />
          ) : (
            <View style={[s.between, { alignItems: 'flex-start' }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 12, color: C.muted }}>{t(FIELD_LABELS[field])}</Text>
                <Text style={{ fontSize: 16, color: C.ink, lineHeight: 23 }} numberOfLines={field === 'story' ? 4 : 2}>{t(displayValue(field, current.facts[field]!.value))}</Text>
              </View>
              <View style={s.row}>
                <Pressable accessibilityRole="button" accessibilityLabel={`${t('Fix')} ${t(FIELD_LABELS[field])}`} onPress={() => setEditing(field)} style={iconButton}><Pencil size={17} color={C.ink} /></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`${t('Confirm')} ${t(FIELD_LABELS[field])}`} onPress={() => run(() => confirmFact(current, field))} style={[iconButton, { backgroundColor: C.green }]}><Check size={18} color="white" /></Pressable>
              </View>
            </View>
          )}
        </View>
      ))}
      <ErrorBox text={error} />
      {proposed.length > 1 && !editing && <Button onPress={confirmAll} icon={<Check size={18} color="white" />}>{t('Confirm all')} {proposed.length}</Button>}
    </View>
  );
}

/** Two answers for one fact. Neither is chosen until the citizen picks, and "not sure" is always offered. */
export function ConflictCard({ current, onChange }: Props) {
  const { t } = useLanguage();
  const [error, setError] = useState('');
  const field = FIELD_IDS.find(item => current.facts[item]?.status === 'conflicting');
  if (!field) return null;
  const fact = current.facts[field]!;
  const sourceLabel = (source: string, ref?: string) => (source === 'document' ? (ref?.includes('relieving') ? t('From the relieving letter') : t('From a document')) : source === 'voice' ? t('You said') : source === 'typed' ? t('You typed') : t('You answered'));
  function pick(value: string) {
    try { setError(''); onChange(resolveConflict(current, field!, value, { source: 'typed' })); } catch (caught) { setError(caught instanceof Error ? t(caught.message) : t('That could not be saved.')); }
  }
  return (
    <View style={[s.card, { backgroundColor: C.paleAmber, borderColor: '#EBD9B8' }]}>
      <Label color={C.amber}>{t('TWO DIFFERENT ANSWERS')}</Label>
      <Text style={{ fontSize: 17, color: C.ink, lineHeight: 24, fontWeight: '600' }}>{t(FIELD_LABELS[field])}: {t('which one is right?')}</Text>
      <Text style={{ fontSize: 13, color: C.muted, lineHeight: 19 }}>{t('We will not pick for you. If you are not sure, the complaint will say the date needs verification.')}</Text>
      {fact.alternatives?.map(alternative => (
        <Pressable key={alternative.value + alternative.source} accessibilityRole="button" onPress={() => pick(alternative.value)} style={{ backgroundColor: C.white, borderRadius: 14, padding: 14, gap: 3, borderWidth: 1, borderColor: '#EBD9B8' }}>
          <Text style={{ fontSize: 17, color: C.ink, fontWeight: '600' }}>{displayValue(field, alternative.value)}</Text>
          <Text style={{ fontSize: 12, color: C.muted }}>{sourceLabel(alternative.source, alternative.sourceRef)}</Text>
        </Pressable>
      ))}
      <Button secondary onPress={() => pick('unknown')}>{t("I'm not sure")}</Button>
      <ErrorBox text={error} />
    </View>
  );
}

const iconButton = { width: 40, height: 40, borderRadius: 13, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: C.white, borderWidth: 1, borderColor: C.line };
