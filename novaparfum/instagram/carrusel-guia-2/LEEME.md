# Carrusel "¿Qué perfume estás buscando?", segunda versión (11/10/2026)

Son siete imágenes de 1080 × 1440 (3:4), en el orden de los nombres de archivo.

**Formato.** Lo pidió la tienda, tomando como referencia un carrusel de @elixir.ar:
- En cada imagen, seis frascos rodean el texto "Quiero un perfume ___", con la categoría dentro de un óvalo.
- Debajo de cada frasco va el nombre.
- Líneas curvas unen el título con los frascos.
- Todos los frascos entran enteros en la imagen; no hay ninguno cortado por el borde.

**Identidad de NovaParfum:**
- Logo con la estrella arriba.
- Categoría en Fraunces y textos en Manrope.
- Violeta de la marca (#7A68B8) en el óvalo, las líneas y las marcas.
- Fondo de seda crema.

La tienda dijo que, si el fondo violeta quedaba mal, alcanzaba con poner el logo. El crema se usa porque los frascos oscuros (A*Men, Gentleman, Legend, Black Aoud) se perdían sobre el violeta.

**Reglas de contenido:**
- Ningún perfume salió antes en una publicación, historia o Reel.
- Las imágenes no llevan el texto "100 ml", pero todas las fotos son de la presentación de 100 ml.

**Versiones anteriores.** Las de este mismo carrusel (fondo crema con tarjetas y fondo violeta) quedan en el historial de git.

Para volver a generar las imágenes: `node generar.mjs <carpeta-recortes> <carpeta-salida>`. Los recortes son PNG con el fondo quitado y no están en el repositorio.

## Qué hay en cada imagen

| Imagen | Frascos |
|---|---|
| 1. Portada: "¿Qué perfume estás buscando?" | N°5, Viking, Flora Gorgeous Gardenia, Sì, Dylan Blue pour Femme, Royal Oud |
| 2. Dulce | Flowerbomb, A*Men, Flora Gorgeous Gardenia, Arabians Tonka, Odyssey Dubai Chocolat, Odyssey Marshmallow |
| 3. Elegante | N°5, Royal Oud, Y Eau de Parfum, Prada L'Homme, Gentleman, Dior Homme Intense |
| 4. De noche | Viking, Eros Flame, Black Aoud, Sì, La Nuit de L'Homme, Intense Café |
| 5. Para el calor | Daisy, Green Irish Tweed, Reflection Man, Toy 2 Pearl, Dylan Blue pour Femme, Uomo Born in Roma Green Stravaganza |
| 6. Sin gastar tanto (con precio) | Legend $ 5.500, Versense $ 5.000, Asad Zanzibar $ 3.300, Yara Tous $ 3.300, Tommy Girl $ 4.150, Yara Elixir $ 3.600 |
| 7. Cierre: "¿A vos cuál te gusta más?" | Toy 2 Pearl, Eros Flame, Yara Elixir, Gentleman |

**Categorías.** Cada perfume va donde lo pone su descripción en Shopify:
- **Dulce:** "dulce" o "gourmand".
- **Elegante:** "elegante".
- **De noche:** "de noche" en "Ideal para".
- **Para el calor:** "fresco/a" y "primavera y verano".

Hay dos excepciones:
- **Odyssey Dubai Chocolat y Odyssey Marshmallow** no tienen descripción en Shopify. Van en Dulce porque su caja dice "Gourmand Edition".
- **Sin gastar tanto** se arma por precio. Los precios son los de Shopify del 11/10/2026.

## Cómo se verificó que cada foto es de 100 ml

| Perfume | Cómo se verificó |
|---|---|
| Viktor&Rolf Flowerbomb | archivo `model_front_Flowerbomb_100` |
| Gucci Flora Gorgeous Gardenia | archivo `..._3.3` (3,3 oz = 100 ml) |
| Mugler A*Men | la caja dice "100 mL" y "3.4 Fl" |
| Montale Arabians Tonka | la etiqueta dice "100ML 3.4 Fl.oz" |
| Armaf Odyssey Dubai Chocolat | archivo `...100-ml...` |
| Armaf Odyssey Marshmallow | archivo `...100-ml...` |
| Chanel N°5 EDP | archivo `n-5-eau-de-parfum-spray-3-4fl-oz` |
| Creed Royal Oud | archivo `Royal_Oud_100ml` |
| YSL Y EDP | archivo `YvesSaintLaurent_Y_EDP_33` (3,3 oz) |
| Prada L'Homme | la caja dice "100ml 3.4 FL OZ" |
| Givenchy Gentleman EDP | la caja dice "100 ML" y "3.3 FL.OZ" |
| Dior Homme Intense | archivo `Dior_Homme_Intense_34` (3,4 oz) |
| Creed Viking | archivo `Viking_100ml` |
| Versace Eros Flame | archivo `Versace_ErosFlame_EDP_34` y la caja dice "100 ml" |
| Montale Black Aoud | la etiqueta dice "100ML 3.4 Fl.oz" |
| Giorgio Armani Sì EDP | la caja dice "100 ml 3.4 FL.OZ." |
| YSL La Nuit de L'Homme | la caja dice "100 ml" y el archivo dice 3.4 |
| Montale Intense Café | la etiqueta dice "100ML 3.4 Fl.oz" |
| Marc Jacobs Daisy | archivo `...Spray-3.4` |
| Creed Green Irish Tweed | archivo `Green_Irish_Tweed_100ml` |
| Amouage Reflection Man | archivo `REFLECTION_100_ML` |
| Moschino Toy 2 Pearl | archivo `...EUR6Y32100...`: Moschino usa "3050" para 50 ml y "32100" para 100 ml (comparado con Toy 2 de 50 ml) |
| Versace Dylan Blue pour Femme | archivo `...Spray-3.4` |
| Valentino Uomo Born in Roma Green Stravaganza | archivo `uomo_greenstra_edt_34` |
| Montblanc Legend | la caja dice "100ML" y "3.3 FL.OZ" |
| Versace Versense | archivo `...Spray-3.4` y el producto se llama "Versense 100ml" |
| Lattafa Asad Zanzibar | la caja dice "100ml 3.4FL.OZ." |
| Lattafa Yara Tous | el sello de la caja dice "100ML, 3.4 FL.OZ." |
| Tommy Hilfiger Tommy Girl | archivo `...Spray-3.4` |
| Lattafa Yara Elixir | el sello de la caja dice "100ML" |

**Quedaron afuera:**
- Dior Hypnotic Poison: la tienda pidió cambiarlo.
- Lattafa Yara Moi: es de 100 ml, pero el frasco blanco sobre fondo blanco no se pudo recortar bien.
- Versace Pour Homme: es de 100 ml, pero el frasco transparente casi no se veía.
- Ariana Grande Cloud, Burberry Goddess, JPG La Belle, 1 Million, Most Wanted, Asad Elixir, los Odyssey sin "100 ml" en la caja y los Rasasi Hawas: no se pudo confirmar el tamaño de la foto.
- Armani Code (125 ml), Mugler Angel (la foto es de 50 ml), Versace Dylan Blue pour Homme (la caja es de 200 ml).
- Spicebomb Extreme, Black Opium, Alien y Crystal Noir: no se hacen en 100 ml.

## Texto para la publicación
```
¿No sabés qué perfume elegir? Te lo hacemos fácil.

Dulce, elegante, de noche, para el calor o sin gastar tanto: deslizá y encontrá el tuyo.

¿A vos cuál te gusta más? Contanos en los comentarios 👇
Link en el perfil · Envío a todo Uruguay

#perfumes #perfumesuruguay #perfumesmontevideo #fragancias
```
