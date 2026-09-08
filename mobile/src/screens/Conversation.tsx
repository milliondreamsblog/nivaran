// The chat. Citizen on the right in green, Nivaran on the left in white with a small avatar, documents inline,
// the facts card and the one open question as cards, and a composer with the mic and attach icons inside.
import React, { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ArrowUp, CheckCheck, FileText, Mic, Paperclip, ShieldCheck } from 'lucide-react-native';
import { canReview, getReadiness, nextQuestion, setUnknown, type Case, type Evidence, type Message, type ProposalResult } from '../core/index';
import type { CaseBundle } from '../db/types';
import { answer, describe, questionText } from '../assistant/guided';
import { interpret } from '../assistant/answers';
import { addMessage, applyCalls, evidenceImage, evidenceParts, proposeStory, withCase } from '../assistant/bundle';
import type { Tab } from '../assistant/next';
import { contextUpdate } from '../voice/prompt';
import { ChatUnavailable, runChatTurn } from '../assistant/chat';
import { useVoice } from '../voice/useVoice';
import type { ToolCall } from '../voice/session';
import { useLanguage } from '../i18n';
import { getSetting } from '../settings';
import { AI_CHAT_SETTING } from '../config';
import { Avatar, C, ErrorBox, Label, s } from '../ui/theme';
import { ConflictCard, FactsCard } from './FactsCard';
import { VoicePanel } from './VoicePanel';
import { AttachSheet } from './AttachSheet';

type Change = (bundle: CaseBundle) => CaseBundle;
type Props = {
  bundle: CaseBundle;
  onChange(change: Change): Promise<CaseBundle | void>;
  initialMode?: string;
  demoCode: string;
  setDemoCode(code: string): void;
  goTo(tab: Tab): void;
};
type Item = { at: number; key: string; message?: Message; evidence?: Evidence };
type T = (text: string) => string;

