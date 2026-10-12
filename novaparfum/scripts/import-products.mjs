#!/usr/bin/env node
// Importa / actualiza perfumes desde una planilla CSV (una fila por tamaño).
// Idempotente: el mismo handle actualiza el producto existente (precios, stock, costos, SKU).
// Uso: cd app && npm run import:products -- ../data/catalogo.csv [--dry-run]
import { readFileSync } from 'node:fs';
import { createContext } from '../app/src/context.js';
import { parseCsv, catalogRowsToProducts } from '../app/src/domain/csv.js';
import { toProductSetInput, validateProduct, PRODUCT_SET_MUTATION } from '../app/src/domain/catalog.js';

const SUPPLIER_QUERY = /* GraphQL */ `
query NovaSupplierByHandle($handle: MetaobjectHandleInput!) {
  metaobjectByHandle(handle: $handle) { id handle }
  locations(first: 1) { nodes { id name } }
}`;

const file = process.argv.slice(2).find((a) => !a.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');
if (!file) {
  console.error('Uso: npm run import:products -- <archivo.csv> [--dry-run]');
  process.exit(1);
}

const products = catalogRowsToProducts(parseCsv(readFileSync(file, 'utf8')));
let invalid = 0;
for (const p of products) {
  const errors = validateProduct(p);
  if (errors.length) {
    invalid++;
    console.error(`✖ ${p.brand} ${p.title}: ${errors.join('; ')}`);
  }
}
if (invalid) process.exit(1);
console.log(`${products.length} productos válidos (${products.reduce((a, p) => a + p.variants.length, 0)} variantes).`);

if (dryRun) {
  for (const p of products) console.log(JSON.stringify(toProductSetInput(p, { locationId: '<location>' }), null, 2));
  process.exit(0);
}

const ctx = createContext();
const supplierIds = new Map();
let locationId;
for (const p of products) {
  if (p.supplierHandle && !supplierIds.has(p.supplierHandle)) {
    const r = await ctx.shopify.graphql(SUPPLIER_QUERY, { handle: { type: 'proveedor', handle: p.supplierHandle } });
    locationId ||= r.locations.nodes[0]?.id;
    if (!r.metaobjectByHandle) console.warn(`⚠ Proveedor "${p.supplierHandle}" no existe en Shopify (Contenido > Metaobjetos). Se importa sin proveedor.`);
    supplierIds.set(p.supplierHandle, r.metaobjectByHandle?.id);
  }
  if (!locationId) {
    const r = await ctx.shopify.graphql(SUPPLIER_QUERY, { handle: { type: 'proveedor', handle: '__none__' } });
    locationId = r.locations.nodes[0]?.id;
  }
  const { handle, input } = toProductSetInput(p, { locationId, supplierMetaobjectId: supplierIds.get(p.supplierHandle) });
  if (p.images?.length) input.files = p.images.map((url, i) => ({ originalSource: url, contentType: 'IMAGE', alt: `${p.title} ${p.brand} perfume ${i === 0 ? 'frasco' : 'detalle'}` }));
  const r = await ctx.shopify.graphql(PRODUCT_SET_MUTATION, { identifier: { handle }, input });
  const errs = r.productSet.userErrors;
  if (errs.length) console.error(`✖ ${handle}:`, errs.map((e) => e.message).join('; '));
  else console.log(`✔ ${handle} (${r.productSet.product.variants.nodes.length} variantes)`);
}
