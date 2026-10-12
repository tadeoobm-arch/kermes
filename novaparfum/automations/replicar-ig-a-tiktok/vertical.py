"""Pasa una imagen del feed de Instagram (4:5 o 3:4) a vertical 1080 × 1920 para TikTok.

La imagen va entera, a lo ancho; arriba y abajo se estira y suaviza la franja del borde para completar el fondo sin cortes.
Uso: python3 vertical.py <entrada> <salida.jpg> [margen_arriba_px]
"""
import sys
from PIL import Image, ImageFilter

def vertical(src, dst, top=None):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    fg = im.resize((1080, int(h * 1080 / w)), Image.LANCZOS)
    if top is None:
        top = max(0, (1920 - fg.height) // 2 - 90)  # un poco arriba: abajo TikTok pone el texto
    out = Image.new('RGB', (1080, 1920))
    if top > 0:
        out.paste(fg.crop((0, 0, 1080, 8)).resize((1080, top)).filter(ImageFilter.GaussianBlur(12)), (0, 0))
    rest = 1920 - top - fg.height
    if rest > 0:
        out.paste(fg.crop((0, fg.height - 8, 1080, fg.height)).resize((1080, rest)).filter(ImageFilter.GaussianBlur(12)), (0, top + fg.height))
    out.paste(fg, (0, top))
    out.save(dst, quality=92, optimize=True)

if __name__ == '__main__':
    vertical(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else None)
