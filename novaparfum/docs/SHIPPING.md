# Envíos y seguimiento

## Modelo
El **proveedor** despacha el paquete directamente al cliente. NovaParfum no asume ninguna empresa:
cada envío registra empresa + número + link, y el sistema está preparado para DAC, UES, Mirtrans,
Correo Uruguayo u otros operadores.

## Configurar tarifas en Shopify (sin código)
Configuración › **Envío y entrega** › Perfil general:
- Zona **Montevideo** (Departamento = Montevideo) y zona **Interior** (resto de Uruguay), con tarifas fijas o gratis desde cierto monto.
- Si Shopify no lista los departamentos de Uruguay como regiones en tu versión del admin, usá una sola zona "Uruguay" y diferenciá con tarifas por precio/peso.
- Tiempos: escribí plazos reales (los del proveedor + operador) en el nombre de la tarifa, p. ej. "Envío a domicilio (2 a 4 días hábiles)".

## Datos del cliente (checkout)
Configuración › **Checkout**:
- Teléfono de la dirección de envío: **Obligatorio**.
- Apellido: obligatorio. Empresa: oculto. Dirección 2 (apartamento): opcional.
- Tienda online › Temas › ⋯ › **Editar contenido predeterminado del tema** › *Checkout*: renombrar "Dirección" a
  **"Calle y número de puerta"** y "Apartamento, local, etc." a **"Apartamento / Torre / Unidad"**.
- Observaciones de entrega: campo del **carrito** (se guarda como nota del pedido y llega al proveedor).

Mapeo al pedido: Nombre/Apellido, Email, Teléfono, **Departamento** (provincia/región), Ciudad, Dirección (calle + número),
Apartamento, Código postal, Observaciones → todos quedan en el pedido de Shopify y en la planilla.

## Flujo de tracking
```
Proveedor recibe email "Nuevo pedido PAGADO #1045"
   └─ toca "Informar envío y seguimiento" (link firmado, sin contraseña, válido 60 días)
        └─ elige empresa (DAC / UES / Mirtrans / Correo Uruguayo / Otro) + número (+ link opcional)
             └─ la app crea el fulfillment en Shopify SOLO con las líneas de ese proveedor
                  ├─ Shopify envía el email nativo "¡Tu pedido ya fue enviado! 📦" con el número
                  ├─ webhook fulfillments/create → estado ENVIADO + planilla + WhatsApp (opcional)
                  └─ el cliente lo ve en "Seguí tu pedido"
```
Alternativa manual: en el admin de Shopify › pedido › **Preparar pedido** (Mark as fulfilled) › cargar empresa y número.
El resto (planilla, estados, avisos) funciona igual porque se basa en los webhooks.

## Entregado / en tránsito
- El proveedor puede tocar **"Marcar como entregado"** en el mismo portal → `fulfillmentEventCreate(DELIVERED)` → Shopify envía el email nativo "Entregado".
- Desde el admin también se pueden agregar eventos de seguimiento.
- Si en el futuro un operador ofrece API o webhooks, se agrega un adaptador que llame a `markInTransit` / `markDelivered` (`app/src/services/fulfillment.js`).

## Links de seguimiento por operador
No se inventan URLs. Configurá la URL pública de rastreo de cada operador con `{tracking}` en `app/.env`:
```
CARRIER_TRACKING_URL_DAC=https://…{tracking}
CARRIER_TRACKING_URL_UES=https://…{tracking}
CARRIER_TRACKING_URL_MIRTRANS=https://…{tracking}
CARRIER_TRACKING_URL_CORREO_UY=https://…{tracking}
```
Si queda vacía, el cliente ve empresa + número (y el proveedor puede pegar un link manual).
Agregar un operador nuevo: sumarlo a `CARRIERS` en `app/src/domain/carriers.js` + su variable `CARRIER_TRACKING_URL_<CODIGO>`.

## Estados que ve el cliente
PEDIDO RECIBIDO → PAGO CONFIRMADO → PREPARANDO PEDIDO → ENVIADO → EN TRÁNSITO → ENTREGADO (o CANCELADO).
Los estados nunca retroceden y se guardan en el metacampo `novaparfum.estado` + etiqueta `estado:*` del pedido.

## Página "Seguí tu pedido"
- Página `/pages/segui-tu-pedido` (plantilla `page.seguimiento`), creada por `npm run setup:store`.
- Consulta con **número de pedido + email o teléfono** (acepta `099 123 456`, `+598 99 123 456`, etc.).
- Muestra: número de pedido, productos, estado actual con línea de tiempo, empresa, número y link de seguimiento, fecha estimada si el operador la informa.
- No muestra dirección ni montos; responde el mismo mensaje genérico si los datos no coinciden (evita adivinar pedidos ajenos); limita 20 consultas cada 10 min por IP.
- Funciona vía **App Proxy** (`/apps/novaparfum/track`), firmado por Shopify: requiere que la app esté desplegada e instalada.
