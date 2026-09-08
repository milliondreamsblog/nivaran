import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { FileText, Trash2 } from 'lucide-react-native';
import type { CaseBundle } from '../db/types';
import type { Case } from '../core/index';
import { evidenceImage, evidenceSummary, removeEvidence, withCase } from '../assistant/bundle';
import { useLanguage } from '../i18n';
import { Body, C, Card, Chip, ErrorBox, Label, s } from '../ui/theme';
import { ConflictCard } from './FactsCard';
import { AttachOptions, attachDocument, type AttachKind } from './AttachSheet';

type Change = (bundle: CaseBundle) => CaseBundle;
type Props = { bundle: CaseBundle; onChange(change: Change): Promise<CaseBundle | void>; demoCode: string };

const PURPOSE: Record<string, string> = { relieving_letter: 'Shows your employment exit date', claim_rejection: 'Shows what the office decided and why', other: 'Supporting document' };

export function Documents({ bundle, onChange, demoCode }: Props) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function add(kind: AttachKind) {
    setError(''); setBusy(true);
    try {
      await attachDocument(kind, demoCode, onChange);
    } catch (caught) {
      setError(caught instanceof Error ? t(caught.message) : t('This document could not be added. Your draft is unchanged.'));
    } finally {
      setBusy(false);
    }
  }

  function updateCase(next: Case) { onChange(b => withCase(b, next)).catch(() => {}); }

  return (
    <ScrollView contentContainerStyle={s.page}>
      <ConflictCard current={bundle.case} onChange={updateCase} />
      <View style={{ gap: 6 }}>
        <Text style={[s.subtitle, { fontSize: 20 }]}>{t('Documents')}</Text>
        <Body style={{ fontSize: 14, lineHeight: 21 }}>{t('Helpful, not required. We read the dates on a document and ask you if they disagree with what you said. A check is not proof of authenticity.')}</Body>
      </View>

      {bundle.evidence.map(evidence => {
        const image = evidenceImage(evidence);
        return (
          <Card key={evidence.id}>
            <View style={[s.row, { alignItems: 'flex-start' }]}>
              {image ? <Image source={{ uri: image }} style={{ width: 54, height: 68, borderRadius: 8, backgroundColor: '#EEE' }} resizeMode="cover" accessibilityLabel={evidence.name} /> : <View style={{ width: 54, height: 68, borderRadius: 8, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}><FileText size={22} color={C.deep} /></View>}
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink }} numberOfLines={1}>{evidence.name}</Text>
                <Text style={{ fontSize: 12, color: C.muted }}>{t(PURPOSE[evidence.purpose] ?? PURPOSE.other)}</Text>
                <Chip warning={evidence.check === 'unreadable'}>{evidence.check === 'unreadable' ? t('Could not read') : evidence.check === 'simulated' ? t('Simulated check') : t('Checked')}</Chip>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`${t('Remove')} ${evidence.name}`} onPress={() => onChange(b => removeEvidence(b, evidence.id)).catch(() => {})} style={{ padding: 8 }}><Trash2 size={18} color={C.muted} /></Pressable>
            </View>
            <Text style={{ fontSize: 14, lineHeight: 21, color: evidence.check === 'unreadable' ? C.amber : C.ink }}>{evidenceSummary(evidence, t)}</Text>
          </Card>
        );
      })}

      {busy && <Text style={{ color: C.muted, fontSize: 14 }}>{t('Reading document…')}</Text>}
      <ErrorBox text={error} />

      <Card style={{ gap: 10 }}>
        <Label color={C.green}>{t('ADD A DOCUMENT')}</Label>
        <AttachOptions onPick={add} disabled={busy} />
      </Card>
      <Text style={{ fontSize: 12, lineHeight: 19, color: C.muted }}>{t('Only the two sample documents get a real reading in this demo. Other files are kept with the draft and marked as not read.')}</Text>
    </ScrollView>
  );
}
