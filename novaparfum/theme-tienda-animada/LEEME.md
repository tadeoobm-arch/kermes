# Rediseño animado (tema "NovaParfum (animada)")

Archivos que cambian respecto del tema publicado "NovaParfum (perfumes nuevos)". El resto del tema queda igual.
Se cargaron en una copia sin publicar (ID 188900868350); el tema publicado no se tocó.

| Archivo | Qué hace |
|---|---|
| `snippets/nova-motion.liquid` | Barra de progreso, encabezado fijo con vidrio (se esconde al bajar y vuelve al subir), títulos palabra por palabra, aparición escalonada de bloques, botones con brillo y respuesta al tocar, contador de carrito que salta, preguntas que se abren suave, botones flotantes con entrada y pulso de WhatsApp. |
| `sections/brand-marquee.liquid` | Franja "Las marcas que traemos" en movimiento continuo; toma las marcas de la tienda y cada una lleva a sus perfumes. |
| `sections/perfume-hero.liquid` | Misma animación del frasco + halo de luz, destellos que suben (siguen al mouse), frasco flotando, frase y botones "Ver perfumes" / "Ofertas", indicador para bajar. |
| `layout/theme.liquid` | Carga `nova-motion` y la cursiva de Fraunces. |
| `templates/index.json` | Agrega la franja de marcas debajo de la portada y los textos/botones de la portada. |

Todo respeta "reducir movimiento" y sin JavaScript se ve todo el contenido.
Vista previa: https://pj3pch-eh.myshopify.com/?preview_theme_id=188900868350

## Carrusel "Tu próxima fragancia favorita" con las fotos anteriores
`sections/perfume-slider.liquid` (tema "NovaParfum (animada + carrusel fotos anteriores)", ID 188901327102): el carrusel
muestra la foto que cada perfume tenía antes de cargar las imágenes oficiales (la primera que no dice "imagen oficial"
en el texto alternativo). Se puede apagar en Personalizar → Carrusel de perfumes → "Usar la foto anterior".
El resto de la tienda (tarjetas, fichas de producto) sigue usando la foto oficial.

## Tarjetas sin segunda foto
`snippets/product-card.liquid` (mismo tema 188901327102): las tarjetas muestran solo la foto principal. Antes, al pasar el
mouse o tocar un perfume aparecía encima la foto anterior.

## Galería de la página de producto
`sections/main-product.liquid` (tema 188901327102): si la foto principal es la oficial, la página del perfume muestra solo esa.
Además se borraron de Shopify las 76 ilustraciones genéricas "frasco NovaParfum" de los perfumes que ya tienen foto real
(los 14 pendientes la conservan).
