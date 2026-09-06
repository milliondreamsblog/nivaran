"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { History, Minimize2, Volume2, VolumeX, Mic, SendHorizontal, Loader2 } from "lucide-react";
import { addGrievance, newRegId, seedOnce } from "../lib/store";
import RadialProgress from "./RadialProgress";

const SUGGESTED = [
  "Mere mohalle mein 2 hafte se paani nahi aa raha, municipal office complaint nahi le raha",
  "My PF withdrawal claim has been pending for 2 months and no reason is given",
  "Road ke gaddhe se roz accident ho rahe hain, koi repair nahi hua",
];

const today = () => new Date().toISOString().slice(0, 10);

// Nivaran mark: the agent's avatar, standing where the navbar keeps its logo.
export function Mark({ size = 14 }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-forest text-white font-display font-bold select-none"
      style={{ width: size, height: size, fontSize: size * 0.55, lineHeight: 1 }}
      aria-hidden="true"
    >
      न
    </span>
  );
}

// The agent panel: variant="page" (inside the portal, with history/minimize
// nav) or "popup" (floating widget with a close button and its own inline
// success state).
export default function AgentPanel({ variant = "page", onClose, onFiled, onNavigate }) {
  const [messages, setMessages] = useState([]); // {role, content} — assistant content is raw JSON
  const [display, setDisplay] = useState([]); // {role, text} — what the chat pane shows
  const [agent, setAgent] = useState(null); // last parsed agent JSON
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState(null);
  const [lang, setLang] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [draft, setDraft] = useState("");
  const [location, setLocation] = useState("");
  const [filed, setFiled] = useState(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speakingNow, setSpeakingNow] = useState(false);
  const voiceOnRef = useRef(true);
  const recRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [display, busy]);

  useEffect(() => {
    voiceOnRef.current = voiceOn;
    if (!voiceOn) {
      try { window.speechSynthesis?.cancel(); } catch {}
      setSpeakingNow(false);
    }
  }, [voiceOn]);

  useEffect(() => {
    seedOnce(); // popup filings must not block the seeded demo states
    try { window.speechSynthesis?.getVoices(); } catch {}
    return () => { try { window.speechSynthesis?.cancel(); } catch {} };
  }, []);

  function speak(text) {
    if (!voiceOnRef.current || !text) return;
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const wantHindi = /[ऀ-ॿ]/.test(text); // Devanagari in the reply
      const voices = synth.getVoices();
      const pick =
        voices.find((v) => v.lang?.toLowerCase().startsWith(wantHindi ? "hi" : "en-in")) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith(wantHindi ? "hi" : "en"));
      if (pick) u.voice = pick;
      u.lang = wantHindi ? "hi-IN" : "en-IN";
      u.rate = 1;
      u.onstart = () => setSpeakingNow(true);
      u.onend = () => setSpeakingNow(false);
      u.onerror = () => setSpeakingNow(false);
      synth.speak(u);
    } catch {
      // no speech support: replies stay text-only
    }
  }

  async function send(text) {
    const clean = text.trim();
    if (!clean || busy) return;
    const nextMessages = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setDisplay((d) => [...d, { role: "user", text: clean }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const json = await res.json();
      const data = json.data;
      setSource(json.source);
      setAgent(data);
      if (data.draft_text) setDraft(data.draft_text);
      if (data.location_guess) setLocation(data.location_guess);
      setMessages((m) => [...m, { role: "assistant", content: JSON.stringify(data) }]);
      setDisplay((d) => [...d, { role: "assistant", text: data.chat_reply }]);
      speak(data.chat_reply);
    } catch {
      setDisplay((d) => [
        ...d,
        { role: "assistant", text: "Something went wrong on my side. Try that once more?" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function toggleMic() {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      setDisplay((d) => [
        ...d,
        { role: "assistant", text: "Voice input needs Chrome or Edge. Typing works the same." },
      ]);
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    try { window.speechSynthesis?.cancel(); } catch {} // don't transcribe our own voice
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript || "";
      setInput((prev) => (prev ? prev + " " + text : text));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function fileIt() {
    const id = `g-${Date.now()}`;
    const g = {
      id,
      regId: newRegId(),
      summary: agent?.summary || "Grievance",
      ministry: agent?.ministry,
      department: agent?.department,
      location: location || "Not specified",
      filedAt: today(),
      status: "filed",
      draft,
      events: [
        { day: 0, date: today(), label: "Filed", plain: "Your grievance was registered. The 21-day clock starts now." },
        {
          day: 0,
          date: today(),
          label: "Routed",
          plain: `Sent directly to ${agent?.department} — no manual category tree, so routing took seconds, not days.`,
        },
      ],
    };
    addGrievance(g);
    setShowReview(false);
    if (variant === "page" && onFiled) {
      onFiled(g);
    } else {
      setFiled(g);
    }
  }

  function resetConversation() {
    setFiled(null);
    setAgent(null);
    setMessages([]);
    setDisplay([]);
    setDraft("");
    setLocation("");
    setSource(null);
  }

  const ready = agent && agent.is_cpgrams_eligible && agent.draft_text && !agent.needs_clarification;

  const iconBtn =
    "btn-tactile flex items-center justify-center w-7 h-7 rounded-full bg-mist border border-line text-inksoft hover:bg-forestwash hover:text-forest transition-colors";

  return (
    <div className="rounded-3xl border border-line bg-card shadow-elevated p-4 sm:p-5 flex flex-col gap-4 h-full min-h-0">
      {/* panel header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`rounded-full ${speakingNow ? "speaking" : ""}`}>
            <Mark size={18} />
          </span>
          <span className="text-[14px] font-semibold text-ink">Nivaran</span>
          {source && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-mist text-mutedink">
              {source === "llm" ? "live model" : "offline mode"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLang(lang === "en-IN" ? "hi-IN" : "en-IN")}
            title="Voice recognition language"
            className="h-7 px-2.5 rounded-full bg-mist border border-line text-[11px] font-medium text-inksoft hover:bg-forestwash hover:text-forest transition-colors"
          >
            {lang === "en-IN" ? "EN" : "हि"}
          </button>
          <button
            onClick={() => setVoiceOn(!voiceOn)}
            title={voiceOn ? "Agent speaks its replies — tap to mute" : "Voice replies muted — tap to unmute"}
            className={iconBtn}
            aria-label={voiceOn ? "voice on" : "muted"}
          >
            {voiceOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          {variant === "page" && (
            <button onClick={() => onNavigate?.("/dashboard")} title="History — my grievances" className={iconBtn}>
              <History size={13} />
            </button>
          )}
          <button
            onClick={() => (variant === "popup" ? onClose?.() : onNavigate?.("/dashboard"))}
            title={variant === "popup" ? "Close" : "Minimize"}
            className={iconBtn}
          >
            <Minimize2 size={13} />
          </button>
        </div>
      </div>

      {filed ? (
        /* popup inline success */
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 rise">
          <div className="success-ripple pop-check w-14 h-14 rounded-full bg-forestwash text-forest flex items-center justify-center text-2xl font-bold">
            ✓
          </div>
          <p className="text-ink font-display font-bold text-xl">Grievance filed</p>
          <p className="text-inksoft text-sm">
            Registration ID <span className="font-mono font-semibold text-ink">{filed.regId}</span>
            <br />
            Routed to {filed.department}. The 21-day clock is running.
          </p>
          <div className="flex gap-2 mt-1">
            <Link
              href="/login"
              className="btn-tactile bg-forest hover:bg-forestdeep text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Track it in the portal
            </Link>
            <button
              onClick={resetConversation}
              className="btn-tactile border border-line rounded-lg px-4 py-2 text-sm text-inksoft hover:bg-mist"
            >
              File another
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
          {/* chat rail */}
          <div className="flex flex-col lg:w-[260px] shrink-0 min-h-[220px]">
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
              {display.length === 0 && (
                <div className="flex flex-col gap-2">
                  <Mark size={14} />
                  <p className="text-[14px] leading-[1.5] text-inksoft">
                    Tell Nivaran what happened — Hindi, English, ya mixed. No forms, no category trees. Try one of
                    these, or tap the mic:
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    {SUGGESTED.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-[12.5px] leading-[1.45] text-inksoft bg-mist border border-line rounded-xl px-3 py-2 hover:bg-forestwash hover:border-forest/30 transition-colors"
                      >
                        "{s}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {display.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end rise">
                    <div className="max-w-[92%] bg-forest text-white px-3 py-2 rounded-[18px] rounded-br-[4px] text-[14px] leading-[1.4]">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex flex-col gap-1.5 pb-1 rise">
                    <Mark size={14} />
                    <p className="text-[14px] leading-[1.5] text-inksoft">{m.text}</p>
                  </div>
                )
              )}
              {busy && (
                <div className="flex items-center gap-1 py-1.5" aria-label="Nivaran is thinking">
                  <span className="tdot" />
                  <span className="tdot" />
                  <span className="tdot" />
                </div>
              )}
              {agent?.needs_clarification && !busy && (
                <div className="flex flex-wrap gap-1.5 rise">
                  {agent.clarification_chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="chip-tactile text-[12.5px] border border-forest/30 text-forest rounded-full px-3 py-1.5 hover:bg-forestwash transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* input */}
            <div className="mt-3 flex items-center gap-1.5">
              <button
                onClick={toggleMic}
                title={listening ? "Stop listening" : "Speak"}
                className={`btn-tactile flex items-center justify-center w-9 h-9 rounded-full border transition-colors shrink-0 ${
                  listening
                    ? "mic-listening-pulse bg-alert border-alert text-white"
                    : "bg-mist border-line text-inksoft hover:bg-forestwash hover:text-forest"
                }`}
              >
                <Mic size={15} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder={listening ? "listening…" : "Describe your problem"}
                className="flex-1 min-w-0 bg-mist border border-line rounded-full px-3.5 py-2 text-[13.5px] text-ink placeholder-mutedink focus:outline-none focus:border-forest"
              />
              <button
                onClick={() => send(input)}
                disabled={busy}
                title="Send"
                className="btn-tactile flex items-center justify-center w-9 h-9 rounded-full bg-forest text-white disabled:opacity-40 shrink-0"
              >
                {busy ? <Loader2 size={15} className="spin-loader" /> : <SendHorizontal size={15} />}
              </button>
            </div>
          </div>

          {/* embedded portal window */}
          <div className="flex-1 min-h-[280px] rounded-xl overflow-hidden border border-line bg-paper flex flex-col">
            <div className="h-8 shrink-0 bg-cream border-b border-line flex items-center px-3 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-alert/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-saffron/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-forest/70" />
              <span className="flex-1 text-center text-[11px] text-mutedink truncate">
                pgportal.gov.in — grievance form · Nivaran is filling this for you
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <LightField label="Ministry" value={agent?.ministry} />
              <LightField label="Department / Office" value={agent?.department} />
              <LightField label="Grievance summary" value={agent?.summary} />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Location</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City / district (edit me)"
                  className="bg-card border border-line rounded-lg px-3 py-2 text-[13.5px] text-ink placeholder-mutedink focus:outline-none focus:border-forest"
                />
              </div>

              {agent && agent.ministry && (
                <div className="rise border border-line rounded-lg p-3 bg-card">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Routing</span>
                    <div className="ml-auto flex items-center gap-2">
                      <RadialProgress
                        value={agent.confidence || 0}
                        size={30}
                        strokeWidth={3}
                        color={(agent.confidence || 0) >= 0.75 ? "#1e4d3a" : "#d97b2b"}
                      >
                        <span className="text-[9px] font-bold text-ink">
                          {Math.round((agent.confidence || 0) * 100)}
                        </span>
                      </RadialProgress>
                      <span className="text-[11px] text-mutedink font-medium">confident</span>
                    </div>
                  </div>
                  <ul className="mt-2 text-[13px] leading-relaxed text-inksoft list-disc pl-5">
                    {(agent.routing_reasons || []).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  {(agent.priority_flags || []).length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {agent.priority_flags.map((f) => (
                        <span
                          key={f}
                          className="text-[10.5px] px-2 py-0.5 rounded-full bg-alertwash text-alert font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {agent && !agent.is_cpgrams_eligible && (
                <div className="rise border border-saffron/40 rounded-lg p-3 bg-saffronwash text-[13px] text-ink">
                  <p className="font-semibold">This one isn't a CPGRAMS matter</p>
                  <p className="mt-1 text-inksoft">{agent.excluded_reason}</p>
                </div>
              )}

              {agent?.draft_text && (
                <div className="flex flex-col gap-1 rise rounded-lg">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">
                    Drafted grievance (yours to edit)
                  </span>
                  <pre className="whitespace-pre-wrap text-[13px] leading-relaxed border border-line rounded-lg p-3 bg-card font-body text-inksoft max-h-52 overflow-y-auto">
                    {draft}
                  </pre>
                </div>
              )}

              {ready && (
                <button
                  onClick={() => setShowReview(true)}
                  className="btn-tactile pulse-cta rise bg-forest hover:bg-forestdeep text-white font-semibold rounded-lg py-2.5 mt-1 transition-colors"
                >
                  Review &amp; file
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* review modal */}
      {showReview && (
        <div className="modal-backdrop-in fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="modal-in bg-card rounded-2xl border border-line shadow-elevated max-w-lg w-full p-5">
            <h3 className="font-display font-bold text-lg text-ink">Read it before it goes</h3>
            <p className="text-[13px] text-inksoft mt-1">
              Nothing files without your sign-off. Edit freely — this is your complaint, in your name.
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={12}
              className="w-full bg-paper border border-line rounded-lg p-3 mt-3 text-[13px] text-ink focus:outline-none focus:border-forest"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setShowReview(false)}
                className="btn-tactile border border-line rounded-lg px-4 py-2 text-inksoft hover:bg-mist"
              >
                Keep editing
              </button>
              <button
                onClick={fileIt}
                className="btn-tactile bg-forest hover:bg-forestdeep text-white font-semibold rounded-lg px-4 py-2"
              >
                File grievance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LightField({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">{label}</span>
      <div
        key={value || "empty"}
        className={`border border-line rounded-lg px-3 py-2 text-[13.5px] min-h-[38px] ${
          value ? "rise field-filled text-ink font-medium bg-card" : "bg-mist text-mutedink italic"
        }`}
      >
        {value || "fills in as you talk"}
      </div>
    </div>
  );
}
