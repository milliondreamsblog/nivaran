const PREFIX = 'nivaran.setting.';

export async function getSetting(key: string): Promise<string> {
  try { return localStorage.getItem(`${PREFIX}${key}`) ?? ''; } catch { return ''; }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    if (value) localStorage.setItem(`${PREFIX}${key}`, value);
    else localStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Private mode or blocked storage: the value simply lives in memory for this visit.
  }
}
