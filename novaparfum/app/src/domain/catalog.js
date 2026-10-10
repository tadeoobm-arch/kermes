// Catálogo: define un perfume con variantes por tamaño (ml) y lo convierte en el input
// de productSet de la Admin API (crea o actualiza de forma idempotente por handle).
// Escala a cientos/miles de productos: importar desde data/products.json o CSV por lotes.

export const SIZE_OPTION = 'Tamaño';
export const GENDERS = ['Hombre', 'Mujer', 'Unisex'];
export const OLFACTIVE_FAMILIES = [
  'Amaderada', 'Oriental', 'Floral', 'Cítrica', 'Frutal', 'Aromática', 'Fougère', 'Chipre',
  'Gourmand', 'Acuática', 'Especiada', 'Almizclada', 'Ambarada', 'Cuero', 'Verde',
];

export function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateProduct(p) {
  const errors = [];
  if (!p.title) errors.push('Falta nombre');
  if (!p.brand) errors.push('Falta marca');
  if (p.gender && !GENDERS.includes(p.gender)) errors.push(`Género inválido: ${p.gender}`);
  for (const f of p.families ?? []) if (!OLFACTIVE_FAMILIES.includes(f)) errors.push(`Familia olfativa desconocida: ${f}`);
  if (!Array.isArray(p.variants) || !p.variants.length) errors.push('Debe tener al menos una variante (tamaño)');
  const skus = new Set();
  const sizes = new Set();
  for (const v of p.variants ?? []) {
    if (!/^\d+(\.\d+)?\s?ml$/i.test(String(v.size))) errors.push(`Tamaño inválido "${v.size}" (usar "100 ml")`);
    if (sizes.has(v.size)) errors.push(`Tamaño repetido ${v.size}`);
    sizes.add(v.size);
    if (!v.sku) errors.push(`Falta SKU en ${v.size}`);
    if (skus.has(v.sku)) errors.push(`SKU repetido ${v.sku}`);
    skus.add(v.sku);
    if (!(Number(v.price) > 0)) errors.push(`Precio inválido en ${v.size}`);
    if (v.compareAtPrice !== undefined && v.compareAtPrice !== null && Number(v.compareAtPrice) <= Number(v.price)) {
      errors.push(`Precio anterior debe ser mayor al precio en ${v.size}`);
    }
    if (v.stock !== undefined && (!Number.isInteger(v.stock) || v.stock < 0)) errors.push(`Stock inválido en ${v.size}`);
    if (v.cost !== undefined && Number(v.cost) >= Number(v.price)) errors.push(`Costo >= precio en ${v.size} (margen negativo)`);
  }
  return errors;
}

export function discountPercent(price, compareAtPrice) {
  if (!compareAtPrice || Number(compareAtPrice) <= Number(price)) return 0;
  return Math.round((1 - Number(price) / Number(compareAtPrice)) * 100);
}

const list = (arr) => JSON.stringify(arr ?? []);
const mf = (namespace, key, type, value) => (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length) ? null : { namespace, key, type, value: typeof value === 'string' ? value : String(value) });

export function toProductSetInput(p, { locationId, supplierMetaobjectId } = {}) {
  const errors = validateProduct(p);
  if (errors.length) throw new Error(`Producto "${p.title}": ${errors.join('; ')}`);
  const handle = p.handle || slugify(`${p.brand} ${p.title}`);
  const sizes = [...p.variants].sort((a, b) => parseFloat(a.size) - parseFloat(b.size));
  const genderTag = p.gender ? `genero-${slugify(p.gender)}` : null;

  const metafields = [
    mf('perfume', 'genero', 'single_line_text_field', p.gender),
    mf('perfume', 'familia_olfativa', 'list.single_line_text_field', p.families?.length ? list(p.families) : null),
    mf('perfume', 'notas_salida', 'list.single_line_text_field', p.topNotes?.length ? list(p.topNotes) : null),
    mf('perfume', 'notas_corazon', 'list.single_line_text_field', p.heartNotes?.length ? list(p.heartNotes) : null),
    mf('perfume', 'notas_fondo', 'list.single_line_text_field', p.baseNotes?.length ? list(p.baseNotes) : null),
    mf('perfume', 'concentracion', 'single_line_text_field', p.concentration),
    mf('perfume', 'codigo_interno', 'single_line_text_field', p.internalCode),
    mf('perfume', 'info_envio', 'multi_line_text_field', p.shippingInfo),
    supplierMetaobjectId ? mf('proveedor', 'proveedor', 'metaobject_reference', supplierMetaobjectId) : null,
  ].filter(Boolean);

  return {
    handle,
    input: {
      title: p.title,
      handle,
      vendor: p.brand,
      productType: 'Perfume',
      status: p.status || 'DRAFT',
      descriptionHtml: p.descriptionHtml || '',
      tags: [...new Set([...(p.tags ?? []), genderTag, ...(p.families ?? []).map((f) => `familia-${slugify(f)}`)].filter(Boolean))],
      seo: {
        title: p.seoTitle || `${p.title} ${p.brand} ${sizes.map((s) => s.size).join(' / ')} | Perfume original en Uruguay | NovaParfum`.slice(0, 70),
        description: p.seoDescription || `Comprá ${p.title} de ${p.brand} en NovaParfum. ${p.families?.[0] ? `Fragancia ${p.families[0].toLowerCase()}. ` : ''}Envíos a todo Uruguay y pago con Mercado Pago.`.slice(0, 160),
      },
      productOptions: [{ name: SIZE_OPTION, values: sizes.map((v) => ({ name: v.size })) }],
      metafields,
      variants: sizes.map((v) => ({
        optionValues: [{ optionName: SIZE_OPTION, name: v.size }],
        price: String(v.price),
        ...(v.compareAtPrice ? { compareAtPrice: String(v.compareAtPrice) } : {}),
        sku: v.sku,
        inventoryPolicy: 'DENY',
        inventoryItem: { tracked: true, requiresShipping: true, ...(v.cost !== undefined ? { cost: String(v.cost) } : {}) },
        ...(locationId && v.stock !== undefined ? { inventoryQuantities: [{ locationId, name: 'available', quantity: v.stock }] } : {}),
        metafields: [mf('proveedor', 'sku_proveedor', 'single_line_text_field', v.supplierSku)].filter(Boolean),
      })),
    },
  };
}

export const PRODUCT_SET_MUTATION = /* GraphQL */ `
mutation NovaProductSet($identifier: ProductSetIdentifiers, $input: ProductSetInput!) {
  productSet(synchronous: true, identifier: $identifier, input: $input) {
    product { id handle variants(first: 50) { nodes { id sku } } }
    userErrors { field message code }
  }
}`;
