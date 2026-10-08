import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const CUT = process.argv[2], OUT = process.argv[3];
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const img = n => 'data:image/png;base64,' + readFileSync(`${CUT}/${n}.png`).toString('base64');
const css = `
html,body{margin:0}
.c{width:1080px;height:1350px;position:relative;overflow:hidden;color:#F7F4F0;font-family:Manrope,sans-serif;
 background:radial-gradient(ellipse 85% 60% at 50% 40%,#463E6E 0%,#2F2A4A 60%,#221D38 100%)}
.logo{position:absolute;top:58px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:12px}
.logo svg{width:34px;height:34px}.logo b{font:400 38px Fraunces,serif;letter-spacing:-.01em}.logo b span{color:#B3A6E4}
.card{position:absolute;left:80px;right:80px;top:140px;height:790px;border-radius:40px;overflow:hidden;
 background:radial-gradient(ellipse 70% 60% at 50% 45%,#FFFFFF 0%,#F7F4F0 70%,#EFEAF3 100%);display:flex;align-items:flex-end;justify-content:center;gap:40px;padding:0 50px 70px;box-sizing:border-box}
.card img{object-fit:contain;filter:drop-shadow(0 26px 30px rgba(47,42,74,.22))}
.chip{position:absolute;top:34px;left:34px;padding:12px 22px;border-radius:99px;background:#2F2A4A;color:#F7F4F0;font:500 22px Manrope,sans-serif;letter-spacing:.18em}
.txt{position:absolute;left:80px;right:80px;top:968px;text-align:center}
.name{font:400 64px/1.05 Fraunces,serif;letter-spacing:-.012em}
.price{margin-top:18px;font:500 44px Manrope,sans-serif;color:#E9C9CF}
.price small{font-size:26px;color:rgba(247,244,240,.6);font-weight:400;margin-left:10px}
.meta{position:absolute;left:0;right:0;bottom:56px;text-align:center;font:500 22px Manrope,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:rgba(247,244,240,.55)}
.duo{display:flex;flex-direction:column;align-items:center;gap:18px}
.duo .l{font:500 26px Manrope,sans-serif;color:#2F2A4A;letter-spacing:.04em;text-align:center}
.duo .l em{display:block;font:400 20px Manrope,sans-serif;font-style:normal;letter-spacing:.18em;color:#7A68B8;margin-bottom:4px}
.duo .l b{display:block;font-weight:500;color:#7A68B8;margin-top:2px}
.sp{position:absolute;fill:#E9C9CF;opacity:.45}
.how h1{position:absolute;top:190px;left:90px;right:90px;margin:0;text-align:center;font:400 96px/1.04 Fraunces,serif;letter-spacing:-.015em}
.how ol{position:absolute;top:470px;left:120px;right:120px;margin:0;padding:0;list-style:none}
.how li{display:flex;gap:34px;align-items:center;padding:34px 0;border-top:1.5px solid rgba(179,166,228,.28)}
.how li:first-child{border-top:none}
.how .n{flex:0 0 auto;width:76px;height:76px;border-radius:50%;background:rgba(179,166,228,.18);color:#E9C9CF;display:flex;align-items:center;justify-content:center;font:400 40px Fraunces,serif}
.how .t{font:500 46px/1.15 Manrope,sans-serif}.how .s{font:400 32px Manrope,sans-serif;color:rgba(247,244,240,.66);margin-top:6px}
.how .cta{position:absolute;left:0;right:0;bottom:150px;text-align:center;font:400 46px Fraunces,serif;color:#E9C9CF}
`;
const logo = `<div class="logo"><svg viewBox="0 0 40 40"><path d="${STAR}" fill="#E9C9CF"/><circle cx="30.5" cy="29.5" r="2.6" fill="#B3A6E4"/></svg><b>nova<span>parfum</span></b></div>`;
const sparks = `<svg class="sp" style="left:36px;top:60px;width:26px" viewBox="0 0 40 40"><path d="${STAR}"/></svg><svg class="sp" style="right:40px;top:980px;width:20px" viewBox="0 0 40 40"><path d="${STAR}"/></svg><svg class="sp" style="left:50px;bottom:120px;width:16px" viewBox="0 0 40 40"><path d="${STAR}"/></svg>`;
const META = 'Envío a todo Uruguay · Mercado Pago';
const posts = [
  { f: '01-presentacion', html: `<div class="card"><img src="${img('blackorchid')}" style="height:520px"><img src="${img('libre')}" style="height:600px"><img src="${img('swy')}" style="height:470px"></div>
     <div class="txt"><div class="name">Tu próxima fragancia<br>favorita, a un clic.</div><div class="price" style="font-size:34px">Más de 250 perfumes · Dama, caballero y unisex</div></div>` },
  { f: '02-arabes', html: `<div class="card" style="gap:70px"><div class="duo"><img src="${img('yara')}" style="width:330px"><div class="l"><em>PARA ELLA</em>Lattafa Yara<b>$ 3.300</b></div></div>
     <div class="duo"><img src="${img('asad')}" style="width:340px"><div class="l"><em>PARA ÉL</em>Lattafa Asad<b>$ 3.200</b></div></div></div>
     <div class="txt"><div class="name">Árabes desde $ 3.200</div><div class="price" style="font-size:34px">Lattafa · para ella y para él</div></div>` },
  { f: '03-eros', chip: 'PARA ÉL', html: `<div class="card"><img src="${img('eros')}" style="width:720px"></div>
     <div class="txt"><div class="name">Versace Eros EDP</div><div class="price">$ 8.250</div></div>` },
  { f: '04-ombre-leather', chip: 'UNISEX', html: `<div class="card"><img src="${img('ombre')}" style="height:600px"></div>
     <div class="txt"><div class="name">Tom Ford Ombré Leather</div><div class="price">$ 10.500</div></div>` },
  { f: '05-paradoxe', chip: 'PARA ELLA', html: `<div class="card"><img src="${img('paradoxe')}" style="width:600px"></div>
     <div class="txt"><div class="name">Prada Paradoxe Intense</div><div class="price">$ 10.800<small>90 ml</small></div></div>` },
  { f: '06-como-comprar', how: true, html: `<h1>Comprar es así de fácil</h1>
     <ol><li><div class="n">1</div><div><div class="t">Elegí tu perfume</div><div class="s">en la web, link en el perfil</div></div></li>
     <li><div class="n">2</div><div><div class="t">Pagá con Mercado Pago</div><div class="s">pago seguro dentro de la web</div></div></li>
     <li><div class="n">3</div><div><div class="t">Recibilo en 48 a 72 horas</div><div class="s">a domicilio o en agencia, en todo Uruguay</div></div></li></ol>
     <div class="cta">¿Dudas? WhatsApp 2312 8537</div>` },
];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const p = await (await b.newContext({ viewport: { width: 1080, height: 1350 } })).newPage();
for (const it of posts) {
  const body = `<div class="c${it.how ? ' how' : ''}">${sparks}${logo}${(it.chip ? it.html.replace('<div class="card">', `<div class="card"><div class="chip">${it.chip}</div>`) : it.html)}<div class="meta">${META}</div></div>`;
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@400;500&display=swap" rel="stylesheet"><style>${css}</style></head><body>${body}</body></html>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => { const t = document.querySelector('.txt'); return t ? Math.round(t.getBoundingClientRect().bottom) : 0; });
  console.log(it.f, 'texto termina en', r, r > 1270 ? 'PISA META' : 'ok');
  await p.locator('.c').screenshot({ path: `${OUT}/post-${it.f}.png` });
}
await b.close();
