'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Check, FileText, HelpCircle, RotateCcw, ShieldCheck, Paperclip } from 'lucide-react';
import { DRAFT_KEY, emptyCase, restoreCase, updateCase, routeFor, makeDraft, validateCase, validateFile, guidance, canPrepareAppeal } from '../../lib/research-model.mjs';

const steps = ['Your situation', 'Supporting evidence', 'Check your complaint'];

export default function PrototypePage() {
  const [data, setData] = useState(emptyCase);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState('Preparing your workspace');
  const [help, setHelp] = useState('');
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [resumed, setResumed] = useState(false);
  const files = useRef(new Map());
  const heading = useRef(null);
  const route = routeFor(data.service);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) { setData(restoreCase(JSON.parse(stored))); setResumed(true); }
    } catch { setSaved('Previous draft could not be read. You can start again.'); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); setSaved('Saved on this device'); }
    catch { setSaved('Device storage is unavailable. Download your draft before leaving.'); }
  }, [data, ready]);

  function change(patch) { setData(s => updateCase(s, patch)); }
  function move(step) { setData(s => ({ ...s, step })); setErrors({}); requestAnimationFrame(() => heading.current?.focus()); }
  function next() {
    const found = data.step === 0 ? validateCase(data) : {};
    setErrors(found);
    if (!Object.keys(found).length) move(data.step + 1);
  }
  function attach(event) {
    const chosen = [...event.target.files];
    const accepted = [];
    const messages = [];
    for (const file of chosen) {
      const problem = validateFile(file);
      if (problem) { messages.push(`${file.name}: ${problem}`); continue; }
      const id = `${file.name}:${file.size}`;
      files.current.set(id, file);
      accepted.push({ name: file.name, size: file.size, type: file.type, available: true });
    }
    if (accepted.length) setData(s => ({ ...s, reviewed: false, evidence: [...s.evidence.filter(old => !accepted.some(e => e.name === old.name && e.size === old.size)), ...accepted] }));
    setFileError(messages.join(' '));
    event.target.value = '';
  }
  function download() {
    const blob = new Blob(['RESEARCH PROTOTYPE — NOT SUBMITTED\n\n' + makeDraft(data)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'nivaran-test-draft.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function submitDemo() {
    const found = validateCase(data, 'review'); setErrors(found);
    if (Object.keys(found).length) return;
    setData(s => ({ ...s, step: 3, receipt: s.receipt || `SIM-${Date.now().toString(36).toUpperCase()}` }));
    requestAnimationFrame(() => heading.current?.focus());
  }
  const field = (name, label, hint, multiline = false) => <label className="rp-field" key={name}>
    <span>{label}</span>{hint && <small id={`${name}-hint`}>{hint}</small>}
    {multiline ? <textarea id={name} value={data[name]} onChange={e => change({ [name]: e.target.value })} rows={name === 'story' ? 5 : 3} maxLength={6000} aria-invalid={!!errors[name]} aria-describedby={`${name}-hint ${name}-error`} />
      : <input id={name} type={name.includes('Date') ? 'date' : 'text'} value={data[name]} onChange={e => change({ [name]: e.target.value })} aria-invalid={!!errors[name]} aria-describedby={`${name}-hint ${name}-error`} />}
    {errors[name] && <small className="rp-error" id={`${name}-error`}>{errors[name]}</small>}
  </label>;

  if (!ready) return <main className="rp"><p className="rp-loading" role="status">Opening your draft…</p></main>;

  return <main className="rp">
    <div className="rp-studybar">Research prototype · use fictional details · nothing is sent to government <Link href="/study">Moderator workspace ↗</Link></div>
    <header className="rp-header"><Link href="/prototype" className="rp-brand"><span>नि</span>Nivaran</Link><div className="rp-save" role="status"><ShieldCheck size={16} />{saved}</div></header>
    <div className="rp-wrap">
      <div className="rp-intro"><p className="rp-eyebrow">A clearer path to being heard</p><h1>Let’s put your case together.</h1><p>Start with what you know. We’ll keep the missing pieces visible.</p></div>
      {resumed && <div className="rp-notice"><RotateCcw size={18} /><span>Your draft is back. Files must be reselected after reopening.</span><button onClick={() => setResumed(false)} aria-label="Dismiss restored draft notice">Dismiss</button></div>}
      <div className="rp-grid">
        <section className="rp-card rp-main">
          {data.step < 3 && <nav className="rp-steps" aria-label="Complaint preparation steps">{steps.map((label, i) => <button key={label} onClick={() => i < data.step && move(i)} disabled={i > data.step} aria-current={i === data.step ? 'step' : undefined}><span>{i < data.step ? <Check size={14} /> : i + 1}</span>{label}</button>)}</nav>}
          <h2 ref={heading} tabIndex={-1}>{data.step < 3 ? steps[data.step] : 'Your test complaint is saved'}</h2>
          {Object.keys(errors).length > 0 && <div className="rp-validation" role="alert"><strong>A few things need your attention.</strong><ul>{Object.entries(errors).map(([key, value]) => <li key={key}>{value}</li>)}</ul></div>}

          {data.step === 0 && <>
            <p className="rp-muted">This first prototype covers EPFO transfer and withdrawal difficulties. Your answers stay editable.</p>
            <fieldset className="rp-field"><legend>What were you trying to do?</legend><div className="rp-choices">{[['transfer', 'Transfer my PF', 'Move it between employment accounts'], ['withdrawal', 'Withdraw my PF', 'Take money out'], ['unsure', 'I’m not sure', 'Help me understand']].map(([id, title, subtitle]) => <label className={data.service === id ? 'selected' : ''} key={id}><input type="radio" name="service" value={id} checked={data.service === id} onChange={() => { change({ service: id }); if (id === 'unsure') setHelp('service'); }} /><span><strong>{title}</strong><small>{subtitle}</small></span></label>)}</div></fieldset>
            {field('story', 'What happened?', 'Use your own words. Include previous attempts only if they actually happened in your test case.', true)}
            {field('outcome', 'What would you like the office to do?', 'For example: explain the rejection and identify any records that need correction.', true)}
            {field('rejection', 'Exact rejection wording, if you have it', 'Copy the wording from the response. Don’t guess.', true)}
            <label className="rp-check"><input type="checkbox" checked={data.rejectionUnknown} onChange={e => change({ rejectionUnknown: e.target.checked })} />I don’t have the exact rejection wording yet.</label>
            <details className="rp-details"><summary>Check an uncertain employment date</summary><p>Keep conflicting dates separate until you can verify one.</p>{field('rememberedDate', 'Date you remember', 'Leave blank if unknown.')}{field('documentDate', 'Date shown on your document', 'Leave blank if the document is unavailable.')}<label className="rp-field"><span>Which date can you confirm?</span><select value={data.dateChoice} onChange={e => change({ dateChoice: e.target.value })}><option value="unknown">Neither yet — keep it unconfirmed</option><option value="document">The document date</option><option value="remembered">The date I remember</option></select></label></details>
            <div className="rp-actions"><span className="rp-muted">No account or UAN needed to prepare this test draft.</span><button className="rp-primary" onClick={next}>Continue to evidence <ArrowRight size={17} /></button></div>
          </>}

          {data.step === 1 && <>
            <p className="rp-muted">Evidence should help explain your case. Missing documents won’t erase your progress.</p>
            <div className="rp-evidence-guide"><FileText size={23} /><div><strong>Rejection response</strong><p>Shows what the office decided and its stated reason.</p></div></div>
            <div className="rp-evidence-guide"><FileText size={23} /><div><strong>Employment record, if relevant</strong><p>A relieving letter may help check a disputed exit date.</p></div></div>
            <label className="rp-upload"><Paperclip size={23} /><strong>Add test documents</strong><span>PDF, PNG or JPG · up to 5 MB each in this prototype</span><input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={attach} /></label>
            <p className="rp-muted">Files are held in this browser session only. No upload takes place. Filename reminders survive reopening; file contents do not.</p>
            {fileError && <p className="rp-error" role="alert">{fileError}</p>}
            <ul className="rp-files">{data.evidence.map((e, index) => <li key={`${e.name}:${e.size}`}><div><strong>{e.name}</strong><small>{Math.ceil(e.size / 1024)} KB · {e.available ? 'Ready in this session' : 'Reselect this file after reopening'}</small></div><button onClick={() => { files.current.delete(`${e.name}:${e.size}`); change({ evidence: data.evidence.filter((_, i) => i !== index) }); }} aria-label={`Remove ${e.name}`}>Remove</button></li>)}</ul>
            <button className="rp-textbutton" onClick={() => setHelp('evidence')}>I don’t have these documents. What can I do?</button>
            {field('office', 'Handling office, if known', 'Optional while preparing. Check the claim response; don’t guess from your home address.')}
            <div className="rp-actions"><button className="rp-secondary" onClick={() => move(0)}><ArrowLeft size={16} /> Back</button><button className="rp-primary" onClick={next}>Review my complaint <ArrowRight size={17} /></button></div>
          </>}

          {data.step === 2 && <>
            <p className="rp-muted">Check the facts and proposed destination. Use Edit facts to correct the source answers; the draft will update.</p>
            <div className="rp-route"><span className="rp-eyebrow">Proposed department</span><h3>{route?.department || 'Needs confirmation'}</h3><p>{route?.ministry}</p><p>{route?.reason}</p><button className="rp-textbutton" onClick={() => move(0)}>Change the service or correct the facts</button></div>
            <label className="rp-check"><input type="checkbox" checked={data.confirmedRoute} onChange={e => setData(s => ({ ...s, confirmedRoute: e.target.checked, reviewed: false }))} />I have reviewed this proposed department.</label>
            <pre className="rp-draft">{makeDraft(data)}</pre>
            <div className="rp-actions rp-compact"><button className="rp-secondary" onClick={() => move(0)}>Edit facts</button><button className="rp-secondary" onClick={download}>Download draft</button></div>
            <p className="rp-muted">{data.evidence.length ? `${data.evidence.length} test file(s) listed. Files needing reselection must be reselected or removed.` : 'No supporting files added. You can return to evidence or continue without them.'}</p>
            <label className="rp-check"><input type="checkbox" checked={data.reviewed} onChange={e => setData(s => ({ ...s, reviewed: e.target.checked }))} />The draft reflects my test case, including any facts still unconfirmed.</label>
            <div className="rp-actions"><button className="rp-secondary" onClick={() => move(1)}><ArrowLeft size={16} /> Evidence</button><button className="rp-primary" onClick={submitDemo}>Save simulated complaint <Check size={17} /></button></div>
          </>}

          {data.step === 3 && <>
            <div className="rp-receipt"><Check size={30} /><p>Simulation reference</p><strong>{data.receipt}</strong><p>This is a local research record. No official grievance has been filed and no response clock has started.</p></div>
            <button className="rp-secondary" onClick={download}>Download the test draft</button>
            <details className="rp-details"><summary>Research exercise: understand an officer’s response</summary><p>The following response is a fictional fixture, not an actual case update.</p><button className="rp-secondary" onClick={() => setData(s => ({ ...s, responseShown: true }))}>Open sample closed-case response</button>
              {data.responseShown && <div className="rp-response"><h3>Office marked the case closed</h3><blockquote>“Contact your previous employer to verify the exit date. No further action at this office.”</blockquote><p>The office has closed its file and asked you to contact your previous employer. This response does not establish that the PF transfer completed.</p><p><strong>Your next decision:</strong> did this response resolve the issue?</p><div className="rp-choices">{[['good', 'Yes, resolved'], ['poor', 'No, still unresolved']].map(([id,label]) => <label key={id} className={data.feedback === id ? 'selected' : ''}><input type="radio" name="feedback" checked={data.feedback === id} onChange={() => setData(s => ({ ...s, feedback: id }))} /><span>{label}</span></label>)}</div>
                {canPrepareAppeal(data) && <><p>For this simulated central-government closed case, review an appeal explaining what remains unaddressed. Actual eligibility and time limits need checking against the case and current rules.</p><label className="rp-field"><span>What does the response leave unanswered?</span><textarea value={data.appeal} onChange={e => setData(s => ({ ...s, appeal: e.target.value }))} rows={4} /></label><p className="rp-muted">Saved with your local draft. This exercise does not submit an appeal.</p></>}
              </div>}
            </details>
          </>}
        </section>
        <aside className="rp-card rp-help"><span className="rp-help-icon"><HelpCircle size={23} /></span><h2>Help stays with you.</h2><p className="rp-muted">Getting stuck should not mean starting again.</p><div className="rp-help-options">{[['service', 'Transfer or withdrawal?'], ['office', 'Which office should I choose?'], ['uan', 'I don’t know my UAN'], ['evidence', 'I’m missing a document'], ['dates', 'My dates don’t match'], ['scope', 'Is another service covered?']].map(([id, text]) => <button key={id} onClick={() => setHelp(id)} aria-pressed={help === id}>{text}<ArrowRight size={14} /></button>)}</div><div className="rp-help-answer" role="status">{guidance(help)}</div><p className="rp-note">Guidance is scripted for this research prototype. It does not infer your facts.</p><button className="rp-textbutton" onClick={download}>Download what I have so far</button></aside>
      </div>
    </div>
  </main>;
}
