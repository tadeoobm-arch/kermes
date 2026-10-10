// Historias para compartir (1080 × 1920): una para la cuenta personal del dueño y otra para que la suban amigos.
// Uso: node generar.mjs <carpeta-recortes> <carpeta-salida>
// Frascos: recortes de fotos de 100 ml, cada uno con "100 ml" al lado. Precios de Shopify del 10/10/2026.
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const CUT = process.argv[2], OUT = process.argv[3];
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const img = n => 'data:image/png;base64,' + readFileSync(`${CUT}/${n}.png`).toString('base64');
const BOTTLES = [
  { img: 'yara', name: 'Lattafa Yara', price: '$ 3.300', h: 330 },
  { img: 'eros', name: 'Versace Eros EDP', price: '$ 7.490', h: 300 },
  { img: 'coco', name: 'Coco Mademoiselle', price: '$ 10.500', h: 360 },
];
const css = `
html,body{margin:0}
.c{width:1080px;height:1920px;position:relative;overflow:hidden;color:#F7F4F0;font-family:Manrope,sans-serif;font-variant-numeric:lining-nums;
 background:radial-gradient(ellipse 90% 55% at 50% 40%,#4A4172 0%,#2F2A4A 58%,#1E1A33 100%)}
.sp{position:absolute;fill:#E9C9CF;opacity:.4}
.logo{position:absolute;top:150px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:14px}
.logo svg{width:40px;height:40px}.logo b{font:400 44px Fraunces,serif}.logo b span{color:#B3A6E4}
.eyebrow{position:absolute;top:268px;left:0;right:0;text-align:center;font:600 28px Manrope,sans-serif;letter-spacing:.24em;color:#B3A6E4}
h1{position:absolute;top:322px;left:80px;right:80px;margin:0;text-align:center;font:400 108px/1.02 Fraunces,serif;letter-spacing:-.02em;font-variation-settings:'opsz' 48;text-wrap:balance}
h1 em{font-style:normal;color:#E9C9CF}
.panel{position:absolute;left:70px;right:70px;top:700px;height:560px;border-radius:44px;
 background:radial-gradient(ellipse 70% 65% at 50% 45%,#FFFFFF 0%,#F7F4F0 70%,#ECE6F3 100%);box-shadow:0 34px 80px rgba(10,6,30,.45);
 display:grid;grid-template-columns:repeat(3,1fr);align-items:end;padding:0 18px 34px;box-sizing:border-box}
.b{display:flex;flex-direction:column;align-items:center;gap:12px;color:#2F2A4A;text-align:center}
.b img{object-fit:contain;max-width:270px;filter:drop-shadow(0 22px 24px rgba(47,42,74,.22))}
.b .n{font:600 26px/1.15 Manrope,sans-serif}
.b .p{font:700 32px Manrope,sans-serif;color:#7A68B8}
.b .ml{display:inline-block;margin-left:8px;padding:3px 10px;border-radius:99px;background:#7A68B8;color:#F7F4F0;font:700 18px Manrope,sans-serif;letter-spacing:.06em;vertical-align:4px}
.l1{position:absolute;top:1292px;left:60px;right:60px;text-align:center;font:600 44px Manrope,sans-serif;color:#E9C9CF}
.l2{position:absolute;top:1358px;left:60px;right:60px;text-align:center;font:500 34px/1.4 Manrope,sans-serif;color:rgba(247,244,240,.82)}
.url{position:absolute;top:1478px;left:50%;transform:translateX(-50%);padding:22px 38px;border-radius:99px;background:#F7F4F0;color:#2F2A4A;font:700 36px Manrope,sans-serif;white-space:nowrap}
.handle{position:absolute;top:1588px;left:0;right:0;text-align:center;font:600 36px Manrope,sans-serif;color:#B3A6E4}
.share{position:absolute;top:1648px;left:0;right:0;text-align:center;font:500 34px Manrope,sans-serif;color:rgba(247,244,240,.9)}
`;
const logo = `<div class="logo"><svg viewBox="0 0 40 40"><path d="${STAR}" fill="#E9C9CF"/><circle cx="30.5" cy="29.5" r="2.6" fill="#B3A6E4"/></svg><b>nova<span>parfum</span></b></div>`;
const sparks = [[80,260,30],[970,620,22],[110,1340,18],[960,1470,24],[150,640,14],[900,240,16]]
  .map(([x,y,s]) => `<svg class="sp" style="left:${x}px;top:${y}px;width:${s}px" viewBox="0 0 40 40"><path d="${STAR}"/></svg>`).join('');
const panel = `<div class="panel">${BOTTLES.map(b => `<div class="b"><img src="${img(b.img)}" style="height:${b.h}px"><div class="n">${b.name}</div><div class="p">${b.price}<span class="ml">100 ml</span></div></div>`).join('')}</div>`;
const common = `${panel}
  <div class="l1">Árabes, diseñador y nicho · desde $ 3.100</div>
  <div class="l2">Pagás con Mercado Pago<br>Envío a todo Uruguay en 48 a 72 horas</div>
  <div class="url">novaparfumuy.myshopify.com</div>
  <div class="handle">@novaparfum.uy</div>`;
const STORIES = [
  { f: 'historia-1-lance-mi-tienda', html: `<div class="eyebrow">MI EMPRENDIMIENTO</div><h1>¡Arranqué mi tienda de <em>perfumes!</em></h1>${common}<div class="share">Compartila con quien esté buscando perfume 💜</div>` },
  { f: 'historia-2-para-amigos', html: `<div class="eyebrow">EMPRENDIMIENTO URUGUAYO</div><h1>¿Buscás perfume? Mirá <em>Nova Parfum</em></h1>${common}<div class="share">Apoyá lo local: compartila 💜</div>` },
];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
for (const s of STORIES) {
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body><div class="c">${sparks}${logo}${s.html}</div></body></html>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => { const h = document.querySelector('h1').getBoundingClientRect(); const pn = document.querySelector('.panel').getBoundingClientRect(); return { h1bottom: Math.round(h.bottom), panelTop: Math.round(pn.top) }; });
  console.log(s.f, r, r.h1bottom > r.panelTop - 20 ? 'PISA EL PANEL' : 'ok');
  await p.locator('.c').screenshot({ path: `${OUT}/${s.f}.png` });
}
await b.close();
