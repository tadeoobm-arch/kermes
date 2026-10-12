// WhatsApp Business Platform (Cloud API de Meta). OPCIONAL y desactivado por defecto.
// Los mensajes iniciados por la empresa requieren PLANTILLAS APROBADAS por Meta:
// cada plantilla se crea en WhatsApp Manager y su nombre se configura por variable de entorno.
// ESTO REQUIERE QUE EL USUARIO CONECTE SU CUENTA (WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN).

export function toWhatsAppNumber(phone) {
  let d = String(phone ?? '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('598')) return d;
  if (d.startsWith('0')) d = d.slice(1); // 099123456 -> 99123456
  if (d.length === 8) return `598${d}`; // número uruguayo sin prefijo
  return d;
}

export function createWhatsAppSender(config, { fetchImpl = fetch, logger } = {}) {
  const wa = config.whatsapp;
  const configured = Boolean(wa.enabled && wa.phoneNumberId && wa.accessToken);

  return {
    configured,
    async sendTemplate({ to, template, params = [] }) {
      const number = toWhatsAppNumber(to);
      if (!configured || !template || !number || config.dryRun) {
        logger?.info('whatsapp.skipped', { template, reason: !configured ? 'no configurado' : !template ? 'sin plantilla' : !number ? 'sin teléfono' : 'DRY_RUN' });
        return { sent: false };
      }
      const res = await fetchImpl(`https://graph.facebook.com/${wa.apiVersion}/${wa.phoneNumberId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${wa.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: number,
          type: 'template',
          template: {
            name: template,
            language: { code: wa.language },
            components: params.length ? [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text: String(text) })) }] : [],
          },
        }),
      });
      if (!res.ok) {
        logger?.warn('whatsapp.error', { status: res.status, template });
        return { sent: false, status: res.status };
      }
      logger?.info('whatsapp.sent', { template });
      return { sent: true };
    },
  };
}
