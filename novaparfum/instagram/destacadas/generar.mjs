import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
const OUT = process.argv[2];
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const I = {
  envios: '<rect x="2" y="6" width="12" height="10" rx="1.2"/><path d="M14 9h4.2l2.8 3.4V16h-7z"/><circle cx="6.5" cy="17" r="1.9" class="f"/><circle cx="17.2" cy="17" r="1.9" class="f"/>',
  comprar: '<path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  pagos: '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 9.6h19"/><path d="M6 14.6h4.5"/>',
  cambios: '<path d="M4.2 11.5a7.8 7.8 0 0 1 13.4-5.2L20 8.6"/><path d="M20 4.2v4.4h-4.4"/><path d="M19.8 12.5a7.8 7.8 0 0 1-13.4 5.2L4 15.4"/><path d="M4 19.8v-4.4h4.4"/>',
  contacto: '<path d="M5 4.5h14A1.5 1.5 0 0 1 20.5 6v9a1.5 1.5 0 0 1-1.5 1.5h-8.6L6 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z"/><circle cx="8.3" cy="10.5" r=".6" class="d"/><circle cx="12" cy="10.5" r=".6" class="d"/><circle cx="15.7" cy="10.5" r=".6" class="d"/>',
  catalogo: '<path d="M12 6.6C10 5.1 7 4.6 3.5 5.1v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5v-13C17 4.6 14 5.1 12 6.6z"/><path d="M12 6.6v13"/>',
};
const items = [
  { k: 'nosotros', n: 'NOSOTROS', title: 'Nova Parfum', lines: [['Tienda online de perfumes en Montevideo.', ''], ['Dama, caballero y unisex.', ''], ['Envíos a todo Uruguay.', '']], foot: 'Tu próxima fragancia favorita, a un clic.' },
  { k: 'envios', n: 'ENVÍOS', title: 'Envíos a todo Uruguay', lines: [['Con DAC y otras empresas de envío', ''], ['A domicilio o retiro en agencia', ''], ['Llega en 48 a 72 horas', 'desde que se confirma el pago'], ['Envío a cobrar', 'lo pagás al recibir o retirar']] },
  { k: 'comprar', n: 'CÓMO COMPRAR', title: 'Cómo comprar', num: true, lines: [['Entrá a la web', 'link en nuestro perfil'], ['Elegí tu perfume', 'y agregalo al carrito'], ['Completá tus datos', 'cédula y forma de entrega'], ['Pagá con Mercado Pago', ''], ['Te llega en 48 a 72 horas', '']], foot: '¿Dudas? WhatsApp 2312 8537' },
  { k: 'pagos', n: 'PAGOS', title: 'Pagás con Mercado Pago', lines: [['Pago seguro dentro de la web', ''], ['Tu pedido se confirma', 'cuando se acredita el pago'], ['El envío se paga aparte', 'al recibir o retirar']] },
  { k: 'cambios', n: 'CAMBIOS', title: 'Cambios y devoluciones', lines: [['5 días hábiles para arrepentirte', 'desde que recibís tu pedido (Ley 17.250)'], ['El perfume tiene que estar cerrado', 'con el sello intacto y en su caja'], ['¿Llegó dañado o equivocado?', 'Avisanos en 48 horas y te lo cambiamos sin costo']] },
  { k: 'contacto', n: 'CONTACTO', title: 'Escribinos', lines: [['WhatsApp', '+598 2312 8537'], ['Email', 'novaparfum.uy@gmail.com'], ['Instagram', '@novaparfum.uy']], foot: 'Te ayudamos a elegir tu perfume.' },
  { k: 'catalogo', n: 'CATÁLOGO', title: 'Nuestro catálogo', lines: [['Más de 250 perfumes', ''], ['Dama · Caballero · Unisex', ''], ['Descargalo en PDF', 'en la web, sección Catálogo']] },
];
const icon = k => k === 'nosotros'
  ? `<svg viewBox="0 0 40 40" class="star"><path d="${STAR}" fill="#E9C9CF"/><circle cx="30.5" cy="29.5" r="2.6" fill="#B3A6E4"/></svg>`
  : `<svg viewBox="0 0 24 24" class="ic">${I[k]}</svg>`;
