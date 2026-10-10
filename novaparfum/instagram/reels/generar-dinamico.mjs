// Reel dinámico "¿Cuál elegís?" (1080 × 1920, 30 fps, ~9 s, sin audio).
// Cortes rápidos con cambio de color, gancho para comentar y grilla final; el final empalma con el principio.
// Uso: node generar-dinamico.mjs <carpeta-recortes> <carpeta-salida>
// Frascos: fotos verificadas de 100 ml (ver textos.md y ../historia-nicho/LEEME.md), cada uno con "100 ml" al lado.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
const CUT = process.argv[2], OUT = process.argv[3], ID = 'reel-5-cual-elegis', FPS = 30;
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const img = n => 'data:image/png;base64,' + readFileSync(`${CUT}/${n}.png`).toString('base64');
const C = { ink: '#2F2A4A', deep: '#1E1A33', cream: '#F7F4F0', powder: '#E9C9CF', lilac: '#B3A6E4', iris: '#7A68B8' };
const ITEMS = [
  { img: 'aventus', brand: 'Creed', name: 'Aventus', bg: C.ink, fg: C.cream, acc: C.powder },
  { img: 'yara', brand: 'Lattafa', name: 'Yara', bg: C.powder, fg: C.ink, acc: C.iris },
  { img: 'coco', brand: 'Chanel', name: 'Coco Mademoiselle', bg: C.cream, fg: C.ink, acc: C.iris },
  { img: 'angels-frasco', brand: 'Kilian', name: "Angels' Share", bg: C.iris, fg: C.cream, acc: C.powder },
  { img: 'eros-sin-reflejo', brand: 'Versace', name: 'Eros EDP', bg: C.deep, fg: C.cream, acc: C.lilac },
  { img: 'naxos', brand: 'Xerjoff', name: 'Naxos', bg: C.lilac, fg: C.ink, acc: C.cream },
  { img: 'lavie', brand: 'Lancôme', name: 'La Vie Est Belle', bg: C.powder, fg: C.ink, acc: C.iris },
  { img: 'bleu', brand: 'Chanel', name: 'Bleu de Chanel', bg: C.ink, fg: C.cream, acc: C.powder },
];
const HOOK = 1.2, SHOT = 0.6, GRID = 2.8;
const css = `
html,body{margin:0}
.c{width:1080px;height:1920px;position:relative;overflow:hidden;font-family:Manrope,sans-serif;font-variant-numeric:lining-nums;background:${C.ink}}
.l{position:absolute;left:0;top:0;width:1080px;height:1920px;will-change:transform,opacity}
.scene{overflow:hidden}
.wipe{position:absolute;left:-200px;top:0;width:1480px;height:1920px;transform-origin:0 50%}
.num{position:absolute;left:70px;top:230px;font:400 380px/1 Fraunces,serif;font-variation-settings:'opsz' 60;opacity:.9}
.brand{position:absolute;left:0;right:0;top:1440px;text-align:center;font:700 34px Manrope,sans-serif;letter-spacing:.3em}
.name{position:absolute;left:40px;right:40px;top:1488px;text-align:center;font:400 104px/1 Fraunces,serif;letter-spacing:-.015em;font-variation-settings:'opsz' 48;white-space:nowrap}
.bottle{position:absolute;left:50%;top:430px;height:920px;display:flex;align-items:flex-end;justify-content:center;transform-origin:50% 90%}
.bottle img{width:840px;height:880px;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 34px 40px rgba(10,6,30,.38))}
.ml{position:absolute;right:70px;top:300px;width:170px;height:170px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Manrope,sans-serif}
.ml b{font:400 72px/1 Fraunces,serif}.ml i{font:700 26px Manrope,sans-serif;font-style:normal;letter-spacing:.16em}
.logo{position:absolute;left:0;right:0;top:150px;display:flex;justify-content:center;align-items:center;gap:12px}
.logo svg{width:36px;height:36px}.logo b{font:400 40px Fraunces,serif}
.hook{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.hook .h{font:400 170px/1 Fraunces,serif;letter-spacing:-.025em;font-variation-settings:'opsz' 48;color:${C.cream}}
.hook .h2{font:400 170px/1 Fraunces,serif;letter-spacing:-.025em;font-variation-settings:'opsz' 48;color:${C.powder}}
.hook .s{margin-top:50px;font:700 50px Manrope,sans-serif;color:${C.cream};padding:18px 34px;border-radius:99px;background:${C.iris}}
.grid{background:radial-gradient(ellipse 90% 60% at 50% 45%,#4A4172 0%,${C.ink} 60%,${C.deep} 100%)}
.gt{position:absolute;left:0;right:0;top:200px;text-align:center;font:400 96px/1 Fraunces,serif;color:${C.cream};font-variation-settings:'opsz' 48}
.gs{position:absolute;left:0;right:0;top:318px;text-align:center;font:700 38px Manrope,sans-serif;color:${C.powder}}
.tiles{position:absolute;left:60px;right:60px;top:400px;display:grid;grid-template-columns:1fr 1fr;gap:22px}
.tile{position:relative;height:262px;border-radius:30px;background:radial-gradient(ellipse 70% 70% at 50% 45%,#fff,#F3EFF7);display:flex;align-items:center;gap:14px;padding:0 22px 0 18px;box-sizing:border-box;overflow:hidden}
.tile img{height:220px;width:150px;object-fit:contain;flex:none;filter:drop-shadow(0 12px 14px rgba(47,42,74,.25))}
.tile .tn{position:absolute;top:14px;left:16px;width:58px;height:58px;border-radius:50%;background:${C.ink};color:${C.cream};display:flex;align-items:center;justify-content:center;font:400 34px Fraunces,serif}
.tile .tx{display:flex;flex-direction:column;gap:4px;color:${C.ink};min-width:0}
.tile .tb{font:700 20px Manrope,sans-serif;letter-spacing:.18em;color:${C.iris}}
.tile .tm{font:400 34px/1.05 Fraunces,serif}
.tile .tml{margin-top:6px;align-self:flex-start;padding:3px 12px;border-radius:99px;background:${C.iris};color:${C.cream};font:700 18px Manrope,sans-serif}
.gf{position:absolute;left:0;right:0;top:1590px;text-align:center;font:600 36px Manrope,sans-serif;color:${C.cream}}
.gf b{color:${C.powder}}
.flash{background:#fff;pointer-events:none}
`;
const logo = (fill, word, word2 = C.lilac) => `<div class="logo"><svg viewBox="0 0 40 40"><path d="${STAR}" fill="${fill}"/><circle cx="30.5" cy="29.5" r="2.6" fill="${C.lilac}"/></svg><b style="color:${word}">nova<span style="color:${word2}">parfum</span></b></div>`;
const scenes = ITEMS.map((it, i) => `<div class="l scene" id="s${i}" style="background:${it.bg}">
  <div class="wipe" id="w${i}" style="background:${it.acc}"></div>
  ${logo(it.acc === C.cream ? C.ink : it.acc, it.fg, it.bg === C.lilac ? C.iris : C.lilac)}
  <div class="num" id="n${i}" style="color:${it.acc === C.cream ? C.ink : it.acc}">${i + 1}</div>
  <div class="ml" id="m${i}" style="background:${it.fg};color:${it.bg}"><b>100</b><i>ML</i></div>
  <div class="bottle" id="b${i}"><img src="${img(it.img)}"></div>
  <div class="brand" id="br${i}" style="color:${it.acc === C.cream ? C.ink : it.acc}">${it.brand.toUpperCase()}</div>
  <div class="name" id="nm${i}" style="color:${it.fg}">${it.name}</div></div>`).join('');
