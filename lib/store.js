// localStorage-backed mock store. Every read/write is guarded: private
// windows and SSR must never crash the page.

import { SEED_GRIEVANCES } from "./seed";

const KEY = "nivaran_grievances";
const AUTH = "nivaran_auth";
const KBV = "nivaran_kb";

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable: the session just won't persist
  }
}

export function seedOnce() {
  const existing = read(KEY, null);
  if (!existing) write(KEY, SEED_GRIEVANCES);
}

export function getGrievances() {
  return read(KEY, SEED_GRIEVANCES);
}

export function getGrievance(id) {
  return getGrievances().find((g) => g.id === id) || null;
}

export function addGrievance(g) {
  const all = getGrievances();
  write(KEY, [g, ...all]);
  return g;
}

export function appendEvent(id, event, status) {
  const all = getGrievances().map((g) =>
    g.id === id ? { ...g, events: [...g.events, event], status: status || g.status } : g
  );
  write(KEY, all);
}

export function login(email) {
  write(AUTH, { email, at: Date.now() });
}

export function logout() {
  try {
    window.localStorage.removeItem(AUTH);
  } catch {}
}

export function currentUser() {
  return read(AUTH, null);
}

export function newRegId() {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `NVRN/E/2026/${String(n).padStart(5, "0")}`;
}

export function getKbState() {
  return read(KBV, { version: "1.2", applied: [] });
}

export function applyKbUpdate(id) {
  const s = getKbState();
  if (s.applied.includes(id)) return s;
  const next = {
    version: (parseFloat(s.version) + 0.1).toFixed(1),
    applied: [...s.applied, id],
    updatedAt: new Date().toISOString(),
  };
  write(KBV, next);
  return next;
}
