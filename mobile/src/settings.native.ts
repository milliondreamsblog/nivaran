import * as FS from 'expo-file-system/legacy';

const file = () => `${FS.documentDirectory}settings.json`;

async function read(): Promise<Record<string, string>> {
  try {
    const info = await FS.getInfoAsync(file());
    if (!info.exists) return {};
    const parsed: unknown = JSON.parse(await FS.readAsStringAsync(file()));
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function getSetting(key: string): Promise<string> {
  return (await read())[key] ?? '';
}

export async function setSetting(key: string, value: string): Promise<void> {
  const all = await read();
  if (value) all[key] = value; else delete all[key];
  await FS.writeAsStringAsync(file(), JSON.stringify(all));
}
