
import os
import cv2
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageDraw, ImageEnhance
import vtracer

BASE_OUT = r"d:\SurLlantas\brand-assets"
SOURCE_PNG = r"d:\SurLlantas\web\assets\img\logo-sur-llantas-horizontal.png"

def build():
    # 1. Cargar y recortar imagen maestra
    raw_img = Image.open(SOURCE_PNG).convert("RGBA")
    bbox = raw_img.getbbox()
    master_img = raw_img.crop(bbox)
    w, h = master_img.size
    print(f"Master crop dimensions: {w}x{h}")
    
    arr = np.array(master_img, dtype=np.float32)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3] / 255.0
    
    eps = 1e-4
    alpha_safe = np.maximum(alpha, eps)[:, :, None]
    unmatted_rgb = np.clip((rgb - 255.0 * (1.0 - alpha[:, :, None])) / alpha_safe, 0, 255)
    
    clean_alpha = np.where(alpha < 0.08, 0.0, alpha)
    clean_alpha_255 = (clean_alpha * 255.0).astype(np.uint8)
    
    clean_light_arr = np.dstack([unmatted_rgb.astype(np.uint8), clean_alpha_255])
    clean_light_img = Image.fromarray(clean_light_arr, "RGBA")
    
    bbox_clean = clean_light_img.getbbox()
    clean_light_img = clean_light_img.crop(bbox_clean)
    w, h = clean_light_img.size
    print(f"Clean light dimensions: {w}x{h}")
    
    # Red mask & Dark mask
    clean_arr = np.array(clean_light_img)
    c_rgb = clean_arr[:, :, :3].astype(np.float32)
    c_alpha = clean_arr[:, :, 3]
    
    is_red = (c_alpha > 30) & (c_rgb[:, :, 0] > 120) & (c_rgb[:, :, 1] < 75) & (c_rgb[:, :, 2] < 75)
    is_dark_element = (c_alpha > 30) & (~is_red)
    brightness = (c_rgb[:, :, 0] + c_rgb[:, :, 1] + c_rgb[:, :, 2]) / 3.0
    
    dark_mode_arr = clean_arr.copy()
    for y in range(h):
        for x in range(w):
            a = clean_arr[y, x, 3]
            if a > 20:
                if is_red[y, x]:
                    dark_mode_arr[y, x, 0] = min(255, int(clean_arr[y, x, 0] * 1.15))
                    dark_mode_arr[y, x, 1] = int(clean_arr[y, x, 1] * 0.9)
                    dark_mode_arr[y, x, 2] = int(clean_arr[y, x, 2] * 0.9)
                elif is_dark_element[y, x]:
                    orig_val = brightness[y, x]
                    new_val = int(255 - orig_val * 0.4)
                    dark_mode_arr[y, x, 0] = min(255, new_val)
                    dark_mode_arr[y, x, 1] = min(255, new_val)
                    dark_mode_arr[y, x, 2] = min(255, new_val)
                    
    clean_dark_img = Image.fromarray(dark_mode_arr, "RGBA")
    
    # Isotype crop
    is_wheel_area = np.zeros((h, w), dtype=bool)
    is_wheel_area[:, int(w * 0.63):] = True
    is_road_area = np.zeros((h, w), dtype=bool)
    is_road_area[int(h * 0.45):, :] = True
    
    isotype_mask = (c_alpha > 20) & (is_wheel_area | (is_road_area & ~is_red))
    isotype_arr = np.zeros_like(clean_arr)
    isotype_arr[isotype_mask] = clean_arr[isotype_mask]
    isotype_img = Image.fromarray(isotype_arr, "RGBA")
    bbox_iso = isotype_img.getbbox()
    isotype_cropped = isotype_img.crop(bbox_iso) if bbox_iso else isotype_img
    
    # Wordmark crop
    wordmark_mask = (c_alpha > 20) & (~(is_road_area & (c_rgb[:, :, 0] < 80))) & (~is_wheel_area)
    wordmark_arr = np.zeros_like(clean_arr)
    wordmark_arr[wordmark_mask] = clean_arr[wordmark_mask]
    wordmark_img = Image.fromarray(wordmark_arr, "RGBA")
    bbox_wm = wordmark_img.getbbox()
    wordmark_cropped = wordmark_img.crop(bbox_wm) if bbox_wm else wordmark_img
    
    # Save vector temp files
    temp_dir = os.path.join(BASE_OUT, "temp_render")
    os.makedirs(temp_dir, exist_ok=True)
    p_light_png = os.path.join(temp_dir, "master_light.png")
    p_dark_png = os.path.join(temp_dir, "master_dark.png")
    p_iso_png = os.path.join(temp_dir, "master_isotype.png")
    p_wm_png = os.path.join(temp_dir, "master_wordmark.png")
    
    clean_light_img.save(p_light_png, "PNG")
    clean_dark_img.save(p_dark_png, "PNG")
    isotype_cropped.save(p_iso_png, "PNG")
    wordmark_cropped.save(p_wm_png, "PNG")
    
    # Vectorize
    svg_dir = os.path.join(BASE_OUT, "01-svg")
    vtracer.convert_image_to_svg_py(p_light_png, os.path.join(svg_dir, "surllantas-logo-color-light.svg"))
    vtracer.convert_image_to_svg_py(p_dark_png, os.path.join(svg_dir, "surllantas-logo-color-dark.svg"))
    vtracer.convert_image_to_svg_py(p_iso_png, os.path.join(svg_dir, "surllantas-isotipo-pista-rueda.svg"))
    vtracer.convert_image_to_svg_py(p_wm_png, os.path.join(svg_dir, "surllantas-wordmark.svg"))
    print("01-svg generated successfully!")
    
    # 02-png-web
    web_dir = os.path.join(BASE_OUT, "02-png-web")
    ratio = h / w
    h_500 = int(500 * ratio)
    h_1000 = int(1000 * ratio)
    
    clean_light_img.resize((500, h_500), Image.Resampling.LANCZOS).save(os.path.join(web_dir, "surllantas-horizontal-500px.png"), "PNG")
    clean_light_img.resize((1000, h_1000), Image.Resampling.LANCZOS).save(os.path.join(web_dir, "surllantas-horizontal-1000px.png"), "PNG")
    clean_dark_img.resize((1000, h_1000), Image.Resampling.LANCZOS).save(os.path.join(web_dir, "surllantas-dark-mode-1000px.png"), "PNG")
    
    # Favicons
    fav_dir = os.path.join(web_dir, "favicons")
    wheel_img = clean_light_img.crop((int(w * 0.70), 0, w, h))
    bbox_wheel = wheel_img.getbbox()
    if bbox_wheel:
        wheel_img = wheel_img.crop(bbox_wheel)
    w_wh, h_wh = wheel_img.size
    max_wh = max(w_wh, h_wh)
    square_wheel = Image.new("RGBA", (max_wh, max_wh), (0, 0, 0, 0))
    square_wheel.paste(wheel_img, ((max_wh - w_wh) // 2, (max_wh - h_wh) // 2))
    
    fav_icons = []
    for sz in [16, 32, 48, 192, 512]:
        fav = square_wheel.resize((sz, sz), Image.Resampling.LANCZOS)
        fav.save(os.path.join(fav_dir, f"favicon-{sz}x{sz}.png"), "PNG")
        if sz in [16, 32, 48]:
            fav_icons.append(fav)
            
    fav_icons[0].save(os.path.join(fav_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=fav_icons[1:])
    print("02-png-web generated successfully!")
    
    # 03-video-assets-4k
    video_dir = os.path.join(BASE_OUT, "03-video-assets-4k")
    h_4000 = int(4000 * ratio)
    clean_light_img.resize((4000, h_4000), Image.Resampling.LANCZOS).save(os.path.join(video_dir, "logo-full-4000px-transparente.png"), "PNG")
    clean_dark_img.resize((4000, h_4000), Image.Resampling.LANCZOS).save(os.path.join(video_dir, "logo-white-text-4000px-transparente.png"), "PNG")
    
    w_iso, h_iso = isotype_cropped.size
    h_iso_2048 = int(2048 * (h_iso / w_iso))
    isotype_cropped.resize((2048, h_iso_2048), Image.Resampling.LANCZOS).save(os.path.join(video_dir, "isotipo-rueda-aislado-2048px.png"), "PNG")
    
    canvas_1080p = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    wm_w = 450
    wm_h = int(wm_w * ratio)
    wm_logo = clean_dark_img.resize((wm_w, wm_h), Image.Resampling.LANCZOS)
    canvas_1080p.paste(wm_logo, (1920 - wm_w - 60, 1080 - wm_h - 60), wm_logo)
    canvas_1080p.save(os.path.join(video_dir, "lower-third-watermark-1080p.png"), "PNG")
    print("03-video-assets-4k generated successfully!")
    
    # 04-redes-sociales
    social_dir = os.path.join(BASE_OUT, "04-redes-sociales")
    
    # Avatar 2048x2048
    avatar = Image.new("RGBA", (2048, 2048), (17, 17, 19, 255))
    draw_av = ImageDraw.Draw(avatar)
    for r_i in range(1024, 0, -16):
        draw_av.ellipse([1024 - r_i, 1024 - r_i, 1024 + r_i, 1024 + r_i], fill=(int(28 * (1 - r_i/1024)), int(28 * (1 - r_i/1024)), int(32 * (1 - r_i/1024)), 255))
    av_logo_w = 1330
    av_logo_h = int(av_logo_w * ratio)
    av_logo = clean_dark_img.resize((av_logo_w, av_logo_h), Image.Resampling.LANCZOS)
    avatar.paste(av_logo, ((2048 - av_logo_w) // 2, (2048 - av_logo_h) // 2), av_logo)
    avatar.save(os.path.join(social_dir, "avatar-perfil-2048x2048.png"), "PNG")
    
    # Banner LinkedIn 1584x396
    linkedin = Image.new("RGBA", (1584, 396), (15, 15, 17, 255))
    draw_li = ImageDraw.Draw(linkedin)
    draw_li.rectangle([0, 390, 1584, 396], fill=(211, 47, 47, 255))
    draw_li.line([(0, 390), (1584, 390)], fill=(255, 59, 48, 255), width=2)
    for i in range(0, 1584, 40):
        draw_li.line([(i, 0), (i + 100, 396)], fill=(22, 22, 26, 255), width=1)
    li_logo_w = 600
    li_logo_h = int(li_logo_w * ratio)
    li_logo = clean_dark_img.resize((li_logo_w, li_logo_h), Image.Resampling.LANCZOS)
    linkedin.paste(li_logo, (1584 - li_logo_w - 120, (396 - li_logo_h) // 2), li_logo)
    linkedin.save(os.path.join(social_dir, "banner-linkedin-1584x396.png"), "PNG")
    
    # Header Twitter 1500x500
    twitter = Image.new("RGBA", (1500, 500), (14, 14, 16, 255))
    draw_tw = ImageDraw.Draw(twitter)
    draw_tw.rectangle([0, 492, 1500, 500], fill=(211, 47, 47, 255))
    for i in range(200, 1500, 50):
        draw_tw.line([(i, 0), (i + 150, 500)], fill=(20, 20, 24, 255), width=1)
    tw_logo_w = 680
    tw_logo_h = int(tw_logo_w * ratio)
    tw_logo = clean_dark_img.resize((tw_logo_w, tw_logo_h), Image.Resampling.LANCZOS)
    twitter.paste(tw_logo, (1500 - tw_logo_w - 140, (500 - tw_logo_h) // 2 - 20), tw_logo)
    twitter.save(os.path.join(social_dir, "header-x-twitter-1500x500.png"), "PNG")
    print("04-redes-sociales generated successfully!")
    
    # Remove temp files
    for f in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, f))
    os.rmdir(temp_dir)
    print("ALL DONE SUCCESSFULLY!")

build()
