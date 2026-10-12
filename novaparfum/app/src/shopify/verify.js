import { createHmac, timingSafeEqual } from 'node:crypto';

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

// Webhooks: HMAC-SHA256 del body crudo, en base64, con el client secret de la app.
export function verifyWebhookHmac(rawBody, hmacHeader, secret) {
  if (!secret || !hmacHeader || rawBody === undefined) return false;
  const digest = createHmac('sha256', secret).update(rawBody).digest('base64');
  return safeEqual(digest, hmacHeader);
}

// App Proxy: los parámetros (menos "signature") se ordenan, se unen como key=value
// (valores múltiples separados por coma) sin separador, y se firma con HMAC-SHA256 hex.
export function verifyAppProxySignature(searchParams, secret) {
  if (!secret) return false;
  const params = new URLSearchParams(searchParams);
  const signature = params.get('signature');
  if (!signature) return false;
  const grouped = {};
  for (const [k, v] of params) {
    if (k === 'signature') continue;
    (grouped[k] ||= []).push(v);
  }
  const message = Object.keys(grouped)
    .sort()
    .map((k) => `${k}=${grouped[k].join(',')}`)
    .join('');
  const digest = createHmac('sha256', secret).update(message).digest('hex');
  return safeEqual(digest, signature);
}

// Firma genérica para links propios (portal de proveedores).
export function signPayload(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySignedPayload(token, secret) {
  if (!secret || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
