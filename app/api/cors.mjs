// Browser calls from the Expo web dev server (localhost:8081) are cross-origin; the deployed site is same-origin.
// Only localhost origins are allowed, and the demo-key header still applies to every request.

const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function corsHeaders(request) {
  const origin = request.headers.get('origin') || '';
  if (!LOCAL.test(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'content-type, x-nivaran-demo-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

export function preflight(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/** Wraps a POST handler so its response carries the CORS headers for local browser origins. */
export function withCors(handler) {
  return async function POST(request) {
    const response = await handler(request);
    const headers = corsHeaders(request);
    if (!Object.keys(headers).length) return response;
    const merged = new Headers(response.headers);
    for (const [key, value] of Object.entries(headers)) merged.set(key, value);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: merged });
  };
}
