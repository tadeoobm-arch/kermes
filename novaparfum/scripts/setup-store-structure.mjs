#!/usr/bin/env node
// Crea la estructura de la tienda (idempotente por handle):
//  - Colecciones: perfumes, hombre, mujer, unisex, ofertas, nuevos, mas-vendidos, destacados
//  - Páginas: Seguí tu pedido, Contacto, Preguntas frecuentes, Envíos, Cambios y devoluciones
//  - Menú principal: Inicio, Perfumes, Hombre, Mujer, Unisex, Ofertas, Nuevos, Contacto
//  - Menú "footer": Seguí tu pedido, Envíos, Preguntas frecuentes, Cambios, Contacto
// Uso: cd app && npm run setup:store [-- --dry-run]
import { createContext } from '../app/src/context.js';

const dryRun = process.argv.includes('--dry-run');
const perfume = { column: 'TYPE', relation: 'EQUALS', condition: 'Perfume' };
const seo = (title, description) => ({ title, description });

export const COLLECTIONS = [
  { handle: 'perfumes', title: 'Perfumes', sortOrder: 'BEST_SELLING', rules: [perfume], seo: seo('Perfumes originales en Uruguay | NovaParfum', 'Comprá perfumes originales de hombre, mujer y unisex con envío a todo Uruguay. Pagá con Mercado Pago.') },
  { handle: 'hombre', title: 'Perfumes de hombre', sortOrder: 'BEST_SELLING', rules: [perfume, { column: 'TAG', relation: 'EQUALS', condition: 'genero-hombre' }], seo: seo('Perfumes de hombre en Uruguay | NovaParfum', 'Perfumes masculinos originales: amaderados, frescos y orientales. Envíos a todo Uruguay.') },
  { handle: 'mujer', title: 'Perfumes de mujer', sortOrder: 'BEST_SELLING', rules: [perfume, { column: 'TAG', relation: 'EQUALS', condition: 'genero-mujer' }], seo: seo('Perfumes de mujer en Uruguay | NovaParfum', 'Perfumes femeninos originales: florales, frutales y gourmand. Envíos a todo Uruguay.') },
  { handle: 'unisex', title: 'Perfumes unisex', sortOrder: 'BEST_SELLING', rules: [perfume, { column: 'TAG', relation: 'EQUALS', condition: 'genero-unisex' }], seo: seo('Perfumes unisex en Uruguay | NovaParfum', 'Fragancias unisex originales para compartir. Envíos a todo Uruguay y pago con Mercado Pago.') },
  { handle: 'ofertas', title: 'Ofertas', sortOrder: 'BEST_SELLING', rules: [perfume, { column: 'IS_PRICE_REDUCED', relation: 'IS_SET', condition: '' }], seo: seo('Ofertas en perfumes | NovaParfum Uruguay', 'Perfumes originales con descuento por tiempo limitado. Envíos a todo Uruguay.') },
  { handle: 'nuevos', title: 'Nuevos', sortOrder: 'CREATED_DESC', rules: [perfume, { column: 'TAG', relation: 'EQUALS', condition: 'nuevo' }], seo: seo('Nuevos perfumes | NovaParfum Uruguay', 'Los últimos lanzamientos en perfumería, disponibles en Uruguay.') },
  { handle: 'mas-vendidos', title: 'Más vendidos', sortOrder: 'BEST_SELLING', rules: [perfume], seo: seo('Perfumes más vendidos en Uruguay | NovaParfum', 'Los perfumes favoritos de nuestros clientes en Uruguay.') },
  { handle: 'destacados', title: 'Destacados', sortOrder: 'MANUAL', rules: null, seo: seo('Perfumes destacados | NovaParfum', 'Nuestra selección de perfumes destacados.') },
];

export const PAGES = [
  { handle: 'segui-tu-pedido', title: 'Seguí tu pedido', templateSuffix: 'seguimiento', body: '' },
  { handle: 'contacto', title: 'Contacto', templateSuffix: 'contact', body: '' },
  { handle: 'preguntas-frecuentes', title: 'Preguntas frecuentes', templateSuffix: 'faq', body: '' },
  { handle: 'envios', title: 'Envíos', templateSuffix: null, body: '<p>[Completar con plazos, costos y empresas de envío reales para Montevideo e Interior.]</p>' },
  { handle: 'cambios-y-devoluciones', title: 'Cambios y devoluciones', templateSuffix: null, body: '<p>[Completar con tu política, respetando la Ley 17.250 de Defensa del Consumidor de Uruguay.]</p>' },
];

