// Carrusel "¿Qué perfume estás buscando?", segunda versión: perfumes que no salieron en ninguna publicación anterior (7 imágenes de 1080 × 1440, 3:4).
// Identidad de NovaParfum como el resto del feed: fondo #2F2A4A, Fraunces + Manrope, logo con la estrella y frascos sobre tarjetas claras.
// Categorías según la descripción de cada perfume en Shopify; frascos con foto verificada de 100 ml, sin el texto "100 ml" (pedido de la tienda, 11/10/2026).
// Uso: node generar.mjs <carpeta-recortes> <carpeta-salida>
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const CUT = process.argv[2], OUT = process.argv[3];
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const img = n => 'data:image/png;base64,' + readFileSync(`${CUT}/${n}.png`).toString('base64');
const INK = '#2F2A4A', DEEP = '#1E1A33', IRIS = '#7A68B8', LILAC = '#B3A6E4', POWDER = '#E9C9CF', CREAM = '#F7F4F0';

const CATS = [
  { f: '2-dulce', title: 'Dulce', sub: 'Caramelo, azúcar moreno y flores', items: [
    { img: 'flowerbomb', brand: 'Viktor&Rolf', name: 'Flowerbomb', line: 'Jazmín, rosa y pachulí' },
    { img: 'gardenia', brand: 'Gucci', name: 'Flora Gorgeous Gardenia', line: 'Gardenia, pera y azúcar moreno' },
    { img: 'amen', brand: 'Mugler', name: 'A*Men', line: 'Café, pachulí y caramelo' } ] },
  { f: '3-elegante', title: 'Elegante', sub: 'Para quedar bien en cualquier ocasión', items: [
    { img: 'n5', brand: 'Chanel', name: 'N°5', line: 'Aldehídos, rosa y jazmín' },
    { img: 'si', brand: 'Armani', name: 'Sì', line: 'Grosella negra, rosa y vainilla' },
    { img: 'dhi', brand: 'Dior', name: 'Homme Intense', line: 'Iris empolvado y sofisticado' } ] },
  { f: '4-de-noche', title: 'De noche', sub: 'Intensos, para salir', items: [
    { img: 'intensecafe', brand: 'Montale', name: 'Intense Café', line: 'Café tostado, rosa y vainilla' },
    { img: 'lanuit', brand: 'YSL', name: "La Nuit de L'Homme", line: 'Cardamomo, lavanda y cedro' },
    { img: 'viking', brand: 'Creed', name: 'Viking', line: 'Menta, pimienta y maderas nobles' } ] },
  { f: '5-para-el-calor', title: 'Para el calor', sub: 'Frescos y livianos', items: [
    { img: 'daisy', brand: 'Marc Jacobs', name: 'Daisy', line: 'Frutillas, violeta y flores blancas' },
    { img: 'dylanfemme', brand: 'Versace', name: 'Dylan Blue pour Femme', line: 'Fresca, frutal y vibrante' },
    { img: 'git', brand: 'Creed', name: 'Green Irish Tweed', line: 'Verde, limpio y aristocrático' } ] },
  { f: '6-sin-gastar-tanto', title: 'Sin gastar tanto', sub: 'Árabes desde $ 3.100', items: [
    { img: 'chocolat', brand: 'Armaf', name: 'Odyssey Dubai Chocolat', line: '$ 3.100' },
    { img: 'zanzibar', brand: 'Lattafa', name: 'Asad Zanzibar', line: '$ 3.300' },
    { img: 'marshmallow', brand: 'Armaf', name: 'Odyssey Marshmallow', line: '$ 3.600' } ] },
];
const css = `
html,body{margin:0}
.c{width:1080px;height:1440px;position:relative;overflow:hidden;color:${CREAM};font-family:Manrope,sans-serif;font-variant-numeric:lining-nums;
 background:radial-gradient(ellipse 85% 60% at 50% 40%,#463E6E 0%,${INK} 60%,#221D38 100%)}
.sp{position:absolute;fill:${POWDER};opacity:.45}
.logo{position:absolute;top:62px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:12px;z-index:5}
.logo svg{width:34px;height:34px}.logo b{font:400 38px Fraunces,serif;letter-spacing:-.01em}.logo b span{color:${LILAC}}
.fr{font-family:Fraunces,serif;font-weight:400;font-variation-settings:'opsz' 48;letter-spacing:-.015em}
/* tarjeta clara, como en los posts de producto */
.card{border-radius:34px;background:radial-gradient(ellipse 70% 60% at 50% 45%,#FFFFFF 0%,${CREAM} 70%,#EFEAF3 100%);box-shadow:0 24px 50px rgba(15,12,30,.35)}
/* portada */
.b{position:absolute;z-index:3;filter:drop-shadow(0 30px 34px rgba(12,10,24,.55)) drop-shadow(0 4px 8px rgba(12,10,24,.35))}
.b img{display:block;width:100%;height:100%;object-fit:contain}
.glow{position:absolute;z-index:2;border-radius:50%;background:radial-gradient(closest-side,rgba(233,201,207,.30),rgba(179,166,228,.12) 55%,transparent);filter:blur(6px)}
.lines{position:absolute;inset:0;z-index:2}
.h1{position:absolute;left:0;right:0;top:596px;text-align:center;z-index:4;font-size:92px;line-height:1.04}
.h2{position:absolute;left:0;right:0;top:806px;text-align:center;z-index:4;font:400 42px Manrope,sans-serif;color:${POWDER}}
.swipe{position:absolute;left:50%;transform:translateX(-50%);bottom:70px;z-index:6;padding:14px 30px;border-radius:99px;background:${CREAM};color:${INK};font:600 26px Manrope,sans-serif;letter-spacing:.06em}
/* categorías */
.eb{position:absolute;top:160px;left:0;right:0;text-align:center;font:600 24px Manrope,sans-serif;letter-spacing:.32em;color:${LILAC}}
.ct{position:absolute;top:186px;left:40px;right:40px;text-align:center;font-size:124px;line-height:1.05;white-space:nowrap}
.cs{position:absolute;top:360px;left:40px;right:40px;text-align:center;font:400 36px Manrope,sans-serif;color:rgba(247,244,240,.72)}
.row{position:absolute;left:40px;right:40px;top:452px;display:flex;justify-content:center;gap:24px}
.it{flex:1;max-width:316px;display:flex;flex-direction:column;align-items:center;text-align:center}
.it .card{width:100%;height:610px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:34px;box-sizing:border-box}
.it .card img{max-width:260px;max-height:510px;object-fit:contain;filter:drop-shadow(0 22px 24px rgba(47,42,74,.28)) drop-shadow(0 3px 5px rgba(47,42,74,.18))}
.it .br{margin-top:28px;font:600 19px Manrope,sans-serif;letter-spacing:.22em;color:${LILAC};text-transform:uppercase}
.it .nm{margin-top:8px;font-size:38px;line-height:1.08}
.it .ln{margin-top:10px;font:400 24px/1.3 Manrope,sans-serif;color:rgba(247,244,240,.66)}
.it .ln.pr{font:600 36px Manrope,sans-serif;color:${POWDER}}
.foot{position:absolute;left:0;right:0;bottom:56px;display:flex;justify-content:center}
.dots{display:flex;gap:10px}.dots i{width:11px;height:11px;border-radius:50%;background:rgba(247,244,240,.22)}.dots i.on{background:${POWDER}}
/* cierre */
.q{position:absolute;top:190px;left:60px;right:60px;text-align:center;font-size:104px;line-height:1.02}
.q2{position:absolute;top:432px;left:0;right:0;text-align:center;font:400 40px Manrope,sans-serif;color:${POWDER}}
.stage{position:absolute;left:110px;right:110px;top:530px;height:500px;display:flex;align-items:flex-end;justify-content:center;gap:34px;padding-bottom:40px;box-sizing:border-box}
.stage img{max-height:400px;max-width:250px;object-fit:contain;filter:drop-shadow(0 22px 24px rgba(47,42,74,.28)) drop-shadow(0 3px 5px rgba(47,42,74,.18))}
.cta{position:absolute;top:1088px;left:50%;transform:translateX(-50%);padding:24px 46px;border-radius:99px;background:${CREAM};color:${INK};font:700 38px Manrope,sans-serif;white-space:nowrap}
.cta2{position:absolute;top:1210px;left:0;right:0;text-align:center;font:400 30px/1.5 Manrope,sans-serif;color:rgba(247,244,240,.72)}
`;
const logo = `<div class="logo"><svg viewBox="0 0 40 40"><path d="${STAR}" fill="${POWDER}"/><circle cx="30.5" cy="29.5" r="2.6" fill="${LILAC}"/></svg><b>nova<span>parfum</span></b></div>`;
const spark = (x, y, w, o = .45) => `<svg class="sp" style="left:${x}px;top:${y}px;width:${w}px;opacity:${o}" viewBox="0 0 40 40"><path d="${STAR}"/></svg>`;
const sparks = spark(48, 70, 26) + spark(1010, 300, 18) + spark(70, 1320, 16) + spark(990, 1250, 22, .35);
const dots = n => `<div class="dots">${Array.from({ length: 7 }, (_, i) => `<i class="${i === n ? 'on' : ''}"></i>`).join('')}</div>`;
// frasco suelto en la portada: x, y, ancho, alto, rotación, con un brillo suave detrás para que se lea sobre el fondo oscuro
const bottle = (n, x, y, w, h, r) => `<div class="glow" style="left:${x - 30}px;top:${y + h * .1}px;width:${w + 60}px;height:${h * .85}px"></div><div class="b" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${r}deg)"><img src="${img(n)}"></div>`;
const cover = `${logo}
  ${bottle('flowerbomb', -70, 60, 400, 470, -14)}
  ${bottle('viking', 760, 70, 330, 470, 13)}
  ${bottle('daisy', -70, 930, 340, 500, 10)}
  ${bottle('dylanfemme', 730, 940, 400, 500, -12)}
  ${bottle('n5', 935, 560, 220, 370, 14)}
  ${bottle('gardenia', -45, 480, 205, 390, -9)}
  <svg class="lines" viewBox="0 0 1080 1440" fill="none" stroke="${LILAC}" stroke-width="2.2" stroke-linecap="round" opacity=".7">
    <path d="M330 420 C 430 450, 470 500, 480 545"/><circle cx="480" cy="551" r="5" fill="${LILAC}"/>
    <path d="M760 430 C 650 450, 610 500, 600 545"/><circle cx="600" cy="551" r="5" fill="${LILAC}"/>
    <path d="M300 1030 C 420 1020, 470 970, 480 925"/><circle cx="480" cy="919" r="5" fill="${LILAC}"/>
    <path d="M770 1020 C 660 1020, 610 970, 600 925"/><circle cx="600" cy="919" r="5" fill="${LILAC}"/>
  </svg>
  <div class="h1 fr">¿Qué perfume<br>estás buscando?</div>
  <div class="h2">Te lo hacemos fácil.</div>
  <div class="swipe">Deslizá →</div>`;
