/* NovaParfum — JS mínimo y progresivo (~5 KB). Todo funciona sin JS; esto solo mejora la experiencia. */
(() => {
  const NP = window.NovaParfum || { routes: { root: '/', cart: '/cart', cartAdd: '/cart/add' }, strings: {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = (NP.routes.root || '/').replace(/\/?$/, '/');

  /* ---------- Producto: variantes por tamaño ---------- */
  const product = $('[data-product]');
  if (product) {
    const form = $('[data-product-form]', product);
    const variants = JSON.parse($('[data-variants-json]')?.textContent || '[]');
    const idInput = $('[data-variant-id]', form);
    const qtyInput = $('[data-qty-input]', form);
    const buyNow = $('[data-buy-now]', form);
    const addBtn = $('[data-add-to-cart]', form);
    const sticky = $('[data-sticky-buy]');
    const stickyBtn = $('[data-sticky-buy-now]');
    let current = variants.find((v) => String(v.id) === idInput.value) || variants[0];

    const selectedOptions = () => $$('input[type=radio][data-option-index]:checked', form).map((i) => i.value);

    function render(v) {
      current = v;
      const available = Boolean(v && v.available);
      if (v) idInput.value = v.id;
      $('[data-price-current]', product).textContent = v ? v.price : '—';
      $('[data-price-current]', product).classList.toggle('price__sale', Boolean(v && v.compare));
      const cmp = $('[data-price-compare]', product);
      cmp.hidden = !(v && v.compare);
      if (v && v.compare) cmp.textContent = v.compare;
      $('[data-price-badge]', product).hidden = !(v && v.pct);
      if (v) $('[data-price-pct]', product).textContent = v.pct;
      $('[data-sku]', product).textContent = (v && v.sku) || '';
      const stock = $('[data-stock]', product);
      stock.className = 'stock' + (!available ? ' stock--out' : v.lowStock ? ' stock--low' : '');
      stock.textContent = !v ? 'Combinación no disponible' : !available ? 'Agotado' : v.lowStock ? `¡Últimas ${v.lowStock} unidades!` : 'En stock · listo para enviar';
      [buyNow, addBtn, stickyBtn].forEach((b) => b && (b.disabled = !available));
      addBtn.textContent = available ? NP.strings.addToCart || 'Agregar al carrito' : NP.strings.soldOut || 'Agotado';
      $$('[data-option-label]', form).forEach((el, i) => (el.textContent = selectedOptions()[i] || ''));
      if (sticky) {
        $('[data-sticky-price]').textContent = v ? v.price : '';
        $('[data-sticky-variant]').textContent = v ? v.title : '';
      }
      if (v) history.replaceState(null, '', v.url);
    }

    form.addEventListener('change', (e) => {
      if (!e.target.matches('[data-option-index]')) return;
      const opts = selectedOptions();
      render(variants.find((v) => v.options.every((o, i) => o === opts[i])));
    });

    $$('[data-qty]', form).forEach((b) =>
      b.addEventListener('click', () => {
        qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) + Number(b.dataset.qty));
      }),
    );

    // "Comprar ahora": enlace permanente de carrito -> checkout de Shopify solo con este producto.
    const goCheckout = (e) => {
      e.preventDefault();
      if (!current || !current.available) return;
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      window.location.href = `${root}cart/${current.id}:${qty}`;
    };
    buyNow.addEventListener('click', goCheckout);
    stickyBtn && stickyBtn.addEventListener('click', goCheckout);

    // "Agregar al carrito" con AJAX (fallback: envío normal del formulario).
    addBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      addBtn.disabled = true;
      try {
        const res = await fetch(`${NP.routes.cartAdd}.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: current.id, quantity: Math.max(1, parseInt(qtyInput.value, 10) || 1) }] }),
        });
        if (!res.ok) throw new Error((await res.json()).description || 'Error');
        const cart = await (await fetch(`${NP.routes.cart}.js`)).json();
        $$('[data-cart-count]').forEach((el) => {
          el.textContent = cart.item_count;
          el.dataset.count = cart.item_count;
        });
        toast(`${NP.strings.added || 'Agregado al carrito'} · <a href="${NP.routes.cart}">${NP.strings.viewCart || 'Ver carrito'}</a>`);
      } catch (err) {
        toast(err.message);
      } finally {
        addBtn.disabled = !current?.available;
      }
    });

    // Barra fija de compra en celular cuando los botones principales salen de pantalla.
    if (sticky && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        sticky.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
        sticky.setAttribute('aria-hidden', String(!sticky.classList.contains('is-visible')));
      }).observe($('[data-buy-buttons]', form));
    }
  }

  function toast(html) {
    $('.toast')?.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = html;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  /* ---------- Colección: enviar filtros/orden al cambiar ---------- */
  $$('[data-autosubmit]').forEach((s) => s.addEventListener('change', () => s.form.submit()));
  const facets = $('[data-facets-form]');
  if (facets && window.matchMedia('(min-width: 990px)').matches) {
    facets.addEventListener('change', (e) => e.target.type === 'checkbox' && facets.submit());
  }

  /* ---------- Seguí tu pedido ---------- */
  const tracking = $('[data-tracking-form]');
  if (tracking) {
    const out = $('[data-tracking-result]');
    const params = new URLSearchParams(location.search);
    if (params.get('pedido')) tracking.pedido.value = params.get('pedido');
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('es-UY', { day: '2-digit', month: 'long' }) : '');

    tracking.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pedido = tracking.pedido.value.trim().replace('#', '');
      const contacto = tracking.contacto.value.trim();
      if (!pedido || !contacto) {
        out.innerHTML = '<p class="notice notice--error">Completá el número de pedido y tu email o teléfono.</p>';
        return;
      }
      out.innerHTML = '<p class="muted">Buscando tu pedido…</p>';
      try {
        const res = await fetch(`${NP.routes.trackingProxy}?${new URLSearchParams({ pedido, contacto })}`, { headers: { Accept: 'application/json' } });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'No encontramos el pedido.');
        const o = data.order;
        out.innerHTML = `
          <div class="cart-summary">
            <p class="eyebrow">Pedido ${esc(o.pedido)}</p>
            <h2 class="h3" style="margin:0">${esc(o.estadoTexto)}</h2>
            ${o.cancelado ? '<p class="notice notice--error">Este pedido fue cancelado.</p>' : `
            <ol class="timeline">${o.pasos.map((p) => `<li class="${p.completo ? 'done' : ''}">${esc(p.texto)}</li>`).join('')}</ol>`}
            ${o.envios.map((s) => `<div class="notice"><strong>${esc(s.empresa || 'Envío')}</strong> · Nº de seguimiento: <strong>${esc(s.numero)}</strong>
              ${s.url ? `<br><a href="${esc(s.url)}" target="_blank" rel="noopener">Ver en la empresa de envío →</a>` : ''}
              ${s.fechaEstimada ? `<br>Entrega estimada: ${esc(fmtDate(s.fechaEstimada))}` : ''}</div>`).join('')}
            <h3 style="font-size:15px;margin:14px 0 6px">Productos</h3>
            <ul style="margin:0;padding-left:18px">${o.productos.map((p) => `<li>${esc(p.nombre)} ${esc(p.tamano)} × ${p.cantidad}</li>`).join('')}</ul>
          </div>`;
      } catch (err) {
        out.innerHTML = `<p class="notice notice--error">${esc(err.message)}</p>`;
      }
    });
    if (params.get('pedido') && params.get('contacto')) {
      tracking.contacto.value = params.get('contacto');
      tracking.requestSubmit();
    }
  }
})();
