import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { PF_TRANSFER_FIELDS, confirmFact, setUnknown, type Case, type FieldId } from '../core/index';
import { FIELD_LABELS } from '../assistant/guided';
import { interpret } from '../assistant/answers';
import { useLanguage } from '../i18n';
import { Button, C, ErrorBox, Label, s } from '../ui/theme';

type Props = { field: FieldId; current: Case; onDone(next: Case): void; onCancel(): void };

/** Inline editor for one fact. Options where the definition has them, free text otherwise, unknown when allowed. */
export function FactEditor({ field, current, onDone, onCancel }: Props) {
  const { t, lang } = useLanguage();
  const definition = PF_TRANSFER_FIELDS[field];
  const existing = current.facts[field];
  const [text, setText] = useState(existing?.status === 'unknown' ? '' : existing?.value ?? '');
  const [error, setError] = useState('');
  const choices = definition.options.filter(option => option.value !== 'unknown');
  const isDate = field === 'exit_date';

  function commit(value: string) {
    try {
      const interpreted = interpret(field, value);
      onDone(interpreted === 'unknown' ? setUnknown(current, field, { source: 'typed' }) : confirmFact(current, field, interpreted, { source: 'typed' }));
    } catch (caught) {
      setError(caught instanceof Error ? t(caught.message) : t('That answer could not be saved.'));
    }
  }

  return (
    <View style={{ gap: 12, backgroundColor: '#EEF2E7', borderRadius: 18, padding: 16 }}>
      <Label color={C.green}>{t(FIELD_LABELS[field]).toUpperCase()}</Label>
      <Text style={{ fontSize: 16, color: C.ink, lineHeight: 23 }}>{lang === 'hi' ? definition.textHi : definition.textEn}</Text>
      {choices.length > 0 && (
        <View style={[s.row, { flexWrap: 'wrap' }]}>
          {choices.map(option => (
            <Pressable key={option.value} accessibilityRole="button" onPress={() => commit(option.value)} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 30, backgroundColor: C.white, borderWidth: 1, borderColor: C.line }}>
              <Text style={{ color: C.ink, fontWeight: '600', fontSize: 14 }}>{lang === 'hi' ? option.textHi : option.textEn}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {(choices.length === 0 || field === 'outcome') && (
        <TextInput
          value={text}
          onChangeText={setText}
          multiline={!isDate}
          placeholder={isDate ? t('For example 15 April 2025') : t('Type your answer')}
          placeholderTextColor="#98A79C"
          style={[s.input, !isDate && { minHeight: 80, textAlignVertical: 'top' }]}
          accessibilityLabel={t(FIELD_LABELS[field])}
        />
      )}
      <ErrorBox text={error} />
      <View style={[s.row, { flexWrap: 'wrap' }]}>
        {(choices.length === 0 || field === 'outcome') && <Button onPress={() => commit(text)} disabled={!text.trim()}>{t('Save answer')}</Button>}
        {definition.allowUnknown && <Button secondary onPress={() => commit('unknown')}>{t("I don't know")}</Button>}
        <Pressable accessibilityRole="button" onPress={onCancel} style={{ paddingVertical: 12, paddingHorizontal: 8 }}><Text style={{ color: C.muted, fontWeight: '600' }}>{t('Cancel')}</Text></Pressable>
      </View>
    </View>
  );
}
