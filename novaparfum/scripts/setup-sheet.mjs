#!/usr/bin/env node
// Prepara la planilla de Google Sheets: pestaña "Pedidos" con encabezados, fila fija,
// y pestañas de reportes. Idempotente.
// Requisito: compartir la planilla con el email de la cuenta de servicio (permiso Editor).
import { createContext } from '../app/src/context.js';
import { SHEET_COLUMNS } from '../app/src/domain/sheetRows.js';
import { refreshReports } from '../app/src/services/reports.js';

const ctx = createContext();
if (!ctx.sheets.configured) {
  console.error('ESTO REQUIERE QUE EL USUARIO CONECTE SU CUENTA: completá GOOGLE_SHEETS_* en app/.env');
  process.exit(1);
}
const tab = ctx.config.sheets.ordersTab;
const meta = await ctx.sheets.getSpreadsheet();
let sheet = meta.sheets.find((s) => s.properties.title === tab);
if (!sheet) {
  await ctx.sheets.batchUpdate([{ addSheet: { properties: { title: tab } } }]);
  sheet = (await ctx.sheets.getSpreadsheet()).sheets.find((s) => s.properties.title === tab);
}
await ctx.sheets.setValues(`${tab}!A1`, [SHEET_COLUMNS], 'RAW');
await ctx.sheets.batchUpdate([
  { updateSheetProperties: { properties: { sheetId: sheet.properties.sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
  {
    repeatCell: {
      range: { sheetId: sheet.properties.sheetId, startRowIndex: 0, endRowIndex: 1 },
      cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }, backgroundColor: { red: 0.294, green: 0.247, blue: 0.659 } } },
      fields: 'userEnteredFormat(textFormat,backgroundColor)',
    },
  },
  { setBasicFilter: { filter: { range: { sheetId: sheet.properties.sheetId } } } },
]);
console.log(`✔ Pestaña "${tab}" lista con ${SHEET_COLUMNS.length} columnas`);
const r = await refreshReports(ctx);
console.log(`✔ Reportes: ${r.tabs.join(', ')}`);
