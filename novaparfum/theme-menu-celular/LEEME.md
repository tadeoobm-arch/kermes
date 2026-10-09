# NovaParfum · Menú del celular arreglado

Tema de Shopify: **"NovaParfum (menú celular arreglado)"** (ID 189016703230), copia exacta de
"NovaParfum (intro de marca)" (el publicado al 9/10/2026) con un solo archivo cambiado: `sections/header.liquid`.
Vista previa: https://novaparfumuy.myshopify.com/?preview_theme_id=189016703230

## El problema
En el celular, al tocar las rayitas (☰) no aparecía el menú.
El menú sí se abría, pero quedaba recortado al alto de la barra de arriba (64 px) y no se veía.

La causa es que el encabezado tiene efecto vidrio (`backdrop-filter`) y, al bajar, se esconde con `transform`.
Las dos propiedades hacen que un panel `position: fixed` que está adentro del encabezado tome como referencia
el encabezado y no la pantalla. Ver `capturas/antes-menu-recortado.png`.

## El arreglo
Al final de `sections/header.liquid`, antes del `{% schema %}`:
- Mientras el menú está abierto se sacan el vidrio, el `transform` y el `filter` del encabezado.
  Funciona con la clase `np-menu-open`, que pone un script, y con `:has()` aunque no haya JavaScript.
- Mientras el menú está abierto, la página de atrás no se desplaza.

Nada más cambia. Con el menú cerrado el encabezado se ve igual que antes, con su vidrio. En la computadora no hay cambios.

## Verificado en la vista previa
En iPhone 13 y Pixel 7, en la portada, la colección y la ficha de producto, arriba de todo y después de bajar:
- El panel ocupa toda la pantalla y se ven todos los ítems, hasta "Seguí tu pedido".
- La X lo cierra.
- Los links navegan.
- No hay errores de JavaScript.

Ver `capturas/despues-menu-completo.png`.

## Publicado
**Publicado el 9 de octubre de 2026** y verificado en la web en vivo, sin vista previa, con las mismas pruebas.
El tema anterior, "NovaParfum (intro de marca)", queda guardado sin publicar.
