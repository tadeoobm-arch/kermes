// Google Sheets como base operativa (API v4, cuenta de servicio, sin dependencias externas).
// Escribe con valueInputOption=RAW para que datos del cliente nunca se interpreten como fórmulas.
import { createSign } from 'node:crypto';

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://sheets.googleapis.com/v4/spreadsheets';

export function columnLetter(index) {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// Fusiona una fila nueva con la existente sin pisar datos cargados a mano:
// si el valor nuevo está vacío se conserva el anterior.
export function mergeRow(existing = [], incoming = []) {
  return incoming.map((v, i) => (v === '' || v === null || v === undefined ? existing[i] ?? '' : v));
}

export function planUpsert(existingValues, header, rows, keyColumn) {
  const keyIdx = header.indexOf(keyColumn);
  const index = new Map();
  existingValues.forEach((r, i) => {
    if (i === 0) return; // encabezado
    if (r[keyIdx]) index.set(r[keyIdx], i + 1); // número de fila 1-based
  });
  const updates = [];
  const appends = [];
  for (const row of rows) {
    const rowNumber = index.get(row[keyIdx]);
    if (rowNumber) updates.push({ rowNumber, values: mergeRow(existingValues[rowNumber - 1], row) });
    else appends.push(row);
  }
  return { updates, appends };
}

export function createSheetsClient(sheetsConfig, { fetchImpl = fetch, logger } = {}) {
  const { spreadsheetId, clientEmail, privateKey } = sheetsConfig;
  const configured = Boolean(spreadsheetId && clientEmail && privateKey);
  let cached = null;

  async function token() {
    if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.token;
    const now = Math.floor(Date.now() / 1000);
    const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })}`;
    const signature = createSign('RSA-SHA256').update(unsigned).sign(privateKey).toString('base64url');
    const res = await fetchImpl(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
    });
    if (!res.ok) throw new Error(`Google OAuth HTTP ${res.status}`);
    const json = await res.json();
    cached = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
    return cached.token;
  }

  async function call(path, { method = 'GET', body } = {}) {
    const res = await fetchImpl(`${API}/${spreadsheetId}${path}`, {
      method,
      headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`Google Sheets HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return res.json();
  }

  const q = (range) => encodeURIComponent(range);

  return {
    configured,
    async readAll(tab) {
      const data = await call(`/values/${q(`${tab}!A:ZZ`)}`);
      return data.values ?? [];
    },
    async upsertRows(tab, header, rows, keyColumn) {
      if (!configured) {
        logger?.info('sheets.skipped', { reason: 'Google Sheets no configurado', rows: rows.length });
        return { updated: 0, appended: 0, skipped: true };
      }
      let existing = await this.readAll(tab);
      if (!existing.length) {
        await call(`/values/${q(`${tab}!A1`)}?valueInputOption=RAW`, { method: 'PUT', body: { values: [header] } });
        existing = [header];
      }
      const { updates, appends } = planUpsert(existing, header, rows, keyColumn);
      const last = columnLetter(header.length - 1);
      if (updates.length) {
        await call('/values:batchUpdate', {
          method: 'POST',
          body: { valueInputOption: 'RAW', data: updates.map((u) => ({ range: `${tab}!A${u.rowNumber}:${last}${u.rowNumber}`, values: [u.values] })) },
        });
      }
      if (appends.length) {
        await call(`/values/${q(`${tab}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: 'POST', body: { values: appends } });
      }
      logger?.info('sheets.upsert', { tab, updated: updates.length, appended: appends.length });
      return { updated: updates.length, appended: appends.length };
    },
    async setValues(range, values, inputOption = 'USER_ENTERED') {
      return call(`/values/${q(range)}?valueInputOption=${inputOption}`, { method: 'PUT', body: { values } });
    },
    async clear(range) {
      return call(`/values/${q(range)}:clear`, { method: 'POST', body: {} });
    },
    async batchUpdate(requests) {
      return call(':batchUpdate', { method: 'POST', body: { requests } });
    },
    async getSpreadsheet() {
      return call('?fields=sheets.properties');
    },
  };
}
