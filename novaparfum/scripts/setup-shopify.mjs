#!/usr/bin/env node
// Crea en Shopify (idempotente): metaobjeto "Proveedor" + metacampos de perfume, proveedor y pedido.
// Uso: cd app && npm run setup:shopify            (requiere credenciales en app/.env)
//      cd app && npm run setup:shopify -- --dry-run
import { createContext } from '../app/src/context.js';
import { METAFIELD_DEFINITION_CREATE, METAOBJECT_DEFINITION_CREATE, METAOBJECT_DEFINITION_BY_TYPE } from '../app/src/shopify/queries.js';
import { OLFACTIVE_FAMILIES, GENDERS } from '../app/src/domain/catalog.js';
import { STATUS } from '../app/src/domain/status.js';

const dryRun = process.argv.includes('--dry-run');

export const SUPPLIER_METAOBJECT = {
  type: 'proveedor',
  name: 'Proveedor',
  displayNameKey: 'nombre',
  access: { storefront: 'NONE' }, // datos de proveedores: nunca visibles en la tienda
  fieldDefinitions: [
    { key: 'nombre', name: 'Nombre', type: 'single_line_text_field', required: true },
    { key: 'email', name: 'Email de pedidos', type: 'single_line_text_field', required: true },
    { key: 'whatsapp', name: 'WhatsApp', type: 'single_line_text_field' },
    { key: 'metodo_envio', name: 'Método / empresa de envío', type: 'single_line_text_field' },
    { key: 'tiempo_preparacion_dias', name: 'Tiempo de preparación (días hábiles)', type: 'number_integer' },
    { key: 'costo_envio', name: 'Costo de envío por paquete (UYU)', type: 'number_decimal' },
    { key: 'activo', name: 'Activo', type: 'boolean' },
    { key: 'notas', name: 'Notas internas', type: 'multi_line_text_field' },
  ],
};

const choices = (arr) => [{ name: 'choices', value: JSON.stringify(arr) }];

export function metafieldDefinitions(supplierDefinitionId) {
  const pub = { storefront: 'PUBLIC_READ' };
  const hidden = { storefront: 'NONE' };
  return [
    { ownerType: 'PRODUCT', namespace: 'perfume', key: 'genero', name: 'Género', type: 'single_line_text_field', validations: choices(GENDERS), access: pub },
    { ownerType: 'PRODUCT', namespace: 'perfume', key: 'familia_olfativa', name: 'Familia olfativa', type: 'list.single_line_text_field', validations: choices(OLFACTIVE_FAMILIES), access: pub },
    { ownerType: 'PRODUCT', namespace: 'perfume', key: 'notas_salida', name: 'Notas de salida', type: 'list.single_line_text_field', access: pub },
    { ownerType: 'PRODUCT', namespace: 'perfume', key: 'notas_corazon', name: 'Notas de corazón', type: 'list.single_line_text_field', access: pub },
    { ownerType: 'PRODUCT', namespace: 'perfume', key: 'notas_fondo', name: 'Notas de fondo', type: 'list.single_line_text_field', access: pub },
    { ownerType: 'PRODUCT', namespace: 'perfume', key: 'concentracion', name: 'Concentración', type: 'single_line_text_field', validations: choices(['Parfum', 'Extrait de Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Body Mist']), access: pub },
    { ownerType: 'PRODUCT', namespace: 'perfume', key: 'codigo_interno', name: 'Código interno', type: 'single_line_text_field', access: hidden },
    { ownerType: 'PRODUCT', namespace: 'perfume', key: 'info_envio', name: 'Información de envío (opcional)', type: 'multi_line_text_field', access: pub },
    { ownerType: 'PRODUCT', namespace: 'proveedor', key: 'proveedor', name: 'Proveedor', type: 'metaobject_reference', validations: [{ name: 'metaobject_definition_id', value: supplierDefinitionId }], access: hidden },
    { ownerType: 'PRODUCTVARIANT', namespace: 'proveedor', key: 'proveedor', name: 'Proveedor (si difiere del producto)', type: 'metaobject_reference', validations: [{ name: 'metaobject_definition_id', value: supplierDefinitionId }], access: hidden },
    { ownerType: 'PRODUCTVARIANT', namespace: 'proveedor', key: 'sku_proveedor', name: 'SKU del proveedor', type: 'single_line_text_field', access: hidden },
    { ownerType: 'ORDER', namespace: 'novaparfum', key: 'estado', name: 'Estado NovaParfum', type: 'single_line_text_field', validations: choices(Object.values(STATUS)), access: hidden },
    { ownerType: 'ORDER', namespace: 'novaparfum', key: 'pedidos_proveedor', name: 'Órdenes a proveedores', type: 'json', access: hidden },
  ];
}

async function main() {
  if (dryRun) {
    console.log(JSON.stringify({ metaobject: SUPPLIER_METAOBJECT, metafields: metafieldDefinitions('<id del metaobjeto>') }, null, 2));
    return;
  }
  const ctx = createContext();
  const { shopify } = ctx;

  let def = (await shopify.graphql(METAOBJECT_DEFINITION_BY_TYPE, { type: 'proveedor' })).metaobjectDefinitionByType;
  if (!def) {
    const r = await shopify.graphql(METAOBJECT_DEFINITION_CREATE, { definition: SUPPLIER_METAOBJECT });
    if (r.metaobjectDefinitionCreate.userErrors.length) throw new Error(JSON.stringify(r.metaobjectDefinitionCreate.userErrors));
    def = r.metaobjectDefinitionCreate.metaobjectDefinition;
    console.log('✔ Metaobjeto "Proveedor" creado');
  } else console.log('• Metaobjeto "Proveedor" ya existía');

  for (const d of metafieldDefinitions(def.id)) {
    const r = await shopify.graphql(METAFIELD_DEFINITION_CREATE, { definition: { ...d, pin: true } });
    const errs = r.metafieldDefinitionCreate.userErrors;
    if (!errs.length) console.log(`✔ ${d.ownerType} ${d.namespace}.${d.key}`);
    else if (errs.some((e) => e.code === 'TAKEN')) console.log(`• ${d.ownerType} ${d.namespace}.${d.key} ya existía`);
    else console.error(`✖ ${d.ownerType} ${d.namespace}.${d.key}:`, errs.map((e) => e.message).join('; '));
  }
  console.log('\nListo. Próximo paso: activar filtros en la app "Search & Discovery" (ver docs/SETUP.md).');
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
