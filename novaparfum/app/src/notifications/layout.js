// Layout de email con la identidad NovaParfum (índigo + lavanda sobre marfil). Compatible con clientes de correo.

export const BRAND = {
  noche: '#26224A',
  iris: '#4B3FA8',
  lavanda: '#BDB2EA',
  bruma: '#F2EFFA',
  marfil: '#FBF9F6',
  rosa: '#F1DAD5',
  salvia: '#B9CBB8',
  piedra: '#5E5A70',
};

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function emailLayout({ title, bodyHtml, preheader = '', storeUrl = '' }) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:${BRAND.marfil};font-family:Manrope,Helvetica,Arial,sans-serif;color:${BRAND.noche}">
<span style="display:none!important;opacity:0;height:0;overflow:hidden">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.marfil}">
<tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden">
    <tr><td style="background:${BRAND.bruma};padding:22px 28px;text-align:center">
      <a href="${escapeHtml(storeUrl || '#')}" style="text-decoration:none;color:${BRAND.noche};font-family:Fraunces,Georgia,serif;font-size:26px;letter-spacing:.5px">
        <span style="color:${BRAND.iris}">&#10022;</span> Nova<span style="font-weight:300">Parfum</span>
      </a>
    </td></tr>
    <tr><td style="padding:28px 28px 8px;font-size:15px;line-height:1.6">${bodyHtml}</td></tr>
    <tr><td style="padding:20px 28px 28px;font-size:12px;color:${BRAND.piedra};border-top:1px solid ${BRAND.bruma}">
      NovaParfum · Perfumería online en Uruguay<br>
      ¿Dudas? Respondé este email o escribinos por WhatsApp.
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

export function button(href, label) {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND.iris};color:#ffffff;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:600">${escapeHtml(label)}</a></p>`;
}
