"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowUpCircle, CheckCircle2 } from "lucide-react";
import Shell from "../../../components/Shell";
import RadialProgress from "../../../components/RadialProgress";
import { getGrievance, appendEvent } from "../../../lib/store";

function iconForEvent(label) {
  if (label === "Deadline crossed" || label === "Disposed") return <AlertTriangle size={9} />;
  if (label === "Appeal filed") return <ArrowUpCircle size={9} />;
  return <CheckCircle2 size={9} />;
}

function daysSince(iso) {
  const ms = Date.now() - new Date(iso + "T00:00:00").getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function appealDraft(g) {
  return (
    `To the Appellate Authority (via CPGRAMS Appeal).\n\n` +
    `Subject: Appeal against ${g.status === "disposed_template" ? "unsatisfactory disposal" : "non-redressal within timeline"} of grievance ${g.regId}.\n\n` +
    `Respected Sir/Madam,\n\n` +
    `My grievance "${g.summary}" (${g.regId}) was filed on ${g.filedAt}. ` +
    (g.status === "disposed_template"
      ? `It was closed with a generic reply that names no inspection, date, or specific action. A closure without a substantive outcome is not redressal.`
      : `The 21-day redressal timeline has passed without resolution or any substantive communication.`) +
    `\n\nI request that the matter be reopened and examined at the appellate level, and that a specific, reasoned reply be provided.\n\n` +
    `Sincerely,\nDemo Citizen`
  );
}

export default function GrievancePage() {
  const { id } = useParams();
  const router = useRouter();
  const [g, setG] = useState(null);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appeal, setAppeal] = useState("");
  const [appealed, setAppealed] = useState(false);
  const [clockReady, setClockReady] = useState(false);

  useEffect(() => {
    const found = getGrievance(id);
    if (!found) {
      router.replace("/dashboard");
      return;
    }
    setG(found);
    setAppeal(appealDraft(found));
    setAppealed(found.events.some((e) => e.label === "Appeal filed"));
    requestAnimationFrame(() => requestAnimationFrame(() => setClockReady(true)));
  }, [id, router]);

  if (!g) return null;

  const d = daysSince(g.filedAt);
  const pct = Math.min(100, Math.round((d / 21) * 100));
  const overdue = d > 21;
  const nearDeadline = !overdue && d >= 15;
  const clockColor = overdue ? "#bd4a3a" : nearDeadline ? "#d97b2b" : "#1e4d3a";
  const canAppeal = !appealed && (g.status === "breached" || g.status === "disposed_template" || d > 21);

  function fileAppeal() {
    const today = new Date().toISOString().slice(0, 10);
    appendEvent(
      g.id,
      {
        day: d,
        date: today,
        label: "Appeal filed",
        plain: "Your appeal was filed with the appellate authority. They have 30 days to respond with a reasoned reply.",
      },
      "in_progress"
    );
    setG(getGrievance(g.id));
    setAppealed(true);
    setShowAppeal(false);
  }

  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push("/dashboard")} className="text-sm text-inksoft hover:text-ink underline underline-offset-2">
          ← All grievances
        </button>

        <div className="bg-card border border-line rounded-2xl shadow-card p-5 mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-mutedink">{g.regId}</span>
            <span className="ml-auto text-xs text-mutedink">Filed {g.filedAt}</span>
          </div>

          <div className="flex items-start gap-4 mt-1">
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-xl text-ink">{g.summary}</h1>
              <p className="text-sm text-inksoft mt-1">
                {g.department} · {g.ministry}
              </p>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-mutedink mb-1">
                  <span>The 21-day redressal clock</span>
                  <span className={overdue ? "text-alert font-semibold" : nearDeadline ? "text-saffrondeep font-semibold" : ""}>
                    Day {d} of 21
                  </span>
                </div>
                <div className="h-2 bg-mist rounded-full overflow-hidden">
                  <div
                    className={`progress-fill h-full rounded-full ${overdue ? "bg-alert" : nearDeadline ? "bg-saffron" : "bg-forest"}`}
                    style={{ width: clockReady ? `${pct}%` : "0%" }}
                  />
                </div>
              </div>
            </div>

            {/* the deadline, made memorable: a ring that fills day by day and
                shifts from calm forest green to saffron warning to alert red */}
            <div className={`shrink-0 ${overdue ? "deadline-pulse rounded-full" : ""}`}>
              <RadialProgress value={clockReady ? Math.min(1, d / 21) : 0} size={76} strokeWidth={6} color={clockColor}>
                <div className="flex flex-col items-center leading-none">
                  <span className="font-display font-bold text-xl" style={{ color: clockColor }}>
                    {d}
                  </span>
                  <span className="text-[9px] text-mutedink mt-1">of 21 days</span>
                </div>
              </RadialProgress>
            </div>
          </div>
        </div>

        {canAppeal && (
          <div className="bg-alertwash border border-alert/30 rounded-2xl p-4 mt-3 rise">
            <p className="font-semibold text-ink">
              {g.status === "disposed_template"
                ? "This was closed with a template reply — that isn't redressal."
                : "The deadline has passed with no resolution."}
            </p>
            <p className="text-sm text-inksoft mt-1">
              Most citizens never learn they can appeal. You can, and Nivaran has already drafted it.
            </p>
            <button
              onClick={() => setShowAppeal(true)}
              className="btn-tactile mt-3 bg-alert text-white font-semibold rounded-lg px-4 py-2 text-sm"
            >
              Review appeal draft
            </button>
          </div>
        )}

        <div className="bg-card border border-line rounded-2xl shadow-card p-5 mt-3">
          <h2 className="font-display font-bold text-ink">What's actually happening</h2>
          <ol className="mt-3 flex flex-col gap-0">
            {g.events.map((e, i) => {
              const isAlert = e.label === "Deadline crossed" || e.label === "Disposed";
              const isAppeal = e.label === "Appeal filed";
              const isCurrent = i === g.events.length - 1;
              const colorCls = isAlert ? "border-alert bg-alertwash text-alert" : isAppeal ? "border-saffron bg-saffronwash text-saffrondeep" : "border-forest bg-forestwash text-forest";
              return (
                <li key={i} className="relative pl-6 pb-5 last:pb-0 rise" style={{ animationDelay: `${i * 90}ms` }}>
                  {i < g.events.length - 1 && (
                    <span className="timeline-line-gradient absolute left-[7px] top-4 bottom-0 w-px" />
                  )}
                  <span
                    className={`timeline-dot ${isCurrent ? "is-current" : ""} absolute left-0 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${colorCls}`}
                  >
                    {iconForEvent(e.label)}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-ink">{e.label}</span>
                    <span className="text-xs text-mutedink">
                      day {e.day} · {e.date}
                    </span>
                  </div>
                  <p className="text-sm text-inksoft mt-0.5">{e.plain}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="bg-card border border-line rounded-2xl shadow-card p-5 mt-3">
          <h2 className="font-display font-bold text-sm text-mutedink uppercase tracking-wider">Filed text</h2>
          <pre className="whitespace-pre-wrap text-sm text-inksoft mt-2 font-body">{g.draft}</pre>
        </div>
      </div>

      {showAppeal && (
        <div className="modal-backdrop-in fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="modal-in bg-card rounded-2xl border border-line shadow-elevated max-w-lg w-full p-5">
            <h3 className="font-display font-bold text-lg text-ink">Your appeal, drafted</h3>
            <p className="text-sm text-inksoft mt-1">Edit anything. It files only when you say so.</p>
            <textarea
              value={appeal}
              onChange={(e) => setAppeal(e.target.value)}
              rows={12}
              className="w-full border border-line rounded-lg p-3 mt-3 text-sm bg-paper focus:outline-2 focus:outline-forest"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setShowAppeal(false)} className="btn-tactile border border-line rounded-lg px-4 py-2 text-inksoft hover:bg-mist">
                Not now
              </button>
              <button onClick={fileAppeal} className="btn-tactile bg-alert text-white font-semibold rounded-lg px-4 py-2">
                File appeal
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
