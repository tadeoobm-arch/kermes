import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createServer } from 'node:http';
import { verifyWebhookHmac, verifyAppProxySignature, signPayload, verifySignedPayload } from '../src/shopify/verify.js';
import { redact, createLogger } from '../src/logger.js';
import { createHandler } from '../src/http/server.js';
import { createTestContext, seedCatalog, CUSTOMER, ADDRESS, TEST_SECRET } from './helpers/setup.js';
import { planUpsert, mergeRow, columnLetter } from '../src/integrations/sheets.js';
import { toWhatsAppNumber } from '../src/integrations/whatsapp.js';
import { shippedMessage } from '../src/notifications/templates.js';
import { missingIntegrations, loadConfig } from '../src/config.js';

const hmac = (body) => createHmac('sha256', TEST_SECRET).update(body).digest('base64');

function proxyQuery(params) {
  const msg = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('');
  const signature = createHmac('sha256', TEST_SECRET).update(msg).digest('hex');
  return new URLSearchParams({ ...params, signature }).toString();
}

async function withServer(ctx, fn) {
  const server = createServer(createHandler(ctx, { processInline: true }));
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    return await fn(base);
  } finally {
    server.close();
  }
}

test('HMAC de webhooks', () => {
  const body = '{"id":1}';
  assert.equal(verifyWebhookHmac(Buffer.from(body), hmac(body), TEST_SECRET), true);
  assert.equal(verifyWebhookHmac(Buffer.from(body), hmac('{"id":2}'), TEST_SECRET), false);
  assert.equal(verifyWebhookHmac(Buffer.from(body), undefined, TEST_SECRET), false);
  assert.equal(verifyWebhookHmac(Buffer.from(body), hmac(body), ''), false);
});

test('firma del App Proxy', () => {
  const q = proxyQuery({ shop: 'tienda.myshopify.com', path_prefix: '/apps/novaparfum', timestamp: '1700000000', pedido: '1045' });
  assert.equal(verifyAppProxySignature(q, TEST_SECRET), true);
  assert.equal(verifyAppProxySignature(q.replace('1045', '1046'), TEST_SECRET), false);
});

test('links firmados del portal: manipulación y vencimiento', () => {
  const t = signPayload({ o: 'gid://shopify/Order/1', s: 'a', exp: Date.now() + 1000 }, 'k');
  assert.equal(verifySignedPayload(t, 'k').s, 'a');
  assert.equal(verifySignedPayload(t, 'otra'), null);
  const [body, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ o: 'gid://shopify/Order/1', s: 'b' })).toString('base64url');
  assert.equal(verifySignedPayload(`${forged}.${sig}`, 'k'), null);
  assert.equal(verifySignedPayload(signPayload({ exp: Date.now() - 1 }, 'k'), 'k'), null);
  assert.ok(body);
});

test('los logs nunca muestran credenciales', () => {
  const lines = [];
  const logger = createLogger({ sink: { log: (l) => lines.push(l), error: (l) => lines.push(l) } });
  logger.info('conexión', { accessToken: 'shpat_abc123', smtp: { pass: 'secreto' }, msg2: 'token APP_USR-1234-abcd en texto', headers: { authorization: 'Bearer xyz' } });
  const out = lines.join('\n');
  assert.doesNotMatch(out, /shpat_abc123|secreto|APP_USR-1234|xyz/);
  assert.match(out, /REDACTED/);
  assert.equal(redact({ client_secret: 'x' }).client_secret, '[REDACTED]');
});

test('servidor: webhook con HMAC inválido es rechazado; válido procesa el pedido pagado', async () => {
  const { ctx, shopify, rec } = createTestContext();
  await seedCatalog(ctx, shopify);
  const order = shopify.checkout({ items: [{ sku: 'NP-AUR-30', quantity: 1 }], customer: CUSTOMER, address: ADDRESS, financialStatus: 'PAID' });
  const body = JSON.stringify({ id: Number(order.legacyResourceId), admin_graphql_api_id: order.id, financial_status: 'paid' });
  await withServer(ctx, async (base) => {
    const bad = await fetch(`${base}/webhooks`, { method: 'POST', body, headers: { 'X-Shopify-Topic': 'orders/paid', 'X-Shopify-Hmac-Sha256': 'invalido' } });
    assert.equal(bad.status, 401);
    assert.equal(rec.emails.length, 0);
    const headers = { 'X-Shopify-Topic': 'orders/paid', 'X-Shopify-Hmac-Sha256': hmac(body), 'X-Shopify-Webhook-Id': 'w-1' };
    const ok = await fetch(`${base}/webhooks`, { method: 'POST', body, headers });
    assert.equal(ok.status, 200);
    assert.ok(rec.emails.some((e) => e.to === 'pedidos@proveedor-a.test'));
    const dup = await fetch(`${base}/webhooks`, { method: 'POST', body, headers });
    assert.deepEqual(await dup.json(), { duplicate: true });
  });
});

