# Notificaciones al cliente — cómo aplicarlas

Shopify envía los emails al cliente de forma nativa (confiable, sin costo, con SPF/DKIM de Shopify).
NovaParfum solo **personaliza** esas plantillas; la app agrega el aviso de "Pago confirmado" y, si lo conectás, WhatsApp.

| Evento | Quién envía | Plantilla en este repo | Dónde se pega en Shopify |
|---|---|---|---|
| Pedido recibido | Shopify (nativo) | `order-confirmation.liquid` | Configuración › Notificaciones › Notificaciones al cliente › **Confirmación del pedido** |
| Pago confirmado | App NovaParfum Ops (email) + WhatsApp opcional | `app/src/notifications/templates.js` | — (automático al llegar `orders/paid`) |
| Pedido enviado | Shopify (nativo) | `shipping-confirmation.liquid` | **Confirmación de envío** |
| Envío actualizado / en camino | Shopify (nativo) | usar la de Shopify con el branding | **Actualización de envío** / **En reparto** |
| Pedido entregado | Shopify (nativo) | `delivered.liquid` | **Entregado** |
| Pedido cancelado | Shopify (nativo, al marcar "Notificar al cliente") | `order-cancelled.liquid` | **Pedido cancelado** |

## Paso previo (1 minuto, sin código)
Configuración › Notificaciones › Notificaciones al cliente › **Personalizar plantillas de email**:
- Logo: `branding/logo/logo-principal-claro.svg` exportado a PNG (ancho 400 px).
- Color de acento: `#4B3FA8` (Iris).

## Cómo pegar una plantilla
1. Abrí la notificación › **Editar código**.
2. Hacé una copia del código original (por si querés volver atrás).
3. Reemplazá el contenido por el del archivo `.liquid` de esta carpeta.
4. **Vista previa** y **Enviar email de prueba**.

Las plantillas usan solo variables documentadas de las notificaciones de Shopify
(`order_name`, `customer`, `line_items`, `order_status_url`, `financial_status`, `fulfillment`, `shop`).
Si Shopify cambia alguna variable, la vista previa del editor lo muestra al instante.
