# NovaParfum — perfumería online para Uruguay (Shopify)

Tienda Shopify completa + automatización de pedidos con proveedores, lista para vender en Uruguay
con **Mercado Pago**, y preparada para pasar de pocos productos a miles sin rehacer nada.

![Vista previa en celular](branding/preview/captura-home-celular.png)

## Qué hace el sistema
1. **Tienda** (tema propio `theme/`): diseño premium y liviano (índigo + lavanda, sin dorado/negro), mobile-first,
   filtros por marca/género/tamaño/precio/familia/disponibilidad, variantes por ml, **Comprar ahora** directo al checkout,
   Mercado Pago visible, combos por cantidad, SEO técnico y "Seguí tu pedido".
2. **Cobro**: Mercado Pago (app oficial) dentro del checkout de Shopify.
3. **Operación automática** (`app/`, Node.js): solo cuando el pago está **confirmado** →
   divide el pedido **por proveedor** → envía a cada uno su orden → planilla en **Google Sheets** con márgenes →
   el proveedor carga el **tracking** en su portal → Shopify avisa al cliente → estados ENVIADO/EN TRÁNSITO/ENTREGADO.
4. **Identidad de marca** (`branding/`, `docs/BRAND.md`): logos vectoriales, paleta, tipografías, plantillas de Instagram.

```
CLIENTE → compra en NovaParfum → paga (Mercado Pago) → Shopify: pedido PAGADO
  → NovaParfum Ops: orden a cada proveedor (solo sus productos + dirección del cliente)
  → proveedor envía y carga el tracking → cliente notificado → "Seguí tu pedido"
```

## Estructura
```
novaparfum/
├── README.md               ← este archivo
├── .env.example            ← todas las variables (sin valores)
├── theme/                  ← tema Shopify OS 2.0 (Liquid) — Theme Check: 0 errores
│   ├── layout/ templates/ sections/ snippets/ assets/ config/ locales/
├── app/                    ← NovaParfum Ops: webhooks, proveedores, planilla, tracking, App Proxy
│   ├── shopify.app.toml    ← permisos, webhooks y App Proxy (Shopify CLI)
│   ├── src/                ← código (sin framework, 1 dependencia: nodemailer)
│   └── test/               ← 35 pruebas + Shopify simulado
├── automations/
│   ├── notifications/      ← plantillas de email de Shopify con la marca
│   └── pixels/             ← píxel personalizado GA4 / Meta / TikTok
├── branding/
│   ├── logo/               ← logos SVG (texto en curvas), isotipo, favicon, perfil
│   ├── instagram/          ← plantillas de posts, historias y destacadas
│   ├── preview/            ← vista previa estática + capturas
│   └── generate_*.py       ← generadores reproducibles
├── data/                   ← plantilla de catálogo CSV, proveedores de respaldo
├── scripts/                ← setup, importación, descuentos, reportes, simulación, checks
└── docs/                   ← SETUP, PROVIDERS, AUTOMATIONS, MERCADOPAGO, SHIPPING, BRAND,
                              INSTAGRAM, ARCHITECTURE, SEO, ANALYTICS, BUNDLES, ADMIN,
                              SECURITY, TESTING, LAUNCH_CHECKLIST
```

## Inicio rápido (sin credenciales)
```bash
cd novaparfum/app
npm install
npm test            # 35 pruebas del flujo completo
npm run simulate    # simula una compra de punta a punta y muestra los emails a proveedores
```

## Cómo…
| Tarea | Cómo | Detalle |
|---|---|---|
| **Instalarlo** | `docs/SETUP.md` pasos 1–3 | tema + app + scripts |
| **Configurarlo** | `.env.example` → `app/.env` (o secrets del hosting) | nunca en el código |
| **Conectar Shopify** | `npx @shopify/cli@latest app config link` + `app deploy`; instalar la app; `SHOPIFY_CLIENT_ID/SECRET` | `SETUP.md` §3 |
| **Conectar Mercado Pago** | Configuración › Pagos › Mercado Pago (app oficial) › vincular cuenta | `MERCADOPAGO.md` |
| **Configurar proveedores** | Contenido › Metaobjetos › Proveedor; asignar a productos | `PROVIDERS.md` |
| **Configurar automatizaciones** | Webhooks (automáticos), Flow (4 workflows), notificaciones, cron | `AUTOMATIONS.md` |
| **Agregar productos** | Admin de Shopify, o CSV `data/catalogo-plantilla.csv` → `npm run import:products -- ../data/catalogo.csv` | una fila por tamaño |
| **Modificar precios** | Admin (edición masiva) o editar el CSV y volver a importar (actualiza por handle) | también stock y costos |
| **Configurar tracking** | URLs de operadores en `.env`; proveedores cargan el número en su portal | `SHIPPING.md` |
| **Hacer pruebas** | `npm test`, `npm run simulate`, prueba real guiada | `TESTING.md` |
| **Pasar a producción** | `DRY_RUN=false`, `/health` sin pendientes, checklist | `LAUNCH_CHECKLIST.md` |

## ESTO REQUIERE QUE EL USUARIO CONECTE SU CUENTA
No se pusieron credenciales ficticias. Queda preparado y documentado para que conectes:
| Integración | Variables / lugar |
|---|---|
| App de Shopify (Dev Dashboard) | `SHOPIFY_SHOP`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `client_id` en `shopify.app.toml` |
| Mercado Pago | Se vincula dentro de la app oficial en Shopify (sin claves en el repo); `MP_FEE_*` para márgenes |
| Email SMTP | `SMTP_*`, `EMAIL_FROM`, `ADMIN_EMAILS` |
| Google Sheets | `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` |
| Hosting de la app | `APP_URL`, `STORE_PUBLIC_URL`, `APP_SIGNING_SECRET`, `CRON_SECRET` |
| WhatsApp (opcional) | `WHATSAPP_*` + plantillas aprobadas |
| Analytics | Apps oficiales Google / Meta / TikTok, o IDs en `automations/pixels/custom-pixel.js` |
| Search Console | Verificación DNS del dominio |

`GET /health` de la app lista en todo momento qué falta conectar.

## Decisiones clave (resumen de `docs/ARCHITECTURE.md`)
- **Shopify primero**: productos, variantes, stock, costos, descuentos, bundles, notificaciones y panel son nativos. No hay panel duplicado.
- **Venta confirmada = `orders/paid` + relectura `displayFinancialStatus = PAID`**. Un pedido creado no dispara nada al proveedor.
- **Comprar ahora** = enlace permanente de carrito → checkout de Shopify con Mercado Pago (no se puede ni se debe saltear el checkout).
- **Email + portal firmado + Google Sheets** para proveedores sin API; punto de extensión para proveedores con API.
- **Google Sheets** como planilla en tiempo real (API oficial) con exportación a Excel.
- **Sin base de datos propia**: estado en metacampos/etiquetas de Shopify → simple, escalable, sin sincronizaciones.
