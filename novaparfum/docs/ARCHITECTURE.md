# Arquitectura de NovaParfum

> Principio rector: **usar Shopify para todo lo que Shopify ya resuelve bien** y construir solo lo que falta.
> Nada de esto inventa APIs: todas las operaciones GraphQL de la app fueron validadas contra el esquema
> oficial de la Admin API (versión `2026-07`).

## 1. Diagrama general

```
                ┌──────────────────────────── SHOPIFY (plan Basic) ────────────────────────────┐
 Cliente ──►    │ Tema NovaParfum (Liquid)  →  Checkout de Shopify  →  Mercado Pago (Checkout Pro)│
 (celular)      │   · filtros nativos          · datos del cliente     · tarjeta / débito /      │
                │   · "Comprar ahora"          · dirección + teléfono    efectivo / dinero en    │
                │   · "Seguí tu pedido"        · nota de entrega         cuenta                  │
                │                                                                               │
                │ Inventario por variante · Descuentos automáticos · Shopify Bundles · Metaobjetos│
                │ Notificaciones nativas (confirmación, envío, entregado, cancelado) · Flow        │
                └───────┬──────────────────────────────────────────────▲─────────────────────────┘
       webhooks (HMAC)  │ orders/create · orders/paid · orders/cancelled │ Admin GraphQL API
                        │ fulfillments/create · fulfillments/update      │ (token client-credentials)
                        ▼                                                │
                ┌──────────────────────── NovaParfum Ops (Node.js) ─────┴───────────────┐
                │ • Detecta PAGO CONFIRMADO (relee el pedido: displayFinancialStatus=PAID)│
                │ • Divide el pedido por proveedor → email (y WhatsApp opcional) a cada uno│
                │ • Portal del proveedor (link firmado) → carga tracking → fulfillmentCreate│
                │ • Estados NovaParfum en metacampo + etiquetas del pedido                 │
                │ • Planilla Google Sheets (una fila por producto) + reportes de ganancia  │
                │ • App Proxy /apps/novaparfum/track → "Seguí tu pedido"                   │
                │ • Conciliación cada 15 min (pedidos pagados sin proveedor notificado)    │
                └─────────┬──────────────────────┬───────────────────────┬────────────────┘
                          ▼                      ▼                       ▼
                   Proveedores (email)    Google Sheets (→ Excel)   WhatsApp Cloud API (opcional)
```

## 2. Qué resuelve cada pieza

### 2.1 Solo con Shopify (sin código)
| Necesidad | Solución nativa |
|---|---|
| Productos, marcas, precios, precio anterior, SKU, stock | Producto + variantes; "Precio de comparación"; inventario por variante |
| Tamaños 30/50/100 ml con precio, SKU y stock distintos | Opción **Tamaño** → una variante por ml |
| Costo del proveedor | Campo nativo **Costo por artículo** de cada variante |
| Familia olfativa, notas, género, código interno | **Metacampos** (definidos por `scripts/setup-shopify.mjs`) |
| Filtros (marca, género, tamaño, precio, familia, disponibilidad) | App gratuita **Search & Discovery** de Shopify |
| Descuento por cantidad (2 = promo, 3 = especial) | **Descuentos automáticos** nativos con cantidad mínima |
| Packs/combos con inventario de componentes | App gratuita **Shopify Bundles** |
| Datos del cliente y dirección asociada al pedido | Checkout de Shopify (teléfono configurable como obligatorio) |
| Emails al cliente (recibido, enviado, entregado, cancelado) | **Notificaciones** nativas (personalizadas en `automations/notifications/`) |
| Tracking y links de seguimiento | Fulfillments con `trackingInfo` (empresa, número, URL) |
| Sitemap, robots.txt, URLs amigables, HTTPS | Nativo de Shopify |
| Analytics (GA4, Meta, TikTok) incluyendo checkout y compra | Apps oficiales + **Eventos del cliente** |
| Panel de productos, precios, stock, pedidos | Admin de Shopify (no se construyó un panel duplicado) |

### 2.2 Qué requiere Shopify Flow (gratis en plan Basic)
Etiquetas de estado, metacampo "estado", emails internos al administrador y alertas.
Ver `docs/AUTOMATIONS.md`. Flow **no** envía emails transaccionales a proveedores con datos
dinámicos por proveedor ni escribe en Google Sheets sin conectores externos → eso lo hace la app.

### 2.3 Qué requiere la app (NovaParfum Ops)
| Necesidad | Por qué no alcanza Shopify solo |
|---|---|
| Orden automática al proveedor **solo con pago confirmado** | Shopify no tiene "dropshipping a email por proveedor"; Flow no puede dividir un pedido por proveedor con contenido distinto para cada uno |
| División automática por proveedor (A, B, C…) | Requiere lógica por línea (metaobjeto proveedor → agrupación) |
| Portal para que el proveedor cargue el tracking sin cuenta de Shopify | Dar acceso al admin a proveedores expondría márgenes y otros clientes |
| Planilla en tiempo real + márgenes (costo + comisión MP + envío) | Los reportes de ganancia nativos no incluyen comisión de MP ni costo de envío del proveedor |
| "Seguí tu pedido" con número + email/teléfono sin iniciar sesión | La página de estado nativa requiere el link del email o iniciar sesión |
| WhatsApp transaccional | No es nativo; se integra con la Cloud API oficial de Meta |

