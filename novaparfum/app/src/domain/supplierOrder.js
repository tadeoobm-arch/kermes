// Orden de proveedor: el documento que recibe cada proveedor con SOLO sus productos.
import { signPayload } from '../shopify/verify.js';
import { escapeHtml } from '../notifications/layout.js';

export function supplierPortalLink({ appUrl, signingSecret }, { orderGid, orderName, supplierHandle }) {
  if (!appUrl || !signingSecret) return '';
  // 60 días de vigencia: suficiente para informar tracking y entrega.
  const token = signPayload({ o: orderGid, n: orderName, s: supplierHandle, exp: Date.now() + 60 * 86400_000 }, signingSecret);
  return `${appUrl}/proveedor/${token}`;
}

export function buildSupplierOrder(order, group, { portalUrl = '', warnings = [] } = {}) {
  const { supplier, lines } = group;
  const addr = order.address;
  const fullAddress = [addr.address1, addr.address2 && `Apto/Unidad: ${addr.address2}`, addr.city, addr.department, addr.zip && `CP ${addr.zip}`, addr.country]
    .filter(Boolean)
    .join(', ');

  const products = lines.map((l) => ({
    producto: l.productTitle,
    marca: l.brand,
    tamano: l.size,
    cantidad: l.currentQuantity ?? l.quantity,
    sku: l.sku,
    skuProveedor: l.supplierSku,
  }));

  const observaciones = [order.address.address2 && `Apartamento ${order.address.address2}`, order.deliveryNotes, ...warnings]
    .filter(Boolean)
    .join(' · ');

  const text = [
    `PEDIDO NOVAPARFUM ${order.name}`,
    `Proveedor: ${supplier.nombre}`,
    '',
    'Cliente:',
    order.customer.fullName,
    '',
    'Teléfono:',
    order.customer.phone || '(no informado)',
    '',
    'Dirección:',
    addr.address1,
    addr.address2 ? `Apto/Unidad ${addr.address2}` : null,
    [addr.city, addr.department].filter(Boolean).join(', '),
    addr.zip ? `CP ${addr.zip}` : null,
    addr.country || 'Uruguay',
    '',
    ...products.flatMap((p) => [
      'Producto:', `${p.marca} ${p.producto}`.trim(),
      '', 'Tamaño:', p.tamano || '-',
      '', 'Cantidad:', String(p.cantidad),
      '', 'SKU:', p.skuProveedor ? `${p.sku} (tu SKU: ${p.skuProveedor})` : p.sku,
      '',
    ]),
    'Observaciones:',
    observaciones || '-',
    '',
    'Estado:',
    'PAGADO',
    '',
    portalUrl ? `Informá el envío y número de seguimiento acá:\n${portalUrl}` : 'Respondé este email con la empresa de envío y el número de seguimiento.',
  ]
    .filter((x) => x !== null)
    .join('\n');

  const rows = products
    .map(
      (p) => `<tr>
        <td style="padding:10px;border-bottom:1px solid #E7E2F0">${escapeHtml(`${p.marca} ${p.producto}`)}</td>
        <td style="padding:10px;border-bottom:1px solid #E7E2F0">${escapeHtml(p.tamano || '-')}</td>
        <td style="padding:10px;border-bottom:1px solid #E7E2F0;text-align:center"><strong>${p.cantidad}</strong></td>
        <td style="padding:10px;border-bottom:1px solid #E7E2F0">${escapeHtml(p.sku)}${p.skuProveedor ? `<br><small>Tu SKU: ${escapeHtml(p.skuProveedor)}</small>` : ''}</td>
      </tr>`,
    )
    .join('');

  const html = `
    <h1 style="font-size:20px;margin:0 0 4px">Pedido NovaParfum ${escapeHtml(order.name)}</h1>
    <p style="margin:0 0 16px;color:#5E5A70">Estado: <strong style="color:#2E7D5B">PAGADO</strong> · Proveedor: ${escapeHtml(supplier.nombre)}</p>
    <h2 style="font-size:15px;margin:16px 0 6px">Enviar a</h2>
    <p style="margin:0;line-height:1.6">
      <strong>${escapeHtml(order.customer.fullName)}</strong><br>
      Tel: ${escapeHtml(order.customer.phone || '(no informado)')}<br>
      ${escapeHtml(fullAddress)}
    </p>
    <h2 style="font-size:15px;margin:20px 0 6px">Productos</h2>
    <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
      <tr style="text-align:left;background:#F3F0FA"><th style="padding:10px">Producto</th><th style="padding:10px">Tamaño</th><th style="padding:10px">Cant.</th><th style="padding:10px">SKU</th></tr>
      ${rows}
    </table>
    <h2 style="font-size:15px;margin:20px 0 6px">Observaciones</h2>
    <p style="margin:0">${escapeHtml(observaciones || '-')}</p>
    ${portalUrl ? `<p style="margin:24px 0"><a href="${escapeHtml(portalUrl)}" style="background:#4B3FA8;color:#fff;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:600">Informar envío y seguimiento</a></p>` : ''}`;

  return {
    supplierHandle: supplier.handle,
    supplierName: supplier.nombre,
    to: supplier.email,
    whatsapp: supplier.whatsapp || '',
    subject: `Nuevo pedido PAGADO ${order.name} — NovaParfum`,
    text,
    html,
    products,
  };
}
