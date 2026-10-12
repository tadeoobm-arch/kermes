# Automatizaciones

Hay tres motores, cada uno para lo que hace mejor:

| Motor | Hace | Dónde |
|---|---|---|
| **Notificaciones nativas de Shopify** | Emails al cliente: pedido recibido, enviado, en camino, entregado, cancelado | `automations/notifications/` |
| **Shopify Flow** (gratis) | Etiquetas, metacampo de estado, emails internos, alertas | Esta guía |
| **NovaParfum Ops** (webhooks) | Órdenes a proveedores, división por proveedor, planilla, portal de tracking, "Seguí tu pedido", WhatsApp | `app/` |

> Para no duplicar trabajo: **Flow no envía nada a proveedores ni escribe la planilla**; eso lo hace la app
> en el mismo evento. Si desactivás la app, Flow sigue marcando estados y avisándote.

## Shopify Flow — instalar
Shopify App Store › **Shopify Flow** (app oficial, gratis) › Instalar. Luego *Crear flujo de trabajo*.
Los nombres de disparadores/acciones pueden variar levemente según el idioma del admin; se indican en español e inglés.

### WORKFLOW 1 — Pedido pagado
- **Disparador:** *Pedido pagado* (`Order paid`).
- **Condición:** `order.displayFinancialStatus` es igual a `PAID` (protección extra).
- **Acciones:**
  1. *Agregar etiquetas al pedido* (`Add order tags`): `np-pagado`, `estado:pago_confirmado`.
  2. *Actualizar metacampo del pedido* (`Update order metafield`): namespace `novaparfum`, key `estado`, tipo texto de una línea, valor `PAGO_CONFIRMADO`.
  3. *Enviar email interno* (`Send internal email`) a tu email:
     - Asunto: `💰 Venta pagada {{order.name}} — {{order.totalPriceSet.shopMoney.amount}} {{order.totalPriceSet.shopMoney.currencyCode}}`
     - Cuerpo:
       ```
       Cliente: {{order.shippingAddress.name}} · {{order.shippingAddress.phone}}
       Dirección: {{order.shippingAddress.address1}} {{order.shippingAddress.address2}}, {{order.shippingAddress.city}}, {{order.shippingAddress.province}}
       Productos:
       {% for li in order.lineItems %}- {{li.name}} x{{li.quantity}} ({{li.sku}})
       {% endfor %}
       Nota: {{order.note}}
       ```
  4. *(Generar info para proveedor, registrar pedido, preparar envío)* → lo ejecuta **NovaParfum Ops** con el webhook `orders/paid` en el mismo instante: divide por proveedor, envía las órdenes, escribe la planilla y deja el pedido en `PREPARANDO`.
  - Opcional si no usás la app: acción *Enviar solicitud HTTP* (`Send HTTP request`) hacia tu propio sistema.

### WORKFLOW 2 — Envío creado
- **Disparador:** *Preparación de pedido creada* (`Fulfillment created`).
- **Acciones:**
  1. *Agregar etiquetas al pedido*: `estado:enviado`.
  2. *Actualizar metacampo del pedido* `novaparfum.estado` = `ENVIADO`.
  3. Tracking: ya queda guardado en el fulfillment (empresa, número, URL) al cargarlo en el portal o en el admin.
  4. Notificar cliente: lo hace la notificación nativa **Confirmación de envío** (se envía al crear el fulfillment con "Notificar al cliente"; el portal lo hace siempre). WhatsApp opcional lo envía la app.

### WORKFLOW 3 — Envío entregado
- **Disparador:** *Evento de preparación creado* (`Fulfillment event created`).
- **Condición:** `fulfillmentEvent.status` es igual a `DELIVERED`.
- **Acciones:**
  1. *Agregar etiquetas al pedido*: `estado:entregado`.
  2. *Actualizar metacampo del pedido* `novaparfum.estado` = `ENTREGADO`.
  3. Notificar cliente: notificación nativa **Entregado** (y WhatsApp opcional desde la app).

> No existe un disparador llamado exactamente "Fulfillment delivered": se usa *Fulfillment event created* con la condición `DELIVERED`.

### WORKFLOW 4 — Pedido cancelado
- **Disparador:** *Pedido cancelado* (`Order cancelled`).
- **Acciones:**
  1. *Agregar etiquetas al pedido*: `estado:cancelado`.
  2. *Actualizar metacampo del pedido* `novaparfum.estado` = `CANCELADO`.
  3. *Enviar email interno*: `❌ Pedido cancelado {{order.name}} — motivo: {{order.cancelReason}}`.
  4. Registrar cancelación + avisar "NO ENVIAR" al proveedor (si ya se le había enviado): lo hace la app.

