"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, FileText, Mic, ShieldCheck } from "lucide-react";
import styles from "./HomeHero.module.css";

const ASSETS = "/figma/sarj";
const EXAMPLE = "Mera PF transfer reject ho gaya. Mujhe reason samajh nahi aa raha.";
const STAGES = ["Describe", "Documents", "Review"];

// showHeader=false when the page already has a navbar above the hero, so the brand and links are not repeated.
export default function HomeHero({ onStart, showHeader = true }) {
  const [mode, setMode] = useState("Text");
  const [stage, setStage] = useState("Describe");
  const [input, setInput] = useState("");

  function submit(event) {
    event.preventDefault();
    onStart(input.trim());
  }

  return (
    <section className={`${styles.hero} ${showHeader ? "" : styles.noHeader}`} aria-labelledby="nivaran-hero-title">
      {showHeader && <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Nivaran home">
          <span className={styles.brandHindi}>निवारण</span>
          <span className={styles.brandEnglish}>nivaran<span>.</span></span>
        </Link>
        <nav aria-label="Main navigation" className={styles.nav}>
          <a href="#how">How it works</a>
          <a href="#why">Why Nivaran</a>
          <Link href="/dashboard">My grievances</Link>
        </nav>
        <Link href="/login" className={styles.login}>Open the portal</Link>
      </header>}

      <div className={styles.copy}>
        <div className={styles.message}>
          <p className={styles.eyebrow}><img src={`${ASSETS}/sparkles.svg`} width="14" height="14" alt="" />A LITTLE HELP. A WAY FORWARD.</p>
          <h1 id="nivaran-hero-title">Your grievance,<br />in your own words.</h1>
          <p className={styles.description}>You shouldn’t need to know the right words to be heard. Tell Nivaran what happened. We’ll help you turn it into a clear complaint, one step at a time.</p>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={() => onStart("")}>Start a conversation<img src={`${ASSETS}/arrow.svg`} width="12" height="12" alt="" /></button>
            <a href="#how" className={styles.secondary}>See how it works</a>
          </div>
          <p className={styles.assurance}><ShieldCheck size={14} aria-hidden="true" />Your words. Your review. Your final say.</p>
        </div>
        <div className={styles.languages}>
          <p>A conversation in the language you call your own.</p>
          <div><span lang="hi">हिन्दी</span><span>English</span><span>Hinglish</span><span className={styles.languageNote}>Hindi, English,<br />ya a little of both.</span></div>
        </div>
      </div>

      <div className={styles.scene}>
        <div className={styles.scenery} aria-hidden="true">
          <Image className={styles.base} src={`${ASSETS}/landscape-base.png`} alt="" width={736} height={1104} sizes="(max-width: 800px) 100vw, 48vw" />
          <Image className={styles.landscape} src={`${ASSETS}/landscape.png`} alt="" width={3774} height={2158} sizes="(max-width: 800px) 240vw, 146vw" priority />
          <Image className={styles.texture} src={`${ASSETS}/texture.png`} alt="" width={2752} height={1728} sizes="(max-width: 800px) 100vw, 48vw" />
        </div>
        <div className={styles.demo}>
          <div className={styles.glass}>
            <div className={styles.cardTop}>
              <div className={styles.modes} role="group" aria-label="Preview input mode">{["Text", "Voice"].map(value => <button key={value} aria-pressed={mode === value} onClick={() => { setMode(value); setStage("Describe"); }} className={mode === value ? styles.activeMode : ""}>{value}</button>)}</div>
              <Image className={styles.orb} src={`${ASSETS}/orb.png`} width={32} height={32} alt="" />
            </div>

            <div className={styles.cardContent} key={`${stage}-${mode}`}>
              {stage === "Describe" && mode === "Text" && <>
                <div className={styles.greeting}><span>MEET YOUR GRIEVANCE ASSISTANT</span><h2>Let’s start with<br />what happened.</h2><p>No formal language needed.</p></div>
                <div className={styles.suggestions}><span>Try a sample complaint</span><button onClick={() => setInput(EXAMPLE)}>“Mera PF transfer reject ho gaya…”</button><button onClick={() => setInput("I don’t know which office is handling my PF transfer.")}>“I don’t know which office to choose.”</button></div>
              </>}
              {stage === "Describe" && mode === "Voice" && <div className={styles.voicePreview}>
                <Image src={`${ASSETS}/orb.png`} width={76} height={76} alt="" />
                <h2>Some things are<br />easier to say.</h2><p>Speak naturally. Take your time.</p>
                <button onClick={() => onStart("")}><Mic size={19} aria-hidden="true" />Open voice assistant</button><small>Microphone is off in this preview.</small>
              </div>}
              {stage === "Documents" && <div className={styles.stagePreview}>
                <span className={styles.previewLabel}>SAMPLE DOCUMENT CHECK</span><h2>A little proof.<br />A clearer picture.</h2>
                <div className={styles.documentRow}><FileText size={23} aria-hidden="true" /><div><strong>Relieving letter</strong><span>Sample document · date found</span></div><Check size={17} aria-hidden="true" /></div>
                <div className={styles.note}><strong>These dates are different.</strong><p>You said 15 April. The sample letter says 31 March. You decide what’s correct—we won’t guess.</p></div>
                <button className={styles.cardLink} onClick={() => setStage("Review")}>See the sample review <span aria-hidden="true">→</span></button>
              </div>}
              {stage === "Review" && <div className={styles.stagePreview}>
                <span className={styles.previewLabel}>SAMPLE COMPLAINT · NOT SUBMITTED</span><h2>Your story,<br />ready for your review.</h2>
                <div className={styles.reviewDetails}><span>REGARDING</span><strong>PF transfer rejection</strong><span>REQUESTED ACTION</span><p>Explain the rejection and identify the records that need correction.</p><div><Check size={15} aria-hidden="true" />Uncertain dates stay unconfirmed</div></div>
                <button className={styles.cardLink} onClick={() => onStart(EXAMPLE)}>Start with your own words <span aria-hidden="true">→</span></button>
              </div>}
            </div>

            {stage === "Describe" && mode === "Text" && <form className={styles.composer} onSubmit={submit}><input aria-label="Describe your grievance" value={input} onChange={event => setInput(event.target.value)} placeholder="Tell us what happened…" maxLength={2000} /><button aria-label="Continue with this message" type="submit"><img src={`${ASSETS}/send.svg`} width="18" height="18" alt="" /></button></form>}
          </div>
          <div className={styles.stages} role="group" aria-label="Explore the complaint journey">{STAGES.map((value, index) => <button aria-pressed={stage === value} className={stage === value ? styles.activeStage : ""} onClick={() => setStage(value)} key={value}><Image src={`${ASSETS}/orb.png`} width={15} height={15} alt="" style={{ filter: index === 1 ? "hue-rotate(65deg)" : index === 2 ? "hue-rotate(155deg)" : undefined }} />{value}</button>)}</div>
          <p className={styles.disclosure}>A glimpse of Nivaran · prototype with sample data</p>
        </div>
      </div>
    </section>
  );
}
