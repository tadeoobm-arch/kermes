import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSupplier, splitBySupplier, UNASSIGNED } from '../src/domain/suppliers.js';
import { computeMargins, mercadoPagoFee, aggregateProfit } from '../src/domain/margins.js';
import { buildSupplierOrder } from '../src/domain/supplierOrder.js';

const cfg = {
  default: null,
  suppliers: [
    { handle: 'prov-c', nombre: 'Proveedor C', email: 'c@test', vendors: ['Marca C'], sku_prefixes: ['PC-'] },
    { handle: 'prov-d', nombre: 'Proveedor D', email: 'd@test', vendors: ['Marca D'] },
  ],
};

const line = (o) => ({ id: `gid://shopify/LineItem/${o.id}`, productTitle: o.t, brand: o.brand, sku: o.sku, size: '100 ml', quantity: o.q ?? 1, currentQuantity: o.q ?? 1, unitPrice: o.price ?? 1000, unitCost: o.cost ?? 500, supplierRef: o.ref ?? null, supplierSku: '' });

test('prioridad de proveedor: variante/producto (metaobjeto) > prefijo SKU > marca > default', () => {
  assert.equal(resolveSupplier(line({ id: 1, brand: 'Marca C', sku: 'X', ref: { handle: 'prov-meta', nombre: 'Meta', email: 'm@test' } }), cfg).handle, 'prov-meta');
  assert.equal(resolveSupplier(line({ id: 2, brand: 'Marca D', sku: 'PC-1' }), cfg).handle, 'prov-c');
  assert.equal(resolveSupplier(line({ id: 3, brand: 'marca d', sku: 'ZZ' }), cfg).handle, 'prov-d');
  assert.equal(resolveSupplier(line({ id: 4, brand: 'Desconocida', sku: 'ZZ' }), cfg).handle, UNASSIGNED);
  assert.equal(resolveSupplier(line({ id: 5, brand: 'Desconocida', sku: 'ZZ' }), { ...cfg, default: 'prov-d' }).handle, 'prov-d');
});

test('división por proveedor: pedido #1050 con 3 perfumes de 2 proveedores', () => {
  const order = {
    name: '#1050',
    customer: { fullName: 'Ana Gómez', phone: '098765432' },
    address: { address1: 'Rivera 2020', address2: '', city: 'Montevideo', department: 'Montevideo', zip: '11200', country: 'Uruguay' },
    deliveryNotes: '',
    lineItems: [
      line({ id: 1, t: 'Perfume 1', brand: 'Marca C', sku: 'PC-1' }),
      line({ id: 2, t: 'Perfume 2', brand: 'Marca C', sku: 'PC-2' }),
      line({ id: 3, t: 'Perfume 3', brand: 'Marca D', sku: 'D-3' }),
    ],
  };
  const groups = splitBySupplier(order, cfg);
  assert.equal(groups.length, 2);
  const a = groups.find((g) => g.supplier.handle === 'prov-c');
  const b = groups.find((g) => g.supplier.handle === 'prov-d');
  assert.deepEqual(a.lines.map((l) => l.productTitle), ['Perfume 1', 'Perfume 2']);
  assert.deepEqual(b.lines.map((l) => l.productTitle), ['Perfume 3']);

  const docB = buildSupplierOrder(order, b);
  assert.match(docB.text, /Perfume 3/);
  assert.doesNotMatch(docB.text, /Perfume 1|Perfume 2/, 'cada proveedor recibe SOLO lo suyo');
  assert.doesNotMatch(docB.text, /Costo|Margen|\$|UYU/, 'el proveedor no ve precios ni márgenes');
});

test('líneas eliminadas por edición de pedido no se envían', () => {
  const order = { lineItems: [line({ id: 1, brand: 'Marca C', sku: 'PC-1' }), { ...line({ id: 2, brand: 'Marca C', sku: 'PC-2' }), currentQuantity: 0 }] };
  assert.equal(splitBySupplier(order, cfg)[0].lines.length, 1);
});

test('comisión Mercado Pago configurable (porcentaje + fijo + IVA sobre comisión)', () => {
  assert.equal(mercadoPagoFee(10000, { mpFeePercent: 5, mpFeeFixed: 0, mpFeeVatPercent: 22 }), 610);
  assert.equal(mercadoPagoFee(10000, { mpFeePercent: 0 }), 0);
});

test('margen por producto y por pedido', () => {
  const order = {
    totals: { total: 5000, shipping: 0 },
    lineItems: [line({ id: 1, brand: 'Marca C', sku: 'PC-1', price: 3000, cost: 1500 }), line({ id: 2, brand: 'Marca D', sku: 'D', price: 2000, cost: 800 })],
  };
  const groups = splitBySupplier(order, cfg);
  const m = computeMargins(order, groups, { mpFeePercent: 5, mpFeeVatPercent: 22, shippingCostPerSupplierShipment: 150 });
  // comisión total = 5000*5% = 250 + 22% IVA = 305; prorrateo 60% / 40%
  assert.equal(m.order.mpFee, 305);
  assert.equal(m.lines[0].mpFee, 183);
  assert.equal(m.lines[0].margin, 3000 - 1500 - 183);
  assert.equal(m.order.shippingCost, 300, '2 proveedores = 2 envíos');
  assert.equal(m.order.margin, 5000 - 2300 - 305 - 300);
  assert.equal(m.order.missingCost, false);
});

test('si falta el costo, el margen queda en blanco (no inventamos ganancia)', () => {
  const order = { totals: { total: 1000, shipping: 0 }, lineItems: [{ ...line({ id: 1, brand: 'Marca C', sku: 'PC-1' }), unitCost: null }] };
  const m = computeMargins(order, splitBySupplier(order, cfg), { mpFeePercent: 5 });
  assert.equal(m.order.margin, null);
  assert.equal(m.order.missingCost, true);
});

test('ganancia diaria y mensual (zona horaria Montevideo, excluye cancelados)', () => {
  const rows = [
    { date: '2026-10-01T02:00:00Z', orderName: '#1', revenue: 1000, margin: 300 }, // 30/09 en Montevideo
    { date: '2026-10-01T15:00:00Z', orderName: '#2', revenue: 2000, margin: 500 },
    { date: '2026-10-01T16:00:00Z', orderName: '#2', revenue: 500, margin: 100 },
    { date: '2026-10-02T15:00:00Z', orderName: '#3', revenue: 900, margin: 200, cancelled: true },
  ];
  const { daily, monthly } = aggregateProfit(rows);
  assert.deepEqual(daily['2026-09-30'], { ventas: 1000, ganancia: 300, pedidos: 1 });
  assert.deepEqual(daily['2026-10-01'], { ventas: 2500, ganancia: 600, pedidos: 1 });
  assert.equal(daily['2026-10-02'], undefined);
  assert.deepEqual(monthly['2026-10'], { ventas: 2500, ganancia: 600, pedidos: 1 });
});
