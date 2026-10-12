// Logger JSON con redacción de secretos. Nunca imprimir credenciales en logs.

const SECRET_KEY = /(^pass$|^pwd$|token|secret|password|passwd|authorization|api[_-]?key|private[_-]?key|credential|hmac|signature|cookie)/i;
// Patrones de valores que parecen credenciales aunque la clave no lo indique.
const SECRET_VALUE = [
  /shpat_[a-z0-9]+/gi, // Shopify admin token
  /shpss_[a-z0-9]+/gi, // Shopify shared secret
  /APP_USR-[\w-]+/g, // Mercado Pago access token
  /TEST-[0-9]{6,}-[\w-]+/g, // Mercado Pago test token
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /Bearer\s+[\w.-]+/gi,
];

export function redact(value, depth = 0) {
  if (depth > 6) return '[depth]';
  if (typeof value === 'string') {
    return SECRET_VALUE.reduce((s, re) => s.replace(re, '[REDACTED]'), value);
  }
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value instanceof Error) {
    return { name: value.name, message: redact(value.message), stack: redact(value.stack || '') };
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SECRET_KEY.test(k) ? '[REDACTED]' : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

export function createLogger({ level = 'info', sink = console } = {}) {
  const levels = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };
  const min = levels[level] ?? 20;
  const write = (lvl) => (msg, data = {}) => {
    if (levels[lvl] < min) return;
    const line = JSON.stringify({ t: new Date().toISOString(), level: lvl, msg: redact(msg), ...redact(data) });
    (lvl === 'error' ? sink.error : sink.log).call(sink, line);
  };
  return { debug: write('debug'), info: write('info'), warn: write('warn'), error: write('error') };
}
