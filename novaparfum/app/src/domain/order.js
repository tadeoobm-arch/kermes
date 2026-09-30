// Normaliza un pedido de la Admin GraphQL API a la forma interna de NovaParfum.

const amount = (set) => Number(set?.shopMoney?.amount ?? 0);
const metaFields = (ref) =>
  ref ? { handle: ref.handle, ...Object.fromEntries((ref.fields ?? []).map((f) => [f.key, f.value])) } : null;

export function normalizePhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  // Uruguay: +598 9X XXX XXX  <->  09X XXX XXX. Comparamos los últimos 8 dígitos.
  return digits.length >= 8 ? digits.slice(-8) : digits;
}

export function normalizeOrder(o) {
  const attributes = Object.fromEntries((o.customAttributes ?? []).map((a) => [a.key, a.value]));
  const addr = o.shippingAddress ?? {};
  const customerEmail = o.email || o.customer?.defaultEmailAddress?.emailAddress || '';
  const customerPhone = addr.phone || o.phone || o.customer?.defaultPhoneNumber?.phoneNumber || '';
  let pedidosProveedor = {};
  try {
    pedidosProveedor = o.pedidosProveedor?.value ? JSON.parse(o.pedidosProveedor.value) : {};
  } catch {
    pedidosProveedor = {};
  }

  const lineItems = (o.lineItems?.nodes ?? []).map((li) => ({
    id: li.id,
    name: li.name,
    productTitle: li.title,
    size: li.variantTitle || '',
    sku: li.sku || li.variant?.sku || '',
    brand: li.vendor || '',
    quantity: li.quantity,
    currentQuantity: li.currentQuantity ?? li.quantity,
    originalUnitPrice: amount(li.originalUnitPriceSet),
    unitPrice: amount(li.discountedUnitPriceAfterAllDiscountsSet) || amount(li.originalUnitPriceSet),
    unitCost: li.variant?.inventoryItem?.unitCost ? Number(li.variant.inventoryItem.unitCost.amount) : null,
    supplierSku: li.variant?.skuProveedor?.value || '',
    supplierRef: metaFields(li.variant?.proveedorVariante?.reference) || metaFields(li.product?.proveedor?.reference),
    internalCode: li.product?.codigoInterno?.value || '',
    productHandle: li.product?.handle || '',
    variantId: li.variant?.id || null,
  }));

  const fulfillments = (o.fulfillments ?? []).map((f) => ({
    id: f.id,
    status: f.status,
    displayStatus: f.displayStatus,
    createdAt: f.createdAt,
    deliveredAt: f.deliveredAt,
    inTransitAt: f.inTransitAt,
    estimatedDeliveryAt: f.estimatedDeliveryAt,
    tracking: (f.trackingInfo ?? [])[0] ?? null,
    lineItems: (f.fulfillmentLineItems?.nodes ?? []).map((n) => ({ lineItemId: n.lineItem?.id, quantity: n.quantity })),
  }));

  return {
    gid: o.id,
    id: o.legacyResourceId,
    name: o.name,
    createdAt: o.createdAt,
    processedAt: o.processedAt,
    cancelledAt: o.cancelledAt,
    cancelReason: o.cancelReason,
    displayFinancialStatus: o.displayFinancialStatus,
    displayFulfillmentStatus: o.displayFulfillmentStatus,
    paymentGateways: o.paymentGatewayNames ?? [],
    tags: o.tags ?? [],
    note: o.note || '',
    attributes,
    estado: o.estado?.value || null,
    pedidosProveedor,
    customer: {
      firstName: addr.firstName || o.customer?.firstName || '',
      lastName: addr.lastName || o.customer?.lastName || '',
      get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
      },
      email: customerEmail,
      phone: customerPhone,
    },
    address: {
      address1: addr.address1 || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      department: addr.province || '',
      zip: addr.zip || '',
      country: addr.country || '',
      countryCode: addr.countryCodeV2 || '',
    },
    deliveryNotes: [o.note, attributes['Observaciones de entrega']].filter(Boolean).join(' | '),
    shippingMethod: o.shippingLine?.title || '',
    totals: {
      total: amount(o.totalPriceSet),
      subtotal: amount(o.subtotalPriceSet),
      shipping: amount(o.totalShippingPriceSet),
      discounts: amount(o.totalDiscountsSet),
      currency: o.totalPriceSet?.shopMoney?.currencyCode || 'UYU',
    },
    lineItems,
    fulfillments,
  };
}

// Advertencias de calidad de datos para que el proveedor no reciba una dirección incompleta.
export function addressWarnings(order) {
  const w = [];
  if (!order.address.address1) w.push('Falta dirección');
  else if (!/\d/.test(order.address.address1)) w.push('La dirección no tiene número de puerta');
  if (!order.customer.phone) w.push('Falta teléfono de contacto');
  if (!order.address.city) w.push('Falta ciudad/localidad');
  return w;
}