### 2.4 Qué se automatiza con webhooks
| Webhook | Acción |
|---|---|
| `orders/create` | Registra el pedido (PEDIDO RECIBIDO). **No** avisa al proveedor. |
| `orders/paid` | Relee el pedido; si `displayFinancialStatus = PAID` → proveedores, planilla, admin, cliente. |
| `orders/cancelled` | Estado CANCELADO, planilla, aviso "NO ENVIAR" al proveedor si ya había sido notificado. |
| `fulfillments/create` / `update` | ENVIADO / EN TRÁNSITO / ENTREGADO, planilla, WhatsApp opcional. |

Robustez: verificación HMAC, deduplicación por `X-Shopify-Webhook-Id`, idempotencia por etiqueta
`np-proveedor-notificado`, bloqueo por pedido y **conciliación periódica** (`/tasks/reconcile`) que
recupera cualquier pedido pagado que no se haya procesado (p. ej. servidor caído).

### 2.5 APIs utilizadas (todas reales)
- **Shopify Admin GraphQL API** `2026-07`: `order`, `orders`, `fulfillmentOrders`, `fulfillmentCreate`,
  `fulfillmentEventCreate`, `tagsAdd`, `metafieldsSet`, `productSet`, `metafieldDefinitionCreate`,
  `metaobjectDefinitionCreate`, `discountAutomaticBasicCreate`, `collectionCreate`, `pageCreate`, `menuCreate/Update`.
- **Autenticación**: *client credentials grant* de apps del Dev Dashboard (token de 24 h, se renueva solo).
- **Google Sheets API v4** con cuenta de servicio (JWT RS256 firmado con `node:crypto`).
- **WhatsApp Business Platform – Cloud API** (`POST /{phone-number-id}/messages`, plantillas aprobadas).
- **SMTP** (nodemailer) para emails a proveedores/administración.
- **Mercado Pago**: no se llama a su API desde la app. El cobro lo hace la integración oficial de
  Mercado Pago dentro del checkout de Shopify y Shopify marca el pedido como pagado. Ver `MERCADOPAGO.md`.

## 3. Limitaciones técnicas (documentadas, con alternativa)

| Limitación | Alternativa aplicada |
|---|---|
| No se puede saltear el checkout de Shopify ni cobrar con un botón propio de Mercado Pago en una tienda Shopify (el pago debe pasar por el checkout con un proveedor de pagos aprobado). | "Comprar ahora" usa el **enlace permanente de carrito** `/cart/{variante}:{cantidad}` → abre el checkout **directo** con ese producto. Mercado Pago aparece como medio de pago. |
| Shopify Payments no está disponible en Uruguay. | Proveedor de pagos externo: app oficial de **Mercado Pago** para Shopify. |
| En plan Basic no se pueden agregar campos nuevos en los pasos de información/envío del checkout (las extensiones de UI de esos pasos son de Shopify Plus). | Se usan los campos nativos (Dirección = calle **y número de puerta**, Apartamento, Ciudad, Departamento, Código postal, Teléfono obligatorio) y el texto de la etiqueta se puede editar desde el idioma del checkout. Las **observaciones de entrega** se piden en el carrito (nota del pedido). La app marca "Revisar" si la dirección no tiene número. |
| Pagos en efectivo (redes de cobranza) quedan pendientes horas/días. | El pedido queda en PEDIDO RECIBIDO y el proveedor recibe la orden recién cuando se acredita (`orders/paid`). |
| La consulta de pedidos antiguos por API requiere el permiso `read_all_orders` (por defecto se ven los últimos 60 días). | Para "Seguí tu pedido" alcanza con 60 días. Si lo necesitás, solicitá `read_all_orders` en la app. |
| Los descuentos automáticos por cantidad no se acumulan entre sí. | Es lo deseado: Shopify aplica el mejor descuento que califique (2 → 10 %, 3+ → 15 %). |
| Instagram no permite embeber el feed sin scripts de terceros pesados. | Sección con 6 imágenes enlazadas (rápida). App oficial opcional. |
| WhatsApp: mensajes iniciados por la empresa requieren plantillas aprobadas por Meta. | Integración preparada y desactivada hasta que conectes tu cuenta y cargues los nombres de plantilla. |

## 4. Escalabilidad (de 10 a miles de perfumes)
- Catálogo: importación masiva idempotente (`scripts/import-products.mjs`) por CSV; productSet crea o actualiza por handle.
- Colecciones automáticas por reglas (tipo, etiquetas `genero-*`, precio rebajado): no hay que curar a mano.
- Filtros nativos indexados por Shopify (no dependen de la cantidad de productos).
- Proveedores como metaobjetos: agregar el sexto proveedor = crear una entrada, sin tocar código.
- App sin base de datos propia: el estado vive en Shopify (metacampos/etiquetas) → se puede escalar horizontalmente; el candado por pedido es por instancia y la idempotencia por etiqueta protege entre instancias.
- Planilla: una fila por línea con clave única (`Pedido|Línea`), upsert sin duplicados. Para > 50.000 filas/año conviene archivar por año (copiar la pestaña) o migrar a BigQuery/Looker Studio sin cambiar la app (solo el adaptador `integrations/sheets.js`).
- Empresas de envío: registro `domain/carriers.js`; agregar un operador = una línea + una variable de entorno.
