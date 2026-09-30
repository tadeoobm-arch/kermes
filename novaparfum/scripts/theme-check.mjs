#!/usr/bin/env node
// Theme Check oficial de Shopify sobre el tema. Sale con error si hay problemas de severidad ERROR.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// La dependencia está instalada en app/node_modules.
const require = createRequire(new URL('../app/package.json', import.meta.url));
const { themeCheckRun } = await import(pathToFileURL(require.resolve('@shopify/theme-check-node')).href);

const root = fileURLToPath(new URL('../theme', import.meta.url));
const { offenses } = await themeCheckRun(root, undefined, () => {});
const label = ['ERROR', 'WARN', 'INFO'];
for (const o of offenses) console.log(`${label[o.severity] ?? o.severity} ${o.uri.split('/theme/')[1]}:${(o.start?.line ?? 0) + 1} [${o.check}] ${o.message}`);
const errors = offenses.filter((o) => o.severity === 0).length;
console.log(`Theme Check: ${offenses.length} observaciones, ${errors} errores`);
process.exit(errors ? 1 : 0);
