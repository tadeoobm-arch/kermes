// Configuración 100% por variables de entorno. Ningún secreto vive en el código.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const bool = (v, def = false) => (v === undefined || v === '' ? def : /^(1|true|yes|si|sí)$/i.test(String(v)));
const num = (v, def = 0) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? def : Number(v));
const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);

export function loadSuppliersFile(path) {
  if (!path || !existsSync(path)) return { default: null, suppliers: [] };
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  return { default: parsed.default ?? null, suppliers: parsed.suppliers ?? [] };
}

export function loadConfig(env = process.env) {
  const suppliersFile = env.SUPPLIERS_FILE || resolve(here, '../../data/suppliers.json');
  const privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ? env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '';

  const config = {
    port: num(env.PORT, 3000),
    logLevel: env.LOG_LEVEL || 'info',
    dryRun: bool(env.DRY_RUN, false),
    appUrl: (env.APP_URL || '').replace(/\/$/, ''),
    storeUrl: (env.STORE_PUBLIC_URL || '').replace(/\/$/, ''),
    trackingPagePath: env.TRACKING_PAGE_PATH || '/pages/segui-tu-pedido',
    signingSecret: env.APP_SIGNING_SECRET || '',
    cronSecret: env.CRON_SECRET || '',
    timezone: env.STORE_TIMEZONE || 'America/Montevideo',
    currency: env.STORE_CURRENCY || 'UYU',

    shopify: {
      shop: env.SHOPIFY_SHOP || '',
      clientId: env.SHOPIFY_CLIENT_ID || '',
      clientSecret: env.SHOPIFY_CLIENT_SECRET || '',
      adminAccessToken: env.SHOPIFY_ADMIN_ACCESS_TOKEN || '',
      apiVersion: env.SHOPIFY_API_VERSION || '2026-07',
    },

    email: {
      from: env.EMAIL_FROM || '',
      adminRecipients: list(env.ADMIN_EMAILS),
      smtp: {
        host: env.SMTP_HOST || '',
        port: num(env.SMTP_PORT, 587),
        secure: bool(env.SMTP_SECURE, false),
        user: env.SMTP_USER || '',
        pass: env.SMTP_PASS || '',
      },
      notifyCustomerOnPayment: bool(env.NOTIFY_CUSTOMER_PAYMENT_EMAIL, true),
    },

    sheets: {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID || '',
      clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
      privateKey,
      ordersTab: env.GOOGLE_SHEETS_ORDERS_TAB || 'Pedidos',
    },

    whatsapp: {
      enabled: bool(env.WHATSAPP_ENABLED, false),
      apiVersion: env.WHATSAPP_API_VERSION || 'v21.0',
      phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || '',
      accessToken: env.WHATSAPP_ACCESS_TOKEN || '',
      language: env.WHATSAPP_TEMPLATE_LANGUAGE || 'es',
      templates: {
        pagoConfirmado: env.WHATSAPP_TEMPLATE_PAGO_CONFIRMADO || '',
        enviado: env.WHATSAPP_TEMPLATE_ENVIADO || '',
        entregado: env.WHATSAPP_TEMPLATE_ENTREGADO || '',
        cancelado: env.WHATSAPP_TEMPLATE_CANCELADO || '',
        proveedorNuevoPedido: env.WHATSAPP_TEMPLATE_PROVEEDOR || '',
      },
    },

    // Costos para el cálculo de margen. Los porcentajes de Mercado Pago dependen de TU cuenta
    // y del plazo de acreditación elegido: cargalos desde tu panel de Mercado Pago.
    costs: {
      mpFeePercent: num(env.MP_FEE_PERCENT, 0),
      mpFeeFixed: num(env.MP_FEE_FIXED, 0),
      mpFeeVatPercent: num(env.MP_FEE_VAT_PERCENT, 0),
      shippingCostPerSupplierShipment: num(env.SHIPPING_COST_PER_SHIPMENT, 0),
      salesVatPercent: num(env.SALES_VAT_PERCENT, 0),
    },

    carriers: {
      DAC: env.CARRIER_TRACKING_URL_DAC || '',
      UES: env.CARRIER_TRACKING_URL_UES || '',
      MIRTRANS: env.CARRIER_TRACKING_URL_MIRTRANS || '',
      CORREO_UY: env.CARRIER_TRACKING_URL_CORREO_UY || '',
      OTRO: '',
    },

    suppliers: loadSuppliersFile(suppliersFile),
  };
  return config;
}

// Lista de integraciones que faltan conectar. Se muestra al arrancar y en /health.
export function missingIntegrations(config) {
  const missing = [];
  const s = config.shopify;
  if (!s.shop) missing.push('SHOPIFY_SHOP');
  if (!s.clientSecret) missing.push('SHOPIFY_CLIENT_SECRET (verificación de webhooks y App Proxy)');
  if (!s.adminAccessToken && !(s.clientId && s.clientSecret)) missing.push('SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (Admin API)');
  if (!config.signingSecret) missing.push('APP_SIGNING_SECRET (links del portal de proveedores)');
  if (!config.appUrl) missing.push('APP_URL');
  if (!config.storeUrl) missing.push('STORE_PUBLIC_URL');
  if (!config.email.smtp.host || !config.email.from) missing.push('SMTP_* / EMAIL_FROM (emails a proveedores y clientes)');
  if (!config.email.adminRecipients.length) missing.push('ADMIN_EMAILS');
  if (!config.sheets.spreadsheetId || !config.sheets.clientEmail || !config.sheets.privateKey) {
    missing.push('GOOGLE_SHEETS_* (planilla de pedidos)');
  }
  if (!config.costs.mpFeePercent) missing.push('MP_FEE_PERCENT (comisión Mercado Pago para márgenes)');
  return missing;
}
