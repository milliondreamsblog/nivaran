// Type-only contract for the platform-split file access (files.native.ts, files.web.ts).
import type { LocalDocument } from './types';

/** Loads one of the two bundled synthetic sample documents. */
export declare function sampleDocument(name: 'relieving-letter' | 'claim-rejection'): Promise<LocalDocument>;
/** Opens the picker. Resolves null when the person cancels. Camera and gallery are native only. */
export declare function pickDocument(source?: 'files' | 'camera' | 'gallery'): Promise<LocalDocument | null>;
