# NovaParfum – rediseño premium

Tema en Shopify: **"NovaParfum (rediseño premium)"** (copia sin publicar, hecha desde "NovaParfum (envíos 48-72 h)").
Se publica desde Tienda online → Temas → Publicar. Nada se borró: las secciones viejas quedan desactivadas en `templates/index.json`.

## Archivos nuevos
| Archivo | Qué hace |
|---|---|
| `sections/hero-showcase.liquid` | Banner principal: 3 perfumes reales que rotan (Sauvage, Baccarat Rouge 540, Aventus), fondo que cambia de color, título grande con desplazamiento al hacer scroll. Se pausa con el mouse. Editable en Personalizar. |
| `sections/benefit-ticker.liquid` | Franja oscura con beneficios que se desliza (48-72 h, envío a cobrar, agencia/domicilio, Mercado Pago). |
| `sections/combo-banner.liquid` | Banner de combos con collage de 3 perfumes y porcentajes que se cuentan al aparecer. Ancla `#combos`. |
| `sections/ig-cta.liquid` | "Seguinos en Instagram" con collage de fotos de productos (o fotos propias si se cargan). Reemplaza la grilla vacía. |
| `snippets/nova-polish.liquid` | Grano sutil, menú flotante tipo isla, "Nuevo" en lila, sombras teñidas, pestañas con pastilla deslizante, vuelo al carrito, zoom en la foto, más aire entre secciones. |

## Cambios en la portada (`templates/index.json`)
- Orden: banner → franja → marcas → Hombre/Mujer/Unisex → carrusel → destacados → combos → más vendidos → beneficios → envíos → preguntas → Instagram.
- Desactivadas (no borradas): portada anterior, Instagram vacío, "Nuevos" (repetía "Más vendidos"), "Ofertas" (la colección automática "precio rebajado" tiene 0 productos porque ningún perfume tiene precio anterior cargado) y el bloque de combos anterior.

## Accesibilidad y rendimiento
- Todo respeta "reducir movimiento" del sistema.
- Solo se animan `transform` y `opacity` (salvo el ancho de la pastilla de pestañas, en un clic puntual).
- Efectos de mouse solo en computadoras (`hover: hover` y `pointer: fine`).
- Sin librerías externas.

## Portada animada (tema "NovaParfum (portada animada)")
`sections/hero-showcase.liquid` suma:
- Entrada en secuencia: "NOVA PARFUM" sube letra por letra, el círculo de luz se expande, el perfume aparece desenfocado y se enfoca, los textos entran en cascada.
- Bruma que flota detrás del frasco y "rocío" lila de partículas cada vez que cambia el perfume.
- Brillo de luz que cruza el círculo.
- Estrellitas de la marca que flotan; en computadora siguen levemente al mouse (paralaje).
- Con "reducir movimiento" no hay bruma, partículas ni rotación; la entrada es solo un fundido.
- Siempre en movimiento: el frasco flota (sube, baja y se balancea) con sombra en el piso, se inclina en 3D con el mouse,
  y una órbita de 8 perfumes de la colección "destacados" gira alrededor (por delante y por detrás). Se configura en
  Personalizar → Banner con perfumes → Órbita de perfumes (colección, cantidad, segundos por vuelta). Se detiene fuera de pantalla.
