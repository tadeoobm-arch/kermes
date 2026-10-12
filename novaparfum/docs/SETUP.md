# SETUP — puesta en marcha paso a paso

Tiempo estimado: 2–3 horas la primera vez. Los pasos marcados **[CONECTAR]** requieren tu cuenta
(nunca se pusieron credenciales ficticias en el código).

## 0. Requisitos
- Tienda Shopify (plan Basic o superior). Tu tienda conectada: **Nova Parfum** (`pj3pch-eh.myshopify.com`, UYU, Uruguay).
- Node.js 22.9+ y npm (para la app y los scripts). Python 3 solo si querés regenerar logos.
- Cuenta de Mercado Pago Uruguay (vendedor), cuenta de Google (Sheets), email para envíos (SMTP).

## 1. Tema de la tienda
Opción A — Shopify CLI (recomendado):
```bash
npx @shopify/cli@latest theme push --path novaparfum/theme --store pj3pch-eh --unpublished
```
Opción B — ZIP: `bash novaparfum/scripts/package-theme.sh` → Tienda online › Temas › **Agregar tema › Subir archivo zip**.

Después: *Personalizar* → revisar la home, cargar imagen del banner y (opcional) logo/favicon/redes. **Publicar** cuando esté listo.

## 2. Configuración nativa de Shopify (sin código)
1. **Configuración › Checkout**: teléfono de envío *Obligatorio*; empresa *Oculto*; apartamento *Opcional*.
   Editar textos del checkout (Temas › ⋯ › Editar contenido predeterminado): "Dirección" → **Calle y número de puerta**.
2. **Configuración › Envío y entrega**: zonas y tarifas reales (ver `SHIPPING.md`).
3. **Configuración › Pagos** **[CONECTAR]**: instalar y vincular **Mercado Pago** (ver `MERCADOPAGO.md`).
4. **Configuración › Notificaciones**: color `#4B3FA8`, logo, y pegar las plantillas de `automations/notifications/`.
5. **Configuración › Políticas**: reembolsos, privacidad, términos, envío (Shopify tiene generadores; adaptá a Uruguay).
6. **Configuración › Idiomas / Mercados**: español como idioma principal, mercado Uruguay, moneda UYU.

## 3. App de operaciones (NovaParfum Ops)
### 3.1 Crear la app en Shopify **[CONECTAR]**
```bash
cd novaparfum/app
npm install
npx @shopify/cli@latest app config link     # crea/vincula la app en el Dev Dashboard y completa client_id
```
- Editá `shopify.app.toml`: reemplazá `https://ops.TU-DOMINIO` por la URL donde vas a desplegar (paso 3.3).
- `npx @shopify/cli@latest app deploy` → publica permisos (scopes), webhooks y App Proxy.
- En el Dev Dashboard › tu app › **Instalar** en la tienda Nova Parfum (la tienda debe estar en la misma organización para usar *client credentials*).
- Copiá **Client ID** y **Client secret** (Dev Dashboard › Settings) a las variables de entorno. **Nunca** al código.

### 3.2 Variables de entorno
```bash
cp ../.env.example .env    # completar; .env está en .gitignore
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # para APP_SIGNING_SECRET y CRON_SECRET
```

### 3.3 Desplegar (cualquier hosting Node con HTTPS)
- **Render / Railway / Fly.io / Google Cloud Run**: comando de inicio `npm start`, directorio `novaparfum/app`, variables de entorno cargadas como *secrets* del hosting.
- Verificá `https://TU-APP/health` → `{"ok":true,"faltaConectar":[...]}` (la lista debe quedar vacía).
- Cron: `POST /tasks/reconcile` cada 15 min y `POST /tasks/reports` diario, con `Authorization: Bearer $CRON_SECRET`.

### 3.4 Estructura de datos y tienda (scripts idempotentes)
```bash
npm run setup:shopify     # metaobjeto Proveedor + metacampos de perfume/proveedor/pedido
npm run setup:store       # colecciones, páginas (Seguí tu pedido, Contacto, FAQ...) y menús
npm run discounts:volume -- --collection perfumes --tiers 2:10,3:15   # combos por cantidad
```
Agregá los scopes nuevos si Shopify los pide al reinstalar (navegación, páginas, publicaciones).

## 4. Filtros de colección
App gratuita **Search & Discovery** › Filtros › agregar: *Disponibilidad*, *Precio*, *Marca (Vendor)*,
*Tamaño (opción de variante)*, *Género* (metacampo `perfume.genero`), *Familia olfativa* (metacampo `perfume.familia_olfativa`).
Ahí también: sinónimos de búsqueda (p. ej. "eau de parfum, edp"), productos recomendados.

## 5. Proveedores y productos
1. Contenido › Metaobjetos › **Proveedor** › cargar tus proveedores (nombre + email) **[CONECTAR]**.
2. Productos: por planilla (`data/catalogo-plantilla.csv` → `npm run import:products -- ../data/catalogo.csv`) o desde el admin.
3. Imágenes: 1600×2000 px, fondo claro, alt descriptivo (ver `BRAND.md` §12).
4. Etiqueta `nuevo` a los lanzamientos (colección Nuevos) y elegí a mano la colección **Destacados**.

## 6. Planilla de Google Sheets **[CONECTAR]**
1. Google Cloud Console › crear proyecto › habilitar **Google Sheets API** › crear **cuenta de servicio** › clave JSON.
2. Crear una planilla vacía y **compartirla con el email de la cuenta de servicio** (Editor).
3. Variables: `GOOGLE_SHEETS_SPREADSHEET_ID` (de la URL), `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
4. `npm run setup:sheet` → crea encabezados, formato y reportes.

## 7. Email **[CONECTAR]**
Recomendado: un dominio propio (p. ej. `pedidos@novaparfum.uy`) con un proveedor SMTP (Google Workspace, Zoho, Brevo…).
Con Gmail: activar verificación en 2 pasos y crear una **contraseña de aplicación** para `SMTP_PASS`.

## 8. Shopify Flow
Instalar Shopify Flow y crear los 4 workflows de `AUTOMATIONS.md`.

## 9. Analytics
Ver `ANALYTICS.md` (apps oficiales de Google, Meta y TikTok + Search Console).

## 10. WhatsApp (opcional) **[CONECTAR]**
Meta Business › WhatsApp Manager › número + plantillas (ver `AUTOMATIONS.md`) → `WHATSAPP_*` en `.env` y `WHATSAPP_ENABLED=true`.

## 11. Probar y lanzar
`TESTING.md` y `LAUNCH_CHECKLIST.md`.
