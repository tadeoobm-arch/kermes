// Simulador en memoria de la Admin GraphQL API: reproduce solo las operaciones que usa NovaParfum.
// Permite probar el flujo completo (catálogo -> compra -> pago -> proveedor -> envío -> entrega) sin credenciales.

let seq = 1000;
const gid = (type) => `gid://shopify/${type}/${++seq}`;

export function createFakeShopify({ now = () => new Date('2026-10-01T14:30:00Z') } = {}) {
  const state = { products: new Map(), orders: new Map(), metaobjects: new Map(), calls: [], orderNumber: 1044 };

  function addSupplier(handle, fields) {
    const id = gid('Metaobject');
    state.metaobjects.set(id, { id, handle, fields: Object.entries(fields).map(([key, value]) => ({ key, value: String(value) })) });
    return id;
  }

  function variantBySku(sku) {
    for (const p of state.products.values()) {
      const v = p.variants.find((x) => x.sku === sku);
      if (v) return { product: p, variant: v };
    }
    throw new Error(`SKU inexistente ${sku}`);
  }

  // Simula el checkout de Shopify: crea el pedido con los datos del cliente.
  function checkout({ items, customer, address, note = '', attributes = {}, financialStatus = 'PENDING', gateway = 'Mercado Pago', shipping = 0 }) {
    const lineNodes = items.map(({ sku, quantity }) => {
      const { product, variant } = variantBySku(sku);
      if (variant.stock < quantity) throw new Error(`Sin stock para ${sku}`);
      variant.stock -= quantity; // Shopify descuenta inventario al crear el pedido
      const supplierRef = (id) => (id ? { reference: state.metaobjects.get(id) } : null);
      return {
        id: gid('LineItem'),
        name: `${product.title} - ${variant.size}`,
        title: product.title,
        variantTitle: variant.size,
        sku: variant.sku,
        vendor: product.vendor,
        quantity,
        currentQuantity: quantity,
        originalUnitPriceSet: { shopMoney: { amount: String(variant.price) } },
        discountedUnitPriceAfterAllDiscountsSet: { shopMoney: { amount: String(variant.discountedPrice ?? variant.price) } },
        variant: {
          id: variant.id,
          sku: variant.sku,
          inventoryItem: { unitCost: variant.cost !== undefined ? { amount: String(variant.cost) } : null },
          skuProveedor: variant.supplierSku ? { value: variant.supplierSku } : null,
          proveedorVariante: supplierRef(variant.supplierId),
        },
        product: { id: product.id, handle: product.handle, proveedor: supplierRef(product.supplierId), codigoInterno: product.internalCode ? { value: product.internalCode } : null },
      };
    });
    const subtotal = lineNodes.reduce((a, l) => a + Number(l.discountedUnitPriceAfterAllDiscountsSet.shopMoney.amount) * l.quantity, 0);
    const id = gid('Order');
    const order = {
      id,
      legacyResourceId: id.split('/').pop(),
      name: `#${++state.orderNumber}`,
      createdAt: now().toISOString(),
      processedAt: now().toISOString(),
      cancelledAt: null,
      cancelReason: null,
      email: customer.email,
      phone: null,
      note,
      tags: [],
      displayFinancialStatus: financialStatus,
      displayFulfillmentStatus: 'UNFULFILLED',
      paymentGatewayNames: [gateway],
      customAttributes: Object.entries(attributes).map(([key, value]) => ({ key, value })),
      totalPriceSet: { shopMoney: { amount: String(subtotal + shipping), currencyCode: 'UYU' } },
      subtotalPriceSet: { shopMoney: { amount: String(subtotal) } },
      totalShippingPriceSet: { shopMoney: { amount: String(shipping) } },
      totalDiscountsSet: { shopMoney: { amount: '0' } },
      customer: { firstName: customer.firstName, lastName: customer.lastName, defaultEmailAddress: { emailAddress: customer.email }, defaultPhoneNumber: { phoneNumber: customer.phone } },
      shippingAddress: { firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, ...address, country: 'Uruguay', countryCodeV2: 'UY' },
      shippingLine: { title: 'Envío a domicilio' },
      estado: null,
      pedidosProveedor: null,
      lineItems: { nodes: lineNodes },
      fulfillments: [],
      _fulfillmentOrders: [
        { id: gid('FulfillmentOrder'), status: 'OPEN', lineItems: { nodes: lineNodes.map((l) => ({ id: gid('FulfillmentOrderLineItem'), remainingQuantity: l.quantity, lineItem: { id: l.id } })) } },
      ],
    };
    state.orders.set(id, order);
    return order;
  }

  function markPaid(orderGid) {
    state.orders.get(orderGid).displayFinancialStatus = 'PAID';
  }

  function cancel(orderGid, reason = 'CUSTOMER') {
    const o = state.orders.get(orderGid);
    o.cancelledAt = now().toISOString();
    o.cancelReason = reason;
  }

  const view = (o) => {
    if (!o) return null;
    const { _fulfillmentOrders, ...rest } = o;
    return structuredClone(rest);
  };

  async function graphql(query, variables = {}) {
    const op = query.match(/(?:query|mutation)\s+(\w+)/)?.[1];
    state.calls.push({ op, variables: structuredClone(variables) });
    switch (op) {
      case 'NovaOrder':
        return { order: view(state.orders.get(variables.id)) };
      case 'NovaOrderLookup': {
        const name = variables.q.replace('name:', '');
        const o = [...state.orders.values()].find((x) => x.name === name);
        return { orders: { nodes: o ? [{ id: o.id, name: o.name, email: o.email, phone: o.phone, shippingAddress: { phone: o.shippingAddress.phone }, customer: o.customer }] : [] } };
      }
      case 'NovaFulfillmentOrders': {
        const o = state.orders.get(variables.id);
        return { order: { fulfillmentOrders: { nodes: structuredClone(o._fulfillmentOrders) } } };
      }
      case 'NovaFulfillmentCreate': {
        const f = variables.fulfillment;
        let order;
        const fliNodes = [];
        for (const group of f.lineItemsByFulfillmentOrder) {
          for (const o of state.orders.values()) {
            const fo = o._fulfillmentOrders.find((x) => x.id === group.fulfillmentOrderId);
            if (!fo) continue;
            order = o;
            for (const item of group.fulfillmentOrderLineItems) {
              const node = fo.lineItems.nodes.find((n) => n.id === item.id);
              if (!node || node.remainingQuantity < item.quantity) return { fulfillmentCreate: { fulfillment: null, userErrors: [{ field: ['fulfillment'], message: 'Cantidad inválida' }] } };
              node.remainingQuantity -= item.quantity;
              fliNodes.push({ lineItem: { id: node.lineItem.id }, quantity: item.quantity });
            }
            if (fo.lineItems.nodes.every((n) => n.remainingQuantity === 0)) fo.status = 'CLOSED';
          }
        }
        const fulfillment = {
          id: gid('Fulfillment'),
          status: 'SUCCESS',
          displayStatus: 'FULFILLED',
          createdAt: now().toISOString(),
          deliveredAt: null,
          estimatedDeliveryAt: null,
          inTransitAt: null,
          trackingInfo: [f.trackingInfo],
          fulfillmentLineItems: { nodes: fliNodes },
          _notifyCustomer: f.notifyCustomer,
        };
        order.fulfillments.push(fulfillment);
        return { fulfillmentCreate: { fulfillment: { id: fulfillment.id, status: 'SUCCESS', trackingInfo: [f.trackingInfo] }, userErrors: [] } };
      }
      case 'NovaFulfillmentEvent': {
        const { fulfillmentId, status } = variables.fulfillmentEvent;
        for (const o of state.orders.values()) {
          const f = o.fulfillments.find((x) => x.id === fulfillmentId);
          if (!f) continue;
          f.displayStatus = status;
          if (status === 'DELIVERED') f.deliveredAt = now().toISOString();
          if (status === 'IN_TRANSIT') f.inTransitAt = now().toISOString();
          return { fulfillmentEventCreate: { fulfillmentEvent: { id: gid('FulfillmentEvent'), status }, userErrors: [] } };
        }
        return { fulfillmentEventCreate: { fulfillmentEvent: null, userErrors: [{ message: 'no existe' }] } };
      }
      case 'NovaTagsAdd': {
        const o = state.orders.get(variables.id);
        o.tags = [...new Set([...o.tags, ...variables.tags])];
        return { tagsAdd: { node: { id: o.id }, userErrors: [] } };
      }
      case 'NovaMetafieldsSet': {
        for (const m of variables.metafields) {
          const o = state.orders.get(m.ownerId);
          if (m.key === 'estado') o.estado = { value: m.value };
          if (m.key === 'pedidos_proveedor') o.pedidosProveedor = { value: m.value };
        }
        return { metafieldsSet: { metafields: variables.metafields, userErrors: [] } };
      }
      case 'NovaPendingSupplier': {
        const nodes = [...state.orders.values()]
          .filter((o) => o.displayFinancialStatus === 'PAID' && !o.cancelledAt && !o.tags.includes('np-proveedor-notificado'))
          .map((o) => ({ id: o.id, name: o.name }));
        return { orders: { nodes } };
      }
      case 'NovaProductSet': {
        const { input } = variables;
        const existing = [...state.products.values()].find((p) => p.handle === input.handle);
        const product = existing || { id: gid('Product') };
        const mfv = (list, key) => list.find((m) => m.key === key)?.value;
        Object.assign(product, {
          title: input.title,
          handle: input.handle,
          vendor: input.vendor,
          status: input.status,
          metafields: input.metafields,
          supplierId: mfv(input.metafields, 'proveedor'),
          internalCode: mfv(input.metafields, 'codigo_interno'),
          variants: input.variants.map((v, i) => ({
            id: existing?.variants[i]?.id || gid('ProductVariant'),
            size: v.optionValues[0].name,
            sku: v.sku,
            price: Number(v.price),
            compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
            cost: v.inventoryItem.cost !== undefined ? Number(v.inventoryItem.cost) : undefined,
            stock: v.inventoryQuantities?.[0]?.quantity ?? 0,
            supplierSku: mfv(v.metafields ?? [], 'sku_proveedor'),
          })),
        });
        state.products.set(product.id, product);
        return { productSet: { product: { id: product.id, handle: product.handle, variants: { nodes: product.variants.map((v) => ({ id: v.id, sku: v.sku })) } }, userErrors: [] } };
      }
      default:
        throw new Error(`FakeShopify: operación no soportada ${op}`);
    }
  }

  return { graphql, state, addSupplier, checkout, markPaid, cancel, variantBySku };
}

// Colaboradores falsos que registran lo enviado.
export function createRecorders() {
  const emails = [];
  const whatsapps = [];
  const sheetRows = new Map();
  return {
    emails,
    whatsapps,
    sheetRows,
    email: { configured: true, async send(msg) { emails.push(msg); return { sent: true }; } },
    whatsapp: { configured: true, async sendTemplate(msg) { if (!msg.template) return { sent: false }; whatsapps.push(msg); return { sent: true }; } },
    sheets: {
      configured: true,
      async upsertRows(tab, header, rows, keyColumn) {
        const k = header.indexOf(keyColumn);
        let appended = 0;
        let updated = 0;
        for (const r of rows) {
          if (sheetRows.has(r[k])) updated++;
          else appended++;
          const prev = sheetRows.get(r[k]) || [];
          sheetRows.set(r[k], r.map((v, i) => (v === '' ? prev[i] ?? '' : v)));
        }
        return { appended, updated };
      },
    },
  };
}
