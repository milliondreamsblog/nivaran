"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, seedOnce } from "../../lib/store";

const DEMO_EMAIL = "citizen@demo.in";
const DEMO_PASS = "nivaran123";
const DEMO_OTP = "123456";

function maskEmail(email) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 1)}${"•".repeat(Math.max(3, name.length - 1))}@${domain}`;
}

// Fixed (non-random) scatter for the verified-state particle burst — safe
// to compute at module scope since it's deterministic.
const OTP_PARTICLES = Array.from({ length: 10 }).map((_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const dist = 46 + (i % 3) * 12;
  return { x: Math.round(Math.cos(angle) * dist), y: Math.round(Math.sin(angle) * dist) };
});

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState("credentials"); // credentials | otp | verified
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const typingRef = useRef(null);

  function submitCredentials(e) {
    e.preventDefault();
    if (email.trim().toLowerCase() === DEMO_EMAIL && pass === DEMO_PASS) {
      setError("");
      setStep("otp");
    } else {
      setError("Those credentials don't match. Use the demo pair shown below — this is a proof of concept.");
    }
  }

  // Mock OTP: no SMS is sent. The demo code types itself in, one digit at a
  // time, then auto-verifies — judges never have to know or enter a code.
  useEffect(() => {
    if (step !== "otp") return;
    setOtp("");
    let i = 0;
    typingRef.current = setInterval(() => {
      i += 1;
      setOtp(DEMO_OTP.slice(0, i));
      if (i >= DEMO_OTP.length) {
        clearInterval(typingRef.current);
        setTimeout(() => setStep("verified"), 450);
      }
    }, 220);
    return () => clearInterval(typingRef.current);
  }, [step]);

  useEffect(() => {
    if (step !== "verified") return;
    const t = setTimeout(() => {
      seedOnce();
      login(DEMO_EMAIL);
      router.push("/dashboard");
    }, 900);
    return () => clearTimeout(t);
  }, [step, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-paper">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="font-display font-extrabold text-4xl text-ink">निवारण</p>
            <p className="font-display font-bold text-forest tracking-widest text-sm mt-1">NIVARAN</p>
          </Link>
          <p className="text-inksoft mt-4 text-[15px] leading-relaxed">
            CPGRAMS, rebuilt so the system carries the burden — not you. Describe your problem like you'd tell a
            friend. Nivaran routes it, drafts it, files it, and tracks it in plain language.
          </p>
        </div>

        {step === "credentials" && (
          <>
            <form onSubmit={submitCredentials} className="bg-card border border-line rounded-2xl shadow-card p-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-mutedink">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@demo.in"
                  className="border border-line rounded-lg px-3 py-2 bg-paper focus:outline-2 focus:outline-forest"
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
                  className="border border-line rounded-lg px-3 py-2 bg-paper focus:outline-2 focus:outline-forest"
                  autoComplete="current-password"
                />
              </label>
              {error && <p className="text-sm text-alert">{error}</p>}
              <button
                type="submit"
                className="btn-tactile bg-forest hover:bg-forestdeep text-white font-semibold rounded-lg py-2.5 transition-colors"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO_EMAIL);
                  setPass(DEMO_PASS);
                  setError("");
                }}
                className="btn-tactile text-sm text-forest underline underline-offset-2"
              >
                Fill demo credentials
              </button>
            </form>

            <div className="mt-4 bg-cream border border-line rounded-xl p-4 text-sm text-inksoft">
              <p className="font-semibold text-ink mb-1">For judges</p>
              <p>
                Sign in with <code className="bg-card px-1.5 py-0.5 rounded border border-line">citizen@demo.in</code> /{" "}
                <code className="bg-card px-1.5 py-0.5 rounded border border-line">nivaran123</code>. A one-time code
                fills itself in on the next screen — nothing to type, no real SMS is sent. Everything is mock data;
                the conversation, routing, and drafting are live.
              </p>
            </div>
          </>
        )}

        {(step === "otp" || step === "verified") && (
          <div className="otp-neon-stage fixed inset-0 z-50 flex flex-col items-center justify-center px-4 text-center">
            {step === "otp" ? (
              <div className="rise">
                <p className="font-display font-bold text-xl text-white/95">Verify it's you</p>
                <p className="text-sm text-white/50 mt-1">
                  A 6-digit code was sent to <span className="text-white/80">{maskEmail(email || DEMO_EMAIL)}</span>
                </p>

                <div className="otp-neon-orbit relative mx-auto mt-10">
                  <div className="otp-neon-ring absolute inset-0">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const angle = i * 60;
                      return (
                        <div
                          key={i}
                          className="absolute left-1/2 top-1/2"
                          style={{
                            marginLeft: "calc(var(--otp-box-size) / -2)",
                            marginTop: "calc(var(--otp-box-size) / -2)",
                            transform: `rotate(${angle}deg) translateY(calc(var(--otp-orbit-radius) * -1)) rotate(${-angle}deg)`,
                          }}
                        >
                          <div className="otp-neon-counter">
                            <div
                              className={`otp-neon-box rounded-xl flex items-center justify-center text-lg font-display font-bold ${
                                otp[i] ? "is-filled" : ""
                              }`}
                            >
                              {otp[i] || ""}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-white/40 mt-8">Reading code automatically…</p>
                <button
                  type="button"
                  onClick={() => {
                    clearInterval(typingRef.current);
                    setOtp("");
                    setStep("credentials");
                  }}
                  className="btn-tactile text-sm text-white/55 hover:text-white/90 underline underline-offset-2 mt-4"
                >
                  ← Back to sign in
                </button>
              </div>
            ) : (
              <div className="rise">
                <div className="otp-neon-check relative mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold">
                  ✓
                  {OTP_PARTICLES.map((p, i) => (
                    <span
                      key={i}
                      className="otp-neon-particle absolute w-1.5 h-1.5 rounded-full"
                      style={{ "--px": `${p.x}px`, "--py": `${p.y}px`, animationDelay: `${i * 25}ms` }}
                    />
                  ))}
                </div>
                <p className="font-display font-bold text-xl text-white/95 mt-5">Identity verified</p>
                <p className="text-sm text-white/50 mt-1">Taking you to your dashboard…</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
