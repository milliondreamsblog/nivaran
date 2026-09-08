import { Platform } from 'react-native';

/** Same origin when the web build is served next to the API; otherwise the configured dev server. */
export function apiBase(): string {
  if (Platform.OS === 'web' && typeof location !== 'undefined' && location.port === '') return '';
  return (process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000').replace(/\/$/, '');
}

export const LIVE_TOKEN_PATH = '/api/live-token';
export const EXTRACT_PATH = '/api/extract';
export const DEMO_CODE_SETTING = 'demoCode';
/** 'off' makes typed chat use the scripted questions instead of the model. Default on. */
export const AI_CHAT_SETTING = 'aiChat';
/** Baked in at build time when EXPO_PUBLIC_DEMO_KEY is set, so local builds need no typing. A saved code overrides it. */
export const DEFAULT_DEMO_CODE = process.env.EXPO_PUBLIC_DEMO_KEY || '';

export function withTimeout(ms: number): AbortSignal | undefined {
  if (typeof AbortController === 'undefined') return undefined;
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}
