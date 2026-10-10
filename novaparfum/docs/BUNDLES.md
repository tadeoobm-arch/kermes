# Bundles, combos y ofertas por cantidad

## Análisis
| Necesidad | Solución | Costo | Inventario |
|---|---|---|---|
| **1 perfume = precio normal / 2 = promo / 3 = especial** (cualquier combinación) | **Descuentos automáticos nativos** con cantidad mínima sobre la colección *Perfumes* | Gratis | Correcto: cada perfume descuenta su propia variante |
| **Pack fijo** (p. ej. "Dúo Aurora 30 ml + Cedro 30 ml") | App oficial **Shopify Bundles** (gratis) | Gratis | Correcto: el pack descuenta stock de cada componente; si un componente se agota, el pack se agota |
| **Multipack** del mismo perfume (p. ej. 3 × 30 ml) | Shopify Bundles (multipack) o descuento por cantidad | Gratis | Correcto |
| Armá-tu-caja con reglas complejas | Shopify Functions (app propia) o apps de terceros | Desarrollo / pago | — |

**Decisión:** descuentos automáticos nativos para "Llevá 2 / Llevá 3" + Shopify Bundles para packs fijos.
No se instala ninguna app de pago.

## "Llevá 2 / Llevá 3" (automático)
```bash
cd app
npm run discounts:volume -- --collection perfumes --tiers 2:10,3:15
```
Crea dos descuentos automáticos:
- *Llevá 2 perfumes: 10% OFF* → mínimo 2 unidades de la colección Perfumes.
- *Llevá 3 perfumes: 15% OFF* → mínimo 3 unidades.
No se combinan entre sí: Shopify aplica el mejor que califique (con 3 se aplica 15 %, no 10 % + 15 %).
Sí se combinan con descuentos de envío. Se ven en el carrito y en el checkout (sin código).

Manual (equivalente): Descuentos › Crear › *Monto de descuento en productos* › Automático › Colección Perfumes ›
Requisito: cantidad mínima 2 → 10 %. Repetir con 3 → 15 %. Combinaciones: solo envío.

La sección de la home **Promo por cantidad** y el aviso en la ficha muestran los mismos porcentajes
(editables en *Personalizar*): mantenelos iguales a los descuentos reales.

## Packs con Shopify Bundles
1. App Store › **Shopify Bundles** (de Shopify) › Instalar.
2. *Crear bundle* → elegir componentes y cantidades (p. ej. Aurora 30 ml ×1 + Cedro 30 ml ×1) → precio del pack.
3. El bundle se crea como un producto más: asignale tipo **Perfume**, etiqueta `combo`, imágenes y el metacampo Proveedor si todos los componentes son del mismo proveedor.
4. Inventario: lo calcula Shopify a partir de los componentes (no se carga a mano).
5. En el pedido, Shopify expande el bundle en sus componentes para la preparación: la app divide por proveedor por línea de pedido; si un pack mezcla proveedores, asigná el pack al proveedor que lo arma o preferí packs de un solo proveedor.

Limitaciones de Shopify Bundles a revisar en la documentación oficial al crear packs: cantidad máxima de componentes por bundle, incompatibilidad con suscripciones (selling plans) y que los componentes deben ser productos existentes.
