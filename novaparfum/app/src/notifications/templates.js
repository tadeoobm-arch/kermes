// Mensajes de NovaParfum (email + texto para WhatsApp). Tono: cercano, claro, con voseo uruguayo.
import { emailLayout, button, escapeHtml } from './layout.js';

export function trackingPageUrl(config, order) {
  if (!config.storeUrl) return '';
  const q = new URLSearchParams({ pedido: order.name.replace('#', '') });
  return `${config.storeUrl}${config.trackingPagePath}?${q}`;
}

function productList(order) {
  return `<ul style="padding-left:18px;margin:8px 0">${order.lineItems
    .map((l) => `<li>${escapeHtml(`${l.brand} ${l.productTitle}`.trim())}${l.size ? ` · ${escapeHtml(l.size)}` : ''} × ${l.currentQuantity ?? l.quantity}</li>`)
    .join('')}</ul>`;
}

export function paymentConfirmedMessage(config, order) {
  const url = trackingPageUrl(config, order);
  const name = order.customer.firstName || 'hola';
  const text = `¡${name}, recibimos tu pago! ✨\n\nTu pedido ${order.name} de NovaParfum está confirmado y ya lo estamos preparando.\n\nTe avisamos apenas salga con su número de seguimiento.${url ? `\n\nSeguí tu pedido: ${url}` : ''}`;
  const html = emailLayout({
    title: `Pago confirmado ${order.name}`,
    preheader: 'Tu pedido está confirmado y lo estamos preparando.',
    storeUrl: config.storeUrl,
    bodyHtml: `<h1 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:24px;margin:0 0 8px">¡Pago confirmado! ✨</h1>
      <p>Hola ${escapeHtml(name)}, recibimos el pago de tu pedido <strong>${escapeHtml(order.name)}</strong> y ya lo estamos preparando.</p>
      ${productList(order)}
      <p>Te vamos a avisar apenas salga, con la empresa de envío y el número de seguimiento.</p>
      ${url ? button(url, 'Seguí tu pedido') : ''}`,
  });
  return { subject: `¡Pago confirmado! Tu pedido ${order.name} ya está en preparación`, text, html };
}

export function shippedMessage(config, order, tracking) {
  const url = tracking?.url || trackingPageUrl(config, order);
  const text = `¡Tu pedido de NovaParfum ya fue enviado! 📦\n\nNúmero de seguimiento:\n${tracking?.number || '-'}${tracking?.company ? `\n\nEmpresa: ${tracking.company}` : ''}\n\nPodés seguir tu pedido desde:\n${url}`;
  const html = emailLayout({
    title: `Pedido ${order.name} enviado`,
    preheader: 'Tu perfume ya está en camino.',
    storeUrl: config.storeUrl,
    bodyHtml: `<h1 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:24px;margin:0 0 8px">¡Tu pedido ya fue enviado! 📦</h1>
      <p>Pedido <strong>${escapeHtml(order.name)}</strong></p>
      <p>Empresa de envío: <strong>${escapeHtml(tracking?.company || '-')}</strong><br>Número de seguimiento: <strong>${escapeHtml(tracking?.number || '-')}</strong></p>
      ${url ? button(url, 'Seguí tu pedido') : ''}`,
  });
  return { subject: `Tu pedido ${order.name} ya está en camino 📦`, text, html };
}

export function deliveredMessage(config, order) {
  const text = `¡Tu pedido ${order.name} fue entregado! 💜\n\nEsperamos que disfrutes tu nuevo perfume. Si querés, contanos qué te pareció respondiendo este mensaje.`;
  const html = emailLayout({
    title: `Pedido ${order.name} entregado`,
    storeUrl: config.storeUrl,
    bodyHtml: `<h1 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:24px;margin:0 0 8px">¡Pedido entregado! 💜</h1>
      <p>Tu pedido <strong>${escapeHtml(order.name)}</strong> ya está en tus manos. Esperamos que lo disfrutes.</p>`,
  });
  return { subject: `Tu pedido ${order.name} fue entregado`, text, html };
}

export function cancelledMessage(config, order) {
  const text = `Tu pedido ${order.name} de NovaParfum fue cancelado.\n\nSi realizaste un pago, el reintegro se procesa por el mismo medio de pago. Ante cualquier duda, escribinos.`;
  const html = emailLayout({
    title: `Pedido ${order.name} cancelado`,
    storeUrl: config.storeUrl,
    bodyHtml: `<h1 style="font-family:Fraunces,Georgia,serif;font-weight:500;font-size:22px;margin:0 0 8px">Pedido cancelado</h1><p>${escapeHtml(text)}</p>`,
  });
  return { subject: `Pedido ${order.name} cancelado`, text, html };
}

export function adminPaidMessage(config, order, { supplierOrders, margins, warnings }) {
  const lines = supplierOrders
    .map((s) => `<li><strong>${escapeHtml(s.supplierName)}</strong> (${escapeHtml(s.to || 'SIN EMAIL')}): ${s.products.map((p) => `${escapeHtml(p.producto)} ${escapeHtml(p.tamano)} ×${p.cantidad}`).join(', ')} — ${s.sent ? 'enviado ✅' : 'NO enviado ⚠️'}</li>`)
    .join('');
  const m = margins.order;
  const html = emailLayout({
    title: `Venta pagada ${order.name}`,
    storeUrl: config.storeUrl,
    bodyHtml: `<h1 style="font-size:20px;margin:0 0 8px">💰 Venta pagada ${escapeHtml(order.name)}</h1>
      <p>${escapeHtml(order.customer.fullName)} · ${escapeHtml(order.customer.phone)} · ${escapeHtml(order.address.city)}, ${escapeHtml(order.address.department)}</p>
      <p>Total: <strong>${order.totals.total} ${escapeHtml(order.totals.currency)}</strong> · Ganancia estimada: <strong>${m.margin === null ? 'falta costo de algún producto' : `${m.margin} (${m.marginPercent}%)`}</strong></p>
      <ul>${lines}</ul>
      ${warnings.length ? `<p style="color:#B4540C"><strong>Revisar:</strong> ${warnings.map(escapeHtml).join(' · ')}</p>` : ''}`,
  });
  return { subject: `💰 Venta pagada ${order.name} — ${order.totals.total} ${order.totals.currency}`, html, text: html.replace(/<[^>]+>/g, ' ') };
}

export function adminCancelledMessage(config, order, { notifiedSuppliers }) {
  const html = emailLayout({
    title: `Pedido cancelado ${order.name}`,
    storeUrl: config.storeUrl,
    bodyHtml: `<h1 style="font-size:20px;margin:0 0 8px">Pedido cancelado ${escapeHtml(order.name)}</h1>
      <p>Motivo: ${escapeHtml(order.cancelReason || 'no indicado')}</p>
      <p>${notifiedSuppliers.length ? `Se avisó la cancelación a: ${notifiedSuppliers.map(escapeHtml).join(', ')}` : 'El pedido no había sido enviado a proveedores.'}</p>`,
  });
  return { subject: `❌ Pedido cancelado ${order.name}`, html, text: html.replace(/<[^>]+>/g, ' ') };
}

export function supplierCancelledMessage(order, supplierName) {
  const text = `CANCELACIÓN — Pedido NovaParfum ${order.name}\n\nPor favor NO enviar este pedido. Si ya fue despachado, avisanos respondiendo este email.\n\nProveedor: ${supplierName}`;
  return { subject: `CANCELADO: pedido ${order.name} — NO ENVIAR`, text, html: `<pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(text)}</pre>` };
}
