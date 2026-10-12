// CSV mínimo (RFC 4180): comillas, comas y saltos de línea dentro de campos.

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x !== '')) rows.push(row);
  const [header, ...data] = rows;
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

export function toCsv(rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    // Prefijo ' para que Excel no interprete datos de clientes como fórmulas.
    const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return `﻿${rows.map((r) => r.map(esc).join(',')).join('\r\n')}\r\n`;
}

// Planilla de catálogo (una fila por variante/tamaño) -> productos para toProductSetInput.
export function catalogRowsToProducts(rows) {
  const split = (v) => (v ? v.split('|').map((x) => x.trim()).filter(Boolean) : []);
  const numOrUndef = (v) => (v === '' || v === undefined ? undefined : Number(v));
  const byKey = new Map();
  for (const r of rows) {
    const key = r.handle || `${r.marca}|${r.nombre}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        handle: r.handle || undefined,
        title: r.nombre,
        brand: r.marca,
        gender: r.genero || undefined,
        families: split(r.familias),
        topNotes: split(r.notas_salida),
        heartNotes: split(r.notas_corazon),
        baseNotes: split(r.notas_fondo),
        concentration: r.concentracion || undefined,
        internalCode: r.codigo_interno || undefined,
        supplierHandle: r.proveedor || undefined,
        descriptionHtml: r.descripcion ? `<p>${r.descripcion}</p>` : '',
        images: split(r.imagenes),
        status: (r.estado || 'DRAFT').toUpperCase(),
        variants: [],
      });
    }
    byKey.get(key).variants.push({
      size: r.tamano,
      price: Number(r.precio),
      compareAtPrice: numOrUndef(r.precio_anterior),
      sku: r.sku,
      supplierSku: r.sku_proveedor || undefined,
      cost: numOrUndef(r.costo),
      stock: r.stock === '' ? undefined : Number.parseInt(r.stock, 10),
    });
  }
  return [...byKey.values()];
}
