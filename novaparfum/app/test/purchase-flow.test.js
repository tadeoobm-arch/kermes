// Simulación de una compra completa: catálogo -> checkout -> pago -> proveedores -> planilla
// -> tracking -> notificaciones -> seguimiento del cliente -> entrega. Más escenarios de error.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext, seedCatalog, CUSTOMER, ADDRESS } from './helpers/setup.js';
import { handleOrderCreated, handleOrderPaid, handleOrderCancelled, TAG_SUPPLIER_NOTIFIED } from '../src/services/orders.js';
import { handleFulfillmentWebhook, registerSupplierTracking, markDelivered } from '../src/services/fulfillment.js';
import { lookupOrder, NOT_FOUND } from '../src/services/tracking.js';
import { reconcilePaidOrders } from '../src/services/reconcile.js';
import { SHEET_COLUMNS } from '../src/domain/sheetRows.js';
import { supplierPortal } from '../src/http/supplierPortal.js';
import { STATUS } from '../src/domain/status.js';

const col = (row, name) => row[SHEET_COLUMNS.indexOf(name)];
const fulfillmentWebhook = (order, f, extra = {}) => ({
  order_id: order.legacyResourceId,
  tracking_company: f.trackingInfo[0].company,
  tracking_number: f.trackingInfo[0].number,
  tracking_url: f.trackingInfo[0].url,
  shipment_status: null,
  ...extra,
});

async function buy(ctx, shopify, items, extra = {}) {
  const order = shopify.checkout({ items, customer: CUSTOMER, address: ADDRESS, note: 'Tocar timbre 302', ...extra });
  await handleOrderCreated(ctx, order.id);
  return order;
}

