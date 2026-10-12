# Email de pago abandonado (Shopify Messaging)

Activado el 8/10/2026 por la persona dueña de la tienda, en Apps → Messaging → Automatizaciones →
"Recupera el pedido abandonado" (desencadenante: Customer abandons checkout).

Configuración:
- **Para:** Todos los clientes (antes: solo suscriptos a email marketing; por eso la ejecución del 30/9 no envió nada).
- **Asunto:** ¿Te olvidaste algo? Tu perfume te está esperando ✨
- **Vista previa:** Guardamos tu carrito. Terminá tu compra en un clic.
- **Cuerpo:** plantilla de Shopify en español ("¿Todo listo para pagar?", "Hemos guardado tu pedido", "Completar pedido").
- **Marca:** logo `novaparfum-logo-email.png` (tamaño 65), Georgia, texto y botones #2F2A4A, etiquetas #F7F4F0,
  pie #2F2A4A, dirección oculta.
- Sin descuento por ahora.

En modo oscuro del celular, Gmail y Mail cambian los colores solos (fondo gris oscuro, fotos con fondo blanco como
recuadros). No se controla desde Shopify.

Recuperación manual por WhatsApp: Pedidos → Pagos abandonados → abrir uno → escribir al teléfono del cliente.
Shopify borra los pagos abandonados de más de 3 meses.

La API de Shopify no permite crear ni editar estas automatizaciones: se hace a mano en Messaging.