### Workflows recomendados extra
- **Stock bajo**: *Nivel de inventario cambiado* → si `available < 2` → email interno "Reponer {{productVariant.sku}}".
- **Pedido pagado sin proveedor**: *Etiquetas del pedido agregadas* con `np-revisar` → email interno urgente.
- **Cliente recurrente**: *Pedido creado* → si `customer.numberOfOrders >= 2` → etiqueta `cliente-recurrente`.

## Webhooks de la app (se registran solos)
Declarados en `app/shopify.app.toml` y publicados con `shopify app deploy`:
`orders/create`, `orders/paid`, `orders/cancelled`, `fulfillments/create`, `fulfillments/update` → `POST /webhooks`.

## Tareas programadas
Configurá un cron externo (el de tu hosting o cron-job.org) con el encabezado `Authorization: Bearer $CRON_SECRET`:
| Tarea | Frecuencia | Qué hace |
|---|---|---|
| `POST /tasks/reconcile` | cada 15 min | Procesa pedidos pagados que no llegaron al proveedor |
| `POST /tasks/reports` | 1 vez por día (y a demanda) | Recalcula Resumen diario, mensual, por proveedor y por producto |

## Notificaciones — mapa completo
| Evento | Cliente (email) | Cliente (WhatsApp, opcional) | Administrador | Proveedor |
|---|---|---|---|---|
| Pedido recibido | Shopify: Confirmación del pedido (aclara si el pago está pendiente) | — | Notificación nativa de nuevo pedido | — |
| Pago confirmado | App: "¡Pago confirmado! ✨" | `WHATSAPP_TEMPLATE_PAGO_CONFIRMADO` | App + Flow W1 | App: orden de su parte (email + WhatsApp opcional) |
| Pedido enviado | Shopify: Confirmación de envío | `WHATSAPP_TEMPLATE_ENVIADO` | — | — |
| Pedido entregado | Shopify: Entregado | `WHATSAPP_TEMPLATE_ENTREGADO` | — | — |
| Pedido cancelado | Shopify: Pedido cancelado | `WHATSAPP_TEMPLATE_CANCELADO` | App + Flow W4 | App: "CANCELADO — NO ENVIAR" |

### Plantillas de WhatsApp sugeridas (crear en WhatsApp Manager, categoría *Utility*)
- `np_pago_confirmado` (es): "¡{{1}}, recibimos tu pago! ✨ Tu pedido {{2}} de NovaParfum ya está en preparación. Te avisamos cuando salga."
- `np_pedido_enviado` (es): "¡Tu pedido de NovaParfum ya fue enviado! 📦 Pedido {{1}}. Número de seguimiento: {{2}}. Podés seguir tu pedido desde: {{3}}"
- `np_pedido_entregado` (es): "¡Tu pedido {{1}} fue entregado! 💜 Esperamos que lo disfrutes."
- `np_pedido_cancelado` (es): "Tu pedido {{1}} de NovaParfum fue cancelado. Si pagaste, el reintegro se hace por el mismo medio."
- `np_proveedor_nuevo_pedido` (es): "Nuevo pedido PAGADO {{1}} de NovaParfum ({{2}} producto/s). Detalle y carga de seguimiento: {{3}}"

## Planilla (Google Sheets) — por qué y cómo
**Decisión: Google Sheets como base operativa + exportación a Excel.**
- Sheets tiene API oficial gratuita, se actualiza en tiempo real y se comparte con permisos.
- Un archivo Excel en disco no se puede actualizar en tiempo real desde un servidor; Excel Online requiere Microsoft Graph + cuenta M365 (más complejo, sin beneficio extra).
- Exportar a Excel: Archivo › Descargar › **Microsoft Excel (.xlsx)**, o `npm run reports -- --excel export/` (CSV UTF-8 compatible con Excel).

Columnas (una fila por producto; se actualiza la misma fila en cada cambio, sin duplicar):
ID pedido · Fecha · Hora · Cliente · Teléfono · Email · Departamento · Ciudad · Dirección · Apartamento · Código postal ·
Producto · Marca · Tamaño · Cantidad · SKU · Precio · Costo proveedor · Margen · Total · Método de pago · Estado del pago ·
Estado del pedido · Estado del envío · Empresa de envío · Número de seguimiento · Fecha de envío · Fecha de entrega ·
Observaciones · Proveedor · SKU proveedor · Comisión MP · Venta línea · Clave

- Lo que escribas a mano en celdas que la app deja vacías **no se pisa**.
- Los datos se escriben como valores (`RAW`): un nombre de cliente como `=HYPERLINK(...)` nunca se ejecuta como fórmula.
- Pestañas de reportes (se regeneran): *Resumen diario*, *Resumen mensual*, *Por proveedor*, *Por producto*.
- **No compartas la planilla con proveedores** (tiene costos y márgenes); ellos usan su portal.
