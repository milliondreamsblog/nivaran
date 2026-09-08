import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight, Pencil } from 'lucide-react-native';
import { FIELD_IDS, PF_TRANSFER_FIELDS, getReadiness, routeFor, type Case, type FieldId } from '../core/index';
import type { CaseBundle } from '../db/types';
import { FIELD_LABELS, displayValue } from '../assistant/guided';
import { missingLine, nextAction, type Tab } from '../assistant/next';
import { useLanguage } from '../i18n';
import { Body, Button, C, Card, Chip, Label, s } from '../ui/theme';
import { FactEditor } from './FactEditor';
import { ConflictCard, FactsCard } from './FactsCard';

type Props = { bundle: CaseBundle; onCase(next: Case): void; goTo(tab: Tab): void };

const STATUS: Record<string, string> = { confirmed: 'Confirmed', proposed: 'Proposed', unknown: 'Unknown', conflicting: 'Conflicting' };

export function Overview({ bundle, onCase, goTo }: Props) {
  const { t, lang } = useLanguage();
  const current = bundle.case;
  const [editing, setEditing] = useState<FieldId | null>(null);
  const action = nextAction(current, lang);
  const actionTitle = action.field ? `${t(action.title)} ${t(FIELD_LABELS[action.field]).toLowerCase()}` : t(action.title);
  const actionDetail = action.count ? `${action.count} ${t(action.detail)}` : t(action.detail);
  const route = routeFor(current.service);
  const readiness = getReadiness(current);
  const shown = FIELD_IDS.filter(field => current.facts[field] || !PF_TRANSFER_FIELDS[field].allowUnknown || field === 'office');

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Card style={{ backgroundColor: C.deep }}>
        <Label color="#9FD3B4">{t('NEXT STEP')}</Label>
        <Text style={{ fontSize: 21, lineHeight: 28, color: '#EAF3EE', fontWeight: '600' }}>{actionTitle}</Text>
        {!!actionDetail && <Text style={{ fontSize: 14, lineHeight: 21, color: '#B9D2C4' }}>{actionDetail}</Text>}
        {!!missingLine(current) && <Text style={{ fontSize: 13, color: '#F3D9A4' }}>{t(missingLine(current))}</Text>}
        <Button onPress={() => goTo(action.tab)} icon={<ChevronRight size={18} color="white" />}>{action.tab === 'review' ? t('Open review') : action.tab === 'documents' ? t('Open documents') : t('Continue')}</Button>
      </Card>

      <ConflictCard current={current} onChange={onCase} />
      <FactsCard current={current} onChange={onCase} />

      <View style={{ gap: 10 }}>
        <View style={s.between}><Text style={[s.subtitle, { fontSize: 20 }]}>{t('Your answers')}</Text><Label>{current.state === 'reviewed' ? t('REVIEWED') : current.state === 'ready' ? t('READY') : t('IN PROGRESS')}</Label></View>
        {shown.map(field => {
          const fact = current.facts[field];
          if (editing === field) return <FactEditor key={field} field={field} current={current} onCancel={() => setEditing(null)} onDone={next => { setEditing(null); onCase(next); }} />;
          return (
            <Pressable key={field} accessibilityRole="button" accessibilityLabel={`${t('Edit')} ${t(FIELD_LABELS[field])}`} onPress={() => fact?.status !== 'conflicting' && setEditing(field)}>
              <Card style={{ gap: 6 }}>
                <View style={s.between}>
                  <Text style={{ fontSize: 12, color: C.muted }}>{t(FIELD_LABELS[field])}</Text>
                  <View style={s.row}>
                    {fact ? <Chip warning={fact.status !== 'confirmed'}>{t(STATUS[fact.status])}</Chip> : <Chip warning>{t('Not answered')}</Chip>}
                    <Pencil size={15} color={C.muted} />
                  </View>
                </View>
                <Text style={{ fontSize: 16, lineHeight: 23, color: fact && fact.status !== 'unknown' ? C.ink : C.muted }} numberOfLines={field === 'story' ? 6 : 3}>
                  {fact?.status === 'conflicting' ? t('Two answers differ. Resolve above.') : fact ? t(displayValue(field, fact.value)) : t('Not yet answered')}
                </Text>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <Label color={C.green}>{t('WHERE THIS GOES')}</Label>
        {route ? (
          <>
            <Text style={{ fontSize: 17, color: C.ink, fontWeight: '600' }}>{route.department}</Text>
            <Body style={{ fontSize: 14, lineHeight: 21 }}>{t(route.reason)}</Body>
          </>
        ) : (
          <Body style={{ fontSize: 14, lineHeight: 21 }}>{t('The destination is shown once the service is confirmed as a PF transfer.')}</Body>
        )}
      </Card>

      <Card>
        <View style={s.between}><Label color={C.green}>{t('DOCUMENTS')}</Label><Chip>{bundle.evidence.length}</Chip></View>
        <Body style={{ fontSize: 14, lineHeight: 21 }}>{bundle.evidence.length ? bundle.evidence.map(e => e.name).join(', ') : t('A rejection message or a relieving letter helps. Nothing is required to prepare the draft.')}</Body>
        <Button secondary onPress={() => goTo('documents')}>{t('Open documents')}</Button>
      </Card>

      {!readiness.ready && current.state !== 'reviewed' && (
        <View style={{ gap: 6 }}>
          <Label>{t('BEFORE REVIEW')}</Label>
          {readiness.blockers.map(blocker => <Text key={blocker.field} style={{ fontSize: 13, color: C.muted, lineHeight: 19 }}>• {t(blocker.reason)}</Text>)}
        </View>
      )}
    </ScrollView>
  );
}
