// Historia "Perfumes de nicho" (1080 × 1920) para compartir, sin precios.
// Uso: node generar.mjs <carpeta-recortes> <carpeta-salida>
// Frascos: fotos de la presentación de 100 ml (ver LEEME.md), cada uno con "100 ml" al lado.
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const CUT = process.argv[2], OUT = process.argv[3];
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const img = n => 'data:image/png;base64,' + readFileSync(`${CUT}/${n}.png`).toString('base64');
const ROW1 = [
  { img: 'naxos', brand: 'Xerjoff', name: 'Naxos', h: 340 },
  { img: 'aventus', brand: 'Creed', name: 'Aventus', h: 390 },
  { img: 'guidance', brand: 'Amouage', name: 'Guidance', h: 310 },
];
const ROW2 = [
  { img: 'santal', brand: 'Le Labo', name: 'Santal 33', h: 320 },
  { img: 'angels-frasco', brand: 'Kilian', name: "Angels' Share", h: 290 },
];
const css = `
html,body{margin:0}
.c{width:1080px;height:1920px;position:relative;overflow:hidden;color:#F7F4F0;font-family:Manrope,sans-serif;font-variant-numeric:lining-nums;
 background:radial-gradient(ellipse 80% 40% at 50% 46%,#4A4172 0%,#2B2646 55%,#17132A 100%)}
.sp{position:absolute;fill:#E9C9CF;opacity:.38}
.logo{position:absolute;top:110px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:14px}
.logo svg{width:40px;height:40px}.logo b{font:400 44px Fraunces,serif}.logo b span{color:#B3A6E4}
.eyebrow{position:absolute;top:206px;left:0;right:0;text-align:center;font:600 28px Manrope,sans-serif;letter-spacing:.3em;color:#B3A6E4}
h1{position:absolute;top:248px;left:60px;right:60px;margin:0;text-align:center;font:400 100px/1 Fraunces,serif;letter-spacing:-.02em;font-variation-settings:'opsz' 48}
h1 em{font-style:normal;color:#E9C9CF}
.brands{position:absolute;top:466px;left:0;right:0;text-align:center;font:500 30px Manrope,sans-serif;letter-spacing:.06em;color:rgba(247,244,240,.72)}
.row{position:absolute;left:40px;right:40px;display:flex;justify-content:center;align-items:flex-end;gap:46px}
.glow{position:absolute;left:90px;right:90px;height:260px;border-radius:50%;background:radial-gradient(ellipse at 50% 60%,rgba(179,166,228,.38),rgba(179,166,228,0) 70%)}
.shelf{position:absolute;left:110px;right:110px;height:3px;border-radius:3px;background:linear-gradient(90deg,rgba(233,201,207,0),rgba(233,201,207,.75),rgba(233,201,207,0))}
.it{display:flex;flex-direction:column;align-items:center}
.it img{display:block;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.45))}
.lab{position:absolute;display:flex;justify-content:center;gap:46px;left:40px;right:40px}
.lab .t{display:flex;flex-direction:column;align-items:center;text-align:center}
.lab .br{font:600 22px Manrope,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#B3A6E4}
.lab .row2{display:flex;align-items:center;gap:10px;margin-top:4px}
.lab .nm{font:400 36px/1.1 Fraunces,serif;white-space:nowrap;font-variation-settings:'opsz' 36}
.lab .ml{white-space:nowrap;padding:4px 12px;border-radius:99px;background:#7A68B8;font:700 20px Manrope,sans-serif;letter-spacing:.06em}
.cta{position:absolute;top:1538px;left:0;right:0;text-align:center;font:600 40px Manrope,sans-serif;color:#E9C9CF}
.url{position:absolute;top:1598px;left:50%;transform:translateX(-50%);padding:20px 36px;border-radius:99px;background:#F7F4F0;color:#2F2A4A;font:700 34px Manrope,sans-serif;white-space:nowrap}
.foot{position:absolute;top:1696px;left:0;right:0;text-align:center;font:500 30px Manrope,sans-serif;color:rgba(247,244,240,.85)}
`;
const logo = `<div class="logo"><svg viewBox="0 0 40 40"><path d="${STAR}" fill="#E9C9CF"/><circle cx="30.5" cy="29.5" r="2.6" fill="#B3A6E4"/></svg><b>nova<span>parfum</span></b></div>`;
const sparks = [[70,240,30],[985,330,20],[100,1180,16],[975,1260,24],[150,560,14],[930,620,16],[520,1530,12]]
  .map(([x,y,s]) => `<svg class="sp" style="left:${x}px;top:${y}px;width:${s}px" viewBox="0 0 40 40"><path d="${STAR}"/></svg>`).join('');
