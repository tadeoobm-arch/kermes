/*
 * NovaParfum — Píxel personalizado (Shopify: Configuración › Eventos del cliente › Agregar píxel personalizado).
 *
 * RECOMENDADO PRIMERO: las apps oficiales y gratuitas, que ya envían ViewContent/AddToCart/
 * InitiateCheckout/Purchase (incluido el checkout, que un tema no puede tocar sin Shopify Plus):
 *   - "Google & YouTube" (GA4 + Google Ads)
 *   - "Facebook & Instagram" de Meta (Meta Pixel + Conversions API)
 *   - "TikTok" (TikTok Pixel + Events API)
 * Usá ESTE archivo solo para la plataforma que no conectes con su app oficial, para no duplicar eventos.
 *
 * ESTO REQUIERE QUE EL USUARIO CONECTE SU CUENTA: completá los IDs (son públicos, no secretos).
 * Dejá vacío el ID de la plataforma que no uses.
 */
const GA4_ID = ''; // p. ej. G-XXXXXXXXXX
const META_PIXEL_ID = ''; // p. ej. 123456789012345
const TIKTOK_PIXEL_ID = ''; // p. ej. CXXXXXXXXXXXXXXX

function loadScript(src) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

// ---------- Carga de librerías (solo si hay ID) ----------
if (GA4_ID) {
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { send_page_view: false });
}
if (META_PIXEL_ID) {
  !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
}
if (TIKTOK_PIXEL_ID) {
  !function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']; ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; }; for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]); ttq.load = function (e) { var s = d.createElement('script'); s.async = true; s.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + e + '&lib=' + t; d.head.appendChild(s); }; ttq.load(TIKTOK_PIXEL_ID); }(window, document, 'ttq');
}

const money = (m) => ({ value: Number(m?.amount ?? 0), currency: m?.currencyCode || 'UYU' });

// ---------- Eventos estándar de Shopify -> eventos de cada plataforma ----------
analytics.subscribe('page_viewed', (event) => {
  if (GA4_ID) window.gtag('event', 'page_view', { page_location: event.context.document.location.href, page_title: event.context.document.title });
  if (META_PIXEL_ID) window.fbq('track', 'PageView');
  if (TIKTOK_PIXEL_ID) window.ttq.page();
});

analytics.subscribe('product_viewed', (event) => {
  const v = event.data.productVariant;
  const { value, currency } = money(v.price);
  const item = { item_id: v.sku || v.id, item_name: v.product.title, item_brand: v.product.vendor, item_variant: v.title, price: value };
  if (GA4_ID) window.gtag('event', 'view_item', { currency, value, items: [item] });
  if (META_PIXEL_ID) window.fbq('track', 'ViewContent', { content_ids: [v.id], content_type: 'product', content_name: v.product.title, value, currency });
  if (TIKTOK_PIXEL_ID) window.ttq.track('ViewContent', { content_id: v.id, content_type: 'product', content_name: v.product.title, value, currency });
});

analytics.subscribe('product_added_to_cart', (event) => {
  const line = event.data.cartLine;
  const v = line.merchandise;
  const { value, currency } = money(line.cost.totalAmount);
  if (GA4_ID) window.gtag('event', 'add_to_cart', { currency, value, items: [{ item_id: v.sku || v.id, item_name: v.product.title, item_brand: v.product.vendor, item_variant: v.title, quantity: line.quantity }] });
  if (META_PIXEL_ID) window.fbq('track', 'AddToCart', { content_ids: [v.id], content_type: 'product', value, currency });
  if (TIKTOK_PIXEL_ID) window.ttq.track('AddToCart', { content_id: v.id, content_type: 'product', quantity: line.quantity, value, currency });
});

analytics.subscribe('checkout_started', (event) => {
  const c = event.data.checkout;
  const { value, currency } = money(c.totalPrice);
  const ids = c.lineItems.map((l) => l.variant?.id);
  if (GA4_ID) window.gtag('event', 'begin_checkout', { currency, value, items: c.lineItems.map((l) => ({ item_id: l.variant?.sku || l.variant?.id, item_name: l.title, quantity: l.quantity })) });
  if (META_PIXEL_ID) window.fbq('track', 'InitiateCheckout', { content_ids: ids, content_type: 'product', num_items: c.lineItems.length, value, currency });
  if (TIKTOK_PIXEL_ID) window.ttq.track('InitiateCheckout', { contents: c.lineItems.map((l) => ({ content_id: l.variant?.id, quantity: l.quantity })), value, currency });
});

analytics.subscribe('checkout_completed', (event) => {
  const c = event.data.checkout;
  const { value, currency } = money(c.totalPrice);
  const orderId = c.order?.id || c.token;
  if (GA4_ID) window.gtag('event', 'purchase', { transaction_id: orderId, currency, value, items: c.lineItems.map((l) => ({ item_id: l.variant?.sku || l.variant?.id, item_name: l.title, quantity: l.quantity })) });
  if (META_PIXEL_ID) window.fbq('track', 'Purchase', { content_ids: c.lineItems.map((l) => l.variant?.id), content_type: 'product', value, currency }, { eventID: orderId });
  if (TIKTOK_PIXEL_ID) window.ttq.track('CompletePayment', { contents: c.lineItems.map((l) => ({ content_id: l.variant?.id, quantity: l.quantity })), value, currency });
});