const css = `
html,body{margin:0}
.c{width:1080px;height:1920px;position:relative;overflow:hidden;color:#F7F4F0;font-family:Manrope,sans-serif;
 background:radial-gradient(ellipse 80% 55% at 50% 48%,#463E6E 0%,#2F2A4A 58%,#221D38 100%)}
.ic{fill:none;stroke:#E9C9CF;stroke-width:1.15;stroke-linecap:round;stroke-linejoin:round}
.ic .f{fill:#2F2A4A}.ic .d{fill:#E9C9CF;stroke:none}
.sp{position:absolute;fill:#E9C9CF;opacity:.45}
.cover .wrap{position:absolute;left:50%;top:50%;width:640px;height:640px;transform:translate(-50%,-50%);border-radius:50%;
 border:3px solid rgba(179,166,228,.55);display:flex;align-items:center;justify-content:center;
 background:radial-gradient(circle at 50% 40%,rgba(179,166,228,.16),rgba(179,166,228,0) 70%)}
.cover .ic{width:380px;height:380px;stroke-width:1.3}.cover .star{width:400px;height:400px}
.story .logo{position:absolute;top:270px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:14px}
.story .logo svg{width:46px;height:46px}.story .logo b{font:400 50px Fraunces,serif;letter-spacing:-.01em}.story .logo b span{color:#B3A6E4}
.story .main{position:absolute;top:380px;bottom:400px;left:100px;right:100px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.story .badge{flex:0 0 auto;margin-bottom:48px;width:210px;height:210px;border-radius:50%;
 border:2px solid rgba(179,166,228,.5);display:flex;align-items:center;justify-content:center}
.story .badge .ic{width:110px;height:110px;stroke-width:1.25}.story .badge .star{width:120px;height:120px}
.story h1{margin:0;text-align:center;font:400 104px/1.04 Fraunces,serif;letter-spacing:-.015em}
.story ul{align-self:stretch;margin:64px 0 0;padding:0;list-style:none}
.story li{display:flex;gap:32px;align-items:flex-start;padding:30px 0;border-top:1.5px solid rgba(179,166,228,.28)}
.story li:first-child{border-top:none}
.story .bul{flex:0 0 auto;width:62px;height:62px;border-radius:50%;background:rgba(179,166,228,.18);color:#E9C9CF;
 display:flex;align-items:center;justify-content:center;font:500 32px Manrope,sans-serif;margin-top:0}
.story .bul svg{width:26px;height:26px}
.story .t{font:500 47px/1.2 Manrope,sans-serif}.story .s{font:400 35px/1.3 Manrope,sans-serif;color:rgba(247,244,240,.68);margin-top:6px}
.story.compact li{padding:20px 0}.story.compact .badge{margin-bottom:34px;width:180px;height:180px}.story.compact ul{margin-top:44px}.story.compact .main{bottom:440px}
.story .foot{position:absolute;left:90px;right:90px;bottom:310px;text-align:center;font:400 42px Fraunces,serif;color:#E9C9CF}
.story .url{position:absolute;left:0;right:0;bottom:250px;text-align:center;font:500 26px Manrope,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:rgba(247,244,240,.55)}
`;
const sparks = `<svg class="sp" style="left:120px;top:180px;width:34px" viewBox="0 0 40 40"><path d="${STAR}"/></svg>
<svg class="sp" style="right:140px;top:330px;width:22px" viewBox="0 0 40 40"><path d="${STAR}"/></svg>
<svg class="sp" style="left:170px;bottom:200px;width:20px" viewBox="0 0 40 40"><path d="${STAR}"/></svg>
<svg class="sp" style="right:110px;bottom:420px;width:30px" viewBox="0 0 40 40"><path d="${STAR}"/></svg>`;
const page = body => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@400;500&display=swap" rel="stylesheet">
<style>${css}</style></head><body>${body}</body></html>`;
const check = '<svg viewBox="0 0 24 24" class="ic" style="stroke-width:2.4"><path d="M5 12.5l4.2 4L19 7"/></svg>';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
let i = 0;
for (const it of items) {
  i++;
  const nn = String(i).padStart(2, '0');
  await p.setContent(page(`<div class="c cover">${sparks}<div class="wrap">${icon(it.k)}</div></div>`), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.locator('.c').screenshot({ path: `${OUT}/portada-${nn}-${it.k}.png` });
  const lis = it.lines.map((l, j) => `<li><div class="bul">${it.num ? j + 1 : check}</div><div><div class="t">${l[0]}</div>${l[1] ? `<div class="s">${l[1]}</div>` : ''}</div></li>`).join('');
  await p.setContent(page(`<div class="c story${it.lines.length >= 5 ? ' compact' : ''}">${sparks}
   <div class="logo"><svg viewBox="0 0 40 40"><path d="${STAR}" fill="#E9C9CF"/><circle cx="30.5" cy="29.5" r="2.6" fill="#B3A6E4"/></svg><b>nova<span>parfum</span></b></div>
   <div class="main"><div class="badge">${icon(it.k)}</div><h1>${it.title}</h1><ul>${lis}</ul></div>
   ${it.foot ? `<div class="foot">${it.foot}</div>` : ''}<div class="url">novaparfumuy.myshopify.com</div></div>`), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  // place list under the title
  const top = await p.evaluate(() => { const ul = document.querySelector('ul'); const r = ul.getBoundingClientRect(); const m = document.querySelector('.main'); if (m.scrollHeight > m.clientHeight) console.log('overflow'); const f = document.querySelector('.foot'); return { ulBottom: Math.round(r.bottom), footTop: f ? Math.round(f.getBoundingClientRect().top) : 1620 }; });
  console.log(it.k, JSON.stringify(top), top.ulBottom > top.footTop - 30 ? 'SE PISA' : 'ok');
  await p.locator('.c').screenshot({ path: `${OUT}/historia-${nn}-${it.k}.png` });
}
await b.close();