const row = (items, bottom, gap = 46) => `<div class="glow" style="top:${bottom - 210}px"></div>
  <div class="row" style="gap:${gap}px;top:${bottom - Math.max(...items.map(i => i.h))}px;height:${Math.max(...items.map(i => i.h))}px">${items.map(i => `<div class="it" data-k="${i.img}"><img src="${img(i.img)}" style="height:${i.h}px"></div>`).join('')}</div>
  <div class="shelf" style="top:${bottom + 6}px"></div>
  <div class="lab" style="top:${bottom + 26}px">${items.map(i => `<div class="t" data-k="${i.img}"><span class="br">${i.brand}</span><span class="row2"><span class="nm">${i.name}</span><span class="ml">100 ml</span></span></div>`).join('')}</div>`;
const html = `<div class="c">${sparks}${logo}
  <div class="eyebrow">COLECCIÓN NICHO</div>
  <h1>Perfumes de nicho,<br><em>en Uruguay</em></h1>
  <div class="brands">Creed · Xerjoff · Le Labo · Amouage · Kilian</div>
  ${row(ROW1, 930)}
  ${row(ROW2, 1400, 210)}
  <div class="cta">Pedilos en la web</div>
  <div class="url">novaparfumuy.myshopify.com</div>
  <div class="foot">@novaparfum.uy · Envío a todo Uruguay · Compartila 💜</div></div>`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body>${html}</body></html>`, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
// cada etiqueta queda centrada debajo de su frasco
await p.evaluate(() => document.querySelectorAll('.lab .t').forEach(t => {
  const it = document.querySelector(`.it[data-k="${t.dataset.k}"]`); const r = it.getBoundingClientRect(); const lr = t.parentElement.getBoundingClientRect();
  t.style.position = 'absolute'; const w = Math.max(r.width, 380); t.style.width = w + 'px'; t.style.left = (r.left + r.width / 2 - lr.left - w / 2) + 'px'; }));
const chk = await p.evaluate(() => { const h = document.querySelector('h1').getBoundingClientRect(); const br = document.querySelector('.brands').getBoundingClientRect();
  const labs = [...document.querySelectorAll('.lab .t')].map(t => t.getBoundingClientRect()); let ov = false;
  for (let i = 0; i < labs.length; i++) for (let j = i + 1; j < labs.length; j++) { const a = labs[i], c = labs[j]; if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) ov = true; }
  const r2 = Math.min(...[...document.querySelectorAll('.row')[1].querySelectorAll('img')].map(i => i.getBoundingClientRect().top)); const l1 = Math.max(...labs.slice(0,3).map(l => l.bottom));
  return { h1bottom: Math.round(h.bottom), brandsTop: Math.round(br.top), labelsOverlap: ov, row1LabelsBottom: Math.round(l1), row2Top: Math.round(r2), lastLabelBottom: Math.round(Math.max(...labs.map(l => l.bottom))) }; });
console.log(chk);
await p.locator('.c').screenshot({ path: `${OUT}/historia-nicho.png` });
// Variante con lugar libre para el sticker de enlace de Instagram (para subir desde la cuenta propia)
await p.evaluate(() => {
  document.querySelector('.url').remove();
  const cta = document.querySelector('.cta'); cta.textContent = 'Tocá el link para verlos 👇'; cta.style.top = '1532px';
  document.querySelector('.foot').style.top = '1742px';
});
await p.locator('.c').screenshot({ path: `${OUT}/historia-nicho-con-espacio-para-link.png` });
await b.close();
