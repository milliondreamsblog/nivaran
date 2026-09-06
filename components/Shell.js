"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { currentUser, logout } from "../lib/store";
import ThemeToggle from "./ThemeToggle";

export default function Shell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = currentUser();
    if (!u) router.replace("/login");
    else setUser(u);
  }, [router]);

  const tab = (href, label) => (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        pathname === href ? "bg-forestwash text-forest" : "text-inksoft hover:bg-mist hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="border-b border-line bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2.5">
          <Link href="/dashboard" className="order-1 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-xl text-ink">निवारण</span>
            <span className="font-display font-bold text-sm text-forest tracking-wide">NIVARAN</span>
          </Link>
          <span className="order-2 hidden lg:block text-xs text-mutedink border-l border-line pl-4">
            CPGRAMS, rebuilt for citizens · proof of concept
          </span>

          <div className="order-2 sm:order-4 ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-2 border-l border-line pl-3">
              <span className="text-xs text-mutedink hidden md:block">{user?.email}</span>
              <button
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
                className="text-xs text-inksoft hover:text-alert underline underline-offset-2"
              >
                Sign out
              </button>
            </div>
          </div>

          <nav className="order-3 w-full sm:w-auto flex items-center gap-1 overflow-x-auto">
            {tab("/dashboard", "My grievances")}
            {tab("/file", "File new")}
            {tab("/admin", "Ops")}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-line py-3 text-center text-xs text-mutedink">
        Proof of concept for Build What Moves India · all data is mock · not affiliated with DARPG
      </footer>
    </div>
  );
}
