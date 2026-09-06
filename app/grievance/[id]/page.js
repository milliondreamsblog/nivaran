"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "../../../components/Shell";
import { getGrievance, appendEvent } from "../../../lib/store";

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

  useEffect(() => {
    const found = getGrievance(id);
    if (!found) {
      router.replace("/dashboard");
      return;
    }
    setG(found);
    setAppeal(appealDraft(found));
    setAppealed(found.events.some((e) => e.label === "Appeal filed"));
  }, [id, router]);

  if (!g) return null;

  const d = daysSince(g.filedAt);
  const pct = Math.min(100, Math.round((d / 21) * 100));
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

        <div className="bg-card border border-line rounded-xl p-5 mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-mutedink">{g.regId}</span>
            <span className="ml-auto text-xs text-mutedink">Filed {g.filedAt}</span>
          </div>
          <h1 className="font-display font-bold text-xl mt-1">{g.summary}</h1>
          <p className="text-sm text-inksoft mt-1">
            {g.department} · {g.ministry}
          </p>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-mutedink mb-1">
              <span>The 21-day redressal clock</span>
              <span className={d > 21 ? "text-alert font-semibold" : ""}>Day {d} of 21</span>
            </div>
            <div className="h-2 bg-mist rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${d > 21 ? "bg-alert" : "bg-leaf"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {canAppeal && (
          <div className="bg-alertwash border border-alert/40 rounded-xl p-4 mt-3 rise">
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
              className="mt-3 bg-alert text-white font-semibold rounded-md px-4 py-2 text-sm"
            >
              Review appeal draft
            </button>
          </div>
        )}

        <div className="bg-card border border-line rounded-xl p-5 mt-3">
          <h2 className="font-display font-bold">What's actually happening</h2>
          <ol className="mt-3 flex flex-col gap-0">
            {g.events.map((e, i) => (
              <li key={i} className="relative pl-6 pb-5 last:pb-0">
                {i < g.events.length - 1 && <span className="absolute left-[7px] top-4 bottom-0 w-px bg-line" />}
                <span
                  className={`absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 ${
                    e.label === "Deadline crossed" || e.label === "Disposed"
                      ? "border-alert bg-alertwash"
                      : e.label === "Appeal filed"
                      ? "border-marigold bg-marigoldwash"
                      : "border-leaf bg-leafwash"
                  }`}
                />
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">{e.label}</span>
                  <span className="text-xs text-mutedink">
                    day {e.day} · {e.date}
                  </span>
                </div>
                <p className="text-sm text-inksoft mt-0.5">{e.plain}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-card border border-line rounded-xl p-5 mt-3">
          <h2 className="font-display font-bold text-sm text-mutedink uppercase tracking-wider">Filed text</h2>
          <pre className="whitespace-pre-wrap text-sm text-inksoft mt-2 font-body">{g.draft}</pre>
        </div>
      </div>

      {showAppeal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-line max-w-lg w-full p-5 rise">
            <h3 className="font-display font-bold text-lg">Your appeal, drafted</h3>
            <p className="text-sm text-inksoft mt-1">Edit anything. It files only when you say so.</p>
            <textarea
              value={appeal}
              onChange={(e) => setAppeal(e.target.value)}
              rows={12}
              className="w-full border border-line rounded-md p-3 mt-3 text-sm bg-paper focus:outline-2 focus:outline-marigold"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setShowAppeal(false)} className="border border-line rounded-md px-4 py-2 text-inksoft hover:bg-mist">
                Not now
              </button>
              <button onClick={fileAppeal} className="bg-alert text-white font-semibold rounded-md px-4 py-2">
                File appeal
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
