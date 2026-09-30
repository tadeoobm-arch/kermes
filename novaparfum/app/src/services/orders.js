// Servicios de pedidos: registrar, confirmar pago (dispara proveedores) y cancelar.
import { ORDER_QUERY, TAGS_ADD, METAFIELDS_SET } from '../shopify/queries.js';
import { assertNoUserErrors, toGid } from '../shopify/client.js';
import { normalizeOrder, addressWarnings } from '../domain/order.js';
import { STATUS, isPaid, nextStatus, deriveStatus } from '../domain/status.js';
import { splitBySupplier, UNASSIGNED } from '../domain/suppliers.js';
import { computeMargins } from '../domain/margins.js';
import { orderToRows, SHEET_COLUMNS, KEY_COLUMN } from '../domain/sheetRows.js';
import { buildSupplierOrder, supplierPortalLink } from '../domain/supplierOrder.js';
import {
  paymentConfirmedMessage, adminPaidMessage, adminCancelledMessage, supplierCancelledMessage,
} from '../notifications/templates.js';

export const TAG_SUPPLIER_NOTIFIED = 'np-proveedor-notificado';
export const TAG_PAID = 'np-pagado';

// Evita procesar dos veces el mismo pedido en paralelo (webhooks duplicados / reintentos).
const inFlight = new Map();
export function withOrderLock(orderGid, fn) {
  const prev = inFlight.get(orderGid) || Promise.resolve();
  const run = prev.catch(() => {}).then(fn);
  inFlight.set(orderGid, run.finally(() => inFlight.get(orderGid) === run && inFlight.delete(orderGid)));
  return run;
}

export async function fetchOrder(ctx, orderId) {
  const data = await ctx.shopify.graphql(ORDER_QUERY, { id: toGid('Order', orderId) });
  if (!data?.order) throw new Error(`Pedido no encontrado: ${orderId}`);
  return normalizeOrder(data.order);
}

export async function setOrderState(ctx, order, { status, pedidosProveedor, tags = [] }) {
  const final = status ? nextStatus(order.estado, status) : order.estado;
  const metafields = [];
  if (final && final !== order.estado) {
    metafields.push({ ownerId: order.gid, namespace: 'novaparfum', key: 'estado', type: 'single_line_text_field', value: final });
  }
  if (pedidosProveedor) {
    metafields.push({ ownerId: order.gid, namespace: 'novaparfum', key: 'pedidos_proveedor', type: 'json', value: JSON.stringify(pedidosProveedor) });
  }
  if (metafields.length) {
    const r = await ctx.shopify.graphql(METAFIELDS_SET, { metafields });
    assertNoUserErrors(r.metafieldsSet, 'metafieldsSet');
  }
  const allTags = [...tags, ...(final && final !== order.estado ? [`estado:${final.toLowerCase()}`] : [])];
  if (allTags.length) {
    const r = await ctx.shopify.graphql(TAGS_ADD, { id: order.gid, tags: allTags });
    assertNoUserErrors(r.tagsAdd, 'tagsAdd');
  }
  order.estado = final;
  if (pedidosProveedor) order.pedidosProveedor = pedidosProveedor;
  order.tags = [...new Set([...order.tags, ...allTags])];
  return final;
}

export async function syncSheet(ctx, order, extra = {}) {
  const groups = splitBySupplier(order, ctx.config.suppliers);
  const margins = computeMargins(order, groups, ctx.config.costs);
  const rows = orderToRows(order, { margins, suppliersConfig: ctx.config.suppliers, timezone: ctx.config.timezone, ...extra });
  try {
    return await ctx.sheets.upsertRows(ctx.config.sheets.ordersTab, SHEET_COLUMNS, rows, KEY_COLUMN);
  } catch (err) {
    // La planilla es un registro secundario: un fallo no debe frenar el envío al proveedor.
    ctx.logger.error('sheets.error', { order: order.name, error: err });
    return { error: err.message };
  }
}

// orders/create — el pedido existe pero NO es una venta confirmada todavía.
export async function handleOrderCreated(ctx, orderId) {
  return withOrderLock(toGid('Order', orderId), async () => {
    // Se lee dentro del candado: si orders/paid llegó antes, no se retrocede el estado.
    const order = await fetchOrder(ctx, orderId);
    if (!order.estado) await setOrderState(ctx, order, { status: isPaid(order) ? STATUS.PAGO_CONFIRMADO : STATUS.PEDIDO_RECIBIDO });
    await syncSheet(ctx, order);
    return { order: order.name, status: order.estado, paid: isPaid(order) };
  });
}

