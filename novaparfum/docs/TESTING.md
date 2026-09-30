# Pruebas

## Automáticas (sin credenciales)
```bash
cd novaparfum/app
npm install
npm test               # 34 pruebas: flujo completo con Shopify simulado en memoria
npm run simulate       # imprime la compra completa: emails a proveedores, planilla, tracking
npm run check:theme    # Theme Check oficial de Shopify (0 errores, 0 advertencias)
npm run check:secrets  # sin credenciales en el repo
```
Corren también en GitHub Actions (`.github/workflows/novaparfum.yml`).

| Caso pedido | Prueba |
|---|---|
| Crear producto | `catalog.test.js` › crear producto: productSet con metacampos, SEO y handle |
| Crear variante | `catalog.test.js` › variantes por tamaño con precio, SKU, stock y costo propios |
| Compra | `purchase-flow.test.js` › compra completa (checkout con 3 perfumes, descuento de stock) |
| Pago aprobado | `purchase-flow.test.js` › `orders/paid` → proveedores, planilla, admin, cliente |
| Pago rechazado / pendiente | `purchase-flow.test.js` › nunca se envía al proveedor; conciliación tampoco |
| Pedido cancelado | `purchase-flow.test.js` › antes y después de avisar al proveedor ("NO ENVIAR") |
| Pedido enviado | portal del proveedor → fulfillment solo con sus líneas, email nativo de Shopify |
| Tracking | URL del operador configurado, sin URL inventada si no está configurado, idempotente |
| División por proveedor | `suppliers-margins.test.js` › pedido #1050 (A: 1 y 2, B: 3) y compra completa |
| Actualización de planilla | filas por producto, upsert sin duplicar, sin pisar datos manuales, fecha/hora de Montevideo |
| Notificación | textos de marca, WhatsApp solo cuando el estado avanza |
| Seguimiento del cliente | número + email/teléfono (formatos uruguayos), respuesta genérica, sin dirección |
| Seguridad | HMAC de webhooks, firma de App Proxy, links firmados, rate-limit, logs sin credenciales |
| Márgenes | comisión MP + IVA, envío por proveedor, suma de líneas = pedido, costo faltante → vacío |
| Reportes | diario/mensual/proveedor/producto solo con pagados y sin cancelados |

## Prueba real en la tienda (antes de lanzar)
Usá `DRY_RUN=true` primero (no envía emails, solo registra) y después `DRY_RUN=false`.
1. Crear un producto de prueba "TEST — no comprar" con 2 variantes (precio bajo) y proveedor = un proveedor de prueba con **tu propio email**.
2. Desde el celular: ficha → **Comprar ahora** → debe abrir el checkout solo con ese producto.
3. Completar datos (dirección sin número para probar la alerta) y pagar con Mercado Pago.
4. Verificar:
   - [ ] Email de Shopify "Confirmación del pedido".
   - [ ] Email "¡Pago confirmado!" (app) y email "Venta pagada" (admin, con margen).
   - [ ] Email al proveedor de prueba con solo sus productos y el link del portal.
   - [ ] Planilla: filas del pedido en "Pagado / Preparando pedido".
   - [ ] Pedido con etiquetas `np-pagado`, `np-proveedor-notificado`, `estado:preparando`.
5. En el portal: cargar DAC + número → email nativo "Pedido enviado", planilla con tracking, "Seguí tu pedido" en ENVIADO.
6. "Marcar como entregado" → email "Entregado", estado ENTREGADO.
7. Repetir con 2 productos de proveedores distintos → 2 emails, 2 envíos.
8. Pago en efectivo (si lo ofrecés) → el proveedor NO recibe nada hasta la acreditación.
9. Cancelar un pedido de prueba → proveedor recibe "NO ENVIAR"; reembolsar desde Shopify.
10. Borrar/archivar el producto de prueba.
