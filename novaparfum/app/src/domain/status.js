// Estados operativos de NovaParfum. Se guardan en el metafield de pedido novaparfum.estado
// y como etiqueta "estado:<codigo>" para poder filtrar pedidos en el admin.

export const STATUS = Object.freeze({
  PEDIDO_RECIBIDO: 'PEDIDO_RECIBIDO',
  PAGO_CONFIRMADO: 'PAGO_CONFIRMADO',
  PREPARANDO: 'PREPARANDO',
  ENVIADO: 'ENVIADO',
  EN_TRANSITO: 'EN_TRANSITO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
});

export const STATUS_LABEL = Object.freeze({
  PEDIDO_RECIBIDO: 'Pedido recibido',
  PAGO_CONFIRMADO: 'Pago confirmado',
  PREPARANDO: 'Preparando pedido',
  ENVIADO: 'Enviado',
  EN_TRANSITO: 'En tránsito',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
});

const ORDERED = [
  STATUS.PEDIDO_RECIBIDO,
  STATUS.PAGO_CONFIRMADO,
  STATUS.PREPARANDO,
  STATUS.ENVIADO,
  STATUS.EN_TRANSITO,
  STATUS.ENTREGADO,
];

// Un estado nunca retrocede (salvo CANCELADO, que es terminal).
export function nextStatus(current, candidate) {
  if (!current) return candidate;
  if (current === STATUS.CANCELADO) return STATUS.CANCELADO;
  if (candidate === STATUS.CANCELADO) return STATUS.CANCELADO;
  return ORDERED.indexOf(candidate) > ORDERED.indexOf(current) ? candidate : current;
}

// Estados de pago de Shopify que cuentan como venta confirmada.
// PENDING / AUTHORIZED / VOIDED / EXPIRED **no** confirman la venta.
export const PAID_FINANCIAL_STATUSES = new Set(['PAID']);

export function isPaid(order) {
  const fs = String(order.displayFinancialStatus ?? order.financial_status ?? '').toUpperCase();
  return PAID_FINANCIAL_STATUSES.has(fs);
}

// Deriva el estado del cliente a partir de los datos reales de Shopify.
export function deriveStatus(order) {
  if (order.cancelledAt || order.cancelled_at) return STATUS.CANCELADO;
  const fulfillments = order.fulfillments ?? [];
  const active = fulfillments.filter((f) => !['CANCELLED', 'ERROR', 'FAILURE'].includes(String(f.status).toUpperCase()));
  const totalQty = (order.lineItems ?? []).reduce((a, l) => a + (l.currentQuantity ?? l.quantity ?? 0), 0);
  const shippedQty = active.reduce((a, f) => a + (f.lineItems ?? []).reduce((b, li) => b + (li.quantity ?? 0), 0), 0);
  if (active.length) {
    const allShipped = shippedQty >= totalQty;
    const display = active.map((f) => String(f.displayStatus || '').toUpperCase());
    if (allShipped && active.every((f) => f.deliveredAt || String(f.displayStatus).toUpperCase() === 'DELIVERED')) return STATUS.ENTREGADO;
    if (display.some((d) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'ATTEMPTED_DELIVERY'].includes(d)) || active.some((f) => f.inTransitAt)) {
      return STATUS.EN_TRANSITO;
    }
    return STATUS.ENVIADO;
  }
  if (isPaid(order)) {
    const stored = order.estado;
    return stored === STATUS.PREPARANDO ? STATUS.PREPARANDO : STATUS.PAGO_CONFIRMADO;
  }
  return STATUS.PEDIDO_RECIBIDO;
}

// Mapea shipment_status de los webhooks de fulfillment (REST) a nuestros estados.
export function statusFromShipmentStatus(shipmentStatus) {
  switch (String(shipmentStatus || '').toLowerCase()) {
    case 'delivered':
      return STATUS.ENTREGADO;
    case 'in_transit':
    case 'out_for_delivery':
    case 'attempted_delivery':
    case 'ready_for_pickup':
    case 'picked_up':
      return STATUS.EN_TRANSITO;
    default:
      return STATUS.ENVIADO;
  }
}
