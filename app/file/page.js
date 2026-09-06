"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../../components/Shell";
import AgentPanel from "../../components/AgentPanel";

export default function FilePage() {
  const router = useRouter();
  const [filed, setFiled] = useState(null);

  if (filed) {
    return (
      <Shell>
        <div className="max-w-md mx-auto text-center py-16 rise">
          <div className="pop-check mx-auto w-16 h-16 rounded-full bg-leafwash text-leaf flex items-center justify-center text-3xl font-bold">
            ✓
          </div>
          <h1 className="font-display font-bold text-2xl mt-4">Grievance filed</h1>
          <p className="text-inksoft mt-2">
            Registration ID <span className="font-mono font-semibold text-ink">{filed.regId}</span>
          </p>
          <p className="text-sm text-inksoft mt-1">
            Routed to {filed.department}. The 21-day redressal clock is running — we'll translate every update into
            plain language.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => router.push(`/grievance/${filed.id}`)}
              className="bg-marigold hover:bg-marigolddeep text-white font-semibold rounded-md px-4 py-2"
            >
              Track it
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="border border-line rounded-md px-4 py-2 text-inksoft hover:bg-mist"
            >
              Dashboard
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="min-h-[74vh] flex flex-col">
        <AgentPanel variant="page" onFiled={setFiled} onNavigate={(p) => router.push(p)} />
      </div>
    </Shell>
  );
}
