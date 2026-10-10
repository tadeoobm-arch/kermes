// Arma el contexto de dependencias (inyectable en tests).
import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { createShopifyClient } from './shopify/client.js';
import { createEmailSender } from './integrations/email.js';
import { createSheetsClient } from './integrations/sheets.js';
import { createWhatsAppSender } from './integrations/whatsapp.js';

export function createContext(overrides = {}) {
  const config = overrides.config ?? loadConfig();
  const logger = overrides.logger ?? createLogger({ level: config.logLevel });
  return {
    config,
    logger,
    shopify: overrides.shopify ?? createShopifyClient(config.shopify, { logger }),
    email: overrides.email ?? createEmailSender(config, { logger }),
    sheets: overrides.sheets ?? createSheetsClient(config.sheets, { logger }),
    whatsapp: overrides.whatsapp ?? createWhatsAppSender(config, { logger }),
  };
}
