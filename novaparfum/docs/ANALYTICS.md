# Analytics — GA4, Search Console, Meta Pixel y TikTok Pixel

## Recomendación (sin código y con checkout incluido)
En plan Basic el tema no puede tocar el checkout; por eso los eventos de compra se miden con
**Eventos del cliente** de Shopify, que es lo que usan las apps oficiales:

| Plataforma | App oficial gratuita | Eventos que envía |
|---|---|---|
| Google Analytics 4 (+ Google Ads) | **Google & YouTube** | page_view, view_item, add_to_cart, begin_checkout, purchase |
| Meta Pixel (+ Conversions API) | **Facebook & Instagram** | PageView, ViewContent, AddToCart, InitiateCheckout, Purchase |
| TikTok Pixel (+ Events API) | **TikTok** | ViewContent, AddToCart, InitiateCheckout, CompletePayment |
| Search Console | — (verificación DNS o desde la app de Google) | — |

**[CONECTAR]** Instalar cada app y vincular tu cuenta. Los IDs de píxel no son secretos, pero tampoco hace falta ponerlos en el código.

## Alternativa: píxel personalizado
`automations/pixels/custom-pixel.js` → Configuración › **Eventos del cliente** › *Agregar píxel personalizado*.
Mapea los eventos estándar de Shopify:

| Evento pedido | Evento Shopify | GA4 | Meta | TikTok |
|---|---|---|---|---|
| ViewContent | `product_viewed` | view_item | ViewContent | ViewContent |
| AddToCart | `product_added_to_cart` | add_to_cart | AddToCart | AddToCart |
| InitiateCheckout | `checkout_started` | begin_checkout | InitiateCheckout | InitiateCheckout |
| Purchase | `checkout_completed` | purchase | Purchase | CompletePayment |

⚠️ No actives el píxel personalizado y la app oficial para la **misma** plataforma: duplicaría conversiones.

## Consentimiento
Configuración › **Privacidad del cliente** › activar el banner de cookies si vas a hacer publicidad a visitantes de regiones que lo exigen.
Los píxeles en Eventos del cliente respetan la configuración de privacidad de Shopify.

## Verificación
- GA4 › Informes › Tiempo real: navegar un producto, agregar al carrito, iniciar checkout.
- Meta Events Manager › Probar eventos. TikTok Events Manager › Test events.
- Una compra real de bajo valor → debe verse `purchase` con el valor en UYU.

## Métricas clave (semanales)
Tasa de conversión, % de "Comprar ahora" vs carrito (GA4: eventos begin_checkout desde producto), ticket promedio,
% de pedidos con 2+ perfumes (efecto combos), ganancia por proveedor (pestaña *Por proveedor* de la planilla).
