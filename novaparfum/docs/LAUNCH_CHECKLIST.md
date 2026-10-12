# Checklist de lanzamiento — NovaParfum

## Marca y contenido
- [ ] Logo, favicon y foto de perfil cargados (`branding/logo/`).
- [ ] Banner principal con foto real (4:5 o 1:1, fondo claro).
- [ ] Al menos 12 perfumes con fotos propias, descripción única, notas, familia, género y alt text.
- [ ] Precios, precio anterior (solo si es real) y **costo** en todas las variantes.
- [ ] Colección **Destacados** curada; etiqueta `nuevo` en lanzamientos.
- [ ] Textos `[Completar…]` reemplazados (envíos, FAQ, cambios y devoluciones).
- [ ] Políticas publicadas: privacidad (Ley 18.331), reembolsos/cambios (Ley 17.250), términos, envíos.
- [ ] Datos del comercio en el pie/contacto (razón social / RUT si corresponde).

## Shopify
- [ ] Tema NovaParfum publicado y revisado en iPhone y Android (menú, filtros, "Comprar ahora", carrito).
- [ ] Filtros activos en Search & Discovery (marca, género, tamaño, precio, familia, disponibilidad).
- [ ] Checkout: teléfono obligatorio, etiqueta "Calle y número de puerta".
- [ ] Zonas y tarifas de envío reales.
- [ ] Notificaciones personalizadas y probadas (confirmación, envío, entregado, cancelado).
- [ ] Descuentos por cantidad creados y coherentes con la sección de la home.
- [ ] Dominio propio conectado y HTTPS activo; contraseña de la tienda quitada.
- [ ] Shopify Flow: 4 workflows activos.

## Pagos
- [ ] Mercado Pago instalado, vinculado y activo; medios y cuotas configurados.
- [ ] Compra real de bajo valor aprobada y reembolsada.
- [ ] `MP_FEE_PERCENT` / `MP_FEE_VAT_PERCENT` con tu tarifa real.

## Operación
- [ ] App NovaParfum Ops desplegada; `/health` sin pendientes (`faltaConectar: []`).
- [ ] App instalada en la tienda; webhooks y App Proxy publicados (`shopify app deploy`).
- [ ] `DRY_RUN=false` en producción.
- [ ] Proveedores cargados (metaobjetos) y asignados a todos los productos (ningún pedido de prueba con `np-revisar`).
- [ ] Proveedores avisados del flujo (email + portal) y con stickers/tarjetas de packaging.
- [ ] Planilla creada, compartida solo con el equipo; `npm run setup:sheet` ejecutado.
- [ ] Cron `/tasks/reconcile` (15 min) y `/tasks/reports` (diario) activos.
- [ ] URLs de seguimiento de los operadores que uses configuradas.
- [ ] Pruebas de `TESTING.md` completas.

## Marketing y medición
- [ ] Apps Google & YouTube, Facebook & Instagram y TikTok conectadas (sin duplicar con el píxel personalizado).
- [ ] Search Console verificado y sitemap enviado.
- [ ] Instagram: bio, destacadas, 9 publicaciones iniciales programadas, catálogo/etiquetas de productos.
- [ ] WhatsApp Business con catálogo y respuestas rápidas.
- [ ] PageSpeed Insights móvil de home y producto revisado (imágenes livianas).

## Seguridad
- [ ] 2FA en Shopify, Mercado Pago, Google y Meta.
- [ ] `npm run check:secrets` OK; `.env` fuera del repositorio.
- [ ] Permisos de staff por rol.
