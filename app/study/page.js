'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OBSERVATIONS_KEY, finishObservation } from '../../lib/research-model.mjs';

const tasks = { preparation: 'Prepare an accurate PF complaint for review', recovery: 'Recover after interruption and reselect evidence', response: 'Explain a closed-case response and the next action' };
const eventTypes = ['Hesitation', 'Wrong choice', 'Asked for help', 'Moderator assisted', 'Lost work', 'Recovered', 'Error', 'Task paused'];
const OUTCOMES = ['Completed without help', 'Completed with help', 'Blocked', 'Abandoned'];

export default function StudyPage() {
  const [rows, setRows] = useState([]);
  const [active, setActive] = useState(null);
  const [ready, setReady] = useState(false);
  const [participant, setParticipant] = useState('');
  const [condition, setCondition] = useState('A');
  const [task, setTask] = useState('preparation');
  const [consent, setConsent] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState('');
  const [understanding, setUnderstanding] = useState('Not asked');
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(OBSERVATIONS_KEY) || '{}');
      if (Array.isArray(saved.rows)) setRows(saved.rows);
      if (saved.active?.startedAt && Array.isArray(saved.active.events)) setActive(saved.active);
    } catch { setError('Saved observations could not be read. Export new observations before leaving.'); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(OBSERVATIONS_KEY, JSON.stringify({ rows, active })); }
    catch { setError('Storage is unavailable. Export observations before leaving.'); }
  }, [rows, active, ready]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const liveRows = rows.filter(r => !r.dryRun);
  const participants = new Set(liveRows.map(r => r.participant));
  const pairCount = [...participants].reduce((n, id) => n + Object.keys(tasks).filter(t => ['A', 'B'].every(c => liveRows.some(r => r.participant === id && r.task === t && r.condition === c))).length, 0);
  function start() {
    if (!/^P\d{2,3}$/i.test(participant)) { setError('Use a participant code such as P01; do not enter a name.'); return; }
    if (!consent) { setError('Confirm permission to observe before starting.'); return; }
    setActive({ id: Date.now().toString(36), participant: participant.toUpperCase(), condition, task, dryRun, startedAt: Date.now(), events: [], consentConfirmed: true });
    setError(''); setNote(''); setOutcome(''); setUnderstanding('Not asked');
  }
  function record(type) {
    setActive(s => ({ ...s, events: [...s.events, { type, at: Date.now(), note: note.trim().slice(0, 2000) }] })); setNote('');
  }
  function finish() {
    if (!outcome) { setError('Choose the observed outcome. Completion is not inferred from clicks.'); return; }
    const hasHelp = active.events.some(e => e.type === 'Moderator assisted');
    if (hasHelp && outcome === 'Completed without help') { setError('Assistance was recorded. Use Completed with help, or explain and correct the record outside this tool.'); return; }
    const s = note.trim() ? { ...active, events: [...active.events, { type: 'Closing note', at: Date.now(), note: note.trim().slice(0, 2000) }] } : active;
    setRows(old => [...old, finishObservation(s, outcome, understanding)]); setActive(null); setNote(''); setError('');
  }
  function exportData() {
    const value = { exportedAt: new Date().toISOString(), interpretation: 'Moderator observations. Dry runs are not participant results. Wall-clock durations include pauses and interruptions. No causal improvement claim is computed.', rows, active };
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'nivaran-study-observations.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main className="rp"><div className="rp-studybar">Moderator workspace · observations stay on this device <Link href="/prototype">Open citizen prototype ↗</Link></div><div className="rp-wrap">
    <div className="rp-intro"><p className="rp-eyebrow">Evidence before claims</p><h1>Does the new flow help?</h1><p>Observe a task, record the obstacles, then compare equivalent tasks.</p></div>
    <div className="rp-notice">{participants.size} participants with recorded results · {liveRows.length} real-user task observations · {pairCount} participant/task pairs covering both flows. Dry runs are excluded.</div>
    <div className="rp-grid"><section className="rp-card">
      <h2>{active ? 'Observation in progress' : 'Start a task observation'}</h2>
      <p className="rp-muted">A = original CPGRAMS, B = this prototype. Original post-login tasks require a real consenting case or an authorised test environment. Do not file fictional grievances.</p>
      {error && <p className="rp-validation" role="alert">{error}</p>}
      {!active ? <>
        <label className="rp-field"><span>Participant code</span><input placeholder="P01" value={participant} onChange={e => setParticipant(e.target.value)} maxLength={4} /></label>
        <label className="rp-field"><span>Flow</span><select value={condition} onChange={e => setCondition(e.target.value)}><option value="A">A · Original CPGRAMS</option><option value="B">B · Nivaran prototype</option></select></label>
        <label className="rp-field"><span>Task</span><select value={task} onChange={e => setTask(e.target.value)}>{Object.entries(tasks).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label className="rp-check"><input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} />Facilitator dry run — exclude from user results</label>
        <label className="rp-check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />The participant agreed to observation, or I am testing the recorder myself.</label>
        <button className="rp-primary" onClick={start} disabled={!ready}>Start timer and observation</button>
      </> : <>
        <p><strong>{active.participant} · Flow {active.condition}</strong> · {tasks[active.task]}</p><p className="rp-muted">{active.dryRun ? 'Dry run' : 'Participant session'} · {Math.max(0, Math.floor((now - active.startedAt) / 1000))} seconds elapsed, including any breaks</p>
        <label className="rp-field"><span>What happened or what did the person say?</span><small>Use brief behavioural notes. Do not record passwords, account identifiers, names or private case details.</small><textarea value={note} onChange={e => setNote(e.target.value)} rows={3} maxLength={2000} /></label>
        <div className="rp-help-options">{eventTypes.map(type => <button key={type} onClick={() => record(type)}>{type}</button>)}</div>
        <ol className="rp-files">{active.events.map((e,i) => <li key={i}><div><strong>{e.type}</strong><small>{Math.round((e.at - active.startedAt) / 1000)} s · {e.note || 'No note recorded'}</small></div></li>)}</ol>
        <label className="rp-field"><span>Observed outcome</span><select value={outcome} onChange={e => setOutcome(e.target.value)}><option value="">Choose outcome</option>{OUTCOMES.map(o => <option key={o}>{o}</option>)}</select></label>
        <label className="rp-field"><span>Understanding of the next step</span><small>Ask the person to explain it in their own words, then score against the study guide.</small><select value={understanding} onChange={e => setUnderstanding(e.target.value)}>{['Not asked', 'Understood', 'Partly understood', 'Did not understand'].map(o => <option key={o}>{o}</option>)}</select></label>
        <button className="rp-primary" onClick={finish}>Finish and save observation</button>
      </>}
    </section><aside className="rp-card rp-help"><h2>Keep the comparison fair</h2><p className="rp-muted">Alternate which flow comes first. Use equivalent facts, the same device and the same stopping point.</p><ol style={{ listStyle: 'decimal', paddingLeft: 20, fontSize: 13 }}><li>Read the task without explaining the controls.</li><li>Let the person try. Record hesitation and mistakes.</li><li>Log every intervention.</li><li>Ask what they think will happen next.</li><li>Separate interface blocks from missing access or unavailable documents.</li></ol><div className="rp-help-answer">No improvement percentage is shown until real observations exist. Report raw counts and individual differences for a small study.</div><button className="rp-secondary" style={{ marginTop: 20 }} onClick={exportData}>Export observations (JSON)</button></aside></div>
    <section className="rp-card" style={{ marginTop: 24 }}><h2>Recorded observations</h2>{!rows.length ? <p className="rp-muted">No observations recorded. The earlier agent audit is evidence about the interface, not a participant comparison.</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', textAlign: 'left', fontSize: 13 }}><thead><tr>{['Participant', 'Flow / task', 'Outcome', 'Seconds', 'Understanding', 'Record type'].map(t => <th key={t} style={{ padding: 10 }}>{t}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r.id}><td style={{ padding: 10 }}>{r.participant}</td><td>{r.condition} · {r.task}</td><td>{r.outcome}</td><td>{r.elapsedSeconds}</td><td>{r.understanding}</td><td>{r.dryRun ? 'Dry run' : 'Participant'}</td></tr>)}</tbody></table></div>}</section>
  </div></main>;
}