test('compra completa con 2 proveedores', async () => {
  const { ctx, shopify, rec } = createTestContext();
  await seedCatalog(ctx, shopify);

  // 1) Compra: el pedido se crea con pago PENDIENTE (cliente en Mercado Pago)
  const order = await buy(ctx, shopify, [
    { sku: 'NP-AUR-100', quantity: 1 },
    { sku: 'NP-BRI-100', quantity: 1 },
    { sku: 'NP-CED-100', quantity: 1 },
  ]);
  assert.equal(shopify.variantBySku('NP-AUR-100').variant.stock, 2, 'el inventario se descuenta por variante');
  assert.equal(order.estado.value, STATUS.PEDIDO_RECIBIDO);
  assert.equal(rec.emails.length, 0, 'PEDIDO CREADO no dispara proveedor ni emails');
  assert.equal(rec.sheetRows.size, 3, 'se registra en la planilla una fila por producto');
  const firstRow = [...rec.sheetRows.values()][0];
  assert.equal(col(firstRow, 'Estado del pago'), 'Pendiente');
  assert.equal(col(firstRow, 'Estado del pedido'), 'Pedido recibido');

  // 2) Mercado Pago aprueba -> Shopify marca el pedido como pagado -> webhook orders/paid
  shopify.markPaid(order.id);
  const result = await handleOrderPaid(ctx, order.id);
  assert.equal(result.supplierOrders.length, 2);

  const toA = rec.emails.find((e) => e.to === 'pedidos@proveedor-a.test');
  const toB = rec.emails.find((e) => e.to === 'ventas@proveedor-b.test');
  assert.ok(toA && toB, 'cada proveedor recibe su orden');
  assert.match(toA.text, /PEDIDO NOVAPARFUM #1045/);
  assert.match(toA.text, /Aurora Nocturna/);
  assert.match(toA.text, /Brisa Cítrica/);
  assert.doesNotMatch(toA.text, /Cedro Azul/);
  assert.match(toB.text, /Cedro Azul/);
  assert.doesNotMatch(toB.text, /Aurora|Brisa/);
  for (const e of [toA, toB]) {
    assert.match(e.text, /Juan Pérez/);
    assert.match(e.text, /\+598 99 123 456/);
    assert.match(e.text, /Av\. Brasil 1234/);
    assert.match(e.text, /Apartamento 302/);
    assert.match(e.text, /Tocar timbre 302/);
    assert.match(e.text, /Estado:\nPAGADO/);
    assert.match(e.text, /https:\/\/ops\.novaparfum\.test\/proveedor\//);
  }
  assert.ok(rec.emails.some((e) => e.to?.includes?.('admin@novaparfum.test') || (Array.isArray(e.to) && e.to.includes('admin@novaparfum.test'))), 'aviso al administrador');
  assert.ok(rec.emails.some((e) => e.to === CUSTOMER.email && /Pago confirmado/.test(e.subject)), 'aviso al cliente: pago confirmado');
  assert.ok(rec.whatsapps.some((w) => w.template === 'np_pago_confirmado'));

  const stored = shopify.state.orders.get(order.id);
  assert.equal(stored.estado.value, STATUS.PREPARANDO);
  assert.ok(stored.tags.includes(TAG_SUPPLIER_NOTIFIED));
  assert.ok(stored.tags.includes('estado:preparando'));

  // Planilla actualizada (misma fila, no duplica)
  assert.equal(rec.sheetRows.size, 3);
  const auroraRow = [...rec.sheetRows.values()].find((r) => col(r, 'SKU') === 'NP-AUR-100');
  assert.equal(col(auroraRow, 'Estado del pago'), 'Pagado');
  assert.equal(col(auroraRow, 'Estado del pedido'), 'Preparando pedido');
  assert.equal(col(auroraRow, 'Proveedor'), 'Proveedor A');
  assert.equal(col(auroraRow, 'Costo proveedor'), 2000);
  assert.equal(col(auroraRow, 'Departamento'), 'Montevideo');
  assert.equal(col(auroraRow, 'Apartamento'), '302');
  assert.equal(col(auroraRow, 'Método de pago'), 'Mercado Pago');
  assert.equal(typeof col(auroraRow, 'Margen'), 'number');
  assert.equal(col(auroraRow, 'Fecha'), '2026-10-01');
  assert.equal(col(auroraRow, 'Hora'), '11:30', 'hora local de Montevideo');

  // 3) Webhook duplicado: NO reenvía a proveedores
  const emailsBefore = rec.emails.length;
  const again = await handleOrderPaid(ctx, order.id);
  assert.equal(again.skipped, 'proveedor ya notificado');
  assert.equal(rec.emails.length, emailsBefore);

  // 4) Proveedor B informa tracking desde su portal (link firmado)
  const linkB = toB.text.match(/\/proveedor\/([\w.-]+)/)[1];
  const form = new URLSearchParams({ empresa: 'DAC', tracking: 'DAC123456' });
  const portal = await supplierPortal(ctx, { method: 'POST', token: linkB, form });
  assert.equal(portal.status, 200);
  assert.match(portal.html, /Guardamos el seguimiento/);
  let f = stored.fulfillments[0];
  assert.equal(f.fulfillmentLineItems.nodes.length, 1, 'el fulfillment incluye SOLO las líneas del proveedor B');
  assert.equal(f.trackingInfo[0].company, 'DAC');
  assert.equal(f.trackingInfo[0].url, 'https://tracking.ejemplo-dac.test/?n=DAC123456');
  assert.equal(f._notifyCustomer, true, 'Shopify envía el email nativo de "Pedido enviado"');

  await handleFulfillmentWebhook(ctx, fulfillmentWebhook(stored, f));
  assert.equal(stored.estado.value, STATUS.ENVIADO);
  const waShipped = rec.whatsapps.find((w) => w.template === 'np_pedido_enviado');
  assert.ok(waShipped);
  assert.deepEqual(waShipped.params.slice(0, 2), ['#1045', 'DAC123456']);
  const cedroRow = [...rec.sheetRows.values()].find((r) => col(r, 'SKU') === 'NP-CED-100');
  assert.equal(col(cedroRow, 'Número de seguimiento'), 'DAC123456');
  assert.equal(col(cedroRow, 'Empresa de envío'), 'DAC');
  assert.equal(col(cedroRow, 'Estado del envío'), 'Enviado');
  const auroraPending = [...rec.sheetRows.values()].find((r) => col(r, 'SKU') === 'NP-AUR-100');
  assert.equal(col(auroraPending, 'Estado del envío'), 'Pendiente', 'lo del proveedor A sigue pendiente');

  // Reenvío del mismo tracking: idempotente
  const dup = await registerSupplierTracking(ctx, { orderGid: order.id, supplierHandle: 'proveedor-b', carrierCode: 'DAC', number: 'DAC123456' });
  assert.equal(dup.alreadyFulfilled, true);

  // 5) Cliente consulta "Seguí tu pedido" con número + teléfono en otro formato
  const lookup = await lookupOrder(ctx, { orderNumber: '1045', contact: '099 123 456' });
  assert.equal(lookup.ok, true);
  assert.equal(lookup.order.estado, STATUS.ENVIADO);
  assert.equal(lookup.order.envios[0].numero, 'DAC123456');
  assert.equal(lookup.order.envios[0].empresa, 'DAC');
  assert.equal(lookup.order.productos.length, 3);
  assert.ok(!JSON.stringify(lookup.order).includes('Brasil'), 'no expone la dirección');
  const byEmail = await lookupOrder(ctx, { orderNumber: '#1045', contact: 'JUAN.PEREZ@example.com' });
  assert.equal(byEmail.ok, true);
  const wrong = await lookupOrder(ctx, { orderNumber: '1045', contact: 'otro@example.com' });
  assert.deepEqual(wrong, { ok: false, error: NOT_FOUND });

  // 6) Proveedor A despacha con otro operador (UES, sin URL configurada)
  const linkA = toA.text.match(/\/proveedor\/([\w.-]+)/)[1];
  await supplierPortal(ctx, { method: 'POST', token: linkA, form: new URLSearchParams({ empresa: 'UES', tracking: 'UES-777' }) });
  f = stored.fulfillments[1];
  assert.equal(f.fulfillmentLineItems.nodes.length, 2);
  assert.equal(f.trackingInfo[0].url, undefined, 'sin URL inventada si el operador no está configurado');
  await handleFulfillmentWebhook(ctx, fulfillmentWebhook(stored, f));
  assert.equal(rec.whatsapps.filter((w) => w.template === 'np_pedido_enviado').length, 1, 'no repite el aviso de enviado');

  // 7) Entregas
  await markDelivered(ctx, { fulfillmentId: stored.fulfillments[0].id });
  await handleFulfillmentWebhook(ctx, fulfillmentWebhook(stored, stored.fulfillments[0], { shipment_status: 'delivered' }));
  assert.equal(stored.estado.value, STATUS.ENVIADO, 'entrega parcial: todavía falta un paquete');
  const portalA = await supplierPortal(ctx, { method: 'POST', token: linkA, form: new URLSearchParams({ accion: 'entregado', fulfillmentId: stored.fulfillments[1].id }) });
  assert.match(portalA.html, /entregado/);
  await handleFulfillmentWebhook(ctx, fulfillmentWebhook(stored, stored.fulfillments[1], { shipment_status: 'delivered' }));
  assert.equal(stored.estado.value, STATUS.ENTREGADO);
  assert.ok(rec.whatsapps.some((w) => w.template === 'np_pedido_entregado'));
  const final = await lookupOrder(ctx, { orderNumber: '1045', contact: CUSTOMER.email });
  assert.equal(final.order.estado, STATUS.ENTREGADO);
  assert.ok(final.order.pasos.every((p) => p.completo));
  assert.ok([...rec.sheetRows.values()].every((r) => col(r, 'Estado del envío') === 'Entregado' && col(r, 'Fecha de entrega') === '2026-10-01'));

  // 8) Un proveedor no puede marcar como entregado un envío ajeno
  const hack = await supplierPortal(ctx, { method: 'POST', token: linkA, form: new URLSearchParams({ accion: 'entregado', fulfillmentId: stored.fulfillments[0].id }) });
  assert.match(hack.html, /Envío no válido/);
});

test('pago rechazado / pendiente: nunca se envía al proveedor', async () => {
  const { ctx, shopify, rec } = createTestContext();
  await seedCatalog(ctx, shopify);
  const order = await buy(ctx, shopify, [{ sku: 'NP-AUR-30', quantity: 1 }]);
  // Llega un orders/paid defensivo pero Shopify dice que NO está pago (p. ej. rechazado / anulado)
  shopify.state.orders.get(order.id).displayFinancialStatus = 'VOIDED';
  const r = await handleOrderPaid(ctx, order.id);
  assert.equal(r.skipped, 'pago no confirmado');
  assert.equal(rec.emails.length, 0);
  const rec2 = await reconcilePaidOrders(ctx);
  assert.equal(rec2.checked, 0, 'la conciliación tampoco lo toma');
  const lookup = await lookupOrder(ctx, { orderNumber: order.name, contact: CUSTOMER.email });
  assert.equal(lookup.order.estado, STATUS.PEDIDO_RECIBIDO);
});

test('pedido cancelado después de enviado al proveedor: avisa NO ENVIAR y registra cancelación', async () => {
  const { ctx, shopify, rec } = createTestContext();
  await seedCatalog(ctx, shopify);
  const order = await buy(ctx, shopify, [{ sku: 'NP-CED-100', quantity: 1 }]);
  shopify.markPaid(order.id);
  await handleOrderPaid(ctx, order.id);
  shopify.cancel(order.id, 'CUSTOMER');
  const r = await handleOrderCancelled(ctx, order.id);
  assert.deepEqual(r.notifiedSuppliers, ['Proveedor B']);
  assert.ok(rec.emails.some((e) => e.to === 'ventas@proveedor-b.test' && /NO ENVIAR/.test(e.subject)));
  assert.ok(rec.emails.some((e) => /Pedido cancelado/.test(e.subject)), 'aviso al administrador');
  const stored = shopify.state.orders.get(order.id);
  assert.equal(stored.estado.value, STATUS.CANCELADO);
  const row = [...rec.sheetRows.values()][0];
  assert.equal(col(row, 'Estado del pedido'), 'Cancelado');
  assert.match(col(row, 'Observaciones'), /Cancelado: CUSTOMER/);
  // El portal del proveedor muestra la cancelación
  const link = rec.emails.find((e) => e.to === 'ventas@proveedor-b.test' && /PAGADO/.test(e.subject)).text.match(/\/proveedor\/([\w.-]+)/)[1];
  const portal = await supplierPortal(ctx, { method: 'GET', token: link, form: new URLSearchParams() });
  assert.match(portal.html, /NO ENVIAR/);
  await assert.rejects(registerSupplierTracking(ctx, { orderGid: order.id, supplierHandle: 'proveedor-b', carrierCode: 'DAC', number: 'X123' }), /cancelado/);
  // Segundo webhook de cancelación: no duplica avisos
  const n = rec.emails.length;
  await handleOrderCancelled(ctx, order.id);
  assert.equal(rec.emails.length, n);
});

test('pedido cancelado antes de pagar: no molesta a proveedores', async () => {
  const { ctx, shopify, rec } = createTestContext();
  await seedCatalog(ctx, shopify);
  const order = await buy(ctx, shopify, [{ sku: 'NP-BRI-100', quantity: 2 }]);
  shopify.cancel(order.id);
  const r = await handleOrderCancelled(ctx, order.id);
  assert.deepEqual(r.notifiedSuppliers, []);
  assert.ok(!rec.emails.some((e) => /proveedor/.test(String(e.to))));
});

test('conciliación: procesa pedidos pagados que no llegaron por webhook', async () => {
  const { ctx, shopify, rec } = createTestContext();
  await seedCatalog(ctx, shopify);
  const order = shopify.checkout({ items: [{ sku: 'NP-AUR-50', quantity: 1 }], customer: CUSTOMER, address: ADDRESS, financialStatus: 'PAID' });
  const r = await reconcilePaidOrders(ctx);
  assert.equal(r.checked, 1);
  assert.ok(rec.emails.some((e) => e.to === 'pedidos@proveedor-a.test'));
  assert.ok(shopify.state.orders.get(order.id).tags.includes(TAG_SUPPLIER_NOTIFIED));
  assert.equal((await reconcilePaidOrders(ctx)).checked, 0);
});

test('producto sin proveedor y dirección sin número: se marca para revisar y se alerta', async () => {
  const { ctx, shopify, rec } = createTestContext();
  await seedCatalog(ctx, shopify);
  shopify.state.products.forEach((p) => { if (p.handle.includes('cedro')) p.supplierId = undefined; });
  const order = shopify.checkout({ items: [{ sku: 'NP-CED-100', quantity: 1 }], customer: CUSTOMER, address: { ...ADDRESS, address1: 'Av. Brasil' }, financialStatus: 'PAID' });
  const r = await handleOrderPaid(ctx, order.id);
  assert.ok(r.warnings.some((w) => /sin proveedor/i.test(w)));
  assert.ok(r.warnings.some((w) => /número de puerta/.test(w)));
  const stored = shopify.state.orders.get(order.id);
  assert.ok(stored.tags.includes('np-revisar'));
  assert.ok(!stored.tags.includes(TAG_SUPPLIER_NOTIFIED), 'queda pendiente para reintentar/conciliar');
  const admin = rec.emails.find((e) => /Venta pagada/.test(e.subject));
  assert.match(admin.html, /Revisar/);
});

test('stock: no se puede comprar más de lo disponible en la variante', async () => {
  const { ctx, shopify } = createTestContext();
  await seedCatalog(ctx, shopify);
  assert.throws(() => shopify.checkout({ items: [{ sku: 'NP-CED-100', quantity: 3 }], customer: CUSTOMER, address: ADDRESS }), /Sin stock/);
});
