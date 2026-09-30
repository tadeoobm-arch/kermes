// Registro de empresas de envío. No asumimos ninguna empresa específica:
// cada operador se identifica por código y su URL de seguimiento es configurable
// (variable CARRIER_TRACKING_URL_<CODIGO>, con {tracking} como marcador).
// Para agregar un operador nuevo basta con sumarlo a esta lista + su variable de entorno.

export const CARRIERS = [
  { code: 'DAC', name: 'DAC' },
  { code: 'UES', name: 'UES' },
  { code: 'MIRTRANS', name: 'Mirtrans' },
  { code: 'CORREO_UY', name: 'Correo Uruguayo' },
  { code: 'OTRO', name: 'Otro operador' },
];

export function findCarrier(codeOrName) {
  const v = String(codeOrName || '').trim().toLowerCase();
  return CARRIERS.find((c) => c.code.toLowerCase() === v || c.name.toLowerCase() === v) || null;
}

export function trackingUrlFor(carrierCode, trackingNumber, carrierUrls = {}, explicitUrl = '') {
  if (explicitUrl && /^https:\/\//i.test(explicitUrl)) return explicitUrl;
  const template = carrierUrls[carrierCode];
  if (!template || !trackingNumber) return '';
  return template.replace('{tracking}', encodeURIComponent(trackingNumber));
}

// Nombre que se guarda en Shopify (trackingInfo.company). Para "Otro" se usa el nombre que escriba el proveedor.
export function companyName(carrierCode, customName = '') {
  const c = findCarrier(carrierCode);
  if (!c || c.code === 'OTRO') return customName.trim() || 'Otro';
  return c.name;
}
