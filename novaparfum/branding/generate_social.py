#!/usr/bin/env python3
"""Plantillas de Instagram/TikTok de NovaParfum (SVG editables: texto real, no curvas).

Abrir en Figma / Illustrator / Canva (importar SVG), reemplazar el rectángulo "FOTO" por la imagen
del producto y editar los textos. Tipografías: Fraunces y Manrope (Google Fonts, gratis).
Uso: python3 branding/generate_social.py
"""
from pathlib import Path
from generate_logos import isotipo, C

OUT = Path(__file__).resolve().parent / "instagram"
OUT.mkdir(exist_ok=True)
HEAD = "font-family:Fraunces,Georgia,serif"
BODY = "font-family:Manrope,Arial,sans-serif"


def doc(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{C["bruma"]}"/>'
            f'<stop offset="1" stop-color="{C["rosa"]}"/></linearGradient></defs>{body}</svg>\n')


def photo(x, y, w, h, r=36, label="FOTO DEL PERFUME (fondo claro, luz natural)"):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{C["lavanda"]}" opacity=".55"/>'
            f'<text x="{x + w/2}" y="{y + h/2}" text-anchor="middle" style="{BODY};font-size:26px;font-weight:700;letter-spacing:3px" fill="{C["noche"]}" opacity=".6">{label}</text>')


def brand_mark(x, y, color=C["noche"], accent=C["iris"], size=36):
    return (isotipo(x + size * 0.4, y - size * 0.95, size * 1.1, color, accent) +
            f'<text x="{x + size}" y="{y}" style="{HEAD};font-size:{size}px;font-weight:500" fill="{color}">Nova<tspan fill="{accent}" font-weight="400">Parfum</tspan></text>')


def pill(x, y, text, bg=C["iris"], fg="#FFFFFF", size=28):
    w = len(text) * size * 0.62 + 56
    return (f'<rect x="{x}" y="{y}" width="{w:.0f}" height="{size * 2.1:.0f}" rx="{size * 1.05:.0f}" fill="{bg}"/>'
            f'<text x="{x + w/2:.0f}" y="{y + size * 1.38:.0f}" text-anchor="middle" style="{BODY};font-size:{size}px;font-weight:800;letter-spacing:1px" fill="{fg}">{text}</text>')


def post_lanzamiento():
    return doc(1080, 1080, f'<rect width="1080" height="1080" fill="url(#g)"/>{photo(80, 80, 920, 620)}'
               f'<text x="80" y="790" style="{BODY};font-size:26px;font-weight:800;letter-spacing:6px" fill="{C["iris"]}">NUEVO LANZAMIENTO</text>'
               f'<text x="80" y="870" style="{HEAD};font-size:72px;font-weight:500" fill="{C["noche"]}">Nombre del perfume</text>'
               f'<text x="80" y="925" style="{BODY};font-size:30px" fill="{C["noche"]}">Marca · Familia olfativa · 30 / 50 / 100 ml</text>'
               f'{brand_mark(80, 1010, size=34)}{pill(760, 968, "Link en bio")}')


def post_promo():
    return doc(1080, 1080, f'<rect width="1080" height="1080" fill="{C["noche"]}"/>'
               f'<text x="540" y="200" text-anchor="middle" style="{BODY};font-size:28px;font-weight:800;letter-spacing:8px" fill="{C["lavanda"]}">COMBOS NOVAPARFUM</text>'
               f'<text x="540" y="380" text-anchor="middle" style="{HEAD};font-size:150px;font-weight:500" fill="{C["marfil"]}">Llevá 2</text>'
               f'<text x="540" y="520" text-anchor="middle" style="{HEAD};font-size:120px;font-weight:400" fill="{C["lavanda"]}">10% OFF</text>'
               f'<rect x="240" y="590" width="600" height="2" fill="{C["lavanda"]}" opacity=".4"/>'
               f'<text x="540" y="690" text-anchor="middle" style="{HEAD};font-size:84px" fill="{C["marfil"]}">3 o más · 15% OFF</text>'
               f'<text x="540" y="780" text-anchor="middle" style="{BODY};font-size:30px" fill="{C["marfil"]}" opacity=".85">Se aplica automáticamente en el carrito</text>'
               f'{pill(390, 860, "Comprá en la web", bg=C["lavanda"], fg=C["noche"])}'
               f'<text x="540" y="1030" text-anchor="middle" style="{HEAD};font-size:30px" fill="{C["marfil"]}">NovaParfum · Uruguay</text>')


def post_descuento():
    return doc(1080, 1080, f'<rect width="1080" height="1080" fill="{C["marfil"]}"/>{photo(540, 80, 460, 920, label="FOTO DEL PERFUME")}'
               f'<text x="80" y="200" style="{BODY};font-size:26px;font-weight:800;letter-spacing:6px" fill="{C["iris"]}">OFERTA POR TIEMPO LIMITADO</text>'
               f'<text x="80" y="420" style="{HEAD};font-size:190px;font-weight:500" fill="{C["noche"]}">-20%</text>'
               f'<text x="80" y="500" style="{HEAD};font-size:52px" fill="{C["noche"]}">Nombre del perfume</text>'
               f'<text x="80" y="570" style="{BODY};font-size:34px" fill="{C["noche"]}" text-decoration="line-through" opacity=".6">$ 0.000</text>'
               f'<text x="80" y="640" style="{BODY};font-size:54px;font-weight:800" fill="{C["iris"]}">$ 0.000</text>'
               f'<text x="80" y="720" style="{BODY};font-size:26px" fill="{C["noche"]}">Hasta agotar stock · Pagá con Mercado Pago</text>'
               f'{brand_mark(80, 1000, size=34)}')


