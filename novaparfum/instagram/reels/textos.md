# Reels de productos (@novaparfum.uy)

Videos de 1080 × 1920, 30 cuadros por segundo, 13,6 segundos, **sin música**: la música se elige en Instagram al subirlos.
Generados con `generar.mjs` (Playwright + ffmpeg) a partir de recortes de las fotos de los frascos.

- Todos los frascos son fotos de la presentación de **100 ml**, verificadas así:
  - por el archivo de la foto, que dice 3.3 oz, 3.4 oz o 3-4fl-oz;
  - por la caja de la foto, que dice 100 ml;
  - o porque la marca solo lo hace en 100 ml (los árabes).
- Cada producto lleva el sello "100 ml" y "100 ml" al lado del precio.
- Las familias olfativas salen de la descripción de Shopify. Eros EDP no tiene descripción, por eso lleva "Eau de Parfum".
- Precios de Shopify del 10/10/2026. Si cambia un precio, hay que cambiarlo en `generar.mjs` y volver a generar.

## 1. reel-1-arabes.mp4
```
¿Perfume árabe a menos de $ 3.500? Sí, y en 100 ml.

Lattafa Yara $ 3.300 · Lattafa Asad $ 3.200 · Rasasi Hawas Ice $ 4.390 · Armaf Odyssey Homme $ 3.700.
Pagás con Mercado Pago y te llega en 48 a 72 horas a todo Uruguay.

Link en el perfil 🛍️

#perfumesarabes #lattafa #perfumesuruguay #perfumesmontevideo
```

## 2. reel-2-para-el.mp4
```
4 clásicos para él, todos en 100 ml.

Armani Acqua di Giò $ 6.990 · Versace Eros EDP $ 7.490 · Valentino Uomo Born in Roma $ 9.100 · Bleu de Chanel $ 10.200.
¿Cuál es el tuyo? Contanos en los comentarios.

Pagás con Mercado Pago y te llega en 48 a 72 horas a todo Uruguay. Link en el perfil.

#perfumeshombre #perfumesuruguay #perfumesmontevideo #fragancias
```

## 3. reel-3-para-ella.mp4
```
4 clásicos para ella, todos en 100 ml.

Calvin Klein Euphoria $ 5.950 · Lancôme La Vie Est Belle $ 9.100 · Valentino Donna Born in Roma $ 9.650 · Chanel Coco Mademoiselle $ 10.500.
Etiquetá a quien le regalarías uno 💌

Pagás con Mercado Pago y te llega en 48 a 72 horas a todo Uruguay. Link en el perfil.

#perfumesmujer #perfumesuruguay #perfumesmontevideo #fragancias
```

## 4. reel-4-nicho.mp4 (sin precios, 15,9 s)
Creed Aventus, Xerjoff Naxos, Le Labo Santal 33, Amouage Guidance y Kilian Angels' Share.

Las fotos de 100 ml están verificadas en `../historia-nicho/LEEME.md`. Las familias olfativas salen de la descripción de Shopify.
```
Perfumes de nicho, en Uruguay. Todos en 100 ml.

Creed Aventus · Xerjoff Naxos · Le Labo Santal 33 · Amouage Guidance · Kilian Angels' Share.
¿Cuál te llevás? Precios en la web, link en el perfil.

Pagás con Mercado Pago y te llega en 48 a 72 horas a todo Uruguay.

#perfumesdenicho #perfumesuruguay #perfumesmontevideo #fragancias
```

## 5. reel-5-cual-elegis.mp4 (dinámico, 8,8 s, `generar-dinamico.mjs`)
- Gancho "¿Cuál elegís? Comentá el número 👇".
- 8 perfumes numerados, medio segundo cada uno, con el fondo cambiando de color en cada corte.
- Grilla final con los 8 para que la gente pause y comente. El final se funde con el principio para que el loop empalme.

Todos son fotos verificadas de 100 ml y llevan el sello "100 ml". A Eros EDP se le recortó el reflejo blanco de la base.

```
¿Cuál elegís? Comentá el número 👇

1 Creed Aventus · 2 Lattafa Yara · 3 Chanel Coco Mademoiselle · 4 Kilian Angels' Share · 5 Versace Eros EDP · 6 Xerjoff Naxos · 7 Lancôme La Vie Est Belle · 8 Bleu de Chanel

Todos en 100 ml, con envío a todo Uruguay. Link en el perfil.
Guardalo para tu próximo regalo 🎁

#perfumes #perfumesuruguay #perfumesmontevideo #fragancias
```

