#!/usr/bin/env node
// Revisa que no haya credenciales en el repositorio antes de subirlo (usar en CI o pre-commit).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SKIP = new Set(['node_modules', '.git', '.shopify', 'dist']);
const PATTERNS = [
  ['Shopify access token', /shpat_[a-f0-9]{20,}/],
  ['Shopify secret', /shpss_[a-f0-9]{20,}/],
  ['Mercado Pago access token', /APP_USR-\d{6,}-[\w-]{10,}/],
  ['Clave privada', /-----BEGIN (RSA )?PRIVATE KEY-----\n[A-Za-z0-9+/]/],
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['Meta token', /EAA[A-Za-z0-9]{50,}/],
];

const found = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name === '.env' || name.startsWith('.env.') && name !== '.env.example') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (statSync(p).size < 2_000_000) {
      const text = readFileSync(p, 'utf8');
      for (const [label, re] of PATTERNS) if (re.test(text)) found.push(`${relative(root, p)}: ${label}`);
    }
  }
})(root);

if (found.length) {
  console.error('✖ Posibles credenciales en el código:\n' + found.join('\n'));
  process.exit(1);
}
console.log('✔ Sin credenciales en el repositorio');
