// Cálculo de ganancia estimada.
//
//   ganancia = precio de venta cobrado
//            - costo del proveedor ("Costo por artículo" de la variante en Shopify)
//            - comisión de Mercado Pago (+ IVA sobre la comisión, si corresponde)
//            - costo de envío que paga NovaParfum (si corresponde)
//            - IVA de la venta (solo si configurás SALES_VAT_PERCENT porque tus precios lo incluyen)
//
// Todos los porcentajes vienen de variables de entorno: dependen de tu cuenta de Mercado Pago
// y de tu situación fiscal. No asumimos tarifas.

const round = (n) => Math.round(n * 100) / 100;

export function mercadoPagoFee(total, costs) {
  const base = (total * (costs.mpFeePercent || 0)) / 100 + (costs.mpFeeFixed || 0);
  const vat = (base * (costs.mpFeeVatPercent || 0)) / 100;
  return round(base + vat);
}

export function shippingCostFor(groups, costs) {
  return round(
    groups.reduce((acc, g) => {
      const specific = g.supplier?.costo_envio !== undefined && g.supplier?.costo_envio !== '' ? Number(g.supplier.costo_envio) : null;
      return acc + (specific ?? costs.shippingCostPerSupplierShipment ?? 0);
    }, 0),
  );
}

function netOfSalesVat(amount, costs) {
  const vat = costs.salesVatPercent || 0;
  return vat ? amount / (1 + vat / 100) : amount;
}

// groups = resultado de splitBySupplier (para prorratear el costo de envío por proveedor)
export function computeMargins(order, groups, costs) {
  const productRevenue = order.lineItems.reduce((a, l) => a + l.unitPrice * (l.currentQuantity ?? l.quantity), 0);
  const mpFee = mercadoPagoFee(order.totals.total, costs);
  const shippingCost = shippingCostFor(groups, costs);
  const shippingCharged = order.totals.shipping || 0;
  let missingCost = false;

  const lines = order.lineItems.map((l) => {
    const qty = l.currentQuantity ?? l.quantity;
    const revenue = l.unitPrice * qty;
    const share = productRevenue ? revenue / productRevenue : 0;
    const cost = l.unitCost === null || l.unitCost === undefined ? null : l.unitCost * qty;
    if (cost === null) missingCost = true;
    const feeShare = mpFee * share;
    const net = netOfSalesVat(revenue, costs);
    const margin = cost === null ? null : round(net - cost - feeShare);
    return {
      lineItemId: l.id,
      revenue: round(revenue),
      supplierCost: cost === null ? null : round(cost),
      mpFee: round(feeShare),
      margin,
      marginPercent: margin === null || !revenue ? null : round((margin / revenue) * 100),
    };
  });

  const totalCost = lines.reduce((a, l) => a + (l.supplierCost ?? 0), 0);
  const orderRevenueNet = netOfSalesVat(productRevenue + shippingCharged, costs);
  const orderMargin = missingCost ? null : round(orderRevenueNet - totalCost - mpFee - shippingCost);

  return {
    lines,
    order: {
      revenue: round(productRevenue + shippingCharged),
      supplierCost: round(totalCost),
      mpFee,
      shippingCost,
      margin: orderMargin,
      marginPercent: orderMargin === null || !order.totals.total ? null : round((orderMargin / order.totals.total) * 100),
      missingCost,
    },
  };
}

// Agregados diarios / mensuales a partir de filas de la planilla (o de pedidos ya calculados).
export function aggregateProfit(rows, { timezone = 'America/Montevideo' } = {}) {
  const fmtDay = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const daily = {};
  const monthly = {};
  for (const r of rows) {
    if (r.cancelled) continue;
    const day = fmtDay.format(new Date(r.date));
    const month = day.slice(0, 7);
    for (const [bucket, key] of [[daily, day], [monthly, month]]) {
      bucket[key] ||= { ventas: 0, ganancia: 0, pedidos: new Set() };
      bucket[key].ventas += r.revenue;
      bucket[key].ganancia += r.margin ?? 0;
      bucket[key].pedidos.add(r.orderName);
    }
  }
  const finalize = (b) =>
    Object.fromEntries(Object.entries(b).sort().map(([k, v]) => [k, { ventas: round(v.ventas), ganancia: round(v.ganancia), pedidos: v.pedidos.size }]));
  return { daily: finalize(daily), monthly: finalize(monthly) };
}
