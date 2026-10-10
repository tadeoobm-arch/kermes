// Reels de productos (1080 × 1920, 30 fps, ~13 s, sin audio: la música se elige en Instagram).
// Uso: node generar.mjs <carpeta-recortes> <carpeta-salida>
// Dibuja cada cuadro con Playwright y lo arma con ffmpeg. Fotos: recortes PNG de frascos de 100 ml.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
const CUT = process.argv[2], OUT = process.argv[3];
const FPS = 30;
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const img = n => 'data:image/png;base64,' + readFileSync(`${CUT}/${n}.png`).toString('base64');

// Precios de Shopify del 10/10/2026. Familias olfativas: solo las que están en la descripción de Shopify.
const REELS = [
  { id: 'reel-1-arabes', hook: ['¿Perfume árabe', 'a menos de', '$ 3.500?'], sub: 'Sí, y en 100 ml.', end: 'Árabes desde $ 3.200',
    items: [
      { img: 'yara', name: 'Lattafa Yara', price: '$ 3.300', chip: 'PARA ELLA' },
      { img: 'asad', name: 'Lattafa Asad', price: '$ 3.200', chip: 'PARA ÉL' },
      { img: 'hawasice', name: 'Rasasi Hawas Ice', price: '$ 4.390', chip: 'PARA ÉL' },
      { img: 'odyssey', name: 'Armaf Odyssey Homme', price: '$ 3.700', chip: 'PARA ÉL' } ] },
  { id: 'reel-2-para-el', hook: ['4 clásicos', 'para él'], sub: 'Todos en 100 ml.', end: 'Clásicos para él',
    items: [
      { img: 'adg', name: 'Armani Acqua di Giò', price: '$ 6.990', chip: 'PARA ÉL', fam: 'Acuático aromático' },
      { img: 'eros', name: 'Versace Eros EDP', price: '$ 7.490', chip: 'PARA ÉL', fam: 'Eau de Parfum' },
      { img: 'uomo', name: 'Valentino Uomo Born in Roma', price: '$ 9.100', chip: 'PARA ÉL', fam: 'Amaderado especiado' },
      { img: 'bleu', name: 'Bleu de Chanel', price: '$ 10.200', chip: 'PARA ÉL', fam: 'Amaderado aromático' } ] },
  { id: 'reel-3-para-ella', hook: ['4 clásicos', 'para ella'], sub: 'Todos en 100 ml.', end: 'Clásicos para ella',
    items: [
      { img: 'euphoria', name: 'Calvin Klein Euphoria', price: '$ 5.950', chip: 'PARA ELLA', fam: 'Oriental floral' },
      { img: 'lavie', name: 'Lancôme La Vie Est Belle', price: '$ 9.100', chip: 'PARA ELLA', fam: 'Floral frutal gourmand' },
      { img: 'donna', name: 'Valentino Donna Born in Roma', price: '$ 9.650', chip: 'PARA ELLA', fam: 'Oriental floral' },
      { img: 'coco', name: 'Chanel Coco Mademoiselle', price: '$ 10.500', chip: 'PARA ELLA', fam: 'Chipre floral' } ] },
];

