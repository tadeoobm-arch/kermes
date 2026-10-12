import { chromium } from 'playwright';
const OUT = process.argv[2];
const STAR = 'M20 4c1 8.4 4.2 11.8 12.6 12.8C24.2 17.8 21 21.2 20 29.6 19 21.2 15.8 17.8 7.4 16.8 15.8 15.8 19 12.4 20 4Z';
const W = 1080, H = 1440;
const sp = (x, y, s, o = .5) => `<svg style="position:absolute;left:${x}px;top:${y}px;width:${s}px;opacity:${o}" viewBox="0 0 40 40"><path d="${STAR}" fill="#E9C9CF"/></svg>`;
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&family=Manrope:wght@400;500&display=swap" rel="stylesheet">
<style>
html,body{margin:0}
.p{position:relative;width:${W*3}px;height:${H}px;overflow:hidden;font-family:Manrope,sans-serif;color:#F7F4F0;
 background:
  radial-gradient(ellipse 38% 55% at 50% 48%, rgba(179,166,228,.30) 0%, rgba(179,166,228,0) 70%),
  radial-gradient(ellipse 30% 45% at 14% 40%, rgba(233,201,207,.10) 0%, rgba(233,201,207,0) 70%),
  radial-gradient(ellipse 30% 45% at 86% 58%, rgba(233,201,207,.10) 0%, rgba(233,201,207,0) 70%),
  linear-gradient(180deg,#2B2645 0%,#2F2A4A 45%,#221D38 100%)}
.line{position:absolute;left:0;right:0;top:${H/2}px;height:1.5px;background:linear-gradient(90deg,rgba(179,166,228,0) 0%,rgba(179,166,228,.45) 12%,rgba(179,166,228,.45) 88%,rgba(179,166,228,0) 100%)}
.w{position:absolute;top:${H/2}px;transform:translate(-50%,-56%);font:300 330px/1 Fraunces,serif;letter-spacing:-.02em;white-space:nowrap}
.w1{left:${W*0.5}px;color:#F7F4F0}
.w3{left:${W*2.5}px;color:#B3A6E4}
.star{position:absolute;left:${W*1.5}px;top:${H/2}px;transform:translate(-50%,-50%);width:520px;height:520px}
.halo{position:absolute;left:${W*1.5}px;top:${H/2}px;transform:translate(-50%,-50%);width:760px;height:760px;border-radius:50%;border:1.5px solid rgba(179,166,228,.35);background:radial-gradient(circle,#2F2A4A 0%,#2F2A4A 62%,rgba(47,42,74,0) 63%)}
.cap{position:absolute;bottom:150px;transform:translateX(-50%);font:500 30px Manrope,sans-serif;letter-spacing:.32em;text-transform:uppercase;color:rgba(247,244,240,.62);white-space:nowrap}
.top{position:absolute;top:140px;transform:translateX(-50%);font:400 34px Fraunces,serif;color:#E9C9CF;white-space:nowrap}
</style></head><body><div class="p">
<div style="position:absolute;top:${H/2}px;height:1.5px;left:0px;width:215px;background:linear-gradient(90deg,rgba(179,166,228,0),rgba(179,166,228,.45))"></div><div style="position:absolute;top:${H/2}px;height:1.5px;left:865px;width:374px;background:linear-gradient(90deg,rgba(179,166,228,.45),rgba(179,166,228,.45))"></div><div style="position:absolute;top:${H/2}px;height:1.5px;left:2001px;width:228px;background:linear-gradient(90deg,rgba(179,166,228,.45),rgba(179,166,228,.45))"></div><div style="position:absolute;top:${H/2}px;height:1.5px;left:3171px;width:69px;background:linear-gradient(90deg,rgba(179,166,228,.45),rgba(179,166,228,0))"></div>
${sp(150,230,40)}${sp(860,1080,26,.4)}${sp(1300,250,22,.35)}${sp(1950,1150,30,.45)}${sp(2330,300,34,.5)}${sp(3020,1120,24,.4)}${sp(2700,980,16,.3)}${sp(560,1250,14,.3)}
<div class="w w1">nova</div>
<div class="halo"></div>
<svg class="star" viewBox="0 0 40 40"><path d="${STAR}" fill="#E9C9CF"/><circle cx="30.5" cy="29.5" r="2.6" fill="#B3A6E4"/></svg>
<div class="w w3">parfum</div>
<div class="top" style="left:${W*1.5}px">Tu próxima fragancia favorita</div>
<div class="cap" style="left:${W*0.5}px">Perfumes</div>
<div class="cap" style="left:${W*1.5}px">Dama · Caballero · Unisex</div>
<div class="cap" style="left:${W*2.5}px">Envíos a todo Uruguay</div>
</div></body></html>`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY } });
const p = await (await b.newContext({ viewport: { width: W*3, height: H } })).newPage();
await p.setContent(html, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
const r = await p.evaluate(() => [...document.querySelectorAll('.w,.cap,.top,.halo')].map(e => { const b = e.getBoundingClientRect(); return [e.className, e.textContent.trim().slice(0,12), Math.round(b.left), Math.round(b.right)]; }));
console.log(JSON.stringify(r));
await p.screenshot({ path: `${OUT}/panorama.png` });
for (let i = 0; i < 3; i++) await p.screenshot({ path: `${OUT}/post-${i+1}.png`, clip: { x: i*W, y: 0, width: W, height: H } });
await b.close();
