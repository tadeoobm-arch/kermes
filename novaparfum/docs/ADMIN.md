# Panel administrativo — qué usar para cada cosa

No se construyó un panel duplicado: Shopify ya administra casi todo. Solo se agregaron las piezas que faltaban.

| Tarea | Dónde | Notas |
|---|---|---|
| Productos, fotos, descripción | Shopify › Productos | Edición masiva: seleccionar › *Editar productos* |
| Precios y precio anterior | Shopify › Productos (o CSV + `npm run import:products`) | Idempotente por handle |
| Stock | Shopify › Productos › Inventario | Por variante (30/50/100 ml) |
| Costos | Campo **Costo por artículo** de cada variante | Base del cálculo de margen |
| Pedidos | Shopify › Pedidos | Filtrar por etiquetas `estado:*`, `np-revisar`, `np-pagado` |
| Proveedores | Shopify › Contenido › Metaobjetos › **Proveedor** | Email, WhatsApp, envío, preparación |
| Seguimientos | Portal del proveedor (link en su email) o pedido › Preparar | Crea el fulfillment con tracking |
| Márgenes y ventas | Google Sheets: *Pedidos*, *Resumen diario*, *Resumen mensual*, *Por proveedor*, *Por producto* | `POST /tasks/reports` o `npm run reports` |
| Ventas (panorama) | Shopify › Estadísticas | Informes nativos |
| Descuentos y combos | Shopify › Descuentos | Ver `BUNDLES.md` |
| Estado de la integración | `https://TU-APP/health` | Lista lo que falta conectar |

## Vistas guardadas recomendadas en Pedidos
- **Pagados sin enviar:** etiqueta `np-pagado` y estado de preparación *No preparado*.
- **Revisar:** etiqueta `np-revisar` (producto sin proveedor, proveedor sin email o dirección incompleta).
- **Pendientes de pago:** estado de pago *Pendiente* (efectivo en redes de cobranza).

## Margen: cómo se calcula
```
ganancia = venta (con descuentos) + envío cobrado
         − costo del proveedor (Costo por artículo × cantidad)
         − comisión Mercado Pago (MP_FEE_PERCENT + MP_FEE_FIXED + IVA de la comisión)
         − costo de envío pagado por NovaParfum (por paquete de proveedor)
         − IVA de la venta (solo si configurás SALES_VAT_PERCENT)
```
- Por producto: columna **Margen** de la planilla (incluye su parte proporcional de comisión y envío).
- Por pedido: suma de sus líneas (igual al email "Venta pagada").
- Diaria / mensual: pestañas de reportes.
- Si falta el costo de algún producto, el margen queda **vacío** (no se inventa ganancia) y el email lo avisa.
