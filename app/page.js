"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, Route, FileCheck2, Clock3, ShieldCheck, RefreshCw, ArrowRight } from "lucide-react";
import AgentPanel, { Mark } from "../components/AgentPanel";

// Calm scroll reveal: slow fade + tiny rise once ~15% visible, staggered via --d.
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={{ "--d": `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Home() {
  const [botOpen, setBotOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* navbar */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-xl text-ink">निवारण</span>
            <span className="font-display font-semibold text-sm text-marigolddeep tracking-wide">NIVARAN</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm text-inksoft">
            <a href="#how" className="hover:text-ink transition-colors duration-300">How it works</a>
            <a href="#why" className="hover:text-ink transition-colors duration-300">Why Nivaran</a>
            <a href="#fresh" className="hover:text-ink transition-colors duration-300">Always current</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setBotOpen(true)}
              className="hidden sm:block text-sm font-medium text-inksoft hover:text-ink px-3 py-2 transition-colors duration-300"
            >
              Talk to Nivaran
            </button>
            <Link
              href="/login"
              className="bg-marigold hover:bg-marigolddeep text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors duration-300"
            >
              Open the portal
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* hero — glass panel floating over a full-bleed dusk riverscape */}
        <section className="relative overflow-hidden">
          <img src="/bg/ganga.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,18,21,0.5),rgba(18,18,21,0.7)_55%,#121215_97%)]" />
          <div className="relative max-w-6xl mx-auto px-4 pt-24 sm:pt-32 pb-10 text-center">
          <Reveal delay={0}>
            <span className="inline-flex items-center gap-1.5 h-[26px] rounded-lg bg-black/25 backdrop-blur-md pl-2 pr-2.5 text-[12.5px] font-medium text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-marigold" aria-hidden="true" />
              Built for Build What Moves India
            </span>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="font-display font-bold tracking-[-0.04em] text-[42px] sm:text-[58px] leading-[1.04] text-white mt-3 max-w-[800px] mx-auto [text-wrap:balance]">
              Your grievance finally files itself.
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-white/70 text-[17px] leading-relaxed max-w-[600px] mx-auto mt-3">
              Filing a complaint on CPGRAMS means guessing the right ministry from a giant category tree and writing
              like a bureaucrat. Nivaran replaces all of it with a conversation — Hindi, English, ya mixed. You talk.
              The system routes, drafts, files, and tracks.
            </p>
          </Reveal>
          <Reveal delay={450}>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setBotOpen(true)}
                className="h-10 px-4 flex items-center bg-white/95 hover:bg-white text-[#212121] font-semibold text-sm rounded-[10px] transition-colors duration-300"
              >
                Talk to Nivaran
              </button>
              <Link
                href="/login"
                className="h-10 px-4 flex items-center gap-1.5 text-white/95 border border-white/20 hover:bg-white/10 font-semibold text-sm rounded-[10px] transition-colors duration-300"
              >
                Open the portal <ArrowRight size={14} />
              </Link>
            </div>
            <p className="text-[12px] text-white/45 mt-4">
              Judges: citizen@demo.in / nivaran123 · every account, department, and status is mock · the agent is real
            </p>
          </Reveal>

          {/* hero shot */}
          <Reveal delay={600}>
            <div className="mt-16 rounded-2xl border border-line overflow-hidden shadow-2xl bg-card">
              <img
                src="/shots/panel.png"
                alt="The Nivaran agent panel: a conversation on the left while the official grievance form fills itself on the right"
                className="w-full block"
              />
            </div>
          </Reveal>
          </div>
        </section>

        {/* stat strip */}
        <section className="border-y border-line bg-card/60">
          <div className="max-w-6xl mx-auto px-4 py-8 grid sm:grid-cols-3 gap-6 text-center">
            {[
              ["Crores of grievances", "flow through CPGRAMS — filed by citizens who must guess the right ministry themselves."],
              ["21 days", "is the official redressal window. Most citizens never see the clock, or learn they can appeal."],
              ["One wrong guess", "in the category tree and a complaint bounces between departments for weeks."],
            ].map(([big, small], i) => (
              <Reveal key={big} delay={i * 180}>
                <p className="font-display font-extrabold text-2xl text-ink">{big}</p>
                <p className="text-sm text-inksoft mt-1">{small}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="max-w-6xl mx-auto px-4 py-16">
          <Reveal>
            <h2 className="font-display font-bold tracking-[-0.03em] text-3xl text-ink text-center [text-wrap:balance]">
              Three minutes, start to filed
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 mt-9">
            {[
              {
                icon: <Mic size={18} />,
                title: "Say it like you'd tell a friend",
                body: '"Mere mohalle mein do hafte se paani nahi aa raha." Speak or type, Hindi or English. The agent asks at most one clarifying question — and answers you out loud.',
              },
              {
                icon: <Route size={18} />,
                title: "Watch the form fill itself",
                body: "Nivaran picks the responsible ministry and department, shows its confidence and its reasons, and drafts the formal grievance from your words. The paperwork happens in front of you.",
              },
              {
                icon: <FileCheck2 size={18} />,
                title: "Approve, file, and actually track",
                body: 'Nothing files without your sign-off. Then tracking speaks human — "your complaint reached the responsible officer on day 3" — with the 21-day clock always visible and a one-tap appeal when it runs out.',
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 180} className="bg-card border border-line rounded-2xl p-6">
                <div className="w-9 h-9 rounded-full bg-marigoldwash text-marigolddeep flex items-center justify-center">
                  {s.icon}
                </div>
                <p className="font-display font-bold text-lg text-ink mt-4">{s.title}</p>
                <p className="text-sm leading-relaxed text-inksoft mt-2">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* feature: routing */}
        <section id="why" className="border-t border-line bg-card/40">
          <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
            <Reveal>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-marigolddeep">
                Routing is the agent's job
              </p>
              <h2 className="font-display font-bold tracking-[-0.03em] text-3xl text-ink mt-3 [text-wrap:balance]">
                Departments only receive complaints they can act on
              </h2>
              <p className="text-inksoft leading-relaxed mt-4">
                The single biggest CPGRAMS failure is misrouting: a stuck PF claim — is that Labour Ministry or EPFO?
                A dead water line — municipality or Jal Nigam? Citizens shouldn't have to know. Nivaran classifies
                every grievance, shows the confidence and reasoning on screen, and files it with the office that owns
                the problem. Fewer bounces, faster redressal, and a paper trail that says why.
              </p>
              <ul className="mt-5 flex flex-col gap-2.5 text-sm text-inksoft">
                <li className="flex gap-2"><Clock3 size={16} className="text-marigolddeep shrink-0 mt-0.5" /> The 21-day clock on every case, with the appeal drafted the moment it breaches</li>
                <li className="flex gap-2"><ShieldCheck size={16} className="text-marigolddeep shrink-0 mt-0.5" /> Template-reply closures get flagged — "necessary action taken" is not redressal</li>
              </ul>
            </Reveal>
            <Reveal delay={200} className="rounded-2xl border border-line overflow-hidden shadow-xl">
              <img src="/shots/dashboard.png" alt="The Nivaran dashboard: every grievance with its status and 21-day clock in plain language" className="w-full block" />
            </Reveal>
          </div>
        </section>

        {/* feature: freshness */}
        <section id="fresh" className="border-t border-line">
          <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
            <Reveal delay={200} className="rounded-2xl border border-line overflow-hidden shadow-xl order-2 lg:order-1">
              <img src="/shots/ops.png" alt="The Ops panel: watchers catch rule changes, a human approves, the agent's knowledge updates" className="w-full block" />
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-marigolddeep">
                Always current
              </p>
              <h2 className="font-display font-bold tracking-[-0.03em] text-3xl text-ink mt-3 [text-wrap:balance]">
                It never quotes last year's rules
              </h2>
              <p className="text-inksoft leading-relaxed mt-4">
                Government chatbots fail the day a circular changes a timeline. Nivaran's knowledge runs through a
                watch-draft-review-sync pipeline: watchers monitor gazette notifications and department circulars,
                draft the knowledge update, and a human approves it before the agent's brain changes. The same
                human-in-the-loop rule protects citizens — nothing legal ever files without an explicit sign-off.
              </p>
              <p className="flex gap-2 items-start mt-5 text-sm text-inksoft">
                <RefreshCw size={16} className="text-marigolddeep shrink-0 mt-0.5" />
                When EPFO cut its claim timeline from 20 days to 15, one approval updated every answer and draft the
                agent gives. That's the whole point.
              </p>
            </Reveal>
          </div>
        </section>

        {/* CTA — glass card back over the riverscape */}
        <section className="relative overflow-hidden border-t border-line">
          <img src="/bg/ganga.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#121215,rgba(18,18,21,0.6)_45%,#121215)]" />
          <div className="relative max-w-6xl mx-auto px-4 py-20">
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-[rgba(28,28,32,0.86)] backdrop-blur-2xl p-10 text-center shadow-2xl">
              <div className="flex justify-center"><Mark size={34} /></div>
              <h2 className="font-display font-bold tracking-[-0.03em] text-3xl text-white/95 mt-4 [text-wrap:balance]">
                File your first grievance in three minutes
              </h2>
              <p className="text-white/65 max-w-lg mx-auto mt-3">
                The button below opens the same agent that lives on the portal. Say your problem. Watch the government
                form fill itself.
              </p>
              <button
                onClick={() => setBotOpen(true)}
                className="mt-6 bg-marigold hover:bg-marigolddeep text-white font-semibold rounded-lg px-6 py-3 transition-colors duration-300"
              >
                Talk to Nivaran
              </button>
            </div>
          </Reveal>
          </div>
        </section>
      </main>

      {/* footer — columned product footer, night variant */}
      <footer className="border-t border-line bg-card/40">
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-10 grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <Mark size={20} />
              <span className="font-display font-bold text-lg text-ink">निवारण</span>
              <span className="font-display font-semibold text-xs text-marigolddeep tracking-widest">NIVARAN</span>
            </div>
            <p className="text-sm text-inksoft leading-relaxed max-w-xs">
              CPGRAMS rebuilt as a conversation. You talk; the system routes, drafts, files, and tracks — in the
              language you actually speak.
            </p>
            <p className="text-xs text-mutedink">
              Demo login: <span className="font-mono text-inksoft">citizen@demo.in</span> ·{" "}
              <span className="font-mono text-inksoft">nivaran123</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedink">Product</p>
            <a href="#how" className="text-sm text-inksoft hover:text-ink transition-colors duration-300">How it works</a>
            <a href="#why" className="text-sm text-inksoft hover:text-ink transition-colors duration-300">Why Nivaran</a>
            <a href="#fresh" className="text-sm text-inksoft hover:text-ink transition-colors duration-300">Always current</a>
            <button onClick={() => setBotOpen(true)} className="text-left text-sm text-inksoft hover:text-ink transition-colors duration-300">
              Talk to Nivaran
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedink">Portal</p>
            <Link href="/login" className="text-sm text-inksoft hover:text-ink transition-colors duration-300">Judge login</Link>
            <Link href="/dashboard" className="text-sm text-inksoft hover:text-ink transition-colors duration-300">My grievances</Link>
            <Link href="/file" className="text-sm text-inksoft hover:text-ink transition-colors duration-300">File a grievance</Link>
            <Link href="/admin" className="text-sm text-inksoft hover:text-ink transition-colors duration-300">Ops</Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedink">Context</p>
            <a href="https://buildwhatmovesindia.com" target="_blank" rel="noreferrer" className="text-sm text-inksoft hover:text-ink transition-colors duration-300">
              Build What Moves India
            </a>
            <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="text-sm text-inksoft hover:text-ink transition-colors duration-300">
              The real CPGRAMS
            </a>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="max-w-6xl mx-auto px-4 pt-5 pb-24 sm:pb-5 sm:pr-48 flex flex-col sm:flex-row items-center gap-2 text-xs text-mutedink">
            <p>© 2026 Nivaran · proof of concept</p>
            <p className="sm:ml-auto">All data is mock · Not affiliated with DARPG or the Government of India</p>
          </div>
        </div>
      </footer>

      {/* floating launcher + popup, the widget pattern from the reference design */}
      {botOpen ? (
        <div className="widget-in fixed z-50 bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 w-auto sm:w-[min(940px,calc(100vw-3rem))] h-[min(640px,calc(100vh-5rem))]">
          <AgentPanel variant="popup" onClose={() => setBotOpen(false)} />
        </div>
      ) : (
        <button
          onClick={() => setBotOpen(true)}
          aria-label="Talk to Nivaran"
          className="launcher-nudge fixed z-50 bottom-6 right-6 flex items-center gap-2.5 bg-[rgba(28,28,32,0.92)] backdrop-blur-xl border border-white/15 text-white rounded-full pl-2 pr-5 py-2 shadow-2xl hover:border-marigold transition-colors duration-300"
        >
          <Mark size={34} />
          <span className="text-sm font-medium">Talk to Nivaran</span>
        </button>
      )}
    </div>
  );
}
