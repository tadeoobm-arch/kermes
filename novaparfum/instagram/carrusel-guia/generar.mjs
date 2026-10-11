// Carrusel "¿Qué perfume estás buscando?" (7 imágenes de 1080 × 1440, 3:4).
// Categorías según la descripción de cada perfume en Shopify; frascos con foto verificada de 100 ml, sin el texto "100 ml" (pedido de la tienda, 11/10/2026).
// Uso: node generar.mjs <carpeta-recortes> <carpeta-salida>
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const CUT = process.argv[2], OUT = process.argv[3];
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const img = n => 'data:image/png;base64,' + readFileSync(`${CUT}/${n}.png`).toString('base64');
const INK = '#2F2A4A', IRIS = '#7A68B8', LILAC = '#B3A6E4', POWDER = '#E9C9CF', CREAM = '#F7F4F0';

const CATS = [
  { f: '2-dulce', title: 'Dulce', sub: 'Vainilla, praliné y canela', items: [
    { img: 'angels-frasco', brand: 'Kilian', name: "Angels' Share", line: 'Coñac, canela y praliné' },
    { img: 'swyint', brand: 'Armani', name: 'Stronger With You Intensely', line: 'Castaña confitada, vainilla y canela' },
    { img: 'lavie', brand: 'Lancôme', name: 'La Vie Est Belle', line: 'Dulce y luminosa' } ] },
  { f: '3-elegante', title: 'Elegante', sub: 'Para quedar bien en cualquier ocasión', items: [
    { img: 'bleu', brand: 'Chanel', name: 'Bleu de Chanel', line: 'Elegante y versátil' },
    { img: 'coco', brand: 'Chanel', name: 'Coco Mademoiselle', line: 'Naranja, rosa y pachulí' },
    { img: 'donna', brand: 'Valentino', name: 'Donna Born in Roma', line: 'Elegante y moderna' } ] },
  { f: '4-de-noche', title: 'De noche', sub: 'Intensos, para salir', items: [
    { img: 'interlude', brand: 'Amouage', name: 'Interlude Man', line: 'Incienso, especias y resinas' },
    { img: 'naxos', brand: 'Xerjoff', name: 'Naxos', line: 'Miel, tabaco y lavanda' },
    { img: 'euphoria', brand: 'Calvin Klein', name: 'Euphoria', line: 'Sensual y misteriosa' } ] },
  { f: '5-para-el-calor', title: 'Para el calor', sub: 'Frescos y livianos', items: [
    { img: 'adg', brand: 'Armani', name: 'Acqua di Giò', line: 'Fresco, limpio y fácil de llevar' },
    { img: 'smw', brand: 'Creed', name: 'Silver Mountain Water', line: 'Frescura cristalina' } ] },
  { f: '6-sin-gastar-tanto', title: 'Sin gastar tanto', sub: 'Árabes desde $ 3.200', items: [
    { img: 'asad', brand: 'Lattafa', name: 'Asad', line: '$ 3.200' },
    { img: 'yara', brand: 'Lattafa', name: 'Yara', line: '$ 3.300' },
    { img: 'odyssey', brand: 'Armaf', name: 'Odyssey Homme', line: '$ 3.700' } ] },
];
const css = `
html,body{margin:0}
.c{width:1080px;height:1440px;position:relative;overflow:hidden;color:${INK};font-family:Manrope,sans-serif;font-variant-numeric:lining-nums;
 background:radial-gradient(ellipse 80% 60% at 45% 40%,#FBF8F3 0%,#F4EEE6 55%,#ECE3D8 100%)}
/* seda: pliegues claros y sombras de ventana difusas */
.silk{position:absolute;inset:-200px;filter:blur(26px);opacity:.9;
 background:
  linear-gradient(118deg,transparent 0 18%,rgba(255,255,255,.75) 21%,transparent 26%,transparent 40%,rgba(255,255,255,.6) 44%,transparent 50%,transparent 62%,rgba(255,255,255,.55) 66%,transparent 72%),
  linear-gradient(118deg,transparent 0 28%,rgba(120,95,70,.09) 31%,transparent 36%,transparent 52%,rgba(120,95,70,.08) 56%,transparent 61%,transparent 76%,rgba(120,95,70,.07) 80%,transparent 86%)}
.logo{position:absolute;top:64px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:12px;z-index:5}
.logo svg{width:34px;height:34px}.logo b{font:400 38px Fraunces,serif}.logo b span{color:${IRIS}}
.b{position:absolute;filter:drop-shadow(22px 30px 26px rgba(70,50,30,.30)) drop-shadow(4px 6px 6px rgba(70,50,30,.18))}
.b img{display:block;width:100%;height:100%;object-fit:contain}
/* portada */
.lines{position:absolute;inset:0;z-index:2}
.h1{position:absolute;left:0;right:0;top:604px;text-align:center;z-index:4;font:700 72px/1.06 Manrope,sans-serif;letter-spacing:-.01em;text-transform:uppercase}
.h2{position:absolute;left:0;right:0;top:790px;text-align:center;z-index:4;font:400 46px Manrope,sans-serif}
.swipe{position:absolute;left:50%;transform:translateX(-50%);bottom:70px;z-index:6;padding:14px 28px;border-radius:99px;background:${INK};color:${CREAM};font:600 26px Manrope,sans-serif;letter-spacing:.06em}
/* categorías */
.eb{position:absolute;top:168px;left:0;right:0;text-align:center;font:700 26px Manrope,sans-serif;letter-spacing:.3em;color:${IRIS}}
.ct{position:absolute;top:212px;left:40px;right:40px;text-align:center;font:700 118px/1 Manrope,sans-serif;letter-spacing:-.02em;text-transform:uppercase;white-space:nowrap}
.cs{position:absolute;top:350px;left:40px;right:40px;text-align:center;font:400 40px Manrope,sans-serif;color:#5A5470}
.row{position:absolute;left:30px;right:30px;top:450px;height:860px;display:flex;justify-content:center;align-items:stretch;gap:20px}
.it{flex:1;max-width:340px;display:flex;flex-direction:column;align-items:center;text-align:center}
.it .ph{position:relative;height:560px;width:100%;display:flex;align-items:flex-end;justify-content:center}
.it .ph img{max-width:300px;max-height:520px;object-fit:contain;filter:drop-shadow(18px 26px 22px rgba(70,50,30,.30)) drop-shadow(3px 5px 5px rgba(70,50,30,.18))}
.it .br{margin-top:26px;font:700 20px Manrope,sans-serif;letter-spacing:.22em;color:${IRIS};text-transform:uppercase}
.it .nm{margin-top:6px;font:400 40px/1.08 Fraunces,serif;font-variation-settings:'opsz' 36}
.it .ln{margin-top:10px;font:500 25px/1.3 Manrope,sans-serif;color:#5A5470}
.it .ln.pr{font:700 36px Manrope,sans-serif;color:${IRIS}}
.foot{position:absolute;left:0;right:0;bottom:56px;display:flex;justify-content:center;align-items:center;gap:14px;font:600 24px Manrope,sans-serif;color:#6E6884}
.dots{display:flex;gap:10px}.dots i{width:11px;height:11px;border-radius:50%;background:rgba(47,42,74,.2)}.dots i.on{background:${IRIS}}
/* cierre */
.q{position:absolute;top:240px;left:60px;right:60px;text-align:center;font:700 96px/1.04 Manrope,sans-serif;letter-spacing:-.015em;text-transform:uppercase}
.q2{position:absolute;top:470px;left:0;right:0;text-align:center;font:400 44px Manrope,sans-serif}
.cta{position:absolute;top:1060px;left:50%;transform:translateX(-50%);padding:24px 44px;border-radius:99px;background:${INK};color:${CREAM};font:700 38px Manrope,sans-serif;white-space:nowrap}
.cta2{position:absolute;top:1180px;left:0;right:0;text-align:center;font:500 30px/1.5 Manrope,sans-serif;color:#5A5470}
`;
const logo = `<div class="logo"><svg viewBox="0 0 40 40"><path d="${STAR}" fill="${IRIS}"/><circle cx="30.5" cy="29.5" r="2.6" fill="${LILAC}"/></svg><b>nova<span>parfum</span></b></div>`;
const dots = n => `<div class="dots">${Array.from({ length: 7 }, (_, i) => `<i class="${i === n ? 'on' : ''}"></i>`).join('')}</div>`;
// frasco suelto en la portada / cierre: x, y, ancho, alto, rotación
const bottle = (n, x, y, w, h, r) => `<div class="b" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${r}deg)"><img src="${img(n)}"></div>`;
const cover = `${logo}
  ${bottle('angels-frasco', -70, 60, 400, 470, -14)}
  ${bottle('smw', 760, 70, 330, 470, 13)}
  ${bottle('interlude', -60, 900, 320, 560, 10)}
  ${bottle('swyint', 720, 930, 420, 540, -12)}
  ${bottle('naxos', 935, 540, 230, 400, 16)}
  ${bottle('aventus', -150, 500, 280, 440, -9)}
  <svg class="lines" viewBox="0 0 1080 1440" fill="none" stroke="${IRIS}" stroke-width="2.2" stroke-linecap="round" opacity=".75">
    <path d="M330 420 C 430 450, 470 500, 480 560"/><circle cx="480" cy="566" r="5" fill="${IRIS}"/>
    <path d="M760 430 C 650 450, 610 500, 600 560"/><circle cx="600" cy="566" r="5" fill="${IRIS}"/>
    <path d="M300 1010 C 420 1000, 470 950, 480 900"/><circle cx="480" cy="894" r="5" fill="${IRIS}"/>
    <path d="M770 1000 C 660 1000, 610 950, 600 900"/><circle cx="600" cy="894" r="5" fill="${IRIS}"/>
  </svg>
  <div class="h1">¿Qué perfume<br>estás buscando?</div>
  <div class="h2">Te lo hacemos fácil.</div>
  <div class="swipe">Deslizá →</div>`;
