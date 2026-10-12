# NovaParfum: contexto completo para otra IA (al 12/10/2026)

Este documento resume la tienda NovaParfum, cómo funciona, lo que ya se hizo y lo que falta. Está pensado para pasárselo a otra IA, así puede seguir el trabajo sin preguntar todo de nuevo.

**No incluye contraseñas, claves, tokens, costos del proveedor, márgenes ni datos bancarios.** Esos datos no se comparten.

---

## 1. Qué es NovaParfum
- **Qué hace:** perfumería online de Uruguay que vende perfumes originales árabes, de diseñador y de nicho. La mayoría son de 100 ml.
- **Cómo opera:** el **proveedor despacha directamente al cliente**. NovaParfum vende, cobra y le pasa el pedido al proveedor.
- **Tienda:** https://novaparfumuy.myshopify.com, en Shopify, plan Basic. El panel de administración es pj3pch-eh.myshopify.com. La moneda es el peso uruguayo (UYU).
- **Email de la tienda:** novaparfum.uy@gmail.com
- **WhatsApp de contacto:** +598 2312 8537
- **Redes:**
  - Instagram: @novaparfum.uy
  - TikTok: @novaparfumuy
  - Página de Facebook conectada a Metricool.
- **Eslogan:** "Tu esencia, en nueva luz."
- **Público:**
  - Principal: 20 a 40 años, de Montevideo y el área metropolitana más las capitales del interior. Compra desde el celular y paga con Mercado Pago.
  - Además: gente que compra para regalar y entusiastas de los perfumes.

## 2. Catálogo
- **Tamaño:** unos 265 productos publicados, incluidos los combos.
- **Etiquetas:**
  - Por público: Dama, Caballero, Unisex.
  - Por tipo: Árabe, Diseñador, Nicho.
  - También: Nuevo, y "revisar" en los que tienen datos por confirmar.
- **Datos de cada producto** (metacampos `novaparfum.*`): género, familia olfativa, notas de salida, corazón y fondo, y concentración. El proveedor queda asignado con un metaobjeto.
- **Descripciones:**
  - Muchos productos de diseñador y de nicho tienen descripción completa: frase de inicio, pirámide olfativa e "Ideal para".
  - Varios árabes solo dicen "Comprá online en NovaParfum…", sin notas.
- **Precios de referencia (11/10/2026):**
  - Árabes desde unos $ 3.100. Por ejemplo, Odyssey Dubai Chocolat $ 3.100, Lattafa Asad $ 3.200 y Yara $ 3.300.
  - Diseñador entre $ 5.000 y $ 12.000 aproximadamente.
  - Nicho entre $ 14.000 y $ 28.000.
- **Combos (colección Ofertas):** por ejemplo, Hawas Ice + Hawas for Her a $ 7.490, 1 Million Elixir + Million Red a $ 14.990 y Asad + Yara a $ 6.090.
- **Cambios de precio registrados:**
  - 8/10: bajaron 5 perfumes de diseñador masivos para quedar a precio de mercado (1 Million $ 5.990, Invictus $ 5.990, Acqua di Giò $ 6.990, Eros EDP $ 7.490 y Eros EDT $ 8.390). Subió la línea Hawas (por ejemplo, Hawas Ice $ 4.390).
  - 11/10: Hugo Man pasó a $ 4.700.
- **Fotos:**
  - Se cargaron fotos oficiales en 249 de 269 productos (6/10).
  - Algunas vienen de sitios de terceros: hay que revisar si se pueden usar (licencia).

## 3. Pagos
- **Mercado Pago** (app oficial dentro del checkout de Shopify): está activo.
  - El cliente **puede pagar sin tener cuenta de Mercado Pago**: con tarjeta, Redpagos o Abitab. Está comprobado.
  - Comisión de Mercado Pago: alrededor de 5,99 % + IVA si se cobra al instante, o 4,99 % + IVA si se cobra a los 21 días.
  - Shopify Basic cobra además un 2 % por usar una pasarela externa. Los métodos manuales, como la transferencia, no pagan ese 2 %.
