import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Pencil, ShieldCheck } from 'lucide-react-native';
import { canReview, getReadiness, makeDraft, markReviewed, routeFor, type Case, type FieldId } from '../core/index';
import type { CaseBundle } from '../db/types';
import { FIELD_LABELS } from '../assistant/guided';
import { withCase } from '../assistant/bundle';
import { useLanguage } from '../i18n';
import { Body, Button, C, Card, Chip, ErrorBox, Label, s } from '../ui/theme';
import { FactEditor } from './FactEditor';

type Change = (bundle: CaseBundle) => CaseBundle;
type Props = { bundle: CaseBundle; onChange(change: Change): Promise<CaseBundle | void>; saved: boolean };

export function Review({ bundle, onChange, saved }: Props) {
  const { t } = useLanguage();
  const current = bundle.case;
  const [editing, setEditing] = useState<FieldId | null>(null);
  const [error, setError] = useState('');
  const readiness = getReadiness(current);
  const route = routeFor(current.service);
  const draft = makeDraft(current);
  const unresolved = readiness.unresolved.filter(field => current.facts[field]?.status !== 'proposed');

  function updateCase(next: Case) { onChange(b => withCase(b, next)).catch(() => {}); }

  async function save() {
    setError('');
    try {
      const reviewed = markReviewed(current, { expectedRevision: current.revision });
      await onChange(b => (b.case.revision === current.revision ? withCase(b, reviewed) : b));
    } catch (caught) {
      setError(caught instanceof Error ? t(caught.message) : t('The draft could not be saved.'));
    }
  }

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      {current.state === 'reviewed' && current.review && (
        <Card style={{ backgroundColor: C.deep }}>
          <View style={s.row}><ShieldCheck size={18} color="#9FD3B4" /><Label color="#9FD3B4">{t('REVIEWED DRAFT SAVED ON THIS DEVICE')}</Label></View>
          <Text style={{ fontSize: 20, color: '#EAF3EE', fontWeight: '600' }}>{t('Simulated receipt')} {current.review.receipt}</Text>
          <Text style={{ fontSize: 13, lineHeight: 20, color: '#B9D2C4' }}>{t('Prototype. Nothing was sent to a department.')} {saved ? t('Saved on this device.') : t('Saving…')} {t('Edit anything below to revise the draft.')}</Text>
        </Card>
      )}

      <Card>
        <Label color={C.green}>{t('DESTINATION')}</Label>
        <Text style={{ fontSize: 17, color: C.ink, fontWeight: '600' }}>{route?.department ?? t('Authority to be confirmed')}</Text>
        {route && <Body style={{ fontSize: 14, lineHeight: 21 }}>{t(route.reason)}</Body>}
      </Card>

      <View style={{ gap: 10 }}>
        <Text style={[s.subtitle, { fontSize: 20 }]}>{t('Your complaint')}</Text>
        <Card>
          <Text style={{ fontSize: 15, lineHeight: 24, color: C.ink }}>{draft}</Text>
        </Card>
      </View>

      <View style={{ gap: 10 }}>
        <Label>{t('EDIT A SECTION')}</Label>
        {(['story', 'outcome', 'rejection_reason', 'office'] as FieldId[]).map(field => (
          editing === field ? (
            <FactEditor key={field} field={field} current={current} onCancel={() => setEditing(null)} onDone={next => { setEditing(null); updateCase(next); }} />
          ) : (
            <Pressable key={field} accessibilityRole="button" accessibilityLabel={`${t('Edit')} ${t(FIELD_LABELS[field])}`} onPress={() => current.facts[field]?.status !== 'conflicting' && setEditing(field)} style={[s.between, { paddingVertical: 10, borderBottomWidth: 1, borderColor: C.line }]}>
              <Text style={{ fontSize: 15, color: C.ink }}>{t(FIELD_LABELS[field])}</Text>
              <View style={s.row}><Text style={{ fontSize: 13, color: C.muted }}>{t('Edit')}</Text><Pencil size={15} color={C.muted} /></View>
            </Pressable>
          )
        ))}
      </View>

      <Card>
        <View style={s.between}><Label color={C.green}>{t('ATTACHMENTS')}</Label><Chip>{bundle.evidence.length}</Chip></View>
        {bundle.evidence.length ? bundle.evidence.map(evidence => <Text key={evidence.id} style={{ fontSize: 14, color: C.ink }}>• {evidence.name} <Text style={{ color: C.muted }}>({evidence.check === 'simulated' ? t('simulated check') : evidence.check})</Text></Text>) : <Body style={{ fontSize: 14 }}>{t('No documents attached. You can still save the draft.')}</Body>}
      </Card>

      {(unresolved.length > 0 || readiness.blockers.length > 0) && (
        <Card style={{ backgroundColor: C.paleAmber }}>
          <Label color={C.amber}>{t('STILL OPEN')}</Label>
          {readiness.blockers.map(blocker => <Text key={`b-${blocker.field}`} style={{ fontSize: 14, lineHeight: 21, color: C.ink }}>• {t(blocker.reason)}</Text>)}
          {unresolved.filter(field => !readiness.blockers.some(b => b.field === field)).map(field => <Text key={field} style={{ fontSize: 14, lineHeight: 21, color: C.ink }}>• {t(FIELD_LABELS[field])} {t('is unknown. The complaint says so; you can add it later.')}</Text>)}
        </Card>
      )}

      <ErrorBox text={error} />
      {current.state !== 'reviewed' && (
        <Button onPress={save} disabled={!canReview(current)} icon={<ShieldCheck size={18} color="white" />}>{t('Save reviewed draft')}</Button>
      )}
      <Text style={{ fontSize: 12, lineHeight: 19, color: C.muted }}>{t('Saving marks this exact version as reviewed by you. Any later edit asks for a fresh review. The receipt is simulated; no department receives anything from this prototype.')}</Text>
    </ScrollView>
  );
}
