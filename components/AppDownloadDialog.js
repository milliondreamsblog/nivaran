"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Download, Globe, Smartphone, X } from "lucide-react";

// The download link goes through /nivaran.apk, a redirect in next.config.mjs to the newest GitHub
// release asset, so shipping a new APK never needs a site change. public/app-qr.svg encodes the same link.
export const APK_PATH = "/nivaran.apk";
export const APP_VERSION = "0.1.0";

export default function AppDownloadDialog({ open, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-download-title"
        onClick={(event) => event.stopPropagation()}
        className="rise relative w-full max-w-lg bg-card border border-line rounded-[22px] shadow-elevated p-6 sm:p-7"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="btn-tactile absolute top-4 right-4 w-9 h-9 rounded-full border border-line bg-card text-ink flex items-center justify-center"
        >
          <X size={16} />
        </button>

        <div className="flex gap-6">
          <div className="min-w-0 flex-1">
            <span className="w-11 h-11 rounded-full bg-forestwash text-forest flex items-center justify-center">
              <Smartphone size={20} />
            </span>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-saffrondeep mt-5">Android app</p>
            <h2 id="app-download-title" className="font-display font-bold tracking-[-0.02em] text-2xl text-ink mt-2 [text-wrap:balance]">
              Take Nivaran with you.
            </h2>
            <p className="text-sm leading-relaxed text-inksoft mt-2">
              Install the app to try the full voice flow on your phone. Free, no sign-in, sample data only.
            </p>
          </div>
          {/* QR for laptop visitors: the phone scans straight to the same download link. */}
          <div className="hidden sm:flex flex-col items-center shrink-0 pt-1">
            <img src="/app-qr.svg" width="132" height="132" alt="QR code linking to the Nivaran Android app download" className="rounded-xl border border-line bg-white p-1" />
            <span className="text-[11px] text-mutedink mt-2">Scan on your phone</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <a
            href={APK_PATH}
            className="btn-tactile inline-flex items-center justify-center gap-2 bg-forest hover:bg-forestdeep text-white text-sm font-semibold rounded-full px-5 py-3 transition-colors"
          >
            <Download size={16} /> Download the APK
          </a>
          <Link
            href="/app"
            onClick={onClose}
            className="btn-tactile inline-flex items-center justify-center gap-2 border border-line text-ink text-sm font-semibold rounded-full px-5 py-3 hover:bg-mist transition-colors"
          >
            <Globe size={16} /> Open in the browser
          </Link>
        </div>

        <p className="text-xs text-mutedink leading-relaxed mt-4">
          Version {APP_VERSION}, about 125 MB, for Android 7 and newer. Android asks once to allow installs from your browser; the
          demo build is signed with a development key, so that prompt is expected.
        </p>
      </div>
    </div>
  );
}
