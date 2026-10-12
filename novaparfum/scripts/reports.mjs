#!/usr/bin/env node
// Ganancia diaria / mensual / por proveedor / por producto.
//   npm run reports                     -> recalcula las pestañas de reportes en Google Sheets
//   npm run reports -- --excel salida   -> además exporta cada pestaña a CSV compatible con Excel (UTF-8 con BOM)
// Para un .xlsx completo: en Google Sheets, Archivo > Descargar > Microsoft Excel (.xlsx).
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createContext } from '../app/src/context.js';
import { buildReports, refreshReports } from '../app/src/services/reports.js';
import { toCsv } from '../app/src/domain/csv.js';

const ctx = createContext();
if (!ctx.sheets.configured) {
  console.error('ESTO REQUIERE QUE EL USUARIO CONECTE SU CUENTA: completá GOOGLE_SHEETS_* en app/.env');
  process.exit(1);
}
await refreshReports(ctx);
const values = await ctx.sheets.readAll(ctx.config.sheets.ordersTab);
const reports = buildReports(values, { timezone: ctx.config.timezone });
for (const [name, rows] of Object.entries(reports)) {
  console.log(`\n== ${name} ==`);
  console.table(rows.slice(1).map((r) => Object.fromEntries(rows[0].map((h, i) => [h, r[i]]))));
}
const i = process.argv.indexOf('--excel');
if (i > -1) {
  const dir = process.argv[i + 1] || 'export';
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'pedidos.csv'), toCsv(values));
  for (const [name, rows] of Object.entries(reports)) writeFileSync(join(dir, `${name.toLowerCase().replace(/\s+/g, '-')}.csv`), toCsv(rows));
  console.log(`\n✔ Exportado a ${dir}/ (abrir con Excel)`);
}
