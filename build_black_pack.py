import os
import numpy as np
from PIL import Image, ImageDraw
import vtracer

BASE_WHITE = r"d:\SurLlantas\brand-assets-white"
BASE_BLACK = r"d:\SurLlantas\brand-assets-black"

def make_black_rgba(im_rgba):
    arr = np.array(im_rgba)
    alpha = arr[:, :, 3]
    black_arr = np.zeros_like(arr)
    black_arr[:, :, 3] = alpha
    return Image.fromarray(black_arr, "RGBA")

def build_black_pack():
    # Crear carpetas esenciales
    svg_dir = os.path.join(BASE_BLACK, "01-svg")
    png_dir = os.path.join(BASE_BLACK, "02-png")
    prev_dir = os.path.join(BASE_BLACK, "03-preview")
    temp_dir = os.path.join(BASE_BLACK, "temp")

    for d in [svg_dir, png_dir, prev_dir, temp_dir]:
        os.makedirs(d, exist_ok=True)

    print("Cargando fuentes maestras de brand-assets-white...")
    im_logo = Image.open(os.path.join(BASE_WHITE, "03-video-assets-4k", "surllantas-logo-blanco-4000px.png")).convert("RGBA")
    im_wm = Image.open(os.path.join(BASE_WHITE, "03-video-assets-4k", "surllantas-wordmark-blanco-4000px.png")).convert("RGBA")
    im_iso = Image.open(os.path.join(BASE_WHITE, "03-video-assets-4k", "surllantas-isotipo-blanco-2048px.png")).convert("RGBA")
    im_wheel = Image.open(os.path.join(BASE_WHITE, "03-video-assets-4k", "surllantas-rueda-blanco-2048px.png")).convert("RGBA")

    print("Convirtiendo a negro puro #000000 con canal alfa intacto...")
    logo_black_4k = make_black_rgba(im_logo)
    wm_black_4k = make_black_rgba(im_wm)
    iso_black_2k = make_black_rgba(im_iso)
    wheel_black_2k = make_black_rgba(im_wheel)

    # 1. Guardar PNGs Esenciales (Master y Web)
    print("Guardando PNGs esenciales...")
    # Logotipo completo
    logo_black_4k.save(os.path.join(png_dir, "surllantas-logo-negro-4000px.png"), "PNG")
    w, h = logo_black_4k.size
    logo_1000 = logo_black_4k.resize((1000, int(1000 * h / w)), Image.Resampling.LANCZOS)
    logo_1000.save(os.path.join(png_dir, "surllantas-logo-negro-1000px.png"), "PNG")

    # Wordmark
    wm_black_4k.save(os.path.join(png_dir, "surllantas-wordmark-negro-4000px.png"), "PNG")
    w_wm, h_wm = wm_black_4k.size
    wm_1000 = wm_black_4k.resize((1000, int(1000 * h_wm / w_wm)), Image.Resampling.LANCZOS)
    wm_1000.save(os.path.join(png_dir, "surllantas-wordmark-negro-1000px.png"), "PNG")

    # Isotipo Pista y Rueda
    iso_black_2k.save(os.path.join(png_dir, "surllantas-isotipo-pista-rueda-negro-2048px.png"), "PNG")
    w_iso, h_iso = iso_black_2k.size
    iso_1000 = iso_black_2k.resize((1000, int(1000 * h_iso / w_iso)), Image.Resampling.LANCZOS)
    iso_1000.save(os.path.join(png_dir, "surllantas-isotipo-pista-rueda-negro-1000px.png"), "PNG")

    # Rueda sola
    wheel_black_2k.save(os.path.join(png_dir, "surllantas-isotipo-rueda-negro-2048px.png"), "PNG")
    w_wh, h_wh = wheel_black_2k.size
    wheel_1000 = wheel_black_2k.resize((1000, int(1000 * h_wh / w_wh)), Image.Resampling.LANCZOS)
    wheel_1000.save(os.path.join(png_dir, "surllantas-isotipo-rueda-negro-1000px.png"), "PNG")

    print("[OK] PNGs generados exitosamente.")

    # 2. Generar Vectores SVG
    print("Vectorizando SVGs con vtracer...")
    assets_to_vectorize = [
        (logo_1000, "surllantas-logo-negro.svg"),
        (wm_1000, "surllantas-wordmark-negro.svg"),
        (iso_1000, "surllantas-isotipo-pista-rueda-negro.svg"),
        (wheel_1000, "surllantas-isotipo-rueda-negro.svg")
    ]

    for img_asset, svg_name in assets_to_vectorize:
        temp_png = os.path.join(temp_dir, f"temp_{svg_name}.png")
        target_svg = os.path.join(svg_dir, svg_name)
        img_asset.save(temp_png, "PNG")
        vtracer.convert_image_to_svg_py(temp_png, target_svg)
        print(f" -> SVG creado: {svg_name} ({os.path.getsize(target_svg)} bytes)")

    # Limpiar temp
    for f in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, f))
    os.rmdir(temp_dir)
    print("[OK] SVGs vectorizados exitosamente.")

    # 3. Preview / Showcase sobre fondo blanco
    print("Generando showcase de contraste sobre fondo blanco...")
    bg_w, bg_h = 2400, 1400
    preview_img = Image.new("RGBA", (bg_w, bg_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(preview_img)

    # Marco sutil
    draw.rectangle([(20, 20), (bg_w - 20, bg_h - 20)], outline=(225, 225, 225, 255), width=2)
    draw.line([(bg_w // 2, 40), (bg_w // 2, bg_h - 40)], fill=(235, 235, 235, 255), width=2)

    # Mitad izquierda: Logotipo Completo Negro centrado
    left_w = bg_w // 2
    l_display_w = 950
    l_display_h = int(l_display_w * h / w)
    logo_res = logo_black_4k.resize((l_display_w, l_display_h), Image.Resampling.LANCZOS)
    preview_img.paste(logo_res, ((left_w - l_display_w) // 2, (bg_h - l_display_h) // 2), logo_res)

    # Mitad derecha: Isotipo Pista y Rueda Negro centrado
    right_w = bg_w // 2
    iso_display_w = 700
    iso_display_h = int(iso_display_w * h_iso / w_iso)
    iso_res = iso_black_2k.resize((iso_display_w, iso_display_h), Image.Resampling.LANCZOS)
    preview_img.paste(iso_res, (left_w + (right_w - iso_display_w) // 2, (bg_h - iso_display_h) // 2), iso_res)

    preview_path = os.path.join(prev_dir, "showcase-contraste-blanco.png")
    preview_img.save(preview_path, "PNG")
    print(f"[OK] Showcase de contraste generado en {preview_path}")

    print("\n¡BRAND PACK ESENCIAL EN NEGRO COMPLETADO AL 100%!")

if __name__ == "__main__":
    build_black_pack()
