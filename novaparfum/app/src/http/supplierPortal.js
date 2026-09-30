// Portal del proveedor: link firmado (sin usuario/contraseña) donde el proveedor ve SOLO
// sus productos del pedido e informa empresa de envío + número de seguimiento.
import { verifySignedPayload } from '../shopify/verify.js';
import { escapeHtml, BRAND } from '../notifications/layout.js';
import { CARRIERS } from '../domain/carriers.js';
import { fetchOrder } from '../services/orders.js';
import { registerSupplierTracking, markDelivered } from '../services/fulfillment.js';

function page(title, body) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title>
<style>
body{margin:0;background:${BRAND.marfil};color:${BRAND.noche};font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:560px;margin:0 auto;padding:20px 16px 48px}
.card{background:#fff;border-radius:16px;padding:18px;margin:14px 0;box-shadow:0 1px 0 ${BRAND.bruma}}
h1{font-size:22px;margin:8px 0}label{display:block;font-weight:600;margin:14px 0 6px}
input,select{width:100%;box-sizing:border-box;font-size:16px;padding:14px;border:1px solid #D9D3EA;border-radius:12px;background:#fff}
button{width:100%;min-height:52px;margin-top:18px;border:0;border-radius:999px;background:${BRAND.iris};color:#fff;font-size:16px;font-weight:700}
button.secondary{background:#fff;color:${BRAND.iris};border:2px solid ${BRAND.iris}}
.ok{background:#E6F2EC;color:#1F5E43;padding:12px;border-radius:12px}.err{background:#FBEAEA;color:#8A1F1F;padding:12px;border-radius:12px}
small{color:${BRAND.piedra}}li{margin:6px 0}
</style></head><body><main><p><strong style="color:${BRAND.iris}">&#10022; NovaParfum</strong> · Portal de proveedores</p>${body}</main></body></html>`;
}

export async function supplierPortal(ctx, { method, token, form }) {
  const payload = verifySignedPayload(token, ctx.config.signingSecret);
  if (!payload) return { status: 403, html: page('Link inválido', '<div class="card err">Este link no es válido o venció. Pedile uno nuevo a NovaParfum.</div>') };

  let notice = '';
  if (method === 'POST') {
    try {
      if (form.get('accion') === 'entregado') {
        const fulfillmentId = form.get('fulfillmentId');
        const order = await fetchOrder(ctx, payload.o);
        const mine = order.pedidosProveedor?.[payload.s]?.tracking?.fulfillmentId;
        if (!fulfillmentId || fulfillmentId !== mine) throw new Error('Envío no válido');
        await markDelivered(ctx, { fulfillmentId });
        notice = '<div class="card ok">¡Listo! Marcamos el pedido como entregado.</div>';
      } else {
        const r = await registerSupplierTracking(ctx, {
          orderGid: payload.o,
          supplierHandle: payload.s,
          carrierCode: form.get('empresa'),
          customCarrier: form.get('empresaOtra') || '',
          number: form.get('tracking'),
          url: form.get('url') || '',
        });
        notice = r.alreadyFulfilled
          ? '<div class="card ok">Este envío ya estaba registrado.</div>'
          : '<div class="card ok">¡Gracias! Guardamos el seguimiento y avisamos al cliente.</div>';
      }
    } catch (err) {
      ctx.logger.warn('portal.error', { order: payload.n, supplier: payload.s, error: err.message });
      notice = `<div class="card err">${escapeHtml(err.message)}</div>`;
    }
  }

  const order = await fetchOrder(ctx, payload.o);
  const mine = order.pedidosProveedor?.[payload.s];
  if (!mine) return { status: 404, html: page('Pedido', '<div class="card err">No hay productos de este proveedor en el pedido.</div>') };
  const lines = order.lineItems.filter((l) => mine.lineas.includes(l.id));
  const a = order.address;

  if (order.cancelledAt) {
    return { status: 200, html: page(`Pedido ${order.name}`, `${notice}<div class="card err"><strong>PEDIDO CANCELADO — NO ENVIAR.</strong></div>`) };
  }

  const trackingBlock = mine.tracking
    ? `<div class="card"><strong>Envío informado</strong><br>${escapeHtml(mine.tracking.company)} · ${escapeHtml(mine.tracking.number)}
       <form method="post"><input type="hidden" name="accion" value="entregado"><input type="hidden" name="fulfillmentId" value="${escapeHtml(mine.tracking.fulfillmentId)}">
       <button class="secondary" type="submit">Marcar como entregado</button></form></div>`
    : `<form method="post" class="card">
        <label for="empresa">Empresa de envío</label>
        <select id="empresa" name="empresa" required>${CARRIERS.map((c) => `<option value="${c.code}">${escapeHtml(c.name)}</option>`).join('')}</select>
        <label for="empresaOtra">Si elegiste "Otro operador", ¿cuál?</label><input id="empresaOtra" name="empresaOtra" autocomplete="off">
        <label for="tracking">Número de seguimiento</label><input id="tracking" name="tracking" required minlength="3" autocomplete="off" inputmode="text">
        <label for="url">Link de seguimiento (opcional)</label><input id="url" name="url" type="url" placeholder="https://">
        <button type="submit">Guardar y avisar al cliente</button>
      </form>`;

  const body = `${notice}
  <h1>Pedido ${escapeHtml(order.name)} <small>· PAGADO</small></h1>
  <div class="card"><strong>Enviar a</strong><br>${escapeHtml(order.customer.fullName)}<br>Tel: ${escapeHtml(order.customer.phone)}<br>
  ${escapeHtml([a.address1, a.address2 && `Apto ${a.address2}`, a.city, a.department, a.zip].filter(Boolean).join(', '))}
  ${order.deliveryNotes ? `<br><small>Obs.: ${escapeHtml(order.deliveryNotes)}</small>` : ''}</div>
  <div class="card"><strong>Tus productos</strong><ul>${lines
    .map((l) => `<li>${escapeHtml(`${l.brand} ${l.productTitle}`)} · ${escapeHtml(l.size)} × <strong>${l.currentQuantity ?? l.quantity}</strong><br><small>SKU ${escapeHtml(l.sku)}${l.supplierSku ? ` · tu SKU ${escapeHtml(l.supplierSku)}` : ''}</small></li>`)
    .join('')}</ul></div>
  ${trackingBlock}`;
  return { status: 200, html: page(`Pedido ${order.name}`, body) };
}
