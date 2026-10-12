// Mapeo pedido -> filas de la planilla operativa (una fila por producto del pedido).
import { STATUS_LABEL, deriveStatus } from './status.js';
import { resolveSupplier } from './suppliers.js';

export const SHEET_COLUMNS = [
  'ID pedido', 'Fecha', 'Hora', 'Cliente', 'Teléfono', 'Email', 'Departamento', 'Ciudad', 'Dirección',
  'Apartamento', 'Código postal', 'Producto', 'Marca', 'Tamaño', 'Cantidad', 'SKU', 'Precio',
  'Costo proveedor', 'Margen', 'Total', 'Método de pago', 'Estado del pago', 'Estado del pedido',
  'Estado del envío', 'Empresa de envío', 'Número de seguimiento', 'Fecha de envío', 'Fecha de entrega',
  'Observaciones', 'Proveedor', 'SKU proveedor', 'Comisión MP', 'Venta línea', 'Clave',
];

export const KEY_COLUMN = 'Clave';

const FINANCIAL_LABEL = {
  PAID: 'Pagado',
  PENDING: 'Pendiente',
  AUTHORIZED: 'Autorizado (sin capturar)',
  PARTIALLY_PAID: 'Pago parcial',
  PARTIALLY_REFUNDED: 'Reembolso parcial',
  REFUNDED: 'Reembolsado',
  VOIDED: 'Anulado',
  EXPIRED: 'Vencido',
};

function localDateTime(iso, timezone) {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const time = new Intl.DateTimeFormat('es-UY', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  return { date, time };
}

function fulfillmentForLine(order, lineId) {
  return order.fulfillments.find(
    (f) => !['CANCELLED', 'ERROR', 'FAILURE'].includes(String(f.status).toUpperCase()) && f.lineItems.some((li) => li.lineItemId === lineId),
  );
}

export function orderToRows(order, { margins, suppliersConfig, timezone = 'America/Montevideo', extraNotes = [] } = {}) {
  const { date, time } = localDateTime(order.createdAt, timezone);
  const orderStatus = deriveStatus({ ...order, lineItems: order.lineItems });
  const payment = order.paymentGateways.join(', ');
  const notes = [order.deliveryNotes, ...extraNotes].filter(Boolean).join(' | ');

  return order.lineItems.map((line) => {
    const f = fulfillmentForLine(order, line.id);
    const m = margins?.lines.find((x) => x.lineItemId === line.id);
    const supplier = resolveSupplier(line, suppliersConfig);
    let shipStatus = 'Pendiente';
    if (order.cancelledAt) shipStatus = 'Cancelado';
    else if (f?.deliveredAt || String(f?.displayStatus).toUpperCase() === 'DELIVERED') shipStatus = STATUS_LABEL.ENTREGADO;
    else if (f?.inTransitAt || String(f?.displayStatus).toUpperCase() === 'IN_TRANSIT') shipStatus = STATUS_LABEL.EN_TRANSITO;
    else if (f) shipStatus = STATUS_LABEL.ENVIADO;
    const qty = line.currentQuantity ?? line.quantity;

    const row = {
      'ID pedido': order.name,
      Fecha: date,
      Hora: time,
      Cliente: order.customer.fullName,
      'Teléfono': order.customer.phone,
      Email: order.customer.email,
      Departamento: order.address.department,
      Ciudad: order.address.city,
      'Dirección': order.address.address1,
      Apartamento: order.address.address2,
      'Código postal': order.address.zip,
      Producto: line.productTitle,
      Marca: line.brand,
      'Tamaño': line.size,
      Cantidad: qty,
      SKU: line.sku,
      Precio: line.unitPrice,
      'Costo proveedor': m?.supplierCost ?? '',
      Margen: m?.margin ?? '',
      Total: order.totals.total,
      'Método de pago': payment,
      'Estado del pago': FINANCIAL_LABEL[String(order.displayFinancialStatus).toUpperCase()] || order.displayFinancialStatus || '',
      'Estado del pedido': STATUS_LABEL[orderStatus],
      'Estado del envío': shipStatus,
      'Empresa de envío': f?.tracking?.company || '',
      'Número de seguimiento': f?.tracking?.number || '',
      'Fecha de envío': f ? localDateTime(f.createdAt, timezone).date : '',
      'Fecha de entrega': f?.deliveredAt ? localDateTime(f.deliveredAt, timezone).date : '',
      Observaciones: notes,
      Proveedor: supplier.nombre,
      'SKU proveedor': line.supplierSku,
      'Comisión MP': m?.mpFee ?? '',
      'Venta línea': m?.revenue ?? line.unitPrice * qty,
      Clave: `${order.name}|${line.id.split('/').pop()}`,
    };
    return SHEET_COLUMNS.map((c) => row[c] ?? '');
  });
}
