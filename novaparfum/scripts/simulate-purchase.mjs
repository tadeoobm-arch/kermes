#!/usr/bin/env node
// Simulación de punta a punta SIN credenciales (Shopify simulado en memoria):
// catálogo -> compra -> pago aprobado -> órdenes a proveedores -> planilla -> tracking -> entrega.
// Uso: cd app && npm run simulate
import { createTestContext, seedCatalog, CUSTOMER, ADDRESS } from '../app/test/helpers/setup.js';
import { handleOrderCreated, handleOrderPaid } from '../app/src/services/orders.js';
import { handleFulfillmentWebhook, registerSupplierTracking, markDelivered } from '../app/src/services/fulfillment.js';
import { lookupOrder } from '../app/src/services/tracking.js';
import { SHEET_COLUMNS } from '../app/src/domain/sheetRows.js';

const line = (t) => console.log(`\n${'─'.repeat(64)}\n${t}\n${'─'.repeat(64)}`);
const { ctx, shopify, rec } = createTestContext();
await seedCatalog(ctx, shopify);

line('1) Cliente compra 3 perfumes (2 proveedores) y va a Mercado Pago');
const order = shopify.checkout({
  items: [{ sku: 'NP-AUR-100', quantity: 1 }, { sku: 'NP-BRI-100', quantity: 1 }, { sku: 'NP-CED-100', quantity: 1 }],
  customer: CUSTOMER, address: ADDRESS, note: 'Tocar timbre 302',
});
await handleOrderCreated(ctx, order.id);
console.log(`Pedido ${order.name} creado · pago: PENDIENTE · emails a proveedores: ${rec.emails.length} (correcto: 0)`);

line('2) Mercado Pago aprueba el pago → Shopify: orders/paid');
shopify.markPaid(order.id);
const paid = await handleOrderPaid(ctx, order.id);
for (const s of paid.supplierOrders) {
  console.log(`\n>>> EMAIL A ${s.supplierName} <${s.to}>\nAsunto: ${s.subject}\n\n${s.text}`);
}
console.log(`\nGanancia estimada del pedido: ${paid.margins.order.margin} UYU (${paid.margins.order.marginPercent}%)`);

line('3) Proveedor B informa el tracking en su portal');
await registerSupplierTracking(ctx, { orderGid: order.id, supplierHandle: 'proveedor-b', carrierCode: 'DAC', number: 'DAC123456' });
const stored = shopify.state.orders.get(order.id);
await handleFulfillmentWebhook(ctx, { order_id: stored.legacyResourceId, tracking_company: 'DAC', tracking_number: 'DAC123456' });
console.log('WhatsApp al cliente (si está conectado):', JSON.stringify(rec.whatsapps.at(-1)));

line('4) Cliente consulta "Seguí tu pedido" (número + teléfono)');
console.log(JSON.stringify((await lookupOrder(ctx, { orderNumber: order.name, contact: '099123456' })).order, null, 2));

line('5) Proveedor A envía y ambos paquetes se entregan');
await registerSupplierTracking(ctx, { orderGid: order.id, supplierHandle: 'proveedor-a', carrierCode: 'UES', number: 'UES-777' });
for (const f of stored.fulfillments) {
  await markDelivered(ctx, { fulfillmentId: f.id });
  await handleFulfillmentWebhook(ctx, { order_id: stored.legacyResourceId, shipment_status: 'delivered' });
}
console.log(`Estado final: ${stored.estado.value}`);

line('6) Planilla de pedidos (Google Sheets)');
const show = ['ID pedido', 'Producto', 'Tamaño', 'Proveedor', 'Precio', 'Costo proveedor', 'Margen', 'Estado del pago', 'Estado del pedido', 'Empresa de envío', 'Número de seguimiento'];
console.table([...rec.sheetRows.values()].map((r) => Object.fromEntries(show.map((c) => [c, r[SHEET_COLUMNS.indexOf(c)]]))));
