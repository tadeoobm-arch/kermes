// Servidor HTTP sin framework (node:http): webhooks, App Proxy de seguimiento, portal de proveedores.
import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { verifyWebhookHmac, verifyAppProxySignature } from '../shopify/verify.js';
import { handleOrderCreated, handleOrderPaid, handleOrderCancelled } from '../services/orders.js';
import { handleFulfillmentWebhook } from '../services/fulfillment.js';
import { lookupOrder } from '../services/tracking.js';
import { reconcilePaidOrders } from '../services/reconcile.js';
import { supplierPortal } from './supplierPortal.js';
import { missingIntegrations } from '../config.js';

const MAX_BODY = 1024 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('body too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function send(res, status, body, type = 'application/json; charset=utf-8', extra = {}) {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', ...extra });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

// Rate limit simple en memoria (por IP) para la consulta pública de pedidos.
export function createRateLimiter({ limit = 20, windowMs = 10 * 60_000 } = {}) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
    arr.push(now);
    hits.set(key, arr);
    if (hits.size > 10_000) hits.clear();
    return arr.length <= limit;
  };
}

// Deduplicación de webhooks por X-Shopify-Webhook-Id (Shopify puede reenviar el mismo evento).
function createDeduper(max = 5000) {
  const seen = new Set();
  return (id) => {
    if (!id) return false;
    if (seen.has(id)) return true;
    seen.add(id);
    if (seen.size > max) seen.delete(seen.values().next().value);
    return false;
  };
}

export const WEBHOOK_HANDLERS = {
  'orders/create': (ctx, p) => handleOrderCreated(ctx, p.admin_graphql_api_id || p.id),
  'orders/paid': (ctx, p) => handleOrderPaid(ctx, p.admin_graphql_api_id || p.id),
  'orders/cancelled': (ctx, p) => handleOrderCancelled(ctx, p.admin_graphql_api_id || p.id),
  'fulfillments/create': (ctx, p) => handleFulfillmentWebhook(ctx, p),
  'fulfillments/update': (ctx, p) => handleFulfillmentWebhook(ctx, p),
};

export function createHandler(ctx, { processInline = false } = {}) {
  const rateOk = createRateLimiter();
  const isDuplicate = createDeduper();
  const pending = new Set();

  const handler = async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return send(res, 200, { ok: true, faltaConectar: missingIntegrations(ctx.config) });
      }

      if (req.method === 'POST' && url.pathname === '/webhooks') {
        const raw = await readBody(req);
        if (!verifyWebhookHmac(raw, req.headers['x-shopify-hmac-sha256'], ctx.config.shopify.clientSecret)) {
          ctx.logger.warn('webhook.invalid_hmac', { topic: req.headers['x-shopify-topic'] });
          return send(res, 401, { error: 'invalid hmac' });
        }
        const topic = String(req.headers['x-shopify-topic'] || '');
        const hook = WEBHOOK_HANDLERS[topic];
        if (!hook) return send(res, 200, { ignored: topic });
        if (isDuplicate(req.headers['x-shopify-webhook-id'])) return send(res, 200, { duplicate: true });
        const payload = JSON.parse(raw.toString('utf8'));
        const job = hook(ctx, payload).catch((err) => ctx.logger.error('webhook.failed', { topic, error: err }));
        if (processInline) {
          const result = await job;
          return send(res, 200, { ok: true, result: result ?? null });
        }
        // Respondemos rápido (Shopify espera < 5 s) y procesamos en segundo plano.
        // Si el proceso falla, /tasks/reconcile vuelve a tomar los pedidos pagados pendientes.
        pending.add(job);
        job.finally(() => pending.delete(job));
        return send(res, 200, { ok: true });
      }

      if (req.method === 'GET' && url.pathname === '/proxy/track') {
        if (!verifyAppProxySignature(url.searchParams, ctx.config.shopify.clientSecret)) return send(res, 401, { ok: false, error: 'firma inválida' });
        const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
        if (!rateOk(ip)) return send(res, 429, { ok: false, error: 'Demasiadas consultas. Probá de nuevo en unos minutos.' });
        const result = await lookupOrder(ctx, { orderNumber: url.searchParams.get('pedido'), contact: url.searchParams.get('contacto') });
        return send(res, result.ok ? 200 : 404, result, 'application/json; charset=utf-8', { 'Cache-Control': 'no-store' });
      }

      const portal = url.pathname.match(/^\/proveedor\/([\w.-]+)$/);
      if (portal && (req.method === 'GET' || req.method === 'POST')) {
        const form = req.method === 'POST' ? new URLSearchParams((await readBody(req)).toString('utf8')) : new URLSearchParams();
        const r = await supplierPortal(ctx, { method: req.method, token: portal[1], form });
        return send(res, r.status, r.html, 'text/html; charset=utf-8', { 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY' });
      }

      if (req.method === 'POST' && url.pathname === '/tasks/reconcile') {
        const auth = String(req.headers.authorization || '');
        const expected = `Bearer ${ctx.config.cronSecret}`;
        const ok = ctx.config.cronSecret && auth.length === expected.length && timingSafeEqual(Buffer.from(auth), Buffer.from(expected));
        if (!ok) return send(res, 401, { error: 'unauthorized' });
        return send(res, 200, await reconcilePaidOrders(ctx));
      }

      return send(res, 404, { error: 'not found' });
    } catch (err) {
      ctx.logger.error('http.error', { path: url.pathname, error: err });
      return send(res, 500, { error: 'error interno' });
    }
  };
  handler.pending = pending;
  return handler;
}

export function startServer(ctx, port) {
  const server = createServer(createHandler(ctx));
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}
