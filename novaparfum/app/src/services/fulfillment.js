// Envíos: registro de tracking (desde el portal del proveedor o desde el admin de Shopify),
// actualización de estados y avisos al cliente.
import { FULFILLMENT_ORDERS_QUERY, FULFILLMENT_CREATE, FULFILLMENT_EVENT_CREATE } from '../shopify/queries.js';
import { assertNoUserErrors, toGid } from '../shopify/client.js';
import { STATUS, deriveStatus } from '../domain/status.js';
import { companyName, trackingUrlFor, findCarrier } from '../domain/carriers.js';
import { fetchOrder, setOrderState, syncSheet, withOrderLock } from './orders.js';
import { trackingPageUrl } from '../notifications/templates.js';

// fulfillments/create y fulfillments/update (webhooks). Sirve tanto si el tracking lo cargó
// el proveedor en el portal como si lo cargaste a mano en el admin de Shopify.
export async function handleFulfillmentWebhook(ctx, payload) {
  const orderId = payload.order_id;
  return withOrderLock(toGid('Order', orderId), async () => {
    const order = await fetchOrder(ctx, orderId);
    const before = order.estado;
    const derived = deriveStatus({ ...order, estado: before });
    const final = await setOrderState(ctx, order, { status: derived });
    await syncSheet(ctx, order);

    const tracking = { company: payload.tracking_company, number: payload.tracking_number, url: payload.tracking_url };
    const wa = ctx.config.whatsapp.templates;
    // El email al cliente lo envía Shopify (notificaciones nativas "Confirmación de envío" y "Entregado").
    // Acá solo agregamos WhatsApp, y únicamente cuando el estado avanza (idempotente).
    if (final !== before && (final === STATUS.ENVIADO || final === STATUS.EN_TRANSITO) && before !== STATUS.ENVIADO && before !== STATUS.EN_TRANSITO) {
      await ctx.whatsapp.sendTemplate({ to: order.customer.phone, template: wa.enviado, params: [order.name, tracking.number || '-', tracking.url || trackingPageUrl(ctx.config, order)] });
    }
    if (final !== before && final === STATUS.ENTREGADO) {
      await ctx.whatsapp.sendTemplate({ to: order.customer.phone, template: wa.entregado, params: [order.name] });
    }
    return { order: order.name, from: before, to: final };
  });
}

// Crea el fulfillment en Shopify SOLO con las líneas del proveedor indicado.
export async function registerSupplierTracking(ctx, { orderGid, supplierHandle, carrierCode, customCarrier = '', number, url = '' }) {
  if (!number || String(number).trim().length < 3) throw new Error('Número de seguimiento inválido');
  if (!findCarrier(carrierCode)) throw new Error('Empresa de envío inválida');
  const order = await fetchOrder(ctx, orderGid);
  if (order.cancelledAt) throw new Error('El pedido está cancelado: no enviar');
  const assigned = order.pedidosProveedor?.[supplierHandle];
  if (!assigned) throw new Error('Este pedido no tiene productos de este proveedor');

  const foData = await ctx.shopify.graphql(FULFILLMENT_ORDERS_QUERY, { id: order.gid });
  const lineItemsByFulfillmentOrder = [];
  for (const fo of foData.order.fulfillmentOrders.nodes) {
    if (!['OPEN', 'IN_PROGRESS'].includes(fo.status)) continue;
    const items = fo.lineItems.nodes
      .filter((n) => n.remainingQuantity > 0 && assigned.lineas.includes(n.lineItem.id))
      .map((n) => ({ id: n.id, quantity: n.remainingQuantity }));
    if (items.length) lineItemsByFulfillmentOrder.push({ fulfillmentOrderId: fo.id, fulfillmentOrderLineItems: items });
  }
  if (!lineItemsByFulfillmentOrder.length) return { alreadyFulfilled: true, order: order.name };

  const company = companyName(carrierCode, customCarrier);
  const trackingUrl = trackingUrlFor(carrierCode, number, ctx.config.carriers, url);
  const trackingInfo = { company, number: String(number).trim(), ...(trackingUrl ? { url: trackingUrl } : {}) };
  const res = await ctx.shopify.graphql(FULFILLMENT_CREATE, {
    fulfillment: { lineItemsByFulfillmentOrder, trackingInfo, notifyCustomer: true },
    message: `Enviado por ${assigned.nombre}`,
  });
  assertNoUserErrors(res.fulfillmentCreate, 'fulfillmentCreate');

  await setOrderState(ctx, order, {
    pedidosProveedor: { ...order.pedidosProveedor, [supplierHandle]: { ...assigned, tracking: { ...trackingInfo, at: new Date().toISOString(), fulfillmentId: res.fulfillmentCreate.fulfillment.id } } },
  });
  ctx.logger.info('tracking.registered', { order: order.name, supplier: supplierHandle, company });
  return { order: order.name, fulfillment: res.fulfillmentCreate.fulfillment };
}

// Marca un envío como entregado (dispara la notificación nativa "Entregado" de Shopify).
export async function markDelivered(ctx, { fulfillmentId }) {
  const res = await ctx.shopify.graphql(FULFILLMENT_EVENT_CREATE, {
    fulfillmentEvent: { fulfillmentId, status: 'DELIVERED', message: 'Entregado según operador logístico' },
  });
  assertNoUserErrors(res.fulfillmentEventCreate, 'fulfillmentEventCreate');
  return res.fulfillmentEventCreate.fulfillmentEvent;
}

export async function markInTransit(ctx, { fulfillmentId }) {
  const res = await ctx.shopify.graphql(FULFILLMENT_EVENT_CREATE, { fulfillmentEvent: { fulfillmentId, status: 'IN_TRANSIT' } });
  assertNoUserErrors(res.fulfillmentEventCreate, 'fulfillmentEventCreate');
  return res.fulfillmentEventCreate.fulfillmentEvent;
}
