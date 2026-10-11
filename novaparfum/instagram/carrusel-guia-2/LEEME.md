# Carrusel "¿Qué perfume estás buscando?", segunda versión (11/10/2026)

Tiene la misma idea que `../carrusel-guia/` pero otros perfumes: ninguno salió antes en una publicación, historia o Reel.
La identidad es la de NovaParfum, como el resto del feed: fondo #2F2A4A, títulos en Fraunces, textos en Manrope, logo con la estrella y frascos sobre tarjetas claras. La tienda lo pidió así porque la versión con fondo de seda crema se parecía a la publicación de referencia. Son siete imágenes de 1080 × 1440 (3:4), en el orden de los nombres de archivo, y no llevan el texto "100 ml".

Para volver a generarlas: `node generar.mjs <carpeta-recortes> <carpeta-salida>`. Los recortes son PNG con el fondo quitado y no están en el repositorio.

## Perfumes
- **Categorías.** Cada perfume va donde lo pone su descripción en Shopify. La línea corta debajo del nombre sale de esa misma descripción.
- **Sin gastar tanto.** Los árabes van con su precio de Shopify del 11/10/2026.
- **Fotos de 100 ml.** Todas están verificadas:

| Imagen | Perfume | Cómo se verificó |
|---|---|---|
| Dulce | Viktor&Rolf Flowerbomb | archivo `model_front_Flowerbomb_100` |
| Dulce | Gucci Flora Gorgeous Gardenia | archivo `..._3.3` (3,3 oz = 100 ml) |
| Dulce | Mugler A*Men | la caja dice "100 mL" y "3.4 Fl" |
| Elegante | Chanel N°5 EDP | archivo `n-5-eau-de-parfum-spray-3-4fl-oz` |
| Elegante | Giorgio Armani Sì EDP | la caja dice "100 ml 3.4 FL.OZ." |
| Elegante | Dior Homme Intense | archivo `Dior_Homme_Intense_34` (3,4 oz) |
| De noche | Montale Intense Café | la etiqueta dice "100ML 3.4 Fl.oz" |
| De noche | YSL La Nuit de L'Homme | la caja dice "100 ml" y el archivo dice 3.4 |
| De noche | Creed Viking | archivo `Viking_100ml` |
| Para el calor | Marc Jacobs Daisy | archivo `...Spray-3.4` |
| Para el calor | Versace Dylan Blue pour Femme | archivo `...Spray-3.4` |
| Para el calor | Creed Green Irish Tweed | archivo `Green_Irish_Tweed_100ml` |
| Sin gastar tanto | Armaf Odyssey Dubai Chocolat ($ 3.100) | archivo `...100-ml...` |
| Sin gastar tanto | Lattafa Asad Zanzibar ($ 3.300) | la caja dice "100ml 3.4FL.OZ." |
| Sin gastar tanto | Armaf Odyssey Marshmallow ($ 3.600) | archivo `...100-ml...` |

En la portada están Flowerbomb, Viking, Flora Gorgeous Gardenia, N°5, Daisy y Dylan Blue pour Femme. En el cierre, Sì, Intense Café y La Nuit de L'Homme.

**Quedaron afuera:**
- Dior Hypnotic Poison: la tienda pidió cambiarlo.
- Versace Pour Homme: es de 100 ml, pero el frasco transparente casi no se veía sobre el fondo claro.
- Armani Code (125 ml) y Mugler Angel (la foto es de 50 ml).
- Spicebomb Extreme, Black Opium, Alien y Crystal Noir: no se hacen en 100 ml.
- Tom Ford Private Blend y Black Orchid: no se pudo verificar el tamaño de la foto.

## Texto para la publicación
```
¿No sabés qué perfume elegir? Te lo hacemos fácil.

Dulce, elegante, de noche, para el calor o sin gastar tanto: deslizá y encontrá el tuyo.

¿A vos cuál te gusta más? Contanos en los comentarios 👇
Link en el perfil · Envío a todo Uruguay

#perfumes #perfumesuruguay #perfumesmontevideo #fragancias
```
