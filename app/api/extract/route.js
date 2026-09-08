import { createExtractHandler } from './handler.mjs';
import { preflight, withCors } from '../cors.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = withCors(createExtractHandler());
export const OPTIONS = preflight;
