"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import { getGrievances, seedOnce } from "../../lib/store";

const STATUS = {
  in_progress: { label: "In progress", cls: "bg-leafwash text-leaf" },
  breached: { label: "Deadline crossed", cls: "bg-alertwash text-alert" },
  disposed_template: { label: "Closed — check the reply", cls: "bg-marigoldwash text-marigolddeep" },
  filed: { label: "Filed", cls: "bg-mist text-inksoft" },
};

function daysSince(iso) {
  const ms = Date.now() - new Date(iso + "T00:00:00").getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

export default function Dashboard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    seedOnce();
    setItems(getGrievances());
  }, []);

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl">My grievances</h1>
          <p className="text-sm text-inksoft mt-1">
            Every complaint, its clock, and what's actually happening — in plain language.
          </p>
        </div>
        <Link
          href="/file"
          className="bg-marigold hover:bg-marigolddeep text-white font-semibold rounded-md px-4 py-2.5 whitespace-nowrap transition-colors"
        >
          File a new grievance
        </Link>
      </div>

      <div className="grid gap-3">
        {items.map((g) => {
          const st = STATUS[g.status] || STATUS.filed;
          const d = daysSince(g.filedAt);
          const pct = Math.min(100, Math.round((d / 21) * 100));
          return (
            <Link
              key={g.id}
              href={`/grievance/${g.id}`}
              className="bg-card border border-line rounded-xl p-4 hover:border-marigold transition-colors rise"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                <span className="text-xs text-mutedink font-mono">{g.regId}</span>
                <span className="ml-auto text-xs text-mutedink">
                  Day {d} of 21
                </span>
              </div>
              <p className="font-semibold text-ink mt-2">{g.summary}</p>
              <p className="text-sm text-inksoft mt-0.5">
                {g.department} · {g.location}
              </p>
              <div className="mt-3 h-1.5 bg-mist rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${d > 21 ? "bg-alert" : "bg-leaf"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-mutedink mt-2">{g.events[g.events.length - 1]?.plain}</p>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}
