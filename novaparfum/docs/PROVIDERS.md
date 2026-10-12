# Proveedores

## Estructura
Cada proveedor es una entrada del metaobjeto **Proveedor** en Shopify (Contenido › Metaobjetos › Proveedor),
creado por `npm run setup:shopify`:

| Campo | Ejemplo | Uso |
|---|---|---|
| Nombre | Proveedor A | Encabezado de la orden y planilla |
| Email de pedidos | pedidos@proveedor-a.com | Destino de la orden automática |
| WhatsApp | 099123456 | Aviso opcional (plantilla de WhatsApp) |
| Método / empresa de envío | DAC | Referencia interna |
| Tiempo de preparación (días) | 1 | Referencia para plazos publicados |
| Costo de envío por paquete | 150 | Cálculo de margen (si NovaParfum lo paga) |
| Activo | Sí | Control interno |
| Notas internas | Horario de retiro… | Solo admin |

Por producto (Productos › ficha › Metacampos):
- **Proveedor** (`proveedor.proveedor`): a quién le corresponde el producto.
- Por variante: **Proveedor (si difiere del producto)** y **SKU del proveedor** (`proveedor.sku_proveedor`).
- **Costo**: campo nativo *Costo por artículo* de cada variante.

Los datos de proveedores **viven en Shopify**, no en el repositorio (el repo puede ser público).

## ¿Cómo se identifica el proveedor de cada línea?
Orden de prioridad (`app/src/domain/suppliers.js`):
1. Proveedor de la **variante** → 2. proveedor del **producto** → 3. `data/suppliers.json` por **prefijo de SKU**
→ 4. por **marca** (vendor) → 5. proveedor **por defecto** → si no hay: grupo *SIN_PROVEEDOR*, pedido etiquetado `np-revisar` y alerta al admin.

`data/suppliers.json` es solo un respaldo (útil para migraciones masivas). Ver `data/suppliers.example.json`.

## División automática por proveedor
Pedido #1050 con Perfume 1 y 2 (Proveedor A) + Perfume 3 (Proveedor B):
- Proveedor A recibe **solo** Perfume 1 y 2; Proveedor B **solo** Perfume 3.
- Ninguno ve precios, costos, márgenes ni productos del otro.
- Cada uno recibe su propio link de portal y carga su propio tracking → Shopify crea **un fulfillment por proveedor**
  y el cliente recibe un aviso por paquete.

Ejemplo real de email generado (salida de `npm run simulate`):
```
PEDIDO NOVAPARFUM #1045
Proveedor: Proveedor B

Cliente:
Juan Pérez

Teléfono:
+598 99 123 456

Dirección:
Av. Brasil 1234
Apto/Unidad 302
Montevideo, Montevideo
CP 11300
Uruguay

Producto:
Otra Marca Cedro Azul

Tamaño:
100 ml

Cantidad:
1

SKU:
NP-CED-100

Observaciones:
Apartamento 302 · Tocar timbre 302

Estado:
PAGADO

Informá el envío y número de seguimiento acá:
https://ops.tu-dominio/proveedor/…
```

## Canal de comunicación con el proveedor — análisis
| Opción | Confiabilidad | Costo | Decisión |
|---|---|---|---|
| **Email automático** | Alta (registro, adjuntable, universal) | Bajo | ✅ Canal principal |
| **Portal con link firmado** | Alta (el proveedor responde con datos estructurados) | Bajo | ✅ Para tracking/entrega |
| **Google Sheets** (planilla interna) | Alta | Gratis | ✅ Registro operativo (no se comparte con proveedores: contiene márgenes) |
| WhatsApp Business API | Alta, pero requiere plantillas aprobadas y costo por conversación | Medio | ⚙️ Preparado, opcional |
| Excel | No se actualiza en tiempo real vía API sin Microsoft 365/Graph | — | Export desde Sheets |
| Webhook / API del proveedor | Ideal si el proveedor la tiene | Variable | 🔌 Punto de extensión (ver abajo) |
| Sistema interno propio | Duplicaría el admin de Shopify | Alto | ❌ |

**Conclusión:** email + portal + planilla (la "solución intermedia" robusta cuando el proveedor no tiene API).

## Si un proveedor tiene API
Agregar en `handleOrderPaid` (`app/src/services/orders.js`) un envío alternativo cuando el metaobjeto
tenga un campo `api_url` (agregarlo al metaobjeto), usando `buildSupplierOrder(...).products` como payload.
Guardar credenciales del proveedor SOLO como variables de entorno.

## Agregar un proveedor (paso a paso)
1. Contenido › Metaobjetos › **Proveedor** › Agregar entrada → completar nombre y email.
2. Asignarlo a sus productos (edición masiva: Productos › seleccionar › *Editar productos* › columna Proveedor).
3. Cargar *Costo por artículo* y *SKU del proveedor* en cada variante.
4. Hacer una compra de prueba (ver `docs/TESTING.md`).