- **Transferencia bancaria (manual):** se recomendó, pero todavía no está activada. Si se activa, hay que cambiar los textos de la web que dicen "Pagá con Mercado Pago". Los datos de la cuenta van solo en Shopify.
- **Otras opciones que se evaluaron:** Handy vía Plexo, la app dLocal Go y el pago contra entrega con DAC (sin confirmar).

## 4. Envíos y políticas
- **Envío:** a cobrar (lo paga el cliente al recibir o al retirar), por DAC u otras empresas. Llega en **48 a 72 horas**. Los pedidos del fin de semana o de feriados salen el siguiente día hábil.
- **Cambios y devoluciones:**
  - Solo con el perfume cerrado.
  - Si llega dañado o no es el que se pidió, se cambia sin costo avisando dentro de las 48 horas.
  - Derecho de arrepentimiento: 5 días hábiles, según la Ley 17.250, artículo 16.
- **Políticas publicadas en Shopify:** reembolso, envío, términos y contacto.
  - Ninguna muestra la dirección de la calle, que **no debe mostrarse**.
  - La Política de privacidad automática todavía dice "llámenos al ," sin el número.
- **Carrito:** pide cédula y modalidad de entrega (domicilio o agencia). Esos datos llegan en el email del pedido.

## 5. Marca
- **Concepto:** "Nova" es una estrella que brilla. El símbolo es una gota de perfume con una estrella de cuatro puntas adentro.
- **Colores:**
  - Tinta #2F2A4A
  - Profundo #1E1A33
  - Crema #F7F4F0
  - Rosa polvo #E9C9CF
  - Lila #B3A6E4
  - Violeta #7A68B8
  - **Nada de dorado y negro.**
- **Tipografías:** Fraunces para títulos y Manrope para textos.
- **Logo:** "nova**parfum**", con "parfum" en lila o violeta y la estrella con un punto.
- **Tono:**
  - Voseo uruguayo ("elegí", "pagá"), frases cortas, cálido y claro.
  - Emojis medidos: ✨ 📦 💜.
  - Nada de mayúsculas gritadas ni urgencia falsa.

## 6. Tema de la tienda
- **Tema publicado:** "NovaParfum (menú celular arreglado)". Es una copia del tema "intro de marca" con un arreglo: el menú del celular quedaba recortado por el efecto de vidrio del encabezado, y ahora se ve completo.
- **Otros temas sin publicar, guardados:** intro de marca, portada arco, campaña, estética, título, premium, tienda animada y web profesional.
- **Forma de trabajo:** los temas nuevos se hacen siempre como copia y el publicado no se toca directo.

## 7. Automatizaciones y herramientas
- **Shopify Flow:** cuando un pedido queda pagado, llega un email a la tienda con los datos del pedido y un link de WhatsApp que abre el chat del proveedor con el mensaje ya escrito. Se reenvía con un toque.
- **Shopify Messaging:** email de pago abandonado activado, en español y con la marca.
- **Catálogo de Meta:**
  - 259 perfumes publicados en Facebook e Instagram.
  - El catálogo de WhatsApp da error al conectarlo, así que se armó un **catálogo manual**: una página con 27 perfumes de 100 ml, fotos y fichas para copiar y pegar en WhatsApp Business. La tienda los carga a mano.
- **Metricool** (marca 7333803, hora de Montevideo): programa publicaciones en Instagram, TikTok y Facebook.
- **Copia de Instagram a TikTok:** una tarea automática revisa cada 2 horas (de 9 a 23) lo nuevo en Instagram y lo copia a TikTok.
  - Copia: fotos sueltas, y Reels o carruseles que ya están en el repositorio.
  - No copia los Reels ni carruseles subidos directo desde la app, porque Metricool no da el video ni todas las fotos.
- **"NovaParfum Ops" (programado, sin instalar):** una app en Node.js que, con cada pedido pagado, separa los productos por proveedor, le manda a cada uno su orden, lleva una planilla en Google Sheets y tiene un portal donde el proveedor carga el seguimiento. Tiene 35 pruebas. Falta subirla a un servidor y conectarle las cuentas.

