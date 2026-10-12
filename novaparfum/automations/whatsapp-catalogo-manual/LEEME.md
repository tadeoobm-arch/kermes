# Catálogo de WhatsApp Business cargado a mano (plan B)

El 9/10/2026, la opción "Conectar un catálogo de Meta Business Suite" de la app de WhatsApp Business
seguía dando "Se produjo un error". Del lado de Meta se revisó todo y estaba bien:
- El catálogo de Shopify (3299567733571858) es de **novaparfum.uy**, y Tadeo BM tiene acceso total.
- La página Novaparfum también es de novaparfum.uy, con Tadeo BM con acceso total.
- La cuenta "NovaParfum – App de WhatsApp Business" está en el portfolio, aprobada.
- En el Administrador de WhatsApp no hay opción de catálogo para cuentas de la app.
  El estado "Sin conexión" del número se refiere a la API paga, no a la app.

Por eso los perfumes se cargan a mano.

## Archivos
- `catalogo-whatsapp.html`: página con una ficha por perfume y botones para copiar Nombre, Precio, Descripción,
  Enlace y Código, en el orden de WhatsApp. Está publicada en https://claude.ai/artifact/1j77kfh6HqSuLXzDZGDNWm
- `fotos/` y `fotos-catalogo-whatsapp.zip`: 27 fotos de 1000 × 1000 con fondo blanco. Son las de la web, menos
  Ombré Leather, que usa la foto oficial del frasco de 100 ml (SKU T5Y301).
- `perfumes.json`: los datos de cada ficha.

## Selección
Hay pocas ventas para elegir por ventas: hubo 2 pedidos en 90 días. Se eligieron los más buscados en Uruguay que
la web vende en 100 ml: 6 árabes, 11 de caballero, 8 de dama y 2 de unisex y nicho. Se dejaron afuera los que
no existen en 100 ml, como Good Girl, Black Opium, Libre, Lady Million, Baccarat Rouge 540, Layton y Delina.

## Mantenimiento
Los precios son los de Shopify del 9/10/2026. WhatsApp no se actualiza solo: si cambia un precio en Shopify,
hay que cambiarlo también en el catálogo de WhatsApp.
