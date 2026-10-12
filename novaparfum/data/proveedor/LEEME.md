# Lista para cotizar con el proveedor (8/10/2026)

`NovaParfum-lista-para-cotizar.xlsx`: 401 perfumes y 803 filas, una por tamaño. El proveedor completa
"¿Lo tenés?", "Precio por unidad ($U)" y "Observaciones". No incluye precios de venta ni costos.

- **En la web (259):** todos los perfumes activos de la tienda, con nombres limpios. "Invictus (Aqua o Común)" se separó
  en dos filas y el duplicado "Dolce&Gabbana The One for Men EDP" se sacó.
- **Nuevos recomendados (142):** árabes en tendencia; los 10 que el proveedor ya tiene en su lista y la web no
  (9 Hawas y Odyssey Toffee Coffee); diseñadores muy pedidos que faltan; y nicho difícil de conseguir en Uruguay.
- **Tamaños:** los habituales de cada perfume en el mercado, más los que ya tiene la web.

Se genera con `lista.py` → `armar.py` → `xlsx.py` (usan datos de Shopify del scratchpad).
La hoja "Resumen" cuenta con fórmulas cuántas filas tienen precio cargado.

## Versión para enviar (8/10/2026): `NovaParfum-lista-100ml.xlsx`
Pedida por la tienda: **solo 100 ml** y **sin la columna "Estado en NovaParfum"**, para que el proveedor no vea qué
está publicado ni qué es recomendación.
- Hoja **"Lista 100 ml"**: 295 perfumes, una fila cada uno, en 100 ml.
- Hoja **"Sin versión de 100 ml"**: 106 perfumes que no se fabrican en 100 ml (YSL Libre 90, Good Girl 80, Kilian 50,
  Parfums de Marly 125, Club de Nuit 105, etc.), con el tamaño más cercano.
- `cruce-interno-NO-ENVIAR.json`: qué perfumes ya están en la web y cuáles son recomendación. Sirve para cruzar la
  respuesta del proveedor. **No se le manda.**

`NovaParfum-lista-para-cotizar.xlsx` (todos los tamaños, con la columna de estado) quedó reemplazado: no enviarlo.