const HOOK = 1.9, ITEM = 2.35, OVER = 0.3, END = 2.6;
const css = `
html,body{margin:0;background:#221D38}
.c{width:1080px;height:1920px;position:relative;overflow:hidden;color:#F7F4F0;font-family:Manrope,sans-serif;font-variant-numeric:lining-nums;
 background:radial-gradient(ellipse 90% 55% at 50% 42%,#4A4172 0%,#2F2A4A 58%,#1E1A33 100%)}
.l{position:absolute;left:0;top:0;will-change:transform,opacity}
.logo{top:150px;width:1080px;display:flex;justify-content:center;align-items:center;gap:14px}
.logo svg{width:40px;height:40px}.logo b{font:400 44px Fraunces,serif}.logo b span{color:#B3A6E4}
.sp{position:absolute;fill:#E9C9CF}
.hook{width:1080px;top:560px;text-align:center}
.hook .w{display:block;font:400 132px/1.04 Fraunces,serif;letter-spacing:-.02em;font-variation-settings:'opsz' 48}
.hook .w:last-of-type{color:#E9C9CF}
.hook .sub{display:block;margin-top:46px;font:500 46px Manrope,sans-serif;color:#B3A6E4;letter-spacing:.01em}
.card{left:90px;top:320px;width:900px;height:940px;border-radius:48px;overflow:hidden;
 background:radial-gradient(ellipse 70% 60% at 50% 45%,#FFFFFF 0%,#F7F4F0 70%,#ECE6F3 100%);box-shadow:0 40px 90px rgba(10,6,30,.45)}
.card .bottle{position:absolute;left:50%;bottom:90px;transform-origin:50% 100%;filter:drop-shadow(0 30px 34px rgba(47,42,74,.25))}
.chip{position:absolute;top:40px;left:40px;padding:14px 26px;border-radius:99px;background:#2F2A4A;color:#F7F4F0;font:600 26px Manrope,sans-serif;letter-spacing:.18em}
.ml{position:absolute;top:30px;right:30px;width:160px;height:160px;border-radius:50%;background:#7A68B8;color:#F7F4F0;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 12px 28px rgba(47,42,74,.3)}
.ml b{font:400 66px/1 Fraunces,serif}.ml i{font:600 26px Manrope,sans-serif;font-style:normal;letter-spacing:.16em;margin-top:2px}
.name{width:1080px;top:1300px;text-align:center;font:400 76px/1.05 Fraunces,serif;letter-spacing:-.012em;padding:0 70px;box-sizing:border-box;white-space:nowrap}
.fam{width:1080px;top:1395px;text-align:center;font:500 34px Manrope,sans-serif;color:#B3A6E4;letter-spacing:.06em}
.price{width:1080px;top:1450px;text-align:center;font:600 78px Manrope,sans-serif;color:#E9C9CF}
.price small{font-size:38px;color:rgba(247,244,240,.7);font-weight:500;margin-left:14px}
.dots{width:1080px;top:1585px;display:flex;justify-content:center;gap:14px}
.dots i{width:14px;height:14px;border-radius:50%;background:rgba(247,244,240,.28)}
.dots i.on{background:#E9C9CF}
.endstar{left:390px;top:430px;width:300px;height:300px}
.end1{width:1080px;top:820px;text-align:center;font:400 104px/1.05 Fraunces,serif;font-variation-settings:'opsz' 48;letter-spacing:-.015em;padding:0 80px;box-sizing:border-box;text-wrap:balance}
.end2{width:1080px;top:1110px;text-align:center;font:600 50px Manrope,sans-serif;color:#E9C9CF}
.end3{width:1080px;top:1200px;text-align:center;font:500 38px/1.5 Manrope,sans-serif;color:rgba(247,244,240,.78)}
.end4{left:290px;top:1400px;width:500px;padding:26px 0;border-radius:99px;background:#E9C9CF;color:#2F2A4A;text-align:center;font:700 40px Manrope,sans-serif}
`;
function sceneHTML(r) {
  const sparks = [[90,300,30],[960,520,22],[120,1380,18],[930,1500,26],[540,1720,16],[200,820,14],[880,980,12]]
    .map(([x,y,s],k) => `<svg class="sp" data-k="${k}" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px" viewBox="0 0 40 40"><path d="${STAR}"/></svg>`).join('');
  const hook = `<div class="l hook" id="hook">${r.hook.map((w,i) => `<span class="w" data-i="${i}">${w}</span>`).join('')}<span class="sub">${r.sub}</span></div>`;
  const items = r.items.map((it,i) => `
    <div class="l card" id="card${i}"><img class="bottle" id="b${i}" src="${img(it.img)}"><div class="chip">${it.chip}</div><div class="ml" id="ml${i}"><b>100</b><i>ML</i></div></div>
    <div class="l name" id="name${i}">${it.name}</div>
    ${it.fam ? `<div class="l fam" id="fam${i}">${it.fam}</div>` : ''}
    <div class="l price" id="price${i}">${it.price}<small>100 ml</small></div>`).join('');
  const dots = `<div class="l dots" id="dots">${r.items.map((_,i) => `<i data-d="${i}"></i>`).join('')}</div>`;
  const end = `<svg class="l endstar" id="endstar" viewBox="0 0 40 40"><path d="${STAR}" fill="#E9C9CF"/><circle cx="30.5" cy="29.5" r="2.6" fill="#B3A6E4"/></svg>
    <div class="l end1" id="end1">${r.end}</div><div class="l end2" id="end2">Pedilo en la web</div>
    <div class="l end3" id="end3">Pagás con Mercado Pago<br>Envío a todo Uruguay en 48 a 72 horas</div><div class="l end4" id="end4">Link en el perfil ↑</div>`;
  const logo = `<div class="l logo" id="logo"><svg viewBox="0 0 40 40"><path d="${STAR}" fill="#E9C9CF"/><circle cx="30.5" cy="29.5" r="2.6" fill="#B3A6E4"/></svg><b>nova<span>parfum</span></b></div>`;
  return `<div class="c">${sparks}${logo}${hook}${items}${dots}${end}</div>`;
}
// Animación: se calcula cada cuadro a partir del tiempo t (determinística, sin depender del reloj).
function frameFn(t, n, HOOK, ITEM, OVER, END) {
  const cl = (x) => Math.max(0, Math.min(1, x));
  const p = (a, b) => cl((t - a) / (b - a));
  const out = (x) => 1 - Math.pow(1 - x, 3);
  const back = (x) => { const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const $ = (id) => document.getElementById(id);
  const set = (el, o, tr) => { if (!el) return; el.style.opacity = o; el.style.transform = tr || 'none'; };
  // destellos que titilan
  document.querySelectorAll('.sp').forEach(s => { const k = +s.dataset.k; s.style.opacity = (0.25 + 0.3 * (0.5 + 0.5 * Math.sin(t * 2.2 + k * 1.7))).toFixed(3); });
  // gancho
  const hOut = out(p(HOOK - 0.35, HOOK));
  document.querySelectorAll('#hook .w').forEach(w => { const i = +w.dataset.i; const e = out(p(0.05 + i * 0.12, 0.6 + i * 0.12)); set(w, e, `translateY(${(1 - e) * 70}px)`); });
  const sub = document.querySelector('#hook .sub'); const se = out(p(0.55, 1.0)); set(sub, se, `translateY(${(1 - se) * 30}px)`);
  set($('hook'), 1 - hOut, `scale(${1 + hOut * 0.06})`);
  // productos
  const endStart = HOOK + n * ITEM - OVER;
  for (let i = 0; i < n; i++) {
    const s = HOOK + i * ITEM - OVER, e = s + ITEM + OVER;
    const ein = out(p(s, s + 0.5)), bin = back(p(s + 0.05, s + 0.7)), eo = out(p(e - OVER, e));
    const vis = t >= s - 0.01 && t <= e + 0.01;
    const cardY = (1 - ein) * 140 - eo * 60, cardX = -eo * 160;
    set($('card' + i), vis ? ein * (1 - eo) : 0, `translate(${cardX}px,${cardY}px)`);
    const b = $('b' + i);
    if (b && b.dataset.w) { const zoom = 1 + 0.05 * p(s, e); b.style.transform = `translateX(-50%) scale(${(0.82 + 0.18 * bin) * zoom})`; }
    const ml = $('ml' + i); const me = back(p(s + 0.45, s + 0.85)); if (ml) { ml.style.transform = `scale(${me})`; ml.style.opacity = cl(me); }
    const ne = out(p(s + 0.2, s + 0.65)); set($('name' + i), vis ? ne * (1 - eo) : 0, `translateY(${(1 - ne) * 40}px)`);
    const fe = out(p(s + 0.3, s + 0.75)); set($('fam' + i), vis ? fe * (1 - eo) : 0, `translateY(${(1 - fe) * 30}px)`);
    const pe = out(p(s + 0.38, s + 0.85)); set($('price' + i), vis ? pe * (1 - eo) : 0, `translateY(${(1 - pe) * 30}px) scale(${0.96 + 0.04 * pe})`);
  }
  const dIn = out(p(HOOK - OVER, HOOK + 0.2)), dOut = out(p(endStart, endStart + 0.3));
  set($('dots'), dIn * (1 - dOut));
  const cur = Math.min(n - 1, Math.max(0, Math.floor((t - HOOK + OVER) / ITEM)));
  document.querySelectorAll('.dots i').forEach(d => d.classList.toggle('on', +d.dataset.d === cur));
  // logo arriba: visible salvo en el cierre
  set($('logo'), 1 - out(p(endStart, endStart + 0.3)));
  // cierre
  const es = endStart + 0.15;
  const st = back(p(es, es + 0.7)); set($('endstar'), cl(p(es, es + 0.3)), `scale(${st}) rotate(${(1 - st) * -40}deg)`);
  [['end1', 0.25], ['end2', 0.45], ['end3', 0.6], ['end4', 0.8]].forEach(([id, d]) => { const x = out(p(es + d, es + d + 0.5)); set($(id), x, `translateY(${(1 - x) * 40}px)`); });
}

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const page = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
for (const r of REELS) {
  const n = r.items.length, total = HOOK + n * ITEM - OVER + END;
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body>${sceneHTML(r)}</body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // tamaño de cada frasco dentro de la tarjeta (máx. 760 × 700)
  await page.evaluate(() => document.querySelectorAll('.bottle').forEach(im => {
    const k = Math.min(760 / im.naturalWidth, 700 / im.naturalHeight); im.style.width = im.naturalWidth * k + 'px'; im.dataset.w = '1'; }));
  // nombres largos: se achica la letra hasta que entren en una línea
  await page.evaluate(() => document.querySelectorAll('.name').forEach(el => {
    let fs = 76; while (el.scrollWidth > el.clientWidth && fs > 48) { fs -= 2; el.style.fontSize = fs + 'px'; } }));
  await page.addScriptTag({ content: 'window.frameFn = ' + frameFn.toString() });
  const dir = `${OUT}/${r.id}-frames`; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const frames = Math.round(total * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(([t, n, a, b2, c, d]) => window.frameFn(t, n, a, b2, c, d), [f / FPS, n, HOOK, ITEM, OVER, END]);
    await page.screenshot({ path: `${dir}/${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', `${OUT}/${r.id}.mp4`]);
  // portada: el cuadro del primer perfume ya armado
  execFileSync('cp', [`${dir}/${String(Math.round((HOOK + 1.1) * FPS)).padStart(4, '0')}.jpg`, `${OUT}/${r.id}-portada.jpg`]);
  console.log(r.id, frames, 'cuadros', total.toFixed(1), 's');
}
await b.close();
