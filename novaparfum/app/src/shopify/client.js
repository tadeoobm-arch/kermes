// Cliente mínimo de la Admin GraphQL API de Shopify.
// Autenticación: client credentials grant (app del Dev Dashboard instalada en la tienda
// de tu misma organización). El token dura 24 h: se cachea y se renueva antes de vencer.
// Alternativa: SHOPIFY_ADMIN_ACCESS_TOKEN para apps "custom" antiguas creadas desde el admin.

export class ShopifyError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ShopifyError';
    this.details = details;
  }
}

export function createShopifyClient({ shop, clientId, clientSecret, adminAccessToken, apiVersion }, { fetchImpl = fetch, logger } = {}) {
  let cached = adminAccessToken ? { token: adminAccessToken, expiresAt: Infinity } : null;

  async function getToken() {
    if (cached && cached.expiresAt - 5 * 60_000 > Date.now()) return cached.token;
    if (!shop || !clientId || !clientSecret) {
      throw new ShopifyError('ESTO REQUIERE QUE EL USUARIO CONECTE SU CUENTA: faltan SHOPIFY_SHOP / SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET');
    }
    const res = await fetchImpl(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
    });
    if (!res.ok) throw new ShopifyError(`No se pudo obtener token de Shopify (HTTP ${res.status})`);
    const json = await res.json();
    cached = { token: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 86399) * 1000 };
    return cached.token;
  }

  async function graphql(query, variables = {}, { retries = 3 } = {}) {
    const token = await getToken();
    const res = await fetchImpl(`https://${shop}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query, variables }),
    });
    if ((res.status === 429 || res.status >= 500) && retries > 0) {
      await new Promise((r) => setTimeout(r, 1000 * (4 - retries)));
      return graphql(query, variables, { retries: retries - 1 });
    }
    if (!res.ok) throw new ShopifyError(`Shopify GraphQL HTTP ${res.status}`);
    const json = await res.json();
    const throttled = json.errors?.some((e) => e.extensions?.code === 'THROTTLED');
    if (throttled && retries > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return graphql(query, variables, { retries: retries - 1 });
    }
    if (json.errors?.length) {
      logger?.error('shopify.graphql.errors', { errors: json.errors });
      throw new ShopifyError('Shopify GraphQL devolvió errores', json.errors);
    }
    return json.data;
  }

  return { graphql };
}

// Lanza si la mutación devolvió userErrors.
export function assertNoUserErrors(payload, label) {
  const errors = payload?.userErrors ?? [];
  if (errors.length) throw new ShopifyError(`${label}: ${errors.map((e) => e.message).join('; ')}`, errors);
  return payload;
}

export const toGid = (type, id) => (String(id).startsWith('gid://') ? String(id) : `gid://shopify/${type}/${id}`);
export const fromGid = (gid) => String(gid).split('/').pop();