const Q = /* GraphQL */ `
query NovaStructure {
  menus(first: 50) { nodes { id handle } }
  publications(first: 20) { nodes { id name } }
  pages(first: 100) { nodes { id handle } }
}`;
const COLLECTION_BY_HANDLE = /* GraphQL */ `
query NovaCollection($handle: String!) { collectionByIdentifier(identifier: { handle: $handle }) { id } }`;
const COLLECTION_CREATE = /* GraphQL */ `
mutation NovaCollectionCreate($input: CollectionInput!) { collectionCreate(input: $input) { collection { id handle } userErrors { field message } } }`;
const PUBLISH = /* GraphQL */ `
mutation NovaPublish($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`;
const PAGE_CREATE = /* GraphQL */ `
mutation NovaPageCreate($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle } userErrors { field message } } }`;
const MENU_CREATE = /* GraphQL */ `
mutation NovaMenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) { menuCreate(title: $title, handle: $handle, items: $items) { menu { id } userErrors { field message } } }`;
const MENU_UPDATE = /* GraphQL */ `
mutation NovaMenuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $title, items: $items) { menu { id } userErrors { field message } } }`;

if (dryRun) {
  console.log(JSON.stringify({ COLLECTIONS, PAGES }, null, 2));
  process.exit(0);
}

const { shopify } = createContext();
const base = await shopify.graphql(Q);
const onlineStore = base.publications.nodes.find((p) => /online store|tienda online/i.test(p.name));
const collectionIds = {};

for (const c of COLLECTIONS) {
  const found = (await shopify.graphql(COLLECTION_BY_HANDLE, { handle: c.handle })).collectionByIdentifier;
  if (found) {
    collectionIds[c.handle] = found.id;
    console.log(`• colección ${c.handle} ya existía`);
    continue;
  }
  const input = { title: c.title, handle: c.handle, sortOrder: c.sortOrder, seo: c.seo };
  if (c.rules) input.ruleSet = { appliedDisjunctively: false, rules: c.rules };
  const r = await shopify.graphql(COLLECTION_CREATE, { input });
  if (r.collectionCreate.userErrors.length) {
    console.error(`✖ ${c.handle}:`, r.collectionCreate.userErrors.map((e) => e.message).join('; '));
    continue;
  }
  collectionIds[c.handle] = r.collectionCreate.collection.id;
  if (onlineStore) await shopify.graphql(PUBLISH, { id: collectionIds[c.handle], input: [{ publicationId: onlineStore.id }] });
  console.log(`✔ colección ${c.handle}`);
}

const pageIds = Object.fromEntries(base.pages.nodes.map((p) => [p.handle, p.id]));
for (const p of PAGES) {
  if (pageIds[p.handle]) {
    console.log(`• página ${p.handle} ya existía`);
    continue;
  }
  const r = await shopify.graphql(PAGE_CREATE, { page: { title: p.title, handle: p.handle, body: p.body, isPublished: true, ...(p.templateSuffix ? { templateSuffix: p.templateSuffix } : {}) } });
  if (r.pageCreate.userErrors.length) console.error(`✖ página ${p.handle}:`, r.pageCreate.userErrors.map((e) => e.message).join('; '));
  else {
    pageIds[p.handle] = r.pageCreate.page.id;
    console.log(`✔ página ${p.handle}`);
  }
}

const col = (title, handle) => ({ title, type: 'COLLECTION', resourceId: collectionIds[handle] });
const page = (title, handle) => ({ title, type: 'PAGE', resourceId: pageIds[handle] });
const menus = {
  'main-menu': { title: 'Menú principal', items: [{ title: 'Inicio', type: 'FRONTPAGE', url: '/' }, col('Perfumes', 'perfumes'), col('Hombre', 'hombre'), col('Mujer', 'mujer'), col('Unisex', 'unisex'), col('Ofertas', 'ofertas'), col('Nuevos', 'nuevos'), page('Contacto', 'contacto')] },
  footer: { title: 'Ayuda', items: [page('Seguí tu pedido', 'segui-tu-pedido'), page('Envíos', 'envios'), page('Preguntas frecuentes', 'preguntas-frecuentes'), page('Cambios y devoluciones', 'cambios-y-devoluciones'), page('Contacto', 'contacto')] },
};
for (const [handle, m] of Object.entries(menus)) {
  const items = m.items.filter((i) => i.type === 'FRONTPAGE' || i.resourceId);
  const existing = base.menus.nodes.find((n) => n.handle === handle);
  const r = existing
    ? await shopify.graphql(MENU_UPDATE, { id: existing.id, title: m.title, items })
    : await shopify.graphql(MENU_CREATE, { title: m.title, handle, items });
  const errs = (existing ? r.menuUpdate : r.menuCreate).userErrors;
  console.log(errs.length ? `✖ menú ${handle}: ${errs.map((e) => e.message).join('; ')}` : `✔ menú ${handle}`);
}
