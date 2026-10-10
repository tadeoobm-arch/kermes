import { createContext } from './context.js';
import { startServer } from './http/server.js';
import { missingIntegrations } from './config.js';

const ctx = createContext();
const missing = missingIntegrations(ctx.config);
if (missing.length) {
  ctx.logger.warn('ESTO REQUIERE QUE EL USUARIO CONECTE SU CUENTA', { faltan: missing });
}
if (ctx.config.dryRun) ctx.logger.warn('DRY_RUN activo: no se envían emails ni WhatsApp');

const server = await startServer(ctx, ctx.config.port);
ctx.logger.info('novaparfum-ops listo', { port: ctx.config.port });

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
