"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, seedOnce } from "../../lib/store";

const DEMO_EMAIL = "citizen@demo.in";
const DEMO_PASS = "nivaran123";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (email.trim().toLowerCase() === DEMO_EMAIL && pass === DEMO_PASS) {
      seedOnce();
      login(DEMO_EMAIL);
      router.push("/dashboard");
    } else {
      setError("Those credentials don't match. Use the demo pair shown below — this is a proof of concept.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="font-display font-extrabold text-4xl text-ink">निवारण</p>
            <p className="font-display font-semibold text-marigolddeep tracking-widest text-sm mt-1">NIVARAN</p>
          </Link>
          <p className="text-inksoft mt-4 text-[15px] leading-relaxed">
            CPGRAMS, rebuilt so the system carries the burden — not you. Describe your problem like you'd tell a
            friend. Nivaran routes it, drafts it, files it, and tracks it in plain language.
          </p>
        </div>

        <form onSubmit={submit} className="bg-card border border-line rounded-xl p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-mutedink">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@demo.in"
              className="border border-line rounded-md px-3 py-2 bg-paper focus:outline-2 focus:outline-marigold"
              autoComplete="username"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-mutedink">Password</span>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="border border-line rounded-md px-3 py-2 bg-paper focus:outline-2 focus:outline-marigold"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-alert">{error}</p>}
          <button
            type="submit"
            className="bg-marigold hover:bg-marigolddeep text-white font-semibold rounded-md py-2.5 transition-colors"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail(DEMO_EMAIL);
              setPass(DEMO_PASS);
              setError("");
            }}
            className="text-sm text-marigolddeep underline underline-offset-2"
          >
            Fill demo credentials
          </button>
        </form>

        <div className="mt-4 bg-mist border border-line rounded-lg p-4 text-sm text-inksoft">
          <p className="font-semibold text-ink mb-1">For judges</p>
          <p>
            Sign in with <code className="bg-card px-1.5 py-0.5 rounded border border-line">citizen@demo.in</code> /{" "}
            <code className="bg-card px-1.5 py-0.5 rounded border border-line">nivaran123</code>. Everything is mock
            data — accounts, departments, statuses. The conversation, routing, and drafting are live.
          </p>
        </div>
      </div>
    </div>
  );
}