## 8. Contenido publicado y programado
**Instagram, ya publicado:**
- Tríptico "nova ✦ parfum" (3 fotos, 8/10).
- Tres publicaciones que armó la tienda (9/10): combo 1 Million Elixir + Million Red, Prada Paradoxe Intense 90 ml y combo Hawas Ice + Hawas for Her.
- Reel de perfumes árabes (10/10). **Quedó publicado dos veces.**
- Reel "¿Cuál elegís? 2" (10/10).
- Carrusel "¿Qué perfume estás buscando?" (11/10). Tiene 7 imágenes en el formato de @elixir.ar: 6 frascos alrededor de "Quiero un perfume ___", con la identidad de NovaParfum.

**TikTok:** el 11/10 se copió todo lo de Instagram (7 publicaciones, entre las 14:05 y las 14:35).

**Programado en Metricool (20:30, hora de Montevideo):**

| Fecha | Instagram | TikTok |
|---|---|---|
| Lunes 12/10 | Reel "4 clásicos para él" | ✓ |
| Miércoles 14/10 | Reel "4 clásicos para ella" | ✓ |
| Jueves 15/10 | Carrusel guía viejo, versión anterior con fondo crema (falta decidir si se saca) | — |
| Viernes 16/10 | Reel "¿Cuál elegís?" | ✓ |
| Domingo 18/10 | Reel de perfumes de nicho | ✓ |
| Martes 20/10 | Reel "¿Cuál elegís? 2" (**ya está en Instagram: saldría repetido**) | ya copiado |

Los Reels no tienen música. Se la puede agregar la tienda.

**Historias:** "Lancé mi tienda" para la cuenta personal, una para que la compartan amigos, y una de perfumes de nicho sin precios (con y sin espacio para el sticker de enlace).

**Anuncio:** la tienda está armando un anuncio en Meta con **$ 140 de presupuesto**.
- Qué promociona: el Reel de árabes.
- Objetivo: mensajes.
- Público: Uruguay, 20 a 45 años, interesados en perfumes. Hay que sacar el interés "Perfume (banda)", que es una banda de música.

## 9. Reglas de contenido (las pidió la tienda)
1. **Siempre 100 ml.** Cada foto de perfume tiene que ser de la presentación de 100 ml.
   - Se verifica por el nombre del archivo (100ml, 3.4 o 34), por lo que dice la caja o la etiqueta, o porque la marca solo lo hace en 100 ml.
   - Si un perfume no existe en 100 ml, no se usa sin consultar.
   - En los carruseles guía, la tienda pidió que **no aparezca el texto "100 ml"**, pero las fotos siguen siendo de 100 ml.
2. **No inventar notas ni datos:** se usa solo lo que dice la descripción del producto en Shopify.
3. **Precios del día:** siempre los de Shopify en el momento en que se arma la pieza.
4. **Identidad de NovaParfum:** logo, colores y tipografías de la marca. La referencia de otras cuentas se usa para el formato, no para la estética.
5. **No repetir perfumes** que ya salieron cuando la tienda pide algo nuevo.
6. Formatos:

| Formato | Tamaño |
|---|---|
| Publicaciones y carruseles | 1080 × 1440 (3:4) |
| Reels e historias | 1080 × 1920 |
| TikTok | Vertical 1080 × 1920 |

## 10. Reglas de trabajo y seguridad
- Nunca guardar ni mostrar contraseñas, tokens, claves ni credenciales de Mercado Pago. Tampoco poner credenciales inventadas.
- No inventar funciones de Shopify ni de Mercado Pago.
- **No borrar nada:** desactivar en vez de borrar, y hacer copias de los temas.
- Los costos y márgenes del proveedor no se guardan ni se comparten.
- **El proveedor no tiene que saber qué perfumes están en la web ni cuáles se recomiendan.**
- Los datos bancarios van solo en Shopify.
- Nunca pedir ni aceptar las contraseñas de Instagram o Facebook de la dueña o el dueño.
- Responder siempre en español con voseo uruguayo.

