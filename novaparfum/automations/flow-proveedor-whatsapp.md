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
{% for a in order.customAttributes %}{{a.key}}: {{a.value}}
{% endfor %}Envío: A COBRAR (lo paga el cliente al recibir/retirar)

Tocá este link para mandárselo al proveedor por WhatsApp:
https://wa.me/598XXXXXXXX?text=Nuevo%20pedido%20{{order.name | url_encode}}%20-%20pagado%0A%0AEnviar%3A%0A{% for li in order.lineItems %}-%20{{li.title | url_encode}}%20{{li.variantTitle | url_encode}}%20x{{li.quantity}}%0A{% endfor %}%0ACliente%3A%20{{order.shippingAddress.name | url_encode}}%0ATel%3A%20{{order.shippingAddress.phone | url_encode}}%0ADirecci%C3%B3n%3A%20{{order.shippingAddress.address1 | url_encode}}%20{{order.shippingAddress.address2 | url_encode}}%2C%20{{order.shippingAddress.city | url_encode}}%2C%20{{order.shippingAddress.province | url_encode}}%0A{% for a in order.customAttributes %}{{a.key | url_encode}}%3A%20{{a.value | url_encode}}%0A{% endfor %}Env%C3%ADo%3A%20A%20COBRAR
```
`598XXXXXXXX` = WhatsApp del proveedor con 598 adelante y sin el 0 inicial.

## Cambiar de proveedor
Flow → abrir el flujo → acción "Send internal email" → cambiar el número en la línea `https://wa.me/...`.

## Más adelante (opcional)
Envío 100 % automático sin tocar nada: WhatsApp Business API (pago por mensaje) + la app `novaparfum/app`
desplegada en un servidor. Ver `docs/AUTOMATIONS.md`.


## Cédula, modalidad de entrega y envío a cobrar

- En el **carrito** se pide la cédula (obligatoria, se valida el dígito verificador) y cómo recibirlo:
  *Envío a domicilio* o *Retiro en agencia* (con agencia y localidad). "Comprar ahora" también pasa por el carrito.
- Se guardan como atributos del pedido: `Cédula`, `Entrega`, `Agencia`. En Flow: `order.customAttributes` (`key` / `value`).
- La tarifa de envío de Uruguay es **$0 – "Envío a cobrar (lo pagás al recibir o al retirar en agencia)"**: el cliente paga el envío a la agencia al recibir o retirar.

## Versión final de los dos emails (con cédula) · 8/10/2026

El flujo queda: **Order paid → Send internal email (a la tienda) → Send internal email (al proveedor)**.
Los datos `Cédula`, `Entrega` y `Agencia` vienen del carrito como `order.customAttributes`; los vacíos (por ejemplo,
`Agencia` cuando es envío a domicilio) no se muestran.

### Email 1 · a la tienda (con el link de WhatsApp al proveedor)
```
Entró una venta pagada: {{order.name}}

Perfumes:
{% for li in order.lineItems %}- {{li.title}} {{li.variantTitle}} x{{li.quantity}}
{% endfor %}
Cliente: {{order.shippingAddress.name}}
Teléfono: {{order.shippingAddress.phone}}
Dirección: {{order.shippingAddress.address1}} {{order.shippingAddress.address2}}, {{order.shippingAddress.city}}, {{order.shippingAddress.province}}
{% for a in order.customAttributes %}{% if a.value != "" %}{{a.key}}: {{a.value}}
{% endif %}{% endfor %}Envío: A COBRAR (lo paga el cliente al recibir o retirar)

Tocá este link para mandárselo al proveedor por WhatsApp:
https://wa.me/598XXXXXXXX?text=Nuevo%20pedido%20{{order.name | url_encode}}%20-%20pagado%0A%0AEnviar%3A%0A{% for li in order.lineItems %}-%20{{li.title | url_encode}}%20{{li.variantTitle | url_encode}}%20x{{li.quantity}}%0A{% endfor %}%0ACliente%3A%20{{order.shippingAddress.name | url_encode}}%0ATel%3A%20{{order.shippingAddress.phone | url_encode}}%0ADirecci%C3%B3n%3A%20{{order.shippingAddress.address1 | url_encode}}%20{{order.shippingAddress.address2 | url_encode}}%2C%20{{order.shippingAddress.city | url_encode}}%2C%20{{order.shippingAddress.province | url_encode}}%0A{% for a in order.customAttributes %}{% if a.value != "" %}{{a.key | url_encode}}%3A%20{{a.value | url_encode}}%0A{% endif %}{% endfor %}Env%C3%ADo%3A%20A%20COBRAR
```
(`598XXXXXXXX` = WhatsApp del proveedor, con 598 y sin el 0 inicial. La línea del link va entera, sin cortes.)

### Email 2 · al proveedor (respaldo)
Asunto: `Nuevo pedido {{order.name}} - NovaParfum`
```
Hola, entró un nuevo pedido pagado en NovaParfum.

Pedido: {{order.name}}

Enviar:
{% for li in order.lineItems %}- {{li.title}} {{li.variantTitle}} x{{li.quantity}}
{% endfor %}
Cliente: {{order.shippingAddress.name}}
Teléfono: {{order.shippingAddress.phone}}
Dirección: {{order.shippingAddress.address1}} {{order.shippingAddress.address2}}
Ciudad: {{order.shippingAddress.city}}, {{order.shippingAddress.province}}
{% for a in order.customAttributes %}{% if a.value != "" %}{{a.key}}: {{a.value}}
{% endif %}{% endfor %}
Envío: A COBRAR. El cliente lo paga al recibirlo o al retirarlo en la agencia.

Entrega en 48 a 72 horas. Cuando lo despaches, avisanos por WhatsApp la empresa y el número de seguimiento.

Gracias,
NovaParfum
```
