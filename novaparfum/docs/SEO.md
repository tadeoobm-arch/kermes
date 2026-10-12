# SEO — posicionar perfumes en Uruguay

## Técnico (implementado en el tema)
| Elemento | Dónde |
|---|---|
| `<title>` y meta description por página (productos, colecciones, páginas) | `layout/theme.liquid` + campos SEO de Shopify |
| URL canónica | `layout/theme.liquid` |
| Open Graph + Twitter Cards (imagen, precio y moneda en productos) | `snippets/meta-tags.liquid` |
| **Schema Product** con una **Offer por variante** (precio UYU, SKU, stock, marca, envío a UY) | `snippets/structured-data-product.liquid` |
| BreadcrumbList (producto y colección) | producto y `main-collection.liquid` |
| OnlineStore + WebSite con SearchAction | `snippets/structured-data-organization.liquid` |
| FAQPage (preguntas frecuentes) | `sections/faq.liquid` |
| BlogPosting | `sections/main-article.liquid` |
| Un solo `<h1>` por página, jerarquía H2/H3 | todas las secciones |
| Imágenes responsive (`srcset`/`sizes`), lazy-load, `fetchpriority=high` en la imagen principal | secciones de producto, colección y hero |
| Tipografías autoalojadas con `font-display: swap` y precarga | `snippets/fonts.liquid` |
| JS mínimo (~5 KB, diferido), sin librerías, sin sliders | `assets/theme.js` |
| Sitemap (`/sitemap.xml`) y `robots.txt` | automáticos de Shopify |
| URLs amigables | handles generados sin tildes: `/products/marca-nombre`, `/collections/perfumes-de-hombre` |

## Estructura de keywords (Uruguay)
| Página | Keyword principal | Secundarias |
|---|---|---|
| Home | perfumería online Uruguay | perfumes originales Uruguay, comprar perfumes online |
| /collections/perfumes | perfumes originales Uruguay | perfumes precio Uruguay |
| /collections/hombre | perfumes de hombre Uruguay | perfume masculino, perfume para hombre Montevideo |
| /collections/mujer | perfumes de mujer Uruguay | perfume femenino, perfume para mujer Montevideo |
| /collections/unisex | perfumes unisex Uruguay | fragancias unisex |
| /collections/ofertas | ofertas perfumes Uruguay | perfumes en promoción, descuento perfumes |
| Colecciones por marca (crear al crecer) | perfumes {marca} Uruguay | {marca} precio Uruguay |
| Colecciones por familia (crear al crecer) | perfumes amaderados / florales / árabes Uruguay | — |
| Producto | {perfume} {marca} Uruguay | {perfume} precio, {perfume} 100 ml |

## Plantillas de meta
- **Producto — title (≤ 60–70):** `{Perfume} {Marca} {ml} | Original en Uruguay | NovaParfum`
- **Producto — description (≤ 155):** `Comprá {Perfume} de {Marca} en NovaParfum. Fragancia {familia}. Envíos a todo Uruguay y pago con Mercado Pago.`
- **Colección — title:** `{Colección} en Uruguay | NovaParfum`
El importador (`scripts/import-products.mjs`) completa estos campos automáticamente si no los cargás.

## Contenido
- Descripción única por producto (no copiar la del proveedor): 80–150 palabras, notas, ocasión, duración/proyección honestas.
- Descripción de colección de 2–3 párrafos (se muestra solo en la página 1).
- Blog "Guía NovaParfum": cómo elegir perfume, EDP vs EDT, perfumes para verano en Uruguay, familias olfativas.
- Alt text: "Frasco de {perfume} de {marca}, {tamaño}".

## Search Console
1. search.google.com/search-console › Propiedad de **dominio** › verificar con registro DNS (en tu proveedor de dominio) **[CONECTAR]**.
2. Enviar `https://TU-DOMINIO/sitemap.xml`.
3. Revisar *Mejoras › Fragmentos de productos* (valida el schema Product) y *Experiencia › Métricas web principales*.

## Velocidad — checklist
- Imágenes ≤ 300 KB, 1600×2000 máx.; no subir PNG para fotos.
- No instalar apps que inyecten scripts en todas las páginas sin necesidad (medir con PageSpeed antes y después).
- Mantener ≤ 12 secciones en la home; sin carruseles automáticos ni videos de fondo.
