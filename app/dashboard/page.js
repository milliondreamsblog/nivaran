"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import TiltCard from "../../components/TiltCard";
import { getGrievances, seedOnce } from "../../lib/store";

const STATUS = {
  in_progress: { label: "In progress", cls: "bg-forestwash text-forest", dot: "bg-forest" },
  breached: { label: "Deadline crossed", cls: "bg-alertwash text-alert", dot: "bg-alert" },
  disposed_template: { label: "Closed — check the reply", cls: "bg-saffronwash text-saffrondeep", dot: "bg-saffron" },
  filed: { label: "Filed", cls: "bg-mist text-inksoft", dot: "bg-inksoft" },
};

function daysSince(iso) {
  const ms = Date.now() - new Date(iso + "T00:00:00").getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => {
    seedOnce();
    setItems(getGrievances());
    // two rAFs so the browser paints the 0%-width bars first, then the
    // transition to their real width is what animates, not a jump-cut.
    requestAnimationFrame(() => requestAnimationFrame(() => setBarsReady(true)));
  }, []);

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">My grievances</h1>
          <p className="text-sm text-inksoft mt-1">
            Every complaint, its clock, and what's actually happening — in plain language.
          </p>
        </div>
        <Link
          href="/file"
          className="btn-tactile bg-forest hover:bg-forestdeep text-white font-semibold rounded-lg px-4 py-2.5 whitespace-nowrap transition-colors"
        >
          File a new grievance
        </Link>
      </div>

      <div className="grid gap-3">
        {items.map((g) => {
          const st = STATUS[g.status] || STATUS.filed;
          const d = daysSince(g.filedAt);
          const pct = Math.min(100, Math.round((d / 21) * 100));
          const overdue = d > 21;
          const nearDeadline = !overdue && d >= 15;
          const barCls = overdue ? "bg-alert" : nearDeadline ? "bg-saffron" : "bg-forest";
          return (
            <Link key={g.id} href={`/grievance/${g.id}`} className="block rise">
              <TiltCard className="bg-card border border-line rounded-2xl p-4 hover:border-forest">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls} ${overdue ? "deadline-pulse" : ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} aria-hidden="true" />
                    {st.label}
                  </span>
                  <span className="text-xs text-mutedink font-mono">{g.regId}</span>
                  <span className={`ml-auto text-xs font-medium ${overdue ? "text-alert" : nearDeadline ? "text-saffrondeep" : "text-mutedink"}`}>
                    Day {d} of 21
                  </span>
                </div>
                <p className="font-semibold text-ink mt-2">{g.summary}</p>
                <p className="text-sm text-inksoft mt-0.5">
                  {g.department} · {g.location}
                </p>
                <div className="mt-3 h-1.5 bg-mist rounded-full overflow-hidden">
                  <div
                    className={`progress-fill h-full rounded-full ${barCls}`}
                    style={{ width: barsReady ? `${pct}%` : "0%" }}
                  />
                </div>
                <p className="text-xs text-mutedink mt-2">{g.events[g.events.length - 1]?.plain}</p>
              </TiltCard>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}