const clock = (at: number) => new Date(at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase();

export function Conversation({ bundle, onChange, initialMode, demoCode, setDemoCode, goTo }: Props) {
  const { t, lang } = useLanguage();
  const current = bundle.case;
  const [text, setText] = useState('');
  const [voiceOpen, setVoiceOpen] = useState(initialMode === 'voice');
  const [attachOpen, setAttachOpen] = useState(false);
  const [error, setError] = useState('');
  // The model handles typed chat while the server answers; the scripted questions only take over when it cannot.
  const [aiThinking, setAiThinking] = useState(false);
  const [aiDown, setAiDown] = useState(!demoCode);
  const [aiSetting, setAiSetting] = useState<'on' | 'off' | null>(null);
  const latest = useRef(bundle); latest.current = bundle;
  const toolRevision = useRef(-1);
  const scroll = useRef<ScrollView>(null);
  const autoReplied = useRef(false);
  useEffect(() => { getSetting(AI_CHAT_SETTING).then(value => { setAiSetting(value === 'off' ? 'off' : 'on'); if (value === 'off') setAiDown(true); }); }, []);
  const aiAllowed = aiSetting === 'on' && !!demoCode;

  // One retry covers a momentary model overload; after that the scripted questions take over until the model answers again.
  async function modelReply(): Promise<boolean> {
    setAiThinking(true);
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await runChatTurn(demoCode, () => latest.current, onChange);
          setAiDown(false);
          return true;
        } catch (caught) {
          if (!(caught instanceof ChatUnavailable)) { setError(caught instanceof Error ? t(caught.message) : t('That answer could not be saved.')); return false; }
          if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      if (!aiDown) await onChange(b => addMessage(b, t('The assistant is busy right now, so I will continue with a few quick questions.'), 'assistant', 'typed')).catch(() => {});
      setAiDown(true);
      return false;
    } finally {
      setAiThinking(false);
    }
  }

  // A chat opened from Home already holds the citizen's first message; answer it right away.
  useEffect(() => {
    const last = bundle.messages[bundle.messages.length - 1];
    if (!autoReplied.current && aiAllowed && last?.speaker === 'citizen' && bundle.messages.every(m => m.speaker === 'citizen') && initialMode !== 'voice') {
      autoReplied.current = true;
      modelReply();
    }
  }, [bundle.messages.length, aiAllowed]);

  const voice = useVoice({
    demoCode,
    getCase: () => latest.current.case,
    async applyCalls(calls: ToolCall[], cancelledIds: string[]) {
      let result: ProposalResult | null = null;
      try {
        await onChange(b => { const applied = applyCalls(b, calls, { source: 'voice', cancelledCallIds: cancelledIds }); result = applied.result; return applied.bundle; });
      } catch { /* the save status shows the failure; the model still gets the validated result */ }
      if (!result) result = applyCalls(latest.current, calls, { source: 'voice', cancelledCallIds: cancelledIds }).result;
      toolRevision.current = (result as ProposalResult).case.revision;
      return result as ProposalResult;
    },
    onCitizen: transcript => { onChange(b => { const withMessage = addMessage(b, transcript, 'citizen', 'voice'); return proposeStory(withMessage, transcript, withMessage.messages[withMessage.messages.length - 1].id); }).catch(() => {}); },
    onAssistant: reply => { onChange(b => addMessage(b, reply, 'assistant', 'voice')).catch(() => {}); },
  });

  useEffect(() => {
    if (voice.connected && current.revision !== toolRevision.current) voice.sendContext(contextUpdate(current));
  }, [current.revision, voice.connected]);
  useEffect(() => { scroll.current?.scrollToEnd({ animated: true }); }, [bundle.messages.length, bundle.evidence.length, current.revision]);

  const question = nextQuestion(current);
  const guidedQuestion = !voice.connected && aiDown && !aiThinking && question && question.kind === 'answer' ? question : null;
  const items: Item[] = [
    ...bundle.messages.map(message => ({ at: message.createdAt, key: message.id, message })),
    ...bundle.evidence.map(evidence => ({ at: evidence.createdAt, key: evidence.id, evidence })),
  ].sort((a, b) => a.at - b.at);
  const rejected = current.facts.claim_status?.value === 'rejected';
  const suggestAttach = rejected && !bundle.evidence.length && !!current.facts.rejection_reason;

  function updateCase(next: Case) { onChange(b => withCase(b, next)).catch(() => {}); }

  async function send() {
    const value = text.trim();
    if (!value) return;
    setText(''); setError('');
    if (voice.connected) {
      await onChange(b => addMessage(b, value, 'citizen', 'typed')).catch(() => {});
      voice.sendText(value);
      return;
    }
    if (aiAllowed) {
      // Always try the model first, even after a failure, so a passing overload heals itself.
      // Store the message, keep the first message as the proposed story, then let the model answer.
      await onChange(b => { const withMessage = addMessage(b, value, 'citizen', 'typed'); return withMessage.case.facts.story ? withMessage : withCase(withMessage, describe(withMessage.case, value)); }).catch(() => {});
      if (await modelReply()) return;
      // The server is not reachable: fall through to the scripted questions for this and later messages.
    }
    try {
      await onChange(b => {
        const alreadyStored = b.messages[b.messages.length - 1]?.text === value && b.messages[b.messages.length - 1]?.speaker === 'citizen';
        const withMessage = alreadyStored ? b : addMessage(b, value, 'citizen', 'typed');
        const pending = nextQuestion(withMessage.case);
        if (!withMessage.case.facts.story) return withCase(withMessage, describe(withMessage.case, value));
        if (pending && pending.kind === 'answer') return withCase(withMessage, answer(withMessage.case, pending.field, interpret(pending.field, value)));
        return withCase(withMessage, describe(withMessage.case, value));
      });
    } catch (caught) {
      setError(caught instanceof Error ? t(caught.message) : t('That answer could not be saved.'));
    }
  }

  function pickOption(value: string) {
    if (!guidedQuestion) return;
    try { setError(''); updateCase(value === 'unknown' ? setUnknown(current, guidedQuestion.field, { source: 'guided' }) : answer(current, guidedQuestion.field, value)); }
    catch (caught) { setError(caught instanceof Error ? t(caught.message) : t('That answer could not be saved.')); }
  }

  if (voiceOpen) {
    return (
      <View style={{ flex: 1 }}>
        <VoicePanel voice={voice} demoCode={demoCode} setDemoCode={setDemoCode} onClose={() => { voice.stop(); setVoiceOpen(false); }} />
        {Object.values(current.facts).some(fact => fact?.status === 'proposed' || fact?.status === 'conflicting') && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 12, gap: 12 }}>
            <ConflictCard current={current} onChange={updateCase} />
            <FactsCard current={current} onChange={updateCase} />
          </View>
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scroll} contentContainerStyle={[s.page, { paddingTop: 6, paddingBottom: 16, gap: 12 }]} keyboardShouldPersistTaps="handled">
        {!bundle.messages.length && (
          <AssistantBubble at={current.createdAt} text={t('Hello. What happened? Tell me in your own words and I will note the important details.')} t={t} />
        )}
        {items.map(item => item.message ? (
          item.message.speaker === 'citizen' ? <CitizenBubble key={item.key} message={item.message} /> : <AssistantBubble key={item.key} at={item.message.createdAt} text={item.message.text} spoken={item.message.mode === 'voice'} t={t} />
        ) : (
          <EvidenceBubble key={item.key} evidence={item.evidence!} t={t} />
        ))}
        {(voice.state === 'thinking' || aiThinking) && <TypingBubble />}

        <ConflictCard current={current} onChange={updateCase} />
        <FactsCard current={current} onChange={updateCase} />

        {guidedQuestion && (
          <View style={questionCard}>
            <Label color={C.green}>{t('ONE QUESTION')}</Label>
            <Text style={{ fontSize: 18, lineHeight: 26, color: C.ink, fontWeight: '600' }}>{questionText(current, lang)}</Text>
            <Text style={{ fontSize: 13, lineHeight: 19, color: C.muted }}>{t(guidedQuestion.reason)}</Text>
            {guidedQuestion.options.length > 0 && (
              <View style={[s.row, { flexWrap: 'wrap' }]}>
                {guidedQuestion.options.map(option => (
                  <Pressable key={option.value} accessibilityRole="button" onPress={() => pickOption(option.value)} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 30, backgroundColor: option.value === 'unknown' ? C.surface : C.mint }}>
                    <Text style={{ color: C.deep, fontWeight: '600', fontSize: 14 }}>{lang === 'hi' ? option.textHi : option.textEn}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
        {!question && aiDown && current.state !== 'reviewed' && !canReview(current) && (
          <View style={[questionCard, { backgroundColor: C.paleAmber, borderColor: '#EBD9B8' }]}>
            <Text style={{ fontSize: 16, lineHeight: 24, color: C.ink }}>{t(getReadiness(current).blockers[0]?.reason ?? 'Your draft is ready to review. You can still edit any answer.')}</Text>
            {current.service === 'withdrawal' && <Text style={{ fontSize: 13, lineHeight: 19, color: C.muted }}>{t('Change the service in Overview if this was actually a transfer.')}</Text>}
          </View>
        )}

        {(suggestAttach || (canReview(current) && current.state !== 'reviewed') || current.state === 'reviewed') && (
          <View style={[s.row, { flexWrap: 'wrap', justifyContent: 'flex-end' }]}>
            {suggestAttach && <Suggestion icon={<Paperclip size={15} color={C.deep} />} label={t('Attach the rejection message or a letter')} onPress={() => setAttachOpen(true)} />}
            {canReview(current) && current.state !== 'reviewed' && <Suggestion icon={<ShieldCheck size={15} color={C.deep} />} label={t('Review your complaint')} onPress={() => goTo('review')} />}
            {current.state === 'reviewed' && <Suggestion icon={<ShieldCheck size={15} color={C.deep} />} label={t('See the reviewed draft')} onPress={() => goTo('review')} />}
          </View>
        )}
        <ErrorBox text={error} />
      </ScrollView>

      <View style={[s.footer, s.row, { paddingBottom: 12 }]}>
        <View style={[s.row, { flex: 1, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 28, paddingLeft: 18, paddingRight: 6, minHeight: 54, gap: 2 }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={guidedQuestion ? t('Type your answer…') : t('Send a message…')}
            placeholderTextColor="#98A79C"
            multiline
            style={{ flex: 1, minHeight: 44, maxHeight: 120, paddingVertical: 12, fontSize: 16, lineHeight: 22, color: C.ink }}
            accessibilityLabel="Message"
            onSubmitEditing={send}
            blurOnSubmit
          />
          {text.trim() ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={send} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}><ArrowUp size={20} color="white" /></Pressable>
          ) : (
            <>
              <Pressable accessibilityRole="button" accessibilityLabel={t('Speak instead')} onPress={() => setVoiceOpen(true)} style={iconSlot}><Mic size={21} color={C.ink} /></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={t('Attach a document')} onPress={() => setAttachOpen(true)} style={iconSlot}><Paperclip size={20} color={C.ink} /></Pressable>
            </>
          )}
        </View>
      </View>
      <AttachSheet open={attachOpen} onClose={() => setAttachOpen(false)} demoCode={demoCode} onChange={onChange} />
    </KeyboardAvoidingView>
  );
}

function Suggestion({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress(): void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.row, { gap: 6, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 30, backgroundColor: C.mint, opacity: pressed ? 0.7 : 1 }]}>
      {icon}<Text style={{ fontSize: 13, fontWeight: '600', color: C.deep }}>{label}</Text>
    </Pressable>
  );
}

function AssistantBubble({ text, at, spoken = false, t }: { text: string; at: number; spoken?: boolean; t: T }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginRight: 40 }}>
      <Avatar size={28} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={bubbleAssistant}>
          <Text style={{ fontSize: 16, lineHeight: 24, color: C.ink }}>{text}</Text>
        </View>
        <Text style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{spoken ? `${t('Spoken')} · ` : ''}{clock(at)}</Text>
      </View>
    </View>
  );
}

