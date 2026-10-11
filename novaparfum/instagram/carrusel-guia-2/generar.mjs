// Carrusel "¿Qué perfume estás buscando?", segunda versión: perfumes que no salieron en ninguna publicación anterior (7 imágenes de 1080 × 1440, 3:4).
// Formato pedido por la tienda (como el carrusel de referencia): seis frascos alrededor de "Quiero un perfume ___", con el nombre debajo,
// todos enteros dentro de la imagen. Identidad de NovaParfum: logo con la estrella arriba, Fraunces + Manrope, violeta de la marca en óvalo y líneas.
// Categorías según la descripción de cada perfume en Shopify; frascos con foto verificada de 100 ml, sin el texto "100 ml".
// Uso: node generar.mjs <carpeta-recortes> <carpeta-salida>
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const CUT = process.argv[2], OUT = process.argv[3];
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const img = n => 'data:image/png;base64,' + readFileSync(`${CUT}/${n}.png`).toString('base64');
const INK = '#2F2A4A', IRIS = '#7A68B8', LILAC = '#B3A6E4', POWDER = '#E9C9CF';

// Lugares de los frascos: arriba (TL, TR), a los costados del título (ML, MR) y abajo (BL, BR).
// x, y, ancho y alto de la caja donde entra el frasco (apoyado abajo), rotación y ancho del texto.
const SLOTS = {
  TL: { x: 36, y: 92, w: 380, h: 372, r: -7, tw: 360 },
  TR: { x: 664, y: 92, w: 380, h: 372, r: 7, tw: 360 },
  ML: { x: 14, y: 572, w: 244, h: 318, r: -5, tw: 250 },
  MR: { x: 822, y: 572, w: 244, h: 318, r: 5, tw: 250 },
  BL: { x: 46, y: 982, w: 390, h: 346, r: 6, tw: 360 },
  BR: { x: 644, y: 982, w: 390, h: 346, r: -6, tw: 360 },
};
// Precios de Shopify del 11/10/2026 (solo en "Sin gastar tanto").
const SLIDES = [
  { f: '1-portada', pre: '¿Qué perfume', word: 'estás buscando?', sub: 'Te lo hacemos fácil. Deslizá →', items: {
    TL: ['n5', 'Chanel', 'N°5'], TR: ['viking', 'Creed', 'Viking'], ML: ['gardenia', 'Gucci', 'Flora Gorgeous Gardenia'],
    MR: ['si', 'Armani', 'Sì'], BL: ['dylanfemme', 'Versace', 'Dylan Blue pour Femme'], BR: ['royaloud', 'Creed', 'Royal Oud'] } },
  { f: '2-dulce', pre: 'Quiero un perfume', word: 'Dulce', items: {
    TL: ['flowerbomb', 'Viktor&Rolf', 'Flowerbomb'], TR: ['amen', 'Mugler', 'A*Men'], ML: ['gardenia', 'Gucci', 'Flora Gorgeous Gardenia'],
    MR: ['tonka', 'Montale', 'Arabians Tonka'], BL: ['chocolat', 'Armaf', 'Odyssey Dubai Chocolat'], BR: ['marshmallow', 'Armaf', 'Odyssey Marshmallow'] } },
  { f: '3-elegante', pre: 'Quiero un perfume', word: 'Elegante', items: {
    TL: ['n5', 'Chanel', 'N°5'], TR: ['royaloud', 'Creed', 'Royal Oud'], ML: ['yedp', 'YSL', 'Y Eau de Parfum'],
    MR: ['pradalhomme', 'Prada', "L'Homme"], BL: ['gentleman', 'Givenchy', 'Gentleman'], BR: ['dhi', 'Dior', 'Homme Intense'] } },
  { f: '4-de-noche', pre: 'Quiero un perfume', word: 'De noche', items: {
    TL: ['viking', 'Creed', 'Viking'], TR: ['erosflame', 'Versace', 'Eros Flame'], ML: ['blackaoud', 'Montale', 'Black Aoud'],
    MR: ['si', 'Armani', 'Sì'], BL: ['lanuit', 'YSL', "La Nuit de L'Homme"], BR: ['intensecafe', 'Montale', 'Intense Café'] } },
  { f: '5-para-el-calor', pre: 'Quiero un perfume', word: 'Para el<br>calor', items: {
    TL: ['daisy', 'Marc Jacobs', 'Daisy'], TR: ['git', 'Creed', 'Green Irish Tweed'], ML: ['reflection', 'Amouage', 'Reflection Man'],
    MR: ['toy2pearl', 'Moschino', 'Toy 2 Pearl'], BL: ['dylanfemme', 'Versace', 'Dylan Blue pour Femme'], BR: ['uomogreen', 'Valentino', 'Uomo Green Stravaganza'] } },
  { f: '6-sin-gastar-tanto', pre: 'Quiero un perfume', word: 'Sin gastar<br>tanto', items: {
    TL: ['legend', 'Montblanc', 'Legend', '$ 5.500'], TR: ['versense', 'Versace', 'Versense', '$ 5.000'], ML: ['zanzibar', 'Lattafa', 'Asad Zanzibar', '$ 3.300'],
    MR: ['yaratous', 'Lattafa', 'Yara Tous', '$ 3.300'], BL: ['tommygirl', 'Tommy Hilfiger', 'Tommy Girl', '$ 4.150'], BR: ['yaraelixir', 'Lattafa', 'Yara Elixir', '$ 3.600'] } },
  { f: '7-cierre', pre: '¿A vos cuál', word: 'te gusta más?', sub: 'Contanos en los comentarios 👇', pill: 'Link en el perfil · Envío a todo Uruguay', items: {
    TL: ['toy2pearl', 'Moschino', 'Toy 2 Pearl'], TR: ['erosflame', 'Versace', 'Eros Flame'],
    BL: ['yaraelixir', 'Lattafa', 'Yara Elixir'], BR: ['gentleman', 'Givenchy', 'Gentleman'] } },
];
const css = `
html,body{margin:0}
.c{width:1080px;height:1440px;position:relative;overflow:hidden;color:${INK};font-family:Manrope,sans-serif;font-variant-numeric:lining-nums;
 background:radial-gradient(ellipse 80% 60% at 50% 45%,#FDFBF7 0%,#F7F2EA 55%,#EEE5D9 100%)}
/* seda: pliegues claros y sombras suaves */
.silk{position:absolute;inset:-200px;filter:blur(26px);opacity:.9;
 background:
  linear-gradient(118deg,transparent 0 18%,rgba(255,255,255,.8) 21%,transparent 26%,transparent 40%,rgba(255,255,255,.65) 44%,transparent 50%,transparent 62%,rgba(255,255,255,.6) 66%,transparent 72%),
  linear-gradient(118deg,transparent 0 28%,rgba(120,95,70,.08) 31%,transparent 36%,transparent 52%,rgba(120,95,70,.07) 56%,transparent 61%,transparent 76%,rgba(120,95,70,.06) 80%,transparent 86%),
  radial-gradient(ellipse 40% 30% at 50% 50%,rgba(233,201,207,.25),transparent)}
.sp{position:absolute;z-index:1}
.logo{position:absolute;top:40px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:10px;z-index:5}
.logo svg{width:30px;height:30px}.logo b{font:400 34px Fraunces,serif;letter-spacing:-.01em}.logo b span{color:${IRIS}}
.slot{position:absolute;z-index:3;display:flex;align-items:flex-end;justify-content:center}
.slot img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(18px 26px 22px rgba(70,50,30,.28)) drop-shadow(3px 5px 6px rgba(70,50,30,.18))}
.lab{position:absolute;z-index:4;text-align:center}
.lab .br{font:600 15px Manrope,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:${IRIS}}
.lab .nm{margin-top:3px;font:600 22px/1.15 Manrope,sans-serif;text-transform:uppercase;letter-spacing:.02em}
.lab .pr{margin-top:4px;font:700 26px Manrope,sans-serif;color:${IRIS}}
.lines{position:absolute;inset:0;z-index:2}
.mid{position:absolute;left:250px;right:250px;z-index:4;display:flex;flex-direction:column;align-items:center;text-align:center}
.pre{font:700 34px Manrope,sans-serif;letter-spacing:.06em;text-transform:uppercase}
.oval{margin-top:10px;padding:14px 46px 20px;border:2.4px solid ${IRIS};border-radius:50%;font-family:Fraunces,serif;font-weight:400;font-variation-settings:'opsz' 48;
 font-size:96px;line-height:1;letter-spacing:-.015em;white-space:nowrap}
.sub{margin-top:18px;font:500 28px Manrope,sans-serif;color:#5A5470}
.pill{position:absolute;left:50%;transform:translateX(-50%);z-index:6;padding:14px 30px;border-radius:99px;background:${INK};color:#F7F4F0;font:600 26px Manrope,sans-serif;letter-spacing:.04em;white-space:nowrap}
`;
const logo = `<div class="logo"><svg viewBox="0 0 40 40"><path d="${STAR}" fill="${IRIS}"/><circle cx="30.5" cy="29.5" r="2.6" fill="${LILAC}"/></svg><b>nova<span>parfum</span></b></div>`;
const spark = (x, y, w, c, o) => `<svg class="sp" style="left:${x}px;top:${y}px;width:${w}px;opacity:${o}" viewBox="0 0 40 40"><path d="${STAR}" fill="${c}"/></svg>`;
const sparks = spark(470, 515, 22, IRIS, .5) + spark(590, 915, 18, POWDER, .9) + spark(40, 470, 16, LILAC, .7) + spark(1020, 930, 16, LILAC, .7);
const slotHtml = (k, [n, brand, name, price]) => {
  const s = SLOTS[k];
  return `<div class="slot" style="left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px;transform:rotate(${s.r}deg)"><img src="${img(n)}"></div>
  <div class="lab" style="left:${s.x + s.w / 2 - s.tw / 2}px;top:${s.y + s.h + 14}px;width:${s.tw}px"><div class="br">${brand}</div><div class="nm">${name}</div>${price ? `<div class="pr">${price}</div>` : ''}</div>`;
};
// líneas curvas del título a los frascos, como en el carrusel de referencia (se ubican según la altura del bloque del medio)
const lines = `<svg class="lines" viewBox="0 0 1080 1440" fill="none" stroke="${IRIS}" stroke-width="2.2" stroke-linecap="round" opacity=".75"></svg>`;
const linePaths = (top, bottom, c) => `
  <path d="M478 ${top} C 470 ${top - 55}, 425 ${top - 85}, 372 ${top - 98}"/><circle cx="478" cy="${top + 6}" r="5" fill="${c}"/>
  <path d="M602 ${top} C 610 ${top - 55}, 655 ${top - 85}, 708 ${top - 98}"/><circle cx="602" cy="${top + 6}" r="5" fill="${c}"/>
  <path d="M478 ${bottom} C 470 ${bottom + 48}, 425 ${bottom + 72}, 372 ${bottom + 82}"/><circle cx="478" cy="${bottom - 6}" r="5" fill="${c}"/>
  <path d="M602 ${bottom} C 610 ${bottom + 48}, 655 ${bottom + 72}, 708 ${bottom + 82}"/><circle cx="602" cy="${bottom - 6}" r="5" fill="${c}"/>`;
