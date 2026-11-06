import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import vtracer

BASE_WHITE = r"d:\SurLlantas\brand-assets-white"
SOURCE_DARK_4K = r"d:\SurLlantas\brand-assets\03-video-assets-4k\logo-white-text-4000px-transparente.png"

def build():
    carpetas = [
        f"{BASE_WHITE}/01-svg",
        f"{BASE_WHITE}/02-png-web/favicons",
        f"{BASE_WHITE}/03-video-assets-4k",
        f"{BASE_WHITE}/04-preview-mockups",
        f"{BASE_WHITE}/temp_render"
    ]
    for c in carpetas:
        os.makedirs(c, exist_ok=True)

    print("Iniciando creaci?n del Brand Pack Monocrom?tico Blanco...")
    im_source = Image.open(SOURCE_DARK_4K).convert("RGBA")
    w, h = im_source.size
    arr = np.array(im_source)

    r = arr[:, :, 0].astype(float)
    g = arr[:, :, 1].astype(float)
    b = arr[:, :, 2].astype(float)
    a = arr[:, :, 3].astype(float)

    factor = np.clip((r - np.maximum(g, b) * 1.2) / 40.0, 0.0, 1.0)[:, :, None]
    rgb = arr[:, :, :3].astype(float)
    white_rgb = np.array([255.0, 255.0, 255.0])
    new_rgb = rgb * (1.0 - factor) + white_rgb * factor

    bright = (new_rgb[:, :, 0] + new_rgb[:, :, 1] + new_rgb[:, :, 2]) / 3.0
    is_fg = (a > 25) & (bright > 100)
    new_rgb[is_fg] = [255.0, 255.0, 255.0]

    clean_a = np.where(a < 15, 0, a).astype(np.uint8)
    master_white_arr = np.dstack([new_rgb.astype(np.uint8), clean_a])
    master_white_4k = Image.fromarray(master_white_arr, "RGBA")

    bbox = master_white_4k.getbbox()
    master_white_4k = master_white_4k.crop(bbox)
    w_4k, h_4k = master_white_4k.size
    ratio = h_4k / w_4k
    print(f"Master white 4K dimensions: {w_4k}x{h_4k}")

    arr_w = np.array(master_white_4k)
    c_a = arr_w[:, :, 3]

    is_wheel = np.zeros((h_4k, w_4k), dtype=bool)
    is_wheel[:, int(w_4k * 0.63):] = True
    is_road = np.zeros((h_4k, w_4k), dtype=bool)
    is_road[int(h_4k * 0.44):, int(w_4k * 0.30):] = True

    isotype_mask = (c_a > 20) & (is_wheel | is_road)
    isotype_arr = np.zeros_like(arr_w)
    isotype_arr[isotype_mask] = arr_w[isotype_mask]
    isotype_im = Image.fromarray(isotype_arr, "RGBA")
    bbox_iso = isotype_im.getbbox()
    isotype_4k = isotype_im.crop(bbox_iso)

    wheel_only_crop = master_white_4k.crop((int(w_4k * 0.68), 0, w_4k, h_4k))
    bbox_wh = wheel_only_crop.getbbox()
    wheel_only_4k = wheel_only_crop.crop(bbox_wh)

    wordmark_mask = (c_a > 20) & (~is_wheel) & (~is_road)
    wordmark_arr = np.zeros_like(arr_w)
    wordmark_arr[wordmark_mask] = arr_w[wordmark_mask]
    wordmark_im = Image.fromarray(wordmark_arr, "RGBA")
    bbox_wm = wordmark_im.getbbox()
    wordmark_4k = wordmark_im.crop(bbox_wm)

    print("Componentes separados con ?xito.")

    temp_dir = f"{BASE_WHITE}/temp_render"
    p_temp_full = f"{temp_dir}/temp_full.png"
    p_temp_iso = f"{temp_dir}/temp_iso.png"
    p_temp_wheel = f"{temp_dir}/temp_wheel.png"
    p_temp_wm = f"{temp_dir}/temp_wm.png"

    master_white_4k.save(p_temp_full, "PNG")
    isotype_4k.save(p_temp_iso, "PNG")
    wheel_only_4k.save(p_temp_wheel, "PNG")
    wordmark_4k.save(p_temp_wm, "PNG")

    svg_dir = f"{BASE_WHITE}/01-svg"
    vtracer.convert_image_to_svg_py(p_temp_full, f"{svg_dir}/surllantas-logo-blanco.svg")
    vtracer.convert_image_to_svg_py(p_temp_wm, f"{svg_dir}/surllantas-wordmark-blanco.svg")
    vtracer.convert_image_to_svg_py(p_temp_iso, f"{svg_dir}/surllantas-isotipo-pista-rueda-blanco.svg")
    vtracer.convert_image_to_svg_py(p_temp_wheel, f"{svg_dir}/surllantas-isotipo-rueda-blanco.svg")
    print("[OK] 01-svg generado.")

    web_dir = f"{BASE_WHITE}/02-png-web"
    h_500 = int(500 * ratio)
    master_white_4k.resize((500, h_500), Image.Resampling.LANCZOS).save(f"{web_dir}/surllantas-logo-blanco-500px.png", "PNG")
    h_1000 = int(1000 * ratio)
    master_white_4k.resize((1000, h_1000), Image.Resampling.LANCZOS).save(f"{web_dir}/surllantas-logo-blanco-1000px.png", "PNG")

    w_wm, h_wm = wordmark_4k.size
    ratio_wm = h_wm / w_wm
    h_wm_1000 = int(1000 * ratio_wm)
    wordmark_4k.resize((1000, h_wm_1000), Image.Resampling.LANCZOS).save(f"{web_dir}/surllantas-wordmark-blanco-1000px.png", "PNG")

    w_iso, h_iso = isotype_4k.size
    ratio_iso = h_iso / w_iso
    h_iso_1000 = int(1000 * ratio_iso)
    isotype_4k.resize((1000, h_iso_1000), Image.Resampling.LANCZOS).save(f"{web_dir}/surllantas-isotipo-blanco-1000px.png", "PNG")

    fav_dir = f"{web_dir}/favicons"
    w_w, h_w = wheel_only_4k.size
    max_w_dim = max(w_w, h_w)
    square_wheel = Image.new("RGBA", (max_w_dim, max_w_dim), (0, 0, 0, 0))
    square_wheel.paste(wheel_only_4k, ((max_w_dim - w_w) // 2, (max_w_dim - h_w) // 2))

    fav_imgs = []
    for sz in [16, 32, 48, 192, 512]:
        fav = square_wheel.resize((sz, sz), Image.Resampling.LANCZOS)
        fav.save(f"{fav_dir}/favicon-{sz}x{sz}.png", "PNG")
        if sz in [16, 32, 48]:
            fav_imgs.append(fav)
            
    fav_imgs[0].save(f"{fav_dir}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=fav_imgs[1:])
    print("[OK] 02-png-web generado.")

    v4k_dir = f"{BASE_WHITE}/03-video-assets-4k"
    master_white_4k.resize((4000, int(4000 * ratio)), Image.Resampling.LANCZOS).save(f"{v4k_dir}/surllantas-logo-blanco-4000px.png", "PNG")
    wordmark_4k.resize((4000, int(4000 * ratio_wm)), Image.Resampling.LANCZOS).save(f"{v4k_dir}/surllantas-wordmark-blanco-4000px.png", "PNG")
    isotype_4k.resize((2048, int(2048 * ratio_iso)), Image.Resampling.LANCZOS).save(f"{v4k_dir}/surllantas-isotipo-blanco-2048px.png", "PNG")
    wheel_only_4k.resize((2048, int(2048 * h_w / w_w)), Image.Resampling.LANCZOS).save(f"{v4k_dir}/surllantas-rueda-blanco-2048px.png", "PNG")

    canvas_1080 = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    wm_w = 460
    wm_h = int(wm_w * ratio)
    wm_resized = master_white_4k.resize((wm_w, wm_h), Image.Resampling.LANCZOS)
    canvas_1080.paste(wm_resized, (1920 - wm_w - 60, 1080 - wm_h - 60), wm_resized)
    canvas_1080.save(f"{v4k_dir}/lower-third-watermark-blanco-1080p.png", "PNG")
    print("[OK] 03-video-assets-4k generado.")

    mock_dir = f"{BASE_WHITE}/04-preview-mockups"
    mock_bg = Image.new("RGBA", (2400, 1200), (10, 10, 10, 255))
    logo_mock_w = 1600
    logo_mock_h = int(logo_mock_w * ratio)
    logo_mock = master_white_4k.resize((logo_mock_w, logo_mock_h), Image.Resampling.LANCZOS)
    mock_bg.paste(logo_mock, ((2400 - logo_mock_w) // 2, (1200 - logo_mock_h) // 2), logo_mock)
    mock_bg.save(f"{mock_dir}/mockup-contraste-negro.png", "PNG")

    grid_img = Image.new("RGBA", (1600, 800), (0, 0, 0, 255))
    draw_grid = ImageDraw.Draw(grid_img)
    draw_grid.line([(800, 0), (800, 800)], fill=(30, 30, 30, 255), width=2)

    l_w = 600
    l_h = int(l_w * ratio)
    l_res = master_white_4k.resize((l_w, l_h), Image.Resampling.LANCZOS)
    grid_img.paste(l_res, (100, (800 - l_h) // 2), l_res)

    i_w = 440
    i_h = int(i_w * ratio_iso)
    i_res = isotype_4k.resize((i_w, i_h), Image.Resampling.LANCZOS)
    grid_img.paste(i_res, (800 + (800 - i_w) // 2, (800 - i_h) // 2), i_res)

    grid_img.save(f"{mock_dir}/grid-referencia-logos-dark.png", "PNG")
    print("[OK] 04-preview-mockups generado.")

    for f_item in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, f_item))
    os.rmdir(temp_dir)
    print("ALL FINISHED SUCCESSFULLY!")
