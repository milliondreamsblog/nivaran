"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Mic,
  Route,
  FileCheck2,
  Clock3,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  ArrowUpRight,
  ArrowUpCircle,
  MessageCircle,
  Paperclip,
  Languages,
  Sparkles,
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  Send,
  Menu,
  X,
  Droplet,
  Construction,
  Headset,
} from "lucide-react";
import AgentPanel, { Mark } from "../components/AgentPanel";
import ThemeToggle from "../components/ThemeToggle";
import RadialProgress from "../components/RadialProgress";

// Calm scroll reveal: fade + tiny rise once ~15% visible, staggered via --d.
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

const PROCESS_WORDS = [
  { label: "Tell", accent: "bg-saffron" },
  { label: "Understand", accent: "bg-forest" },
  { label: "Route", accent: "bg-forest" },
  { label: "Resolve", accent: "bg-saffron" },
];

const FEATURES = [
  {
    icon: <MessageCircle size={19} />,
    card: "bg-sage",
    iconWrap: "bg-card text-forest",
    title: "AI Grievance Assistant",
    body: "Tell Nivaran what happened in natural language — Hindi, English, or mixed. No forms, no category trees.",
  },
  {
    icon: <Route size={19} />,
    card: "bg-peach",
    iconWrap: "bg-card text-saffrondeep",
    title: "Smart Routing",
    body: "AI identifies the appropriate department and grievance category, and shows its confidence and reasoning.",
  },
  {
    icon: <Clock3 size={19} />,
    card: "bg-butter",
    iconWrap: "bg-card text-saffrondeep",
    title: "Transparent Tracking",
    body: "Follow your complaint from submission to resolution, with the 21-day redressal clock always visible.",
  },
  {
    icon: <Paperclip size={19} />,
    card: "bg-sage",
    iconWrap: "bg-card text-forest",
    title: "Evidence & Documents",
    body: "Upload photos, documents and supporting evidence so your complaint carries proof, not just words.",
  },
  {
    icon: <Languages size={19} />,
    card: "bg-peach",
    iconWrap: "bg-card text-saffrondeep",
    title: "Multilingual Access",
    body: "Interact with Nivaran in Hindi, English, or a natural mix — spoken or typed, answered the same way.",
  },
  {
    icon: <ArrowUpCircle size={19} />,
    card: "bg-butter",
    iconWrap: "bg-card text-forest",
    title: "Appeals",
    body: "Automatically generate an appeal when a grievance is unresolved or closed with a template reply.",
  },
];

const TRUST = [
  { icon: <Sparkles size={20} />, label: "AI-Powered Understanding" },
  { icon: <BarChart3 size={20} />, label: "Transparent Tracking" },
  { icon: <ShieldCheck size={20} />, label: "Secure & Private by Design" },
  { icon: <Languages size={20} />, label: "Multilingual Support" },
  { icon: <Users size={20} />, label: "Accessible Across India" },
];

const STEPS = [
  {
    icon: <Mic size={18} />,
    title: "Tell us",
    body: "Describe your problem naturally — speak or type, Hindi or English, like you'd tell a friend.",
  },
  {
    icon: <Sparkles size={18} />,
    title: "Nivaran understands",
    body: "AI identifies the issue, its category, and the relevant authority — with its reasoning shown on screen.",
  },
  {
    icon: <Route size={18} />,
    title: "We route & track",
    body: "The grievance is drafted, submitted with your sign-off, and tracked against the 21-day clock.",
  },
  {
    icon: <FileCheck2 size={18} />,
    title: "Resolve or appeal",
    body: "Follow progress in plain language, and generate a ready-drafted appeal the moment it's needed.",
  },
];

const COMPARISON = {
  traditional: [
    "Complex, unfamiliar categories to navigate alone",
    "Unclear which department actually owns the problem",
    "Manual drafting in formal, bureaucratic language",
    "Little visibility once a complaint is filed",
  ],
  nivaran: [
    "One natural conversation — Hindi, English, or mixed",
    "AI-assisted routing to the office that owns the problem",
    "Automatic drafting, always yours to edit before filing",
    "Transparent tracking with a 21-day clock, in plain language",
  ],
};

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#why", label: "Why Nivaran" },
  { href: "#fresh", label: "Always current" },
];

