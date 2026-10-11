# Copiar a TikTok lo que se publica en Instagram

La tienda lo pidió el 11/10/2026: "todo lo que yo suba a IG lo repliques a TikTok". Una revisión automática corre cada 2 horas, de 9 a 23 (Montevideo), y sigue estos pasos.

## Datos fijos
- **Metricool:** marca 7333803, zona horaria America/Montevideo. Instagram es novaparfum.uy y TikTok es novaparfumuy.
- **Shopify:** tienda pj3pch-eh.myshopify.com. Las imágenes se suben a Archivos para tener una dirección pública.
- **Lista de lo que ya se copió:** `replicados.json`, con dos índices:
  - `por_url`: la dirección de la publicación en Instagram.
  - `por_comienzo_del_texto`: el comienzo del texto, para lo que ya se programó en las dos redes antes de salir en Instagram.

## Pasos
1. **Buscar lo publicado en los últimos 7 días** con `getAnalyticsDataByMetrics` (marca 7333803):
   - Publicaciones: `IGPO02`, `IGPO03`, `IGPO06`, `IGPO07` y `IGPO05`, que son fecha, texto, dirección, tipo e imagen.
   - Reels: `IGRE02`, `IGRE03`, `IGRE06` y `IGRE05`.
   - Las fechas vienen en UTC: Montevideo es UTC−3.

2. **Descartar lo que ya está copiado.** Una publicación ya está copiada si su dirección está en `por_url` o si su texto empieza con algún texto de `por_comienzo_del_texto`. Si no queda nada nuevo, se termina ahí y no se avisa nada.

3. **Revisar los precios del texto.** Se buscan en Shopify con `products.json` (si la página 2 llega vacía, se reintenta).
   - Si algún precio no coincide con el de hoy, esa publicación **no se copia**. Se le avisa a la tienda qué precio cambió.
   - No se inventan notas ni datos: el texto se copia tal cual. Solo se cambia "Link en bio" por "Link en el perfil".

4. **Publicación de una sola foto** (tipo `FEED_IMAGE`):
   1. Bajar la imagen de `IGPO05` a una carpeta nueva y vacía.
   2. Pasarla a vertical: `python3 vertical.py <imagen> <salida.jpg>`.
   3. Subirla a Shopify con `stagedUploadsCreate` (IMAGE, POST, fileSize), después el POST multipart, después `fileCreate`, y esperar a que el archivo quede READY para usar `image.url`.
   4. Programarla en TikTok con `createScheduledPost`, 5 minutos después de la hora actual. Si hay varias, una cada 5 minutos.
   5. Datos de TikTok: providers `tiktok`, `tiktokData` con `privacyOption` PUBLIC_TO_EVERYONE, `commercialContentOwnBrand` true, `autoAddMusic` true, `photoCoverIndex` 0 y `title` (obligatorio, hasta 90 caracteres: el primer renglón del texto, recortado).

5. **Carrusel** (tipo `CAROUSEL_ALBUM`):
   - Metricool solo da la primera imagen.
   - Si las imágenes están en el repositorio (en `novaparfum/instagram/...`), se usan esas, en vertical.
   - Si no están, no se copia y se le pide a la tienda que mande las imágenes o que lo publique desde Metricool marcando Instagram y TikTok.

6. **Reel:**
   - Metricool no da el archivo de video, solo la portada.
   - Si el video es uno de `novaparfum/instagram/reels/` (está en Shopify Archivos, ver `reels/textos.md`), se usa ese con `originalSource.url`.
   - Si no, no se copia y se le pide a la tienda el video o que lo publique desde Metricool en las dos redes.

7. **Anotar y guardar:**
   - Agregar cada publicación copiada a `replicados.json` con el id de Metricool.
   - Agregar a `../../instagram/tiktok-replicas/LEEME.md` una línea por publicación.
   - Hacer commit y push a la rama `claude/novaparfum-ecommerce-setup-1i7ses`.

8. **Avisar a la tienda** en una línea qué se copió y a qué hora sale, y qué no se pudo copiar y por qué.

## Lo que no se puede copiar solo
- **Reels y carruseles subidos directo desde la app de Instagram:** Metricool no da el video ni todas las fotos. Para que salgan en las dos redes sin esperar, conviene publicar desde Metricool marcando Instagram y TikTok a la vez.
- **Historias.**