## 11. Diagnóstico de ventas (al 11/10/2026)
- **Tráfico:** unas 515 sesiones en 30 días, casi todas pruebas propias. Las visitas reales llegaron casi nada: 3 de Instagram, 3 de Facebook, 1 de Google y 1 de TikTok.
- **Pedidos:** todavía **no hubo ventas reales**. Los 2 pedidos fueron pruebas y se reembolsaron.
- **Conclusión:** el problema principal es que **falta tráfico**.
- **Recomendaciones:**
  - Publicar todos los días y subir historias con el sticker de enlace.
  - Seguir con los Reels.
  - Escribirles a conocidos por WhatsApp.
  - Publicar en Marketplace y en grupos de Facebook.
  - Hacer anuncios chicos en Meta con los perfumes árabes.
  - Contestar rápido los mensajes.
  - Crear un código de bienvenida, como BIENVENIDA10 (no está creado; hace falta aprobarlo).
  - Mostrar el costo del envío de DAC.

## 12. Pendientes
1. Decidir qué pasa con el carrusel viejo programado en Instagram para el 15/10.
2. Sacar la repetición del Reel "¿Cuál elegís? 2" programada en Instagram para el 20/10.
3. Borrar uno de los dos Reels de árabes repetidos en Instagram. Si se promociona uno, hay que quedarse con ese.
4. Agregar música a los Reels, o pasarle a la IA los nombres de las canciones.
5. Arreglar fotos de producto:
   - Rasasi Hawas Elixir tiene un dibujo con "novaparfum" escrito en la etiqueta, no una foto real.
   - La foto de Odyssey Homme Limited Edition muestra la caja de Mandarin Sky.
   - La foto de Hawas for Her es dudosa.
6. Revisar etiquetas de tamaño: CK One aparece en 200 ml y Black XS for Her en 80 ml.
7. The One for Men EDP aparece duplicado con dos precios ($ 9.300 y $ 7.500).
8. Confirmar la marca de "Alpha for Him", que dice "A confirmar".
9. Completar la cotización del proveedor: hay una lista de 401 perfumes y 133 todavía no tienen costo.
10. Activar la transferencia bancaria (opcional) y cambiar los textos que dicen "Pagá con Mercado Pago".
11. Poner el número de teléfono en la Política de privacidad automática.
12. Cargar el catálogo manual en WhatsApp Business.
13. Mostrar el costo del envío de DAC en la web.
14. Revisar las estadísticas de Metricool cuando salgan los Reels.
15. Las recomendaciones de precio para 55 perfumes de diseñador **no se aplican salvo que la tienda lo pida**.

## 13. Dónde está todo
Todo está en el repositorio de GitHub **tadeoobm-arch/kermes**, rama `claude/novaparfum-ecommerce-setup-1i7ses`, carpeta `novaparfum/`.

| Carpeta | Qué tiene |
|---|---|
| `instagram/` | Todas las piezas, con sus textos (`LEEME.md`, `textos.md`) y los generadores. `REGLAS.md` tiene las reglas de contenido. |
| `automations/` | Flow, pago abandonado, catálogo de WhatsApp y copia a TikTok. |
| `politicas/` | Textos de las políticas. |
| `docs/` | Marca, Mercado Pago, envíos, seguridad y arquitectura. |
| `data/informes/` | Cambios de precio e informes de fotos. |
| `theme*/` | Temas de la tienda. |
| `app/` | La app NovaParfum Ops. |

---

### Texto sugerido para arrancar con la otra IA
> Sos asistente de NovaParfum, una perfumería online de Uruguay. Te paso el contexto completo abajo. Respondeme siempre en español rioplatense con voseo. Respetá las reglas de contenido (fotos de 100 ml, no inventar notas, precios del día, identidad de la marca) y de seguridad (nada de contraseñas, costos del proveedor ni datos bancarios). Antes de recomendar algo, fijate en la lista de pendientes.
