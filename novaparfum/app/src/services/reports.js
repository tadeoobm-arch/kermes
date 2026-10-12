// Reportes de ganancia (diaria, mensual, por proveedor y por producto) a partir de la planilla.
// Se calculan en la app y se escriben como valores: no dependen de fórmulas ni del idioma de Sheets.
import { SHEET_COLUMNS } from '../domain/sheetRows.js';
import { aggregateProfit } from '../domain/margins.js';

const idx = (name) => SHEET_COLUMNS.indexOf(name);
const n = (v) => (v === '' || v === undefined || v === null || Number.isNaN(Number(v)) ? 0 : Number(v));
const round = (x) => Math.round(x * 100) / 100;

export function sheetValuesToRecords(values) {
  const [header, ...rows] = values;
  const pos = (name) => (header ?? SHEET_COLUMNS).indexOf(name);
  return rows
    .filter((r) => r[pos('ID pedido')])
    .map((r) => ({
      orderName: r[pos('ID pedido')],
      localDate: r[pos('Fecha')],
      product: `${r[pos('Marca')]} ${r[pos('Producto')]} ${r[pos('Tamaño')]}`.trim(),
      supplier: r[pos('Proveedor')],
      revenue: n(r[pos('Venta línea')]),
      margin: r[pos('Margen')] === '' ? null : n(r[pos('Margen')]),
      qty: n(r[pos('Cantidad')]),
      paid: r[pos('Estado del pago')] === 'Pagado',
      cancelled: r[pos('Estado del pedido')] === 'Cancelado',
    }));
}

export function buildReports(values, { timezone } = {}) {
  const records = sheetValuesToRecords(values).filter((r) => r.paid);
  const { daily, monthly } = aggregateProfit(records, { timezone });
  const group = (key) => {
    const m = {};
    for (const r of records) {
      if (r.cancelled) continue;
      m[r[key]] ||= { unidades: 0, ventas: 0, ganancia: 0 };
      m[r[key]].unidades += r.qty;
      m[r[key]].ventas += r.revenue;
      m[r[key]].ganancia += r.margin ?? 0;
    }
    return Object.entries(m)
      .map(([k, v]) => [k, v.unidades, round(v.ventas), round(v.ganancia), v.ventas ? round((v.ganancia / v.ventas) * 100) : 0])
      .sort((a, b) => b[3] - a[3]);
  };
  return {
    'Resumen diario': [['Fecha', 'Pedidos', 'Ventas', 'Ganancia estimada'], ...Object.entries(daily).map(([k, v]) => [k, v.pedidos, v.ventas, v.ganancia])],
    'Resumen mensual': [['Mes', 'Pedidos', 'Ventas', 'Ganancia estimada'], ...Object.entries(monthly).map(([k, v]) => [k, v.pedidos, v.ventas, v.ganancia])],
    'Por proveedor': [['Proveedor', 'Unidades', 'Ventas', 'Ganancia', 'Margen %'], ...group('supplier')],
    'Por producto': [['Producto', 'Unidades', 'Ventas', 'Ganancia', 'Margen %'], ...group('product')],
  };
}

export async function refreshReports(ctx) {
  if (!ctx.sheets.configured) return { skipped: true };
  const values = await ctx.sheets.readAll(ctx.config.sheets.ordersTab);
  const reports = buildReports(values, { timezone: ctx.config.timezone });
  const meta = await ctx.sheets.getSpreadsheet();
  const existing = new Set(meta.sheets.map((s) => s.properties.title));
  const missing = Object.keys(reports).filter((t) => !existing.has(t));
  if (missing.length) await ctx.sheets.batchUpdate(missing.map((title) => ({ addSheet: { properties: { title } } })));
  for (const [tab, rows] of Object.entries(reports)) {
    await ctx.sheets.clear(`${tab}!A:Z`);
    await ctx.sheets.setValues(`${tab}!A1`, rows, 'RAW');
  }
  return { tabs: Object.keys(reports) };
}
