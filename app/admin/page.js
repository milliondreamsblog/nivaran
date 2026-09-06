"use client";

import { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import { WATCHER_EVENTS } from "../../lib/seed";
import { getKbState, applyKbUpdate } from "../../lib/store";

export default function AdminPage() {
  const [kb, setKb] = useState({ version: "1.2", applied: [] });
  const [toast, setToast] = useState("");

  useEffect(() => {
    setKb(getKbState());
  }, []);

  function approve(id) {
    const next = applyKbUpdate(id);
    setKb(next);
    setToast("Knowledge updated — the agent now answers with the new rules.");
    setTimeout(() => setToast(""), 3500);
  }

  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl">Ops — keeping the agent honest</h1>
            <p className="text-sm text-inksoft mt-1 max-w-lg">
              Government rules change constantly. Watchers monitor gazette notifications and circulars, draft knowledge
              updates, and a human approves before the agent's brain changes. The agent never quotes last year's rules.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-mutedink uppercase tracking-wider font-semibold">Knowledge base</span>
            <p className="font-mono font-semibold text-leaf">v{kb.version}</p>
          </div>
        </div>

        <div className="grid gap-3 mt-5">
          {WATCHER_EVENTS.map((w) => {
            const applied = kb.applied.includes(w.id);
            return (
              <div key={w.id} className="bg-card border border-line rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      applied ? "bg-leafwash text-leaf" : "bg-marigoldwash text-marigolddeep"
                    }`}
                  >
                    {applied ? "Applied" : "Pending review"}
                  </span>
                  <span className="text-xs text-mutedink">detected {w.detected}</span>
                  <span className="ml-auto text-xs text-mutedink font-mono">{w.source}</span>
                </div>
                <p className="font-semibold text-ink mt-2">{w.title}</p>
                <p className="text-sm text-inksoft mt-1">{w.detail}</p>
                <div className="border border-line rounded-lg bg-paper p-3 mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-mutedink">Proposed update</p>
                  <p className="text-sm text-inksoft mt-1">{w.proposal}</p>
                </div>
                {!applied && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approve(w.id)}
                      className="bg-leaf text-white text-sm font-semibold rounded-md px-4 py-2"
                    >
                      Approve &amp; sync
                    </button>
                    <button className="border border-line rounded-md px-4 py-2 text-sm text-inksoft hover:bg-mist">
                      Hold
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-mutedink mt-4">
          In production these watchers would poll the e-Gazette, ministry circular pages, and the CPGRAMS org directory.
          In this proof of concept the two events above are seeded.
        </p>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-line text-ink text-sm rounded-lg px-4 py-2.5 rise z-50 shadow-2xl">
          {toast}
        </div>
      )}
    </Shell>
  );
}
