import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCsv, toCsv, catalogRowsToProducts } from '../src/domain/csv.js';
import { toProductSetInput, validateProduct } from '../src/domain/catalog.js';
import { metafieldDefinitions, SUPPLIER_METAOBJECT } from '../../scripts/setup-shopify.mjs';

test('la plantilla de catálogo del repo se importa como 1 producto con 3 variantes válidas', () => {
  const rows = parseCsv(readFileSync(new URL('../../data/catalogo-plantilla.csv', import.meta.url), 'utf8'));
  const products = catalogRowsToProducts(rows);
  assert.equal(products.length, 1);
  const [p] = products;
  assert.deepEqual(validateProduct(p), []);
  assert.deepEqual(p.families, ['Oriental', 'Ambarada']);
  assert.deepEqual(p.variants.map((v) => v.size), ['30 ml', '50 ml', '100 ml']);
  assert.equal(p.variants[2].compareAtPrice, 4590);
  assert.equal(p.supplierHandle, 'proveedor-principal');
  const { input } = toProductSetInput(p, { locationId: 'gid://shopify/Location/1' });
  assert.equal(input.variants.length, 3);
});

test('CSV: comillas, comas y saltos de línea; export seguro para Excel', () => {
  const rows = parseCsv('a,b\n"hola, mundo","línea1\nlínea2"\n');
  assert.deepEqual(rows, [{ a: 'hola, mundo', b: 'línea1\nlínea2' }]);
  const out = toCsv([['Cliente', 'Monto'], ['=HYPERLINK("x")', '-150'], ['@malo', 'ok']]);
  assert.ok(out.startsWith('﻿'), 'BOM para que Excel lea UTF-8');
  assert.match(out, /'=HYPERLINK/);
  assert.match(out, /,-150/, 'los números negativos no se alteran');
  assert.match(out, /'@malo/);
});

test('definiciones de metacampos y metaobjeto Proveedor', () => {
  const defs = metafieldDefinitions('gid://shopify/MetaobjectDefinition/1');
  const keys = defs.map((d) => `${d.ownerType}:${d.namespace}.${d.key}`);
  for (const k of ['PRODUCT:perfume.genero', 'PRODUCT:perfume.familia_olfativa', 'PRODUCT:perfume.notas_salida', 'PRODUCT:perfume.notas_corazon',
    'PRODUCT:perfume.notas_fondo', 'PRODUCT:perfume.codigo_interno', 'PRODUCT:proveedor.proveedor', 'PRODUCTVARIANT:proveedor.sku_proveedor',
    'ORDER:novaparfum.estado', 'ORDER:novaparfum.pedidos_proveedor']) {
    assert.ok(keys.includes(k), `falta ${k}`);
  }
  assert.equal(defs.find((d) => d.key === 'codigo_interno').access.storefront, 'NONE', 'datos internos no visibles en la tienda');
  assert.equal(SUPPLIER_METAOBJECT.access.storefront, 'NONE', 'proveedores nunca visibles en la tienda');
  assert.deepEqual(SUPPLIER_METAOBJECT.fieldDefinitions.map((f) => f.key).slice(0, 5), ['nombre', 'email', 'whatsapp', 'metodo_envio', 'tiempo_preparacion_dias']);
});
