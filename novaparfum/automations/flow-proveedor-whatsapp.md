# Aviso de venta al proveedor por WhatsApp (Shopify Flow, sin costo)

Probado y funcionando el 6/10/2026 con el pedido #1001.

## Cómo funciona
1. Una venta queda **pagada** → Flow (activador "Order paid") manda un email interno a la dueña/o de la tienda.
2. El email trae el pedido (perfumes, cliente, teléfono, dirección) y un link `https://wa.me/<número>?text=...`.
3. Al tocar el link desde el celular se abre WhatsApp (personal) en el chat del proveedor con el mensaje ya escrito → **Enviar**.

Sin servidor, sin WhatsApp Business API y sin costo. Un toque por venta.

## Configuración en Flow
- Activador: **Order paid**
- Acción: **Send internal email**
  - To: email de la tienda
  - Subject: `🟣 Venta pagada {{order.name}}: mandásela al proveedor`
  - Message:
```
Entró una venta pagada: {{order.name}}

Perfumes:
{% for li in order.lineItems %}- {{li.title}} {{li.variantTitle}} x{{li.quantity}}
{% endfor %}
Cliente: {{order.shippingAddress.name}}
Teléfono: {{order.shippingAddress.phone}}
Dirección: {{order.shippingAddress.address1}} {{order.shippingAddress.address2}}, {{order.shippingAddress.city}}, {{order.shippingAddress.province}}

Tocá este link para mandárselo al proveedor por WhatsApp:
https://wa.me/598XXXXXXXX?text=Nuevo%20pedido%20{{order.name | url_encode}}%20-%20pagado%0A%0AEnviar%3A%0A{% for li in order.lineItems %}-%20{{li.title | url_encode}}%20{{li.variantTitle | url_encode}}%20x{{li.quantity}}%0A{% endfor %}%0ACliente%3A%20{{order.shippingAddress.name | url_encode}}%0ATel%3A%20{{order.shippingAddress.phone | url_encode}}%0ADirecci%C3%B3n%3A%20{{order.shippingAddress.address1 | url_encode}}%20{{order.shippingAddress.address2 | url_encode}}%2C%20{{order.shippingAddress.city | url_encode}}%2C%20{{order.shippingAddress.province | url_encode}}
```
`598XXXXXXXX` = WhatsApp del proveedor con 598 adelante y sin el 0 inicial.

## Cambiar de proveedor
Flow → abrir el flujo → acción "Send internal email" → cambiar el número en la línea `https://wa.me/...`.

## Más adelante (opcional)
Envío 100 % automático sin tocar nada: WhatsApp Business API (pago por mensaje) + la app `novaparfum/app`
desplegada en un servidor. Ver `docs/AUTOMATIONS.md`.
