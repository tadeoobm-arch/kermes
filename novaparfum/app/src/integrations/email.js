// Envío de emails por SMTP (Gmail con contraseña de aplicación, Zoho, Brevo, etc.).
// Si falta configuración o DRY_RUN=true, no se envía nada: se registra en el log.

export function createEmailSender(config, { logger, transport } = {}) {
  const { smtp, from } = config.email;
  const configured = Boolean(smtp.host && from);
  let transporterPromise = null;

  async function getTransport() {
    if (transport) return transport;
    if (!transporterPromise) {
      transporterPromise = import('nodemailer').then(({ default: nodemailer }) =>
        nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
        }),
      );
    }
    return transporterPromise;
  }

  return {
    configured: configured || Boolean(transport),
    async send({ to, subject, html, text, replyTo }) {
      const recipients = [].concat(to).filter(Boolean);
      if (!recipients.length) return { sent: false, reason: 'sin destinatario' };
      if (config.dryRun || (!configured && !transport)) {
        logger?.info('email.skipped', { to: recipients, subject, reason: config.dryRun ? 'DRY_RUN' : 'SMTP no configurado' });
        return { sent: false, reason: config.dryRun ? 'DRY_RUN' : 'SMTP no configurado' };
      }
      const t = await getTransport();
      const info = await t.sendMail({ from, to: recipients.join(', '), subject, html, text, replyTo });
      logger?.info('email.sent', { to: recipients, subject, id: info?.messageId });
      return { sent: true, id: info?.messageId };
    },
  };
}