const catSlide = (c, k) => `${sparks}${logo}
  <div class="eb">SI BUSCÁS ALGO</div><div class="ct fr">${c.title}</div><div class="cs">${c.sub}</div>
  <div class="row">${c.items.map(it => `<div class="it"><div class="card"><img src="${img(it.img)}"></div>
    <div class="br">${it.brand}</div><div class="nm fr">${it.name}</div>
    <div class="ln${it.line.startsWith('$') ? ' pr' : ''}">${it.line}</div></div>`).join('')}</div>
  <div class="foot">${dots(k)}</div>`;
const close = `${sparks}${logo}
  <div class="q fr">¿A vos cuál<br>te gusta más?</div>
  <div class="q2">Contanos en los comentarios 👇</div>
  <div class="stage card"><img src="${img('si')}"><img src="${img('intensecafe')}"><img src="${img('lanuit')}"></div>
  <div class="cta">Link en el perfil</div>
  <div class="cta2">Envío a todo Uruguay<br>Pagás con Mercado Pago</div>
  <div class="foot">${dots(6)}</div>`;
const SLIDES = [{ f: '1-portada', html: cover }, ...CATS.map((c, i) => ({ f: c.f, html: catSlide(c, i + 1) })), { f: '7-cierre', html: close }];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const p = await (await b.newContext({ viewport: { width: 1080, height: 1440 } })).newPage();
for (const s of SLIDES) {
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body><div class="c">${s.html}</div></body></html>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  // títulos largos en una línea
  await p.evaluate(() => { const el = document.querySelector('.ct'); if (!el) return; let fs = 124; while (el.scrollWidth > el.clientWidth && fs > 80) { fs -= 4; el.style.fontSize = fs + 'px'; } });
  // que el texto de abajo no pise los puntos
  const bottom = await p.evaluate(() => Math.max(0, ...[...document.querySelectorAll('.it')].map(e => e.getBoundingClientRect().bottom)));
  await p.locator('.c').screenshot({ path: `${OUT}/${s.f}.png` });
  console.log(s.f, bottom > 1360 ? `TEXTO HASTA ${Math.round(bottom)}: PISA LOS PUNTOS` : 'ok');
}
await b.close();
