// "Seguí tu pedido": consulta pública por número de pedido + email o teléfono.
// Devuelve solo datos mínimos (sin dirección ni montos) y un error genérico si no coincide,
// para no permitir adivinar pedidos ajenos.
import { ORDER_LOOKUP_QUERY } from '../shopify/queries.js';
import { normalizePhone } from '../domain/order.js';
import { STATUS, STATUS_LABEL, deriveStatus } from '../domain/status.js';
import { fetchOrder } from './orders.js';

export const NOT_FOUND = 'No encontramos un pedido con esos datos. Revisá el número de pedido y el email o teléfono usados en la compra.';

const TIMELINE = [STATUS.PEDIDO_RECIBIDO, STATUS.PAGO_CONFIRMADO, STATUS.PREPARANDO, STATUS.ENVIADO, STATUS.EN_TRANSITO, STATUS.ENTREGADO];

export function contactMatches(candidate, contact) {
  const c = String(contact || '').trim().toLowerCase();
  if (!c) return false;
  if (c.includes('@')) return [candidate.email, candidate.customer?.defaultEmailAddress?.emailAddress].some((e) => e && e.toLowerCase() === c);
  const p = normalizePhone(c);
  if (p.length < 8) return false;
  return [candidate.phone, candidate.shippingAddress?.phone, candidate.customer?.defaultPhoneNumber?.phoneNumber].some((x) => x && normalizePhone(x) === p);
}

export function publicOrderView(order) {
  const status = deriveStatus(order);
  const reached = status === STATUS.CANCELADO ? -1 : TIMELINE.indexOf(status);
  const shipments = order.fulfillments
    .filter((f) => !['CANCELLED', 'ERROR', 'FAILURE'].includes(String(f.status).toUpperCase()))
    .map((f) => ({
      empresa: f.tracking?.company || '',
      numero: f.tracking?.number || '',
      url: f.tracking?.url || '',
      fechaEnvio: f.createdAt,
      fechaEstimada: f.estimatedDeliveryAt || null,
      entregado: Boolean(f.deliveredAt),
    }));
  return {
    pedido: order.name,
    estado: status,
    estadoTexto: STATUS_LABEL[status],
    productos: order.lineItems.map((l) => ({ nombre: `${l.brand} ${l.productTitle}`.trim(), tamano: l.size, cantidad: l.currentQuantity ?? l.quantity })),
    pasos: TIMELINE.map((s, i) => ({ codigo: s, texto: STATUS_LABEL[s], completo: reached >= i })),
    envios: shipments,
    fechaEstimada: shipments.find((s) => s.fechaEstimada)?.fechaEstimada || null,
    cancelado: status === STATUS.CANCELADO,
  };
}

export async function lookupOrder(ctx, { orderNumber, contact }) {
  const num = String(orderNumber || '').replace(/[^0-9A-Za-z-]/g, '');
  if (!num || !contact) return { ok: false, error: NOT_FOUND };
  const data = await ctx.shopify.graphql(ORDER_LOOKUP_QUERY, { q: `name:#${num}` });
  const candidate = data?.orders?.nodes?.[0];
  if (!candidate || candidate.name.replace('#', '') !== num || !contactMatches(candidate, contact)) {
    return { ok: false, error: NOT_FOUND };
  }
  const order = await fetchOrder(ctx, candidate.id);
  return { ok: true, order: publicOrderView(order) };
}