const page = s => `<div class="silk"></div>${sparks}${logo}
  ${Object.entries(s.items).map(([k, v]) => slotHtml(k, v)).join('')}
  ${lines}
  <div class="mid"><div class="pre">${s.pre}</div><div class="oval">${s.word}</div>${s.sub ? `<div class="sub">${s.sub}</div>` : ''}</div>
  ${s.pill ? `<div class="pill">${s.pill}</div>` : ''}`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const p = await (await b.newContext({ viewport: { width: 1080, height: 1440 } })).newPage();
for (const s of SLIDES) {
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body><div class="c">${page(s)}</div></body></html>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const { top, bottom } = await p.evaluate(() => {
    // el óvalo no puede pisar los frascos de los costados: achica la letra si hace falta
    const o = document.querySelector('.oval'); let fs = 96; while (o.getBoundingClientRect().width > 580 && fs > 56) { fs -= 4; o.style.fontSize = fs + 'px'; }
    // el bloque del medio queda centrado entre las líneas de arriba (y=560) y las de abajo (y=893)
    const m = document.querySelector('.mid'); const h = m.getBoundingClientRect().height; m.style.top = Math.round(726 - h / 2) + 'px';
    const pill = document.querySelector('.pill'); if (pill) { pill.style.top = Math.round(726 + h / 2 + 26) + 'px'; }
    return { top: Math.round(m.getBoundingClientRect().top - 14), bottom: Math.round((pill || m).getBoundingClientRect().bottom + 14) };
  });
  await p.evaluate(html => { document.querySelector('.lines').innerHTML = html; }, linePaths(top, bottom, IRIS));
  // controles: todo dentro de la imagen
  const chk = await p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('.slot img, .lab, .pill')) { const r = e.getBoundingClientRect(); if (r.left < 4 || r.right > 1076 || r.top < 4 || r.bottom > 1432) out.push(`FUERA ${e.className || 'img'}: ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`); }
    const m = document.querySelector('.mid').getBoundingClientRect(); out.push(`medio ${Math.round(m.top)}-${Math.round(m.bottom)}, óvalo ${Math.round(document.querySelector('.oval').getBoundingClientRect().width)} px`);
    return out;
  });
  await p.locator('.c').screenshot({ path: `${OUT}/${s.f}.png` });
  console.log(s.f, chk.join(' | '));
}
await b.close();
