import { loadConfig } from '../../src/config.js';
import { createLogger } from '../../src/logger.js';
import { createFakeShopify, createRecorders } from './fakeShopify.js';
import { toProductSetInput, PRODUCT_SET_MUTATION } from '../../src/domain/catalog.js';

export const TEST_SECRET = 'test-client-secret-no-real';

export function testConfig(overrides = {}) {
  const config = loadConfig({
    SHOPIFY_SHOP: 'tienda-prueba.myshopify.com',
    SHOPIFY_CLIENT_ID: 'test-client-id',
    SHOPIFY_CLIENT_SECRET: TEST_SECRET,
    APP_URL: 'https://ops.novaparfum.test',
    STORE_PUBLIC_URL: 'https://novaparfum.test',
    APP_SIGNING_SECRET: 'firma-de-prueba-32-bytes-minimo-xx',
    CRON_SECRET: 'cron-de-prueba',
    ADMIN_EMAILS: 'admin@novaparfum.test',
    MP_FEE_PERCENT: '5',
    MP_FEE_VAT_PERCENT: '22',
    SHIPPING_COST_PER_SHIPMENT: '150',
    CARRIER_TRACKING_URL_DAC: 'https://tracking.ejemplo-dac.test/?n={tracking}',
    WHATSAPP_TEMPLATE_ENVIADO: 'np_pedido_enviado',
    WHATSAPP_TEMPLATE_ENTREGADO: 'np_pedido_entregado',
    WHATSAPP_TEMPLATE_PAGO_CONFIRMADO: 'np_pago_confirmado',
    SUPPLIERS_FILE: new URL('../fixtures/suppliers.json', import.meta.url).pathname,
    ...overrides,
  });
  return config;
}

export function createTestContext(overrides = {}) {
  const shopify = createFakeShopify();
  const rec = createRecorders();
  const ctx = {
    config: testConfig(overrides),
    logger: createLogger({ level: 'silent' }),
    shopify,
    email: rec.email,
    sheets: rec.sheets,
    whatsapp: rec.whatsapp,
  };
  return { ctx, shopify, rec };
}

// Carga el catálogo de prueba: 2 proveedores (metaobjetos) y 3 perfumes con variantes por ml.
export async function seedCatalog(ctx, shopify) {
  const provA = shopify.addSupplier('proveedor-a', { nombre: 'Proveedor A', email: 'pedidos@proveedor-a.test', metodo_envio: 'DAC', tiempo_preparacion_dias: 1 });
  const provB = shopify.addSupplier('proveedor-b', { nombre: 'Proveedor B', email: 'ventas@proveedor-b.test', whatsapp: '099111222', metodo_envio: 'UES', tiempo_preparacion_dias: 2 });
  const products = [
    {
      supplier: provA,
      data: {
        title: 'Aurora Nocturna', brand: 'Marca Ejemplo', gender: 'Unisex', families: ['Oriental', 'Ambarada'],
        topNotes: ['Bergamota', 'Azafrán'], heartNotes: ['Rosa'], baseNotes: ['Ámbar', 'Vainilla'], internalCode: 'NP-0001', concentration: 'Eau de Parfum',
        variants: [
          { size: '30 ml', price: 1990, sku: 'NP-AUR-30', cost: 900, stock: 5, supplierSku: 'A-AUR30' },
          { size: '100 ml', price: 3990, compareAtPrice: 4590, sku: 'NP-AUR-100', cost: 2000, stock: 3, supplierSku: 'A-AUR100' },
          { size: '50 ml', price: 2890, sku: 'NP-AUR-50', cost: 1400, stock: 4 },
        ],
      },
    },
    {
      supplier: provA,
      data: { title: 'Brisa Cítrica', brand: 'Marca Ejemplo', gender: 'Mujer', families: ['Cítrica'], variants: [{ size: '100 ml', price: 2490, sku: 'NP-BRI-100', cost: 1100, stock: 10 }] },
    },
    {
      supplier: provB,
      data: { title: 'Cedro Azul', brand: 'Otra Marca', gender: 'Hombre', families: ['Amaderada'], variants: [{ size: '100 ml', price: 3290, sku: 'NP-CED-100', cost: 1600, stock: 2 }] },
    },
  ];
  for (const p of products) {
    const { handle, input } = toProductSetInput(p.data, { locationId: 'gid://shopify/Location/1', supplierMetaobjectId: p.supplier });
    await ctx.shopify.graphql(PRODUCT_SET_MUTATION, { identifier: { handle }, input });
  }
  return { provA, provB };
}

export const CUSTOMER = { firstName: 'Juan', lastName: 'Pérez', email: 'juan.perez@example.com', phone: '+598 99 123 456' };
export const ADDRESS = { address1: 'Av. Brasil 1234', address2: '302', city: 'Montevideo', province: 'Montevideo', provinceCode: 'UY-MO', zip: '11300' };