const catSlide = (c, k) => `${logo}
  <div class="eb">SI BUSCÁS ALGO</div><div class="ct">${c.title}</div><div class="cs">${c.sub}</div>
  <div class="row">${c.items.map(it => `<div class="it"><div class="ph"><img src="${img(it.img)}"></div>
    <div class="br">${it.brand}</div><div class="nm">${it.name}</div>
    <div class="ln${it.line.startsWith('$') ? ' pr' : ''}">${it.line}</div></div>`).join('')}</div>
  <div class="foot">${dots(k)}</div>`;
const close = `${logo}
  <div class="q">¿A vos cuál<br>te gusta más?</div>
  <div class="q2">Contanos en los comentarios 👇</div>
  ${bottle('guidance', 70, 600, 300, 400, -10)}
  ${bottle('santal', 400, 560, 270, 460, 3)}
  ${bottle('another13', 700, 600, 270, 420, 11)}
  <div class="cta">Link en el perfil</div>
  <div class="cta2">Envío a todo Uruguay<br>Pagás con Mercado Pago</div>
  <div class="foot">${dots(6)}</div>`;
const SLIDES = [{ f: '1-portada', html: cover }, ...CATS.map((c, i) => ({ f: c.f, html: catSlide(c, i + 1) })), { f: '7-cierre', html: close }];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const p = await (await b.newContext({ viewport: { width: 1080, height: 1440 } })).newPage();
for (const s of SLIDES) {
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body><div class="c"><div class="silk"></div>${s.html}</div></body></html>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  // títulos largos en una línea
  await p.evaluate(() => { const el = document.querySelector('.ct'); if (!el) return; let fs = 118; while (el.scrollWidth > el.clientWidth && fs > 70) { fs -= 4; el.style.fontSize = fs + 'px'; } });
  await p.locator('.c').screenshot({ path: `${OUT}/${s.f}.png` });
  console.log(s.f);
}
await b.close();
