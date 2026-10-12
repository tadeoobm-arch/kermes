# Mercado Pago en NovaParfum (Shopify · Uruguay)

## Resumen de la decisión
| Opción analizada | ¿Sirve en Shopify? | Decisión |
|---|---|---|
| **Mercado Pago Checkout Pro** (app oficial de Mercado Pago para Shopify) | Sí. Es la integración oficial: el cliente elige Mercado Pago en el checkout de Shopify, paga en el entorno de Mercado Pago (tarjetas con o sin cuotas, débito, efectivo en redes de cobranza, dinero en cuenta) y vuelve automáticamente a la tienda. Shopify recibe el resultado y marca el pedido. | ✅ **Usar** |
| Mercado Pago "Tarjetas" / Checkout API (pago con tarjeta dentro del checkout) | Mercado Pago ofrece una variante de tarjetas para Shopify en algunos países. **Verificá en tu admin si aparece para Uruguay**; si aparece, se puede activar además de Checkout Pro. | ⚠️ Opcional, según disponibilidad |
| Checkout API / Bricks propios en el tema o en una app | **No**. Shopify no permite cobrar fuera de su checkout con un proveedor no aprobado; sería inseguro (datos de tarjeta en tu código) y rompería la conciliación de pedidos. | ❌ Descartado |
| Link de pago de Mercado Pago manual | Posible, pero el pedido no queda pagado en Shopify automáticamente. | ❌ Solo para ventas por WhatsApp fuera de la web |

Fuentes: documentación de Mercado Pago Developers para Shopify (Checkout Pro y Tarjetas) y página de
Mercado Pago Uruguay "Vender con Shopify". Las tarifas y medios dependen de tu cuenta: verificá en tu panel.

## "Comprar ahora" → checkout con Mercado Pago visible
1. En la ficha, **Comprar ahora** abre el checkout de Shopify **solo con ese producto** (enlace permanente `/cart/{variante}:{cantidad}`).
   Sin JavaScript, el botón agrega al carrito y redirige a `/checkout`.
2. El cliente completa email, teléfono y dirección (una sola pantalla en celular) y elige envío.
3. En **Pago**, Mercado Pago aparece como medio de pago → redirección a Mercado Pago → vuelve a la tienda.
4. Mercado Pago está **visible antes del checkout**: bloque "Pagá seguro con Mercado Pago" en producto y carrito, barra de anuncio, beneficios de la home y FAQ.

No existe una forma oficial y segura de saltear el checkout de Shopify en una tienda Shopify; esta es la alternativa oficial más corta.
**Tip:** en Configuración › Checkout activá "Checkout de una página" (por defecto en tiendas nuevas) y dejá **solo los campos necesarios**.

## Instalación (ESTO REQUIERE QUE EL USUARIO CONECTE SU CUENTA)
1. Tener cuenta de **Mercado Pago Uruguay** (vendedor) con identidad verificada.
2. Shopify admin › **Configuración › Pagos** › *Agregar métodos de pago* / proveedores externos › buscar **Mercado Pago** › instalar la app oficial.
3. Dentro de la app, **vincular la cuenta** de Mercado Pago (inicio de sesión de Mercado Pago; no se copian claves a este repositorio).
4. Configurar en Mercado Pago: cuotas ofrecidas, medios habilitados, plazo de acreditación (define la comisión).
5. Volver a Configuración › Pagos y confirmar que Mercado Pago figura **activo**.
6. Completar `MP_FEE_PERCENT` y `MP_FEE_VAT_PERCENT` en `app/.env` con tu tarifa real (para calcular márgenes).
   Si Shopify cobra una comisión de transacción por usar un proveedor externo en tu plan, sumala a `MP_FEE_PERCENT` (se ve en Configuración › Pagos).

## Detección de "PEDIDO CREADO" vs "PEDIDO PAGADO"
| Situación en Mercado Pago | En Shopify | En NovaParfum |
|---|---|---|
| Pago aprobado con tarjeta/dinero en cuenta | Pedido creado y **Pagado** → webhook `orders/paid` | PAGO CONFIRMADO → órdenes a proveedores |
| Pago en efectivo (redes de cobranza) generado, aún no pagado | Pedido creado con pago **Pendiente** → `orders/create` | PEDIDO RECIBIDO. **No** se avisa al proveedor |
| El cliente paga el efectivo días después | Shopify marca **Pagado** → `orders/paid` | Recién ahí se envía al proveedor |
| Pago rechazado | Mercado Pago muestra el rechazo y el cliente vuelve al checkout (normalmente no se crea pedido; si existiera, no queda pagado) | Nada se envía |
| Pago pendiente que vence / se anula | El pedido queda sin pagar o se cancela | CANCELADO (si se cancela); proveedor nunca notificado |

La app **nunca** confía solo en el evento: siempre relee el pedido y exige `displayFinancialStatus = PAID`
(`app/src/domain/status.js`). Además, la conciliación cada 15 min recupera pagos acreditados cuyo webhook se haya perdido.

## Seguridad
- No se guardan Access Tokens ni claves de Mercado Pago en el código: la vinculación es OAuth dentro de la app oficial.
- NovaParfum nunca ve datos de tarjetas (los procesa Mercado Pago).
- `npm run check:secrets` detecta tokens `APP_USR-…` si alguien los pegara por error en el repositorio.

## Pruebas
1. Configuración › Pagos › Mercado Pago: usar el **modo de prueba / credenciales de prueba** que ofrezca la app de Mercado Pago (si lo ofrece) o hacer una compra real de bajo valor y reembolsarla.
2. Verificar en la planilla: fila con "Pendiente" al crear, luego "Pagado"; email al proveedor solo después del pago.
3. Probar un pago en efectivo: la orden al proveedor debe llegar recién cuando se acredita.
