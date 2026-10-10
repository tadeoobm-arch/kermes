import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toProductSetInput, validateProduct, discountPercent, slugify, PRODUCT_SET_MUTATION } from '../src/domain/catalog.js';
import { createTestContext, seedCatalog } from './helpers/setup.js';

const base = {
  title: 'Aurora Nocturna', brand: 'Marca Ejemplo', gender: 'Unisex', families: ['Oriental'],
  topNotes: ['Bergamota'], heartNotes: ['Rosa'], baseNotes: ['Ámbar'],
  variants: [
    { size: '100 ml', price: 3990, compareAtPrice: 4590, sku: 'NP-AUR-100', cost: 2000, stock: 3 },
    { size: '30 ml', price: 1990, sku: 'NP-AUR-30', cost: 900, stock: 5 },
    { size: '50 ml', price: 2890, sku: 'NP-AUR-50', cost: 1400, stock: 0 },
  ],
};

test('crear producto: genera productSet con metacampos, SEO y handle amigable', () => {
  const { handle, input } = toProductSetInput(base, { locationId: 'gid://shopify/Location/1', supplierMetaobjectId: 'gid://shopify/Metaobject/9' });
  assert.equal(handle, 'marca-ejemplo-aurora-nocturna');
  assert.equal(input.vendor, 'Marca Ejemplo');
  assert.equal(input.productType, 'Perfume');
  assert.equal(input.status, 'DRAFT', 'los productos nuevos entran como borrador');
  assert.ok(input.seo.title.length <= 70);
  assert.ok(input.seo.description.length <= 160);
  const keys = input.metafields.map((m) => `${m.namespace}.${m.key}`);
  for (const k of ['perfume.genero', 'perfume.familia_olfativa', 'perfume.notas_salida', 'perfume.notas_corazon', 'perfume.notas_fondo', 'proveedor.proveedor']) {
    assert.ok(keys.includes(k), `falta ${k}`);
  }
  assert.deepEqual(JSON.parse(input.metafields.find((m) => m.key === 'notas_salida').value), ['Bergamota']);
  assert.ok(input.tags.includes('genero-unisex'));
});

test('crear variantes: cada tamaño tiene precio, SKU, stock y costo propios, ordenados por ml', () => {
  const { input } = toProductSetInput(base, { locationId: 'gid://shopify/Location/1' });
  assert.deepEqual(input.productOptions[0].values.map((v) => v.name), ['30 ml', '50 ml', '100 ml']);
  const [v30, v50, v100] = input.variants;
  assert.equal(v30.price, '1990');
  assert.equal(v100.compareAtPrice, '4590');
  assert.equal(v50.sku, 'NP-AUR-50');
  assert.equal(v30.inventoryItem.cost, '900');
  assert.equal(v30.inventoryQuantities[0].quantity, 5);
  assert.equal(v50.inventoryQuantities[0].quantity, 0);
  assert.equal(v100.inventoryPolicy, 'DENY', 'no vender sin stock');
});

test('validación de producto detecta errores de carga', () => {
  const errors = validateProduct({
    title: 'X', brand: 'Y', gender: 'Niño', families: ['Inventada'],
    variants: [
      { size: '100ml', price: 100, sku: 'A', compareAtPrice: 90 },
      { size: '100ml', price: 0, sku: 'A' },
      { size: 'grande', price: 10, sku: 'B', cost: 20 },
    ],
  });
  const text = errors.join(' | ');
  assert.match(text, /Género inválido/);
  assert.match(text, /Familia olfativa desconocida/);
  assert.match(text, /SKU repetido A/);
  assert.match(text, /Tamaño repetido/);
  assert.match(text, /Precio anterior debe ser mayor/);
  assert.match(text, /Tamaño inválido "grande"/);
  assert.match(text, /margen negativo/);
  assert.throws(() => toProductSetInput({ ...base, variants: [] }), /al menos una variante/);
});

test('descuento % y slug', () => {
  assert.equal(discountPercent(3990, 4590), 13);
  assert.equal(discountPercent(100, null), 0);
  assert.equal(slugify('Perfumes Árabes Uruguay'), 'perfumes-arabes-uruguay');
});

test('carga de catálogo en Shopify (simulada) es idempotente por handle', async () => {
  const { ctx, shopify } = createTestContext();
  await seedCatalog(ctx, shopify);
  assert.equal(shopify.state.products.size, 3);
  const { handle, input } = toProductSetInput({ ...base, variants: base.variants.map((v) => ({ ...v, price: v.price + 100 })) }, { locationId: 'gid://shopify/Location/1' });
  await ctx.shopify.graphql(PRODUCT_SET_MUTATION, { identifier: { handle }, input });
  assert.equal(shopify.state.products.size, 3, 'no duplica productos');
  assert.equal(shopify.variantBySku('NP-AUR-30').variant.price, 2090, 'modificar precio actualiza la variante');
});
