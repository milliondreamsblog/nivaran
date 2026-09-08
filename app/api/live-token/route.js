import { createLiveTokenHandler } from './handler.mjs';
import { preflight, withCors } from '../cors.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = withCors(createLiveTokenHandler());
export const OPTIONS = preflight;