// orders/paid — ÚNICO punto que genera órdenes a proveedores.
export async function handleOrderPaid(ctx, orderId) {
  return withOrderLock(toGid('Order', orderId), async () => {
    // Siempre releer el pedido desde Shopify: no confiamos solo en el payload del webhook.
    const order = await fetchOrder(ctx, orderId);

    if (!isPaid(order)) {
      ctx.logger.warn('order.paid.ignored', { order: order.name, financial: order.displayFinancialStatus });
      return { order: order.name, skipped: 'pago no confirmado' };
    }
    if (order.cancelledAt) return { order: order.name, skipped: 'pedido cancelado' };
    if (order.tags.includes(TAG_SUPPLIER_NOTIFIED)) {
      await syncSheet(ctx, order);
      return { order: order.name, skipped: 'proveedor ya notificado' };
    }

    const warnings = addressWarnings(order);
    const groups = splitBySupplier(order, ctx.config.suppliers);
    const margins = computeMargins(order, groups, ctx.config.costs);
    const supplierOrders = [];
    const pedidosProveedor = { ...order.pedidosProveedor };

    for (const group of groups) {
      const portalUrl = group.supplier.handle === UNASSIGNED ? '' : supplierPortalLink(ctx.config, { orderGid: order.gid, orderName: order.name, supplierHandle: group.supplier.handle });
      const doc = buildSupplierOrder(order, group, { portalUrl, warnings });
      let sent = false;
      if (group.supplier.handle !== UNASSIGNED && doc.to) {
        const r = await ctx.email.send({ to: doc.to, subject: doc.subject, text: doc.text, html: doc.html, replyTo: ctx.config.email.adminRecipients[0] });
        sent = r.sent;
        if (doc.whatsapp) {
          await ctx.whatsapp.sendTemplate({ to: doc.whatsapp, template: ctx.config.whatsapp.templates.proveedorNuevoPedido, params: [order.name, doc.products.length, portalUrl] });
        }
      } else {
        warnings.push(group.supplier.handle === UNASSIGNED ? `Productos sin proveedor: ${group.lines.map((l) => l.productTitle).join(', ')}` : `Proveedor ${doc.supplierName} sin email`);
      }
      supplierOrders.push({ ...doc, sent });
      pedidosProveedor[group.supplier.handle] = {
        nombre: group.supplier.nombre,
        lineas: group.lines.map((l) => l.id),
        notificado: sent,
        notificadoEn: new Date().toISOString(),
        tracking: pedidosProveedor[group.supplier.handle]?.tracking ?? null,
      };
    }

    const allSent = supplierOrders.every((s) => s.sent);
    await setOrderState(ctx, order, {
      status: allSent ? STATUS.PREPARANDO : STATUS.PAGO_CONFIRMADO,
      pedidosProveedor,
      tags: [TAG_PAID, ...(allSent ? [TAG_SUPPLIER_NOTIFIED] : ['np-revisar'])],
    });

    await syncSheet(ctx, order, { extraNotes: warnings });

    await ctx.email.send({ to: ctx.config.email.adminRecipients, ...adminPaidMessage(ctx.config, order, { supplierOrders, margins, warnings }) });

    if (ctx.config.email.notifyCustomerOnPayment && order.customer.email) {
      await ctx.email.send({ to: order.customer.email, ...paymentConfirmedMessage(ctx.config, order) });
    }
    await ctx.whatsapp.sendTemplate({
      to: order.customer.phone,
      template: ctx.config.whatsapp.templates.pagoConfirmado,
      params: [order.customer.firstName || 'hola', order.name],
    });

    ctx.logger.info('order.paid.processed', { order: order.name, suppliers: supplierOrders.map((s) => ({ h: s.supplierHandle, sent: s.sent })), warnings });
    return { order: order.name, status: order.estado, supplierOrders, margins, warnings };
  });
}

// orders/cancelled
export async function handleOrderCancelled(ctx, orderId) {
  return withOrderLock(toGid('Order', orderId), async () => {
    const order = await fetchOrder(ctx, orderId);
    if (order.estado === STATUS.CANCELADO && order.tags.includes('np-cancelacion-procesada')) {
      return { order: order.name, skipped: 'ya procesado' };
    }
    const notifiedSuppliers = [];
    for (const [handle, info] of Object.entries(order.pedidosProveedor)) {
      if (!info?.notificado) continue;
      const supplier = (ctx.config.suppliers.suppliers ?? []).find((s) => s.handle === handle);
      const line = order.lineItems.find((l) => info.lineas?.includes(l.id));
      const email = line?.supplierRef?.email || supplier?.email;
      if (email) {
        await ctx.email.send({ to: email, ...supplierCancelledMessage(order, info.nombre) });
        notifiedSuppliers.push(info.nombre);
      }
    }
    await setOrderState(ctx, order, { status: STATUS.CANCELADO, tags: ['np-cancelacion-procesada'] });
    await syncSheet(ctx, order, { extraNotes: [`Cancelado: ${order.cancelReason || 'sin motivo'}`] });
    await ctx.email.send({ to: ctx.config.email.adminRecipients, ...adminCancelledMessage(ctx.config, order, { notifiedSuppliers }) });
    await ctx.whatsapp.sendTemplate({ to: order.customer.phone, template: ctx.config.whatsapp.templates.cancelado, params: [order.name] });
    // El email de cancelación al cliente lo envía Shopify (notificación nativa "Pedido cancelado").
    return { order: order.name, status: STATUS.CANCELADO, notifiedSuppliers };
  });
}

export { deriveStatus };
