// Type-only contract for the platform-split settings store (settings.native.ts = a JSON file, settings.web.ts = localStorage).
export declare function getSetting(key: string): Promise<string>;
export declare function setSetting(key: string, value: string): Promise<void>;