function CitizenBubble({ message }: { message: Message }) {
  const spoken = message.mode === 'voice';
  return (
    <View style={bubbleCitizen}>
      {spoken && <Waveform seed={message.id} />}
      <Text style={{ fontSize: 16, lineHeight: 24, color: 'white' }}>{message.text}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 4 }}>
        <Text style={{ fontSize: 11, color: '#D7F0DF' }}>{clock(message.createdAt)}</Text>
        <CheckCheck size={14} color="#D7F0DF" />
      </View>
    </View>
  );
}

/** Decorative bars for a spoken message, deterministic per message so they do not jump on re-render. */
function Waveform({ seed }: { seed: string }) {
  let x = 0; for (let i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) >>> 0;
  const bars = Array.from({ length: 26 }, (_, i) => { x = (x * 1103515245 + 12345) >>> 0; return 4 + ((x >>> 8) % 18) * (i % 5 === 0 ? 0.5 : 1); });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}><Mic size={15} color="white" /></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 }} accessibilityElementsHidden>
        {bars.map((h, i) => <View key={i} style={{ width: 3, borderRadius: 2, height: h, backgroundColor: 'rgba(255,255,255,0.85)' }} />)}
      </View>
    </View>
  );
}

function EvidenceBubble({ evidence, t }: { evidence: Evidence; t: T }) {
  const image = evidenceImage(evidence);
  const parts = evidenceParts(evidence);
  const reading = parts.unreadable
    ? `${t('No details could be read from this file.')} ${t('I have kept the file with your draft.')}`
    : `${parts.date ? `${t('Date of exit found:')} ${parts.date}` : t('No exit date found')} · ${parts.simulated ? t('Simulated check') : t('AI check')}. ${parts.date ? t('I have kept the file with your draft and noted the date.') : t('I have kept the file with your draft.')}`;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ alignSelf: 'flex-end', alignItems: 'flex-end', gap: 4 }}>
        {image ? (
          <Image source={{ uri: image }} style={{ width: 150, height: 190, borderRadius: 18, backgroundColor: '#EEE' }} resizeMode="cover" accessibilityLabel={`${t('Attached')} ${evidence.name}`} />
        ) : (
          <View style={[s.row, { backgroundColor: C.green, borderRadius: 18, padding: 14 }]}><FileText size={18} color="white" /><Text style={{ color: 'white', fontWeight: '600' }}>{evidence.name}</Text></View>
        )}
        <View style={[s.row, { gap: 4 }]}><Text style={{ fontSize: 11, color: C.muted }}>{clock(evidence.createdAt)}</Text><CheckCheck size={14} color={C.muted} /></View>
      </View>
      <AssistantBubble at={evidence.createdAt + 1} text={reading} t={t} />
    </View>
  );
}

function TypingBubble() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
      <Avatar size={28} />
      <View style={[bubbleAssistant, { flex: 0, flexDirection: 'row', gap: 5, paddingVertical: 14 }]}>
        {[0, 1, 2].map(i => <View key={i} style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: '#B9C3BD' }} />)}
      </View>
    </View>
  );
}

const bubbleAssistant = { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 20, borderBottomLeftRadius: 6, padding: 14 };
const bubbleCitizen = { backgroundColor: C.green, borderRadius: 20, borderBottomRightRadius: 6, padding: 14, marginLeft: 48, alignSelf: 'flex-end' as const, maxWidth: '84%' as const, minWidth: 120 };
const questionCard = { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 22, padding: 18, gap: 10 };
const iconSlot = { width: 40, height: 40, borderRadius: 20, alignItems: 'center' as const, justifyContent: 'center' as const };
