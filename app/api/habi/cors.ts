const ALLOWED_ORIGINS = new Set([
  'https://lfeelterrible-lab.github.io',
  'https://identity-v-character-archive.smoky-mint-8739.chatgpt.site',
]);

function allowedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin) || origin.startsWith('http://localhost:')) return origin;
  return null;
}

export function corsHeaders(request: Request) {
  const headers = new Headers();
  const origin = allowedOrigin(request);
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Habi-User-Id, X-Habi-Room-Code');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Vary', 'Origin');
  }
  return headers;
}

export function withCors(response: Response, request: Request) {
  corsHeaders(request).forEach((value, key) => response.headers.set(key, value));
  return response;
}

export function optionsResponse(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