export default function Home() {
  const [botOpen, setBotOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* navbar */}
      <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark size={30} />
            <span className="flex flex-col leading-none">
              <span className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl text-ink leading-none">निवारण</span>
                <span className="w-px h-4 bg-line" aria-hidden="true" />
                <span className="font-display font-extrabold text-[13px] text-forest tracking-[0.2em] leading-none">NIVARAN</span>
              </span>
              <span className="text-[10px] font-medium tracking-[0.14em] text-mutedink mt-1 hidden sm:block">
                People &middot; Process &middot; Progress
              </span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-forest mx-auto whitespace-nowrap">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-forestdeep transition-colors">{l.label}</a>
            ))}
          </nav>
          <div className="ml-auto md:ml-0 flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="btn-tactile hidden sm:flex items-center text-sm font-medium text-inksoft hover:text-ink px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => setBotOpen(true)}
              className="btn-tactile hidden sm:flex items-center gap-1.5 bg-forest hover:bg-forestdeep text-white text-sm font-semibold rounded-full pl-4 pr-3.5 py-2 transition-colors"
            >
              Get Started <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="btn-tactile lg:hidden flex items-center justify-center w-9 h-9 rounded-full border border-line bg-card text-ink"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="rise lg:hidden border-t border-line bg-card px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="px-2 py-2.5 rounded-lg text-[15px] font-medium text-forest hover:bg-mist hover:text-forestdeep transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-line">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm font-semibold text-ink border border-line"
              >
                Sign In
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setBotOpen(true);
                }}
                className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-forest text-white"
              >
                Get Started
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        {/* hero */}
        <section className="relative overflow-hidden hero-texture">
          <img
            src="/bg/parliament-hero.png"
            alt=""
            aria-hidden="true"
            className="hero-photo absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />
          <div className="hero-photo-scrim absolute inset-0 pointer-events-none" aria-hidden="true" />
          <div className="relative max-w-6xl mx-auto px-4 pt-14 sm:pt-16 pb-20 sm:pb-24 grid lg:grid-cols-[1fr_1.08fr] gap-10 lg:gap-14 items-center">
            <div>
              <Reveal delay={0}>
                <span className="inline-flex items-center gap-1.5 h-[28px] rounded-full bg-card border border-line pl-2.5 pr-3 text-[12.5px] font-medium text-inksoft shadow-card">
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron" aria-hidden="true" />
                  Your AI companion for public grievances
                </span>
              </Reveal>
              <Reveal delay={60}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[11px] font-semibold tracking-[0.14em] uppercase text-mutedink">
                  {PROCESS_WORDS.map((w) => (
                    <span key={w.label} className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 ${w.accent}`} aria-hidden="true" /> {w.label}
                    </span>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={120}>
                <h1 className="font-display font-extrabold tracking-[-0.02em] text-[38px] sm:text-[52px] leading-[1.08] text-ink mt-3 [text-wrap:balance]">
                  Your grievance,{" "}
                  <span className="text-forest">understood</span> —<br className="hidden sm:block" /> not just{" "}
                  <span className="text-saffrondeep">filed</span>.
                </h1>
              </Reveal>
              <Reveal delay={240}>
                <p className="text-inksoft text-[17px] leading-relaxed max-w-[540px] mt-4">
                  Filing a complaint shouldn't mean navigating complicated government categories and figuring out
                  the right department yourself. Nivaran uses AI to understand your problem, draft your grievance,
                  route it to the right authority, and help you track it.
                </p>
              </Reveal>
              <Reveal delay={360}>
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    onClick={() => setBotOpen(true)}
                    className="btn-tactile h-11 px-5 flex items-center gap-1.5 bg-forest hover:bg-forestdeep text-white font-semibold text-sm rounded-full transition-colors shadow-card hover:shadow-elevated"
                  >
                    Talk to Nivaran <ArrowRight size={14} />
                  </button>
                  <Link
                    href="/login"
                    className="btn-tactile h-11 px-5 flex items-center gap-1.5 text-forest border-[1.5px] border-forest/35 hover:border-forest/60 hover:bg-forestwash font-semibold text-sm rounded-full transition-colors"
                  >
                    Open the portal <ArrowUpRight size={14} />
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={480}>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-[13px] text-inksoft">
                  {["AI-powered routing", "Secure & private", "Human oversight", "Always available"].map((t) => (
                    <span key={t} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-forest" /> {t}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-mutedink mt-3">
                  For judges — demo access: <code className="text-[10.5px]">citizen@demo.in / nivaran123</code>{" "}
                  (mock data, live agent)
                </p>
              </Reveal>
            </div>

            <Reveal delay={300}>
              <HeroMock />
            </Reveal>
          </div>
        </section>

        {/* dark-green trust band */}
        <section className="bg-forest-section">
          <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-6 flex-1">
              {TRUST.map((t) => (
                <div key={t.label} className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-full bg-forest-section-text/12 text-forest-section-text flex items-center justify-center shrink-0">
                    {t.icon}
                  </span>
                  <span className="text-[13px] font-semibold text-forest-section-text leading-tight">{t.label}</span>
                </div>
              ))}
            </div>
            <div className="lg:pl-8 lg:border-l border-forest-section-text/15 shrink-0">
              <p className="font-display italic text-forest-section-muted text-[15px] leading-snug text-center lg:text-right">
                Seamless Governance
                <br />
                Stronger Communities
              </p>
            </div>
          </div>
        </section>

        {/* features */}
        <section id="features" className="max-w-6xl mx-auto px-4 py-20">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-saffrondeep">Features</p>
              <h2 className="font-display font-bold tracking-[-0.02em] text-3xl text-ink mt-2 [text-wrap:balance]">
                Designed for citizens, not bureaucrats
              </h2>
              <p className="text-inksoft mt-2">Simple tools, real support, and a paperwork process that carries itself.</p>
            </div>
            <a href="#how" className="btn-tactile hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-forestdeep transition-colors">
              Explore all features <ArrowRight size={14} />
            </a>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-9">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className={`card-hover shadow-card hover:shadow-elevated h-full border border-line rounded-[22px] p-6 ${f.card}`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-card ${f.iconWrap}`}>
                    {f.icon}
                  </div>
                  <p className="font-display font-bold text-[17px] text-ink mt-4">{f.title}</p>
                  <p className="text-sm leading-relaxed text-inksoft mt-2">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="border-t border-line bg-cream">
          <div className="max-w-6xl mx-auto px-4 py-20">
            <Reveal>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-saffrondeep text-center">How it works</p>
              <h2 className="font-display font-bold tracking-[-0.02em] text-3xl text-ink text-center mt-2 [text-wrap:balance]">
                Three minutes, start to filed
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-4 gap-4 mt-10">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 130}>
                  <div className="h-full bg-card border border-line rounded-[22px] shadow-card p-5">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-full bg-forestwash text-forest flex items-center justify-center shrink-0">
                        {s.icon}
                      </span>
                      <span className="font-display font-bold text-2xl text-line">0{i + 1}</span>
                    </div>
                    <p className="font-display font-bold text-[15px] text-ink mt-3">{s.title}</p>
                    <p className="text-sm leading-relaxed text-inksoft mt-1.5">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* why nivaran — traditional vs. nivaran comparison */}
        <section id="why" className="border-t border-line">
          <div className="max-w-6xl mx-auto px-4 py-20">
            <Reveal className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-saffrondeep">Why Nivaran</p>
              <h2 className="font-display font-bold tracking-[-0.02em] text-3xl text-ink mt-3 [text-wrap:balance]">
                Traditional filing, replaced
              </h2>
              <p className="text-inksoft leading-relaxed mt-4">
                The single biggest failure in grievance filing is misrouting: a stuck PF claim — is that the Labour
                Ministry or EPFO? A dead water line — the municipality or Jal Nigam? Citizens shouldn't have to know.
                Nivaran classifies every grievance, shows its confidence and reasoning on screen, and files it with
                the office that owns the problem.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-5 mt-9">
              <Reveal delay={100}>
                <div className="h-full bg-mist border border-line rounded-[22px] p-6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-mutedink">Traditional</p>
                  <ul className="mt-4 flex flex-col gap-3 text-sm text-inksoft">
                    {COMPARISON.traditional.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <XCircle size={16} className="text-mutedink shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="h-full bg-forestsoft border border-forest/20 rounded-[22px] p-6 shadow-card">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-forest">Nivaran</p>
                  <ul className="mt-4 flex flex-col gap-3 text-sm text-ink font-medium">
                    {COMPARISON.nivaran.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <CheckCircle2 size={16} className="text-forest shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* feature: freshness */}
        <section id="fresh" className="border-t border-line bg-cream">
          <div className="max-w-6xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-10 items-center">
            <Reveal delay={150} className="order-2 lg:order-1">
              <OpsMock />
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-saffrondeep">
                Always current
              </p>
              <h2 className="font-display font-bold tracking-[-0.02em] text-3xl text-ink mt-3 [text-wrap:balance]">
                It never quotes last year's rules
              </h2>
              <p className="text-inksoft leading-relaxed mt-4">
                Government chatbots fail the day a circular changes a timeline. Nivaran's knowledge runs through a
                watch-draft-review-sync pipeline: watchers monitor gazette notifications and department circulars,
                draft the knowledge update, and a human approves it before the agent's brain changes. The same
                human-in-the-loop rule protects citizens — nothing legal ever files without an explicit sign-off.
              </p>
              <p className="flex gap-2 items-start mt-5 text-sm text-inksoft">
                <RefreshCw size={16} className="text-forest shrink-0 mt-0.5" />
                When EPFO cut its claim timeline from 20 days to 15, one approval updated every answer and draft the
                agent gives. That's the whole point.
              </p>
            </Reveal>
          </div>
        </section>

        {/* CTA banner */}
        <section className="border-t border-line">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <Reveal>
              <div className="rounded-3xl bg-forest-section px-6 sm:px-12 py-14 sm:py-16 text-center shadow-elevated">
                <div className="flex justify-center"><Mark size={36} /></div>
                <h2 className="font-display font-bold tracking-[-0.02em] text-2xl sm:text-3xl text-forest-section-text mt-4 [text-wrap:balance]">
                  Your problem deserves to be heard.
                </h2>
                <p className="text-forest-section-muted max-w-lg mx-auto mt-3">
                  Let Nivaran help you take the next step.
                </p>
                <button
                  onClick={() => setBotOpen(true)}
                  className="btn-tactile mt-7 inline-flex items-center gap-1.5 bg-forest-section-text hover:bg-forest-section-text/90 text-forest-section font-semibold rounded-full px-6 py-3 transition-colors"
                >
                  Start a grievance <ArrowRight size={15} />
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-line bg-card">
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-10 grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Mark size={20} />
              <span className="font-display font-bold text-lg text-ink">निवारण</span>
              <span className="font-display font-bold text-xs text-forest tracking-widest">NIVARAN</span>
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
            <a href="#features" className="text-sm text-inksoft hover:text-forest transition-colors">Features</a>
            <a href="#how" className="text-sm text-inksoft hover:text-forest transition-colors">How it works</a>
            <a href="#why" className="text-sm text-inksoft hover:text-forest transition-colors">Why Nivaran</a>
            <button onClick={() => setBotOpen(true)} className="text-left text-sm text-inksoft hover:text-forest transition-colors">
              Talk to Nivaran
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedink">Portal</p>
            <Link href="/login" className="text-sm text-inksoft hover:text-forest transition-colors">Judge login</Link>
            <Link href="/dashboard" className="text-sm text-inksoft hover:text-forest transition-colors">My grievances</Link>
            <Link href="/file" className="text-sm text-inksoft hover:text-forest transition-colors">File a grievance</Link>
            <Link href="/admin" className="text-sm text-inksoft hover:text-forest transition-colors">Ops</Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedink">Context</p>
            <a href="https://buildwhatmovesindia.com" target="_blank" rel="noreferrer" className="text-sm text-inksoft hover:text-forest transition-colors">
              Build What Moves India
            </a>
            <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="text-sm text-inksoft hover:text-forest transition-colors">
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

      {/* agent popup — opened from the hero, navbar, or CTA banner. No
          separate floating launcher: the sticky navbar's "Get Started"
          already gives constant access without a persistent widget. */}
      {botOpen && (
        <div className="widget-in fixed z-50 bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 w-auto sm:w-[min(940px,calc(100vw-3rem))] h-[min(640px,calc(100vh-5rem))]">
          <AgentPanel variant="popup" onClose={() => setBotOpen(false)} />
        </div>
      )}
    </div>
  );
}

const HERO_QUICK_REPLIES = [
  { icon: <Droplet size={14} />, label: "Water supply issue" },
  { icon: <Construction size={14} />, label: "Road / infrastructure damage" },
  { icon: <Clock3 size={14} />, label: "Track my complaint" },
  { icon: <Headset size={14} />, label: "Talk to a human agent" },
];

// ---- hero visual: a light product mockup — chat + live status card — in
// place of a screenshot or any 3D product shot. Pure markup, no images.
function HeroMock() {
  return (
    <div className="relative max-w-[30rem] mx-auto lg:mx-0 lg:ml-auto">
      <div className="bg-card border-[1.5px] border-line rounded-[28px] shadow-elevated overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-forest">
          <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
            <Mark size={22} />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-white leading-tight">Nivaran AI</p>
            <p className="text-[11.5px] text-white/80 leading-tight flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> Online now
            </p>
          </div>
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-white bg-white/15 border border-white/25 rounded-full px-2.5 py-1">
            Live agent
          </span>
        </div>
        <div className="p-5 flex flex-col gap-2.5">
          <p className="text-[14.5px] font-medium text-inksoft mb-0.5">Namaste! Kaise madad karun aaj?</p>
          {HERO_QUICK_REPLIES.map((r) => (
            <div
              key={r.label}
              className="flex items-center gap-3 text-left text-[14px] font-medium text-ink bg-mist rounded-xl px-3.5 py-3"
            >
              <span className="w-7 h-7 rounded-full bg-card text-forest flex items-center justify-center shrink-0">
                {r.icon}
              </span>
              {r.label}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1.5 bg-card border border-line rounded-full pl-4 pr-1.5 py-1.5">
            <span className="text-[13px] text-mutedink flex-1">Type your message…</span>
            <span className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center shrink-0">
              <Send size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* floating status card */}
      <div className="hidden sm:flex absolute -top-6 -right-7 items-center gap-3 bg-card border border-line rounded-2xl shadow-elevated pl-3.5 pr-4 py-3.5">
        <RadialProgress value={9 / 21} size={40} strokeWidth={4.5} color="#123f2e" track="rgba(22,31,26,0.08)">
          <span className="text-[9.5px] font-bold text-forest">9/21</span>
        </RadialProgress>
        <div>
          <p className="text-[12px] font-semibold text-ink leading-tight">CG-2024-8891</p>
          <p className="text-[11px] text-mutedink leading-tight mt-0.5">Day 9 · In progress</p>
        </div>
      </div>

      {/* trust badge */}
      <div className="hidden sm:flex absolute -bottom-6 -left-8 items-center gap-2.5 bg-card border border-line rounded-2xl shadow-card pl-3 pr-5 py-3">
        <span className="w-8 h-8 rounded-full bg-saffronwash text-saffrondeep flex items-center justify-center shrink-0">
          <FileCheck2 size={16} />
        </span>
        <p className="text-[12.5px] font-semibold text-ink leading-tight">Appeal drafted<br />automatically</p>
      </div>
    </div>
  );
}

// ---- freshness feature visual: a light card standing in for the ops
// screenshot, showing a watcher event awaiting human approval.
function OpsMock() {
  return (
    <div className="bg-card border border-line rounded-2xl shadow-elevated p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-saffronwash text-saffrondeep">Pending review</span>
        <span className="text-[11px] text-mutedink font-mono">e-Gazette</span>
      </div>
      <p className="font-display font-bold text-ink mt-3">EPFO shortens PF claim timeline to 15 days</p>
      <p className="text-sm text-inksoft mt-1">Detected in this week's circular. Proposed update: replace every "20-day" reference in the knowledge base with "15-day".</p>
      <button className="btn-tactile mt-4 bg-forest hover:bg-forestdeep text-white text-sm font-semibold rounded-lg px-4 py-2">
        Approve &amp; sync
      </button>
    </div>
  );
}