def post_testimonio():
    return doc(1080, 1080, f'<rect width="1080" height="1080" fill="url(#g)"/>'
               f'<text x="100" y="330" style="{HEAD};font-size:260px" fill="{C["iris"]}" opacity=".25">“</text>'
               f'<text x="100" y="420" style="{HEAD};font-size:56px" fill="{C["noche"]}">Texto del testimonio real</text>'
               f'<text x="100" y="490" style="{HEAD};font-size:56px" fill="{C["noche"]}">en dos o tres líneas,</text>'
               f'<text x="100" y="560" style="{HEAD};font-size:56px" fill="{C["noche"]}">con permiso del cliente.</text>'
               f'<text x="100" y="660" style="{BODY};font-size:32px;font-weight:800" fill="{C["iris"]}">★★★★★</text>'
               f'<text x="100" y="720" style="{BODY};font-size:30px;font-weight:700" fill="{C["noche"]}">Nombre · Ciudad</text>'
               f'<text x="100" y="765" style="{BODY};font-size:26px" fill="{C["noche"]}" opacity=".7">Compró: Nombre del perfume 100 ml</text>'
               f'{brand_mark(100, 1000, size=34)}')


def post_nuevo():
    return doc(1080, 1080, f'<rect width="1080" height="1080" fill="{C["bruma"]}"/>{photo(0, 0, 1080, 760, r=0)}'
               f'{pill(60, 60, "NUEVO", bg=C["iris"])}'
               f'<text x="60" y="860" style="{HEAD};font-size:64px;font-weight:500" fill="{C["noche"]}">Nombre del perfume</text>'
               f'<text x="60" y="920" style="{BODY};font-size:30px" fill="{C["noche"]}">Salida: nota · Corazón: nota · Fondo: nota</text>'
               f'<text x="60" y="1010" style="{BODY};font-size:34px;font-weight:800" fill="{C["iris"]}">Desde $ 0.000</text>'
               f'<text x="1020" y="1010" text-anchor="end" style="{HEAD};font-size:30px" fill="{C["noche"]}">NovaParfum</text>')


def story_base(title, sub, cta):
    return doc(1080, 1920, f'<rect width="1080" height="1920" fill="url(#g)"/>'
               f'{brand_mark(80, 190, size=44)}{photo(80, 300, 920, 1000)}'
               f'<text x="80" y="1440" style="{HEAD};font-size:84px;font-weight:500" fill="{C["noche"]}">{title}</text>'
               f'<text x="80" y="1520" style="{BODY};font-size:36px" fill="{C["noche"]}">{sub}</text>'
               f'{pill(80, 1600, cta, size=34)}'
               f'<text x="540" y="1860" text-anchor="middle" style="{BODY};font-size:26px;font-weight:700;letter-spacing:4px" fill="{C["noche"]}" opacity=".6">ZONA SEGURA: NO PONER TEXTO ACÁ</text>')


def highlight(label, icon_path):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">'
            f'<circle cx="540" cy="540" r="540" fill="{C["bruma"]}"/>'
            f'<g transform="translate(300 250) scale(20)" fill="none" stroke="{C["iris"]}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">{icon_path}</g>'
            f'<text x="540" y="860" text-anchor="middle" style="{BODY};font-size:64px;font-weight:800;letter-spacing:4px" fill="{C["noche"]}">{label}</text></svg>\n')


ICONS = {
    "envios": ("ENVÍOS", '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
    "pagos": ("PAGOS", '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>'),
    "novedades": ("NOVEDADES", '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z"/>'),
    "resenas": ("RESEÑAS", '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 10h8"/>'),
    "ayuda": ("AYUDA", '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01"/>'),
}


def main():
    files = {
        "post-lanzamiento.svg": post_lanzamiento(),
        "post-promo-combos.svg": post_promo(),
        "post-descuento.svg": post_descuento(),
        "post-testimonio.svg": post_testimonio(),
        "post-nuevo-perfume.svg": post_nuevo(),
        "historia-producto.svg": story_base("Nombre del perfume", "Marca · 100 ml · Familia olfativa", "Comprar ahora"),
        "historia-promo.svg": story_base("Llevá 2 y ahorrá 10%", "3 o más: 15% OFF automático", "Ver perfumes"),
        "historia-envio.svg": story_base("¡Tu pedido va en camino!", "Seguilo con tu número de pedido", "Seguí tu pedido"),
    }
    for key, (label, path) in ICONS.items():
        files[f"destacada-{key}.svg"] = highlight(label, path)
    for name, content in files.items():
        (OUT / name).write_text(content, encoding="utf-8")
        print("✔ branding/instagram/" + name)


if __name__ == "__main__":
    main()
