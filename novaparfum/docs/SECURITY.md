# Seguridad

## Credenciales
- **Ninguna** credencial en el repositorio: todo por variables de entorno (`.env` local en `.gitignore` o *secrets* del hosting).
- `.env.example` solo tiene nombres de variables vacías.
- `npm run check:secrets` busca tokens de Shopify (`shpat_`, `shpss_`), Mercado Pago (`APP_USR-`), claves privadas, API keys de Google y tokens de Meta. Corre también en CI (`.github/workflows/novaparfum.yml`).
- Mercado Pago se vincula por OAuth dentro de su app oficial: no hay claves de Mercado Pago en ningún archivo.
- Shopify: *client credentials* (token de 24 h en memoria, nunca en disco ni logs).

## Logs
`app/src/logger.js` redacta claves sensibles (`token`, `secret`, `password`, `authorization`, `pass`, …) y valores con forma de
credencial (`shpat_…`, `APP_USR-…`, `Bearer …`, claves PEM). Hay una prueba automática que lo verifica.

## Entradas externas
| Entrada | Protección |
|---|---|
| Webhooks | HMAC-SHA256 del cuerpo crudo con el client secret, comparación en tiempo constante; deduplicación por `X-Shopify-Webhook-Id`; se relee el pedido desde la API (no se confía en el payload) |
| App Proxy (Seguí tu pedido) | Firma de Shopify verificada; rate-limit por IP; respuesta genérica si no coincide; sin dirección ni montos |
| Portal de proveedores | Link firmado HMAC con vencimiento (60 días) que solo permite ver/operar las líneas de ese proveedor; un proveedor no puede marcar entregado un envío ajeno (probado) |
| Tareas programadas | `Authorization: Bearer CRON_SECRET`, comparación en tiempo constante |
| Planilla | Escritura `RAW` (sin inyección de fórmulas); CSV exportado con prefijo `'` para celdas que empiezan con `= + - @` |
| HTML de emails/portal | Todo dato del cliente se escapa (`escapeHtml`) |

## Datos personales
- Los proveedores reciben solo lo necesario para entregar (nombre, teléfono, dirección, productos). Sin precios ni email del cliente.
- La planilla no se comparte con proveedores.
- Tratamiento de datos: publicar la política de privacidad conforme a la Ley 18.331 de Protección de Datos Personales (Uruguay).

## Buenas prácticas operativas
- Activar 2FA en Shopify, Mercado Pago, Google y Meta.
- Rotar `SHOPIFY_CLIENT_SECRET`, `APP_SIGNING_SECRET` y `CRON_SECRET` si alguien deja el equipo (rotar `APP_SIGNING_SECRET` invalida los links de portal vigentes).
- Dar a colaboradores permisos de *staff* en Shopify por rol, no la cuenta del dueño.