const grid = `<div class="l grid" id="grid">${logo(C.powder, C.cream)}
  <div class="gt" id="gt">¿Cuál elegís?</div><div class="gs" id="gs">Comentá el número 👇</div>
  <div class="tiles">${ITEMS.map((it, i) => `<div class="tile" id="t${i}"><div class="tn">${i + 1}</div><img src="${img(it.img)}"><div class="tx"><span class="tb">${it.brand.toUpperCase()}</span><span class="tm">${it.name}</span><span class="tml">100 ml</span></div></div>`).join('')}</div>
  <div class="gf" id="gf">Todos en 100 ml · <b>Link en el perfil</b></div></div>`;
const hook = `<div class="l hook" id="hook"><div class="h" id="h1">¿Cuál</div><div class="h2" id="h2">elegís?</div><div class="s" id="hs">Comentá el número 👇</div></div>`;
function frameFn(t, n, HOOK, SHOT, GRID) {
  const cl = x => Math.max(0, Math.min(1, x)), p = (a, b) => cl((t - a) / (b - a));
  const out = x => 1 - Math.pow(1 - x, 3), back = x => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const $ = id => document.getElementById(id);
  const set = (el, o, tr, f) => { if (!el) return; el.style.opacity = o; el.style.transform = tr || 'none'; el.style.filter = f || 'none'; };
  const total = HOOK + n * SHOT + GRID;
  // gancho: el fondo alterna tinta / iris al ritmo y las palabras entran con golpe
  const hk = $('hook'); hk.style.display = t < HOOK ? 'flex' : 'none';
  hk.style.background = Math.floor(t / 0.3) % 2 ? '#7A68B8' : '#2F2A4A';
  const w1 = back(p(0.0, 0.25)), w2 = back(p(0.15, 0.4)), w3 = out(p(0.35, 0.6));
  set($('h1'), cl(w1 * 2), `scale(${0.6 + 0.4 * w1})`); set($('h2'), cl(w2 * 2), `scale(${0.6 + 0.4 * w2})`);
  set($('hs'), w3, `translateY(${(1 - w3) * 40}px)`);
  // tomas de producto
  for (let i = 0; i < n; i++) {
    const s = HOOK + i * SHOT, e = s + SHOT, on = t >= s && t < e;
    const sc = $('s' + i); sc.style.display = on ? 'block' : 'none'; if (!on) continue;
    const k = (t - s) / SHOT;
    const wp = p(s, s + 0.16); $('w' + i).style.transform = `translateX(${-1980 + 4200 * out(wp)}px) skewX(-14deg)`;
    const bi = p(s, s + 0.22), bb = back(bi);
    set($('b' + i), 1, `translateX(-50%) scale(${(1.28 - 0.28 * bb) * (1 + 0.05 * k)}) rotate(${(1 - out(bi)) * (i % 2 ? 6 : -6)}deg)`, `blur(${(1 - out(bi)) * 14}px)`);
    const ni = out(p(s + 0.03, s + 0.2)); set($('n' + i), ni, `translateX(${(1 - ni) * -160}px)`);
    const mi = back(p(s + 0.1, s + 0.3)); set($('m' + i), cl(mi), `scale(${mi}) rotate(${(1 - cl(mi)) * -30}deg)`);
    const ti = out(p(s + 0.06, s + 0.24)); set($('br' + i), ti, `translateY(${(1 - ti) * 30}px)`); set($('nm' + i), ti, `translateY(${(1 - ti) * 60}px)`);
  }
  // grilla final
  const gs = HOOK + n * SHOT, g = $('grid'); g.style.display = t >= gs ? 'block' : 'none';
  const gi = out(p(gs, gs + 0.3)); set($('gt'), gi, `scale(${0.85 + 0.15 * back(p(gs, gs + 0.3))})`); set($('gs'), out(p(gs + 0.12, gs + 0.4)));
  for (let i = 0; i < n; i++) { const x = back(p(gs + 0.08 + i * 0.05, gs + 0.38 + i * 0.05)); set($('t' + i), cl(x * 1.5), `scale(${0.7 + 0.3 * x})`); }
  set($('gf'), out(p(gs + 0.6, gs + 0.9)));
  // destello en cada corte y salida hacia el principio para que el loop empalme
  const cuts = [HOOK, ...Array.from({ length: n }, (_, i) => HOOK + (i + 1) * SHOT)];
  let fl = 0; cuts.forEach(c => { const d = t - c; if (d >= 0 && d < 0.1) fl = Math.max(fl, 0.55 * (1 - d / 0.1)); });
  const endFade = p(total - 0.25, total); fl = Math.max(fl, endFade * 0.9);
  $('flash').style.opacity = fl;
}
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const page = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body><div class="c">${scenes}${grid}${hook}<div class="l flash" id="flash" style="opacity:0"></div></div></body></html>`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// nombres largos en una línea
await page.evaluate(() => document.querySelectorAll('.name').forEach(el => { let fs = 104; const box = el.parentElement.style.display; el.parentElement.style.display = 'block';
  while (el.scrollWidth > el.clientWidth && fs > 60) { fs -= 4; el.style.fontSize = fs + 'px'; } el.parentElement.style.display = box; }));
await page.addScriptTag({ content: 'window.frameFn = ' + frameFn.toString() });
const total = HOOK + ITEMS.length * SHOT + GRID, frames = Math.round(total * FPS);
const dir = `${OUT}/${ID}-frames`; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
for (let f = 0; f < frames; f++) {
  await page.evaluate(([t, n, a, s, g]) => window.frameFn(t, n, a, s, g), [f / FPS, ITEMS.length, HOOK, SHOT, GRID]);
  await page.screenshot({ path: `${dir}/${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
}
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', `${OUT}/${ID}.mp4`]);
execFileSync('cp', [`${dir}/${String(Math.round((HOOK + ITEMS.length * SHOT + 1.2) * FPS)).padStart(4, '0')}.jpg`, `${OUT}/${ID}-portada.jpg`]);
console.log(ID, frames, 'cuadros', total.toFixed(1), 's');
await b.close();
