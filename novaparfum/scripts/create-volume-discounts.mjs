#!/usr/bin/env node
// Crea descuentos AUTOMÁTICOS nativos por cantidad ("Llevá 2 / Llevá 3") sobre una colección.
// Sin apps de pago. No se combinan entre sí: Shopify aplica el mejor descuento que califique.
// Uso: cd app && npm run discounts:volume -- --collection perfumes --tiers 2:10,3:15 [--dry-run]
import { createContext } from '../app/src/context.js';
import { AUTOMATIC_BASIC_DISCOUNT_CREATE } from '../app/src/shopify/queries.js';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const collectionHandle = arg('collection', 'perfumes');
const tiers = arg('tiers', '2:10,3:15')
  .split(',')
  .map((t) => t.split(':').map(Number))
  .map(([qty, pct]) => ({ qty, pct }));
const dryRun = process.argv.includes('--dry-run');

const COLLECTION = /* GraphQL */ `
query NovaCollection($handle: String!) {
  collectionByIdentifier(identifier: { handle: $handle }) { id title }
}`;

export function volumeDiscountInput({ qty, pct }, collectionId, startsAt = new Date().toISOString()) {
  return {
    title: `Llevá ${qty} perfumes: ${pct}% OFF`,
    startsAt,
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
    minimumRequirement: { quantity: { greaterThanOrEqualToQuantity: String(qty) } },
    customerGets: { value: { percentage: pct / 100 }, items: { collections: { add: [collectionId] } } },
  };
}

if (dryRun) {
  for (const t of tiers) console.log(JSON.stringify(volumeDiscountInput(t, `<id colección ${collectionHandle}>`), null, 2));
  process.exit(0);
}

const ctx = createContext();
const { collectionByIdentifier: col } = await ctx.shopify.graphql(COLLECTION, { handle: collectionHandle });
if (!col) {
  console.error(`No existe la colección "${collectionHandle}". Creala primero (ver docs/SETUP.md).`);
  process.exit(1);
}
for (const t of tiers) {
  const r = await ctx.shopify.graphql(AUTOMATIC_BASIC_DISCOUNT_CREATE, { automaticBasicDiscount: volumeDiscountInput(t, col.id) });
  const errs = r.discountAutomaticBasicCreate.userErrors;
  console.log(errs.length ? `✖ ${t.qty} u.: ${errs.map((e) => e.message).join('; ')}` : `✔ Llevá ${t.qty}: ${t.pct}% OFF en "${col.title}"`);
}
