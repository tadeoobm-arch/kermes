#!/usr/bin/env python3
"""Genera los logos de NovaParfum en SVG con el texto convertido a curvas (no depende de fuentes instaladas).

Requiere: pip install fonttools brotli
Uso:      python3 branding/generate_logos.py
Fuentes:  theme/assets/fraunces-latin.woff2 y manrope-latin.woff2 (SIL Open Font License).
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "branding" / "logo"
OUT.mkdir(parents=True, exist_ok=True)

C = {
    "noche": "#26224A", "iris": "#4B3FA8", "lavanda": "#BDB2EA", "marfil": "#FBF9F6",
    "bruma": "#F2EFFA", "rosa": "#F1DAD5", "salvia": "#B9CBB8", "blanco": "#FFFFFF",
}


def load(name, **axes):
    f = TTFont(ROOT / "theme" / "assets" / name)
    return instancer.instantiateVariableFont(f, axes) if "fvar" in f else f


FRAUNCES_500 = load("fraunces-latin.woff2", wght=500)
FRAUNCES_400 = load("fraunces-latin.woff2", wght=400)
MANROPE_700 = load("manrope-latin.woff2", wght=700)


def text_path(font, text, size, x, y, tracking=0.0):
    """Devuelve (d, ancho) del texto como path SVG. y = línea base."""
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font["head"].unitsPerEm
    s = size / upm
    pen = SVGPathPen(gs)
    cursor = 0.0
    for ch in text:
        g = cmap.get(ord(ch))
        if g is None:
            continue
        tp = TransformPen(pen, (s, 0, 0, -s, x + cursor, y))
        gs[g].draw(tp)
        cursor += gs[g].width * s + tracking
    return pen.getCommands(), cursor - tracking


def isotipo(cx, top, h, drop, star, dot=None, stroke=None):
    """Gota (perfume) con una estrella de 4 puntas (nova) adentro."""
    w = h * 0.72
    r = w / 2
    by = top + h - r  # centro del círculo inferior
    sw = stroke or h * 0.06
    d = (f"M{cx:.2f} {top:.2f} C{cx:.2f} {top:.2f} {cx + r:.2f} {top + h*0.36:.2f} {cx + r:.2f} {by:.2f} "
         f"A{r:.2f} {r:.2f} 0 0 1 {cx - r:.2f} {by:.2f} C{cx - r:.2f} {top + h*0.36:.2f} {cx:.2f} {top:.2f} {cx:.2f} {top:.2f}Z")
    k = h * 0.25  # radio de la estrella
    sy = by
    q = k * 0.18
    s = (f"M{cx:.2f} {sy - k:.2f} C{cx + q:.2f} {sy - q:.2f} {cx + q:.2f} {sy - q:.2f} {cx + k:.2f} {sy:.2f} "
         f"C{cx + q:.2f} {sy + q:.2f} {cx + q:.2f} {sy + q:.2f} {cx:.2f} {sy + k:.2f} "
         f"C{cx - q:.2f} {sy + q:.2f} {cx - q:.2f} {sy + q:.2f} {cx - k:.2f} {sy:.2f} "
         f"C{cx - q:.2f} {sy - q:.2f} {cx - q:.2f} {sy - q:.2f} {cx:.2f} {sy - k:.2f}Z")
    out = (f'<path d="{d}" fill="none" stroke="{drop}" stroke-width="{sw:.2f}" stroke-linejoin="round"/>'
           f'<path d="{s}" fill="{star}"/>')
    if dot:
        out += f'<circle cx="{cx + r*0.95:.2f}" cy="{top + h*0.16:.2f}" r="{h*0.045:.2f}" fill="{dot}"/>'
    return out


def svg(w, h, body, bg=None, title="NovaParfum"):
    bgrect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">'
            f"<title>{title}</title>{bgrect}{body}</svg>\n")


def horizontal(ink, accent, drop, star, dot, bg=None):
    size = 64
    iso = isotipo(38, 14, 72, drop, star, dot)
    d1, w1 = text_path(FRAUNCES_500, "Nova", size, 86, 74, tracking=0.5)
    d2, w2 = text_path(FRAUNCES_400, "Parfum", size, 86 + w1 + 1, 74, tracking=0.5)
    width = 86 + w1 + 1 + w2 + 16
    body = iso + f'<path d="{d1}" fill="{ink}"/><path d="{d2}" fill="{accent}"/>'
    return svg(width, 100, body, bg)


def stacked(ink, accent, drop, star, dot, sub, bg=None):
    size = 56
    d1, w1 = text_path(FRAUNCES_500, "Nova", size, 0, 0)
    d2, w2 = text_path(FRAUNCES_400, "Parfum", size, 0, 0)
    tw = w1 + w2 + 1
    width = max(tw, 260) + 40
    x0 = (width - tw) / 2
    d1, _ = text_path(FRAUNCES_500, "Nova", size, x0, 150)
    d2, _ = text_path(FRAUNCES_400, "Parfum", size, x0 + w1 + 1, 150)
    tag = "PERFUMERÍA · URUGUAY"
    _, tw3 = text_path(MANROPE_700, tag, 13, 0, 0, tracking=3.2)
    d3, _ = text_path(MANROPE_700, tag, 13, (width - tw3) / 2, 184, tracking=3.2)
    body = (isotipo(width / 2, 12, 84, drop, star, dot) + f'<path d="{d1}" fill="{ink}"/><path d="{d2}" fill="{accent}"/>'
            f'<path d="{d3}" fill="{sub}"/>')
    return svg(width, 204, body, bg)


def main():
    files = {
        "logo-principal-claro.svg": horizontal(C["noche"], C["iris"], C["noche"], C["iris"], C["lavanda"]),
        "logo-principal-oscuro.svg": horizontal(C["marfil"], C["lavanda"], C["marfil"], C["lavanda"], C["rosa"], bg=C["noche"]),
        "logo-principal-oscuro-transparente.svg": horizontal(C["marfil"], C["lavanda"], C["marfil"], C["lavanda"], C["rosa"]),
        "logo-principal-mono-noche.svg": horizontal(C["noche"], C["noche"], C["noche"], C["noche"], None),
        "logo-principal-mono-blanco.svg": horizontal(C["blanco"], C["blanco"], C["blanco"], C["blanco"], None),
        "logo-secundario-claro.svg": stacked(C["noche"], C["iris"], C["noche"], C["iris"], C["lavanda"], C["iris"]),
        "logo-secundario-oscuro.svg": stacked(C["marfil"], C["lavanda"], C["marfil"], C["lavanda"], C["rosa"], C["lavanda"], bg=C["noche"]),
        "isotipo-claro.svg": svg(120, 120, isotipo(60, 14, 92, C["noche"], C["iris"], C["lavanda"])),
        "isotipo-oscuro.svg": svg(120, 120, isotipo(60, 14, 92, C["marfil"], C["lavanda"], C["rosa"]), bg=C["noche"]),
        "isotipo-lavanda.svg": svg(120, 120, isotipo(60, 14, 92, C["noche"], C["iris"], C["marfil"]), bg=C["lavanda"]),
        "favicon.svg": ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#4B3FA8"/>'
                        + isotipo(32, 8, 50, C["marfil"], C["marfil"], C["lavanda"], stroke=3.6) + "</svg>\n"),
        "perfil-instagram.svg": svg(1080, 1080, f'<circle cx="540" cy="540" r="540" fill="{C["bruma"]}"/>'
                                    + isotipo(540, 250, 580, C["noche"], C["iris"], C["lavanda"], stroke=30)),
    }
    for name, content in files.items():
        (OUT / name).write_text(content, encoding="utf-8")
        print("✔", OUT.relative_to(ROOT) / name)
    # El tema usa el mismo favicon y logo (servidos por el CDN de Shopify)
    (ROOT / "theme" / "assets" / "favicon.svg").write_text(files["favicon.svg"], encoding="utf-8")
    (ROOT / "theme" / "assets" / "logo-novaparfum.svg").write_text(files["logo-principal-claro.svg"], encoding="utf-8")


if __name__ == "__main__":
    main()
