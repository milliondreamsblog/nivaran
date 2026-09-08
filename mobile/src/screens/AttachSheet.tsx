// Bottom sheet for adding a document from the chat or the Documents screen. One shared attach path so both behave the same.
import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { Camera, FileText, FolderOpen, Image as ImageIcon, X } from 'lucide-react-native';
import type { CaseBundle } from '../db/types';
import { pickDocument, sampleDocument } from '../documents/files';
import { extractDocument } from '../documents/extract';
import { attachEvidence } from '../assistant/bundle';
import { useLanguage } from '../i18n';
import { C, Label, s } from '../ui/theme';

export type AttachKind = 'relieving-letter' | 'claim-rejection' | 'files' | 'camera' | 'gallery';
type Change = (bundle: CaseBundle) => CaseBundle;

/** Picks or loads a file, reads it, and attaches it to the case. Resolves false when the person cancelled. */
export async function attachDocument(kind: AttachKind, demoCode: string, onChange: (change: Change) => Promise<unknown>): Promise<boolean> {
  const file = kind === 'relieving-letter' || kind === 'claim-rejection' ? await sampleDocument(kind) : await pickDocument(kind);
  if (!file) return false;
  const purpose = kind === 'relieving-letter' ? 'relieving_letter' : kind === 'claim-rejection' ? 'claim_rejection' : 'other';
  const check = await extractDocument(file, purpose, demoCode);
  await onChange(b => attachEvidence(b, file, purpose, check));
  return true;
}

export function AttachOptions({ onPick, disabled }: { onPick(kind: AttachKind): void; disabled: boolean }) {
  const { t } = useLanguage();
  return (
    <View style={{ gap: 2 }}>
      <Pick label={t('Sample relieving letter')} hint={t('Fixture · says 31 March 2025')} icon={<FileText size={19} color={C.deep} />} onPress={() => onPick('relieving-letter')} disabled={disabled} />
      <Pick label={t('Sample rejection printout')} hint={t('Fixture · says 15 April 2025')} icon={<FileText size={19} color={C.deep} />} onPress={() => onPick('claim-rejection')} disabled={disabled} />
      <Pick label={t('Choose a file')} hint={t('PNG, JPG or PDF up to 2 MB')} icon={<FolderOpen size={19} color={C.deep} />} onPress={() => onPick('files')} disabled={disabled} />
      {Platform.OS !== 'web' && <Pick label={t('Take a photo')} hint={t('Camera')} icon={<Camera size={19} color={C.deep} />} onPress={() => onPick('camera')} disabled={disabled} />}
      {Platform.OS !== 'web' && <Pick label={t('From gallery')} hint={t('Photos')} icon={<ImageIcon size={19} color={C.deep} />} onPress={() => onPick('gallery')} disabled={disabled} />}
    </View>
  );
}

export function AttachSheet({ open, onClose, demoCode, onChange, onDone }: { open: boolean; onClose(): void; demoCode: string; onChange(change: Change): Promise<unknown>; onDone?(): void }) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function pick(kind: AttachKind) {
    setBusy(true); setError('');
    try {
      const added = await attachDocument(kind, demoCode, onChange);
      if (added) { onClose(); onDone?.(); }
    } catch (caught) {
      setError(caught instanceof Error ? t(caught.message) : t('This document could not be added. Your draft is unchanged.'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel={t('Close')} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} />
      <View style={{ backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30, gap: 12, width: '100%', maxWidth: 520, alignSelf: 'center' }}>
        <View style={s.between}>
          <Label color={C.green}>{t('ADD A DOCUMENT')}</Label>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Close')} onPress={onClose} style={s.circleButton}><X size={18} color={C.ink} /></Pressable>
        </View>
        <Text style={{ fontSize: 13, lineHeight: 19, color: C.muted }}>{t('Helpful, not required. We read the dates and ask you if they disagree with what you said.')} {busy ? t('Reading document…') : ''}</Text>
        <AttachOptions onPick={pick} disabled={busy} />
        {!!error && <Text style={{ color: C.red, fontSize: 13 }}>{error}</Text>}
      </View>
    </Modal>
  );
}

function Pick({ label, hint, icon, onPress, disabled }: { label: string; hint: string; icon: React.ReactNode; onPress(): void; disabled: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} disabled={disabled} style={({ pressed }) => [s.row, { paddingVertical: 10, opacity: disabled ? 0.5 : pressed ? 0.7 : 1 }]}>
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink }}>{label}</Text>
        <Text style={{ fontSize: 12, color: C.muted }}>{hint}</Text>
      </View>
    </Pressable>
  );
}