test('servidor: App Proxy "Seguí tu pedido" exige firma y limita consultas', async () => {
  const { ctx, shopify } = createTestContext();
  await seedCatalog(ctx, shopify);
  const order = shopify.checkout({ items: [{ sku: 'NP-AUR-30', quantity: 1 }], customer: CUSTOMER, address: ADDRESS });
  await withServer(ctx, async (base) => {
    const unsigned = await fetch(`${base}/proxy/track?pedido=1045&contacto=x`);
    assert.equal(unsigned.status, 401);
    const q = proxyQuery({ shop: 'tienda-prueba.myshopify.com', path_prefix: '/apps/novaparfum', timestamp: '1', pedido: order.name.slice(1), contacto: CUSTOMER.email });
    const res = await fetch(`${base}/proxy/track?${q}`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.order.estadoTexto, 'Pedido recibido');
    let last;
    for (let i = 0; i < 25; i++) last = await fetch(`${base}/proxy/track?${q}`);
    assert.equal(last.status, 429);
  });
});

test('servidor: portal con token inválido y reconcile sin autorización', async () => {
  const { ctx } = createTestContext();
  await withServer(ctx, async (base) => {
    assert.equal((await fetch(`${base}/proveedor/abc.def`)).status, 403);
    assert.equal((await fetch(`${base}/tasks/reconcile`, { method: 'POST' })).status, 401);
    assert.equal((await fetch(`${base}/tasks/reconcile`, { method: 'POST', headers: { Authorization: 'Bearer cron-de-prueba' } })).status, 200);
    const health = await (await fetch(`${base}/health`)).json();
    assert.equal(health.ok, true);
  });
});

test('planilla: upsert sin duplicar y sin pisar datos cargados a mano', () => {
  const header = ['Clave', 'Estado', 'Nota manual'];
  const existing = [header, ['#1|1', 'Pagado', 'llamar antes']];
  const plan = planUpsert(existing, header, [['#1|1', 'Enviado', ''], ['#2|5', 'Pagado', '']], 'Clave');
  assert.deepEqual(plan.updates, [{ rowNumber: 2, values: ['#1|1', 'Enviado', 'llamar antes'] }]);
  assert.deepEqual(plan.appends, [['#2|5', 'Pagado', '']]);
  assert.deepEqual(mergeRow(['a', 'b'], ['', 'c']), ['a', 'c']);
  assert.equal(columnLetter(0), 'A');
  assert.equal(columnLetter(32), 'AG');
});

test('notificación de envío con identidad NovaParfum', () => {
  const order = { name: '#1045', customer: { firstName: 'Juan' }, lineItems: [] };
  const m = shippedMessage({ storeUrl: 'https://novaparfum.test', trackingPagePath: '/pages/segui-tu-pedido' }, order, { number: 'XXXXXXX', company: 'DAC' });
  assert.equal(m.text.split('\n')[0], '¡Tu pedido de NovaParfum ya fue enviado! 📦');
  assert.match(m.text, /Número de seguimiento:\nXXXXXXX/);
  assert.match(m.text, /Podés seguir tu pedido desde:\nhttps:\/\/novaparfum\.test\/pages\/segui-tu-pedido\?pedido=1045/);
  assert.match(m.html, /NovaParfum|Nova<span/);
  assert.match(m.html, /#4B3FA8/, 'usa el color de marca, no dorado/negro');
});

test('WhatsApp: normaliza números uruguayos', () => {
  assert.equal(toWhatsAppNumber('099 123 456'), '59899123456');
  assert.equal(toWhatsAppNumber('+598 99 123 456'), '59899123456');
  assert.equal(toWhatsAppNumber(''), '');
});

test('sin credenciales: la app indica exactamente qué conectar', () => {
  const missing = missingIntegrations(loadConfig({}));
  assert.ok(missing.some((m) => m.startsWith('SHOPIFY_SHOP')));
  assert.ok(missing.some((m) => m.startsWith('GOOGLE_SHEETS')));
  assert.ok(missing.some((m) => m.startsWith('MP_FEE_PERCENT')));
});