## 6. reel-6-cual-elegis-2.mp4 (dinámico, 8,8 s, `generar-dinamico.mjs reel-6-cual-elegis-2`)
Mismo formato que el 5, con 8 perfumes que no aparecían en publicaciones anteriores.

Fotos de 100 ml:

| Perfume | Cómo se verificó |
|---|---|
| Silver Mountain Water | archivo `_100ml` |
| Interlude Man | archivo `_100_ML` |
| Another 13 | la etiqueta dice 100 ml |
| Stronger With You Intensely | archivo `_33` (3.3 oz) |
| Acqua di Gioia | archivo `3.4` |
| Asad Bourbon | archivo `_34` |
| Hawas Kobra | archivo `_34` y la caja dice 100 ml |
| Yara Candy | Lattafa la hace solo en 100 ml |

```
¿Cuál elegís? Comentá el número 👇

1 Creed Silver Mountain Water · 2 Lattafa Yara Candy · 3 Armani Stronger With You Intensely · 4 Amouage Interlude Man · 5 Armani Acqua di Gioia · 6 Lattafa Asad Bourbon · 7 Le Labo Another 13 · 8 Rasasi Hawas Kobra

Todos en 100 ml, con envío a todo Uruguay. Link en el perfil.
Mandáselo a quien siempre te pregunta qué perfume usás 💜

#perfumes #perfumesuruguay #perfumesmontevideo #fragancias
```

## Programación en Metricool (marca "Novaparfum", Instagram novaparfum.uy)
Programados el 10/10/2026 como Reel de Instagram (no como Reel de prueba), con publicación automática, "mostrar en el feed" activado y portada `*-portada.jpg`.
Los videos se sirven desde Archivos de Shopify en su calidad original de 1080 × 1920.

| Reel | Fecha y hora (Montevideo) | Shopify |
|---|---|---|
| 1 · árabes | sábado 10/10/2026, 20:30 | gid://shopify/Video/46415046869246 |
| 2 · para él | lunes 12/10/2026, 20:30 | gid://shopify/Video/46415046902014 |
| 3 · para ella | miércoles 14/10/2026, 20:30 | gid://shopify/Video/46415046934782 |
| 5 · ¿Cuál elegís? | viernes 16/10/2026, 20:30 | gid://shopify/Video/46418607997182 |
| 4 · nicho | domingo 18/10/2026, 20:30 | gid://shopify/Video/46418607964414 |
| 6 · ¿Cuál elegís? 2 | martes 20/10/2026, 20:30 | gid://shopify/Video/46418608029950 |

Metricool todavía no tenía datos para recomendar un horario, porque la cuenta es nueva. Se eligieron las 20:30.
Van sin música: si se le agrega, tiene que ser antes de que se publique.

## TikTok (programado el 11/10/2026 en Metricool, cuenta novaparfumuy)
Son los mismos videos y textos que en Instagram, en publicaciones aparte, para no tocar las de Instagram. Salen solos a las 20:30 (Montevideo).
En todos está marcado "contenido de tu propia marca" (TikTok pide declararlo cuando se promociona el negocio propio). Los videos no tienen música.

| Video | Fecha | Título en TikTok | Id en Metricool |
|---|---|---|---|
| 2 · para él | lunes 12/10 | 4 clásicos para él | 393380272 |
| 1 · árabes | domingo 11/10, 14:25 (adelantado: ya estaba en Instagram) | Perfumes árabes a menos de $ 3.500 | 393397721 |
| 3 · para ella | miércoles 14/10 | 4 clásicos para ella | 393380313 |
| 5 · ¿Cuál elegís? | viernes 16/10 | ¿Cuál elegís? Comentá el número | 393380351 |
| 4 · nicho | domingo 18/10 | Perfumes de nicho en Uruguay | 393380376 |
| 6 · ¿Cuál elegís? 2 | domingo 11/10, 14:30 (adelantado: ya estaba en Instagram desde el 10/10) | ¿Cuál elegís? Parte 2 | 393397764 |

Los precios de los Reels 1, 2 y 3 se revisaron contra Shopify el 11/10/2026 y siguen iguales.
