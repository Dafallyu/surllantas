import os
import glob
import time
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
from rembg import remove, new_session

def master_tire_photo(input_path, output_dir, session, target_size=(1000, 1000)):
    os.makedirs(output_dir, exist_ok=True)
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    output_path = os.path.join(output_dir, f"{base_name}.webp")

    start_t = time.time()
    result_info = {
        "file": os.path.basename(input_path),
        "output_file": f"{base_name}.webp",
        "status": "OK",
        "type": "Completa",
        "size_kb": 0,
        "warnings": []
    }

    try:
        img = Image.open(input_path).convert("RGB")
        orig_w, orig_h = img.size
        
        # 1. Segmentacion con IA
        nobg = remove(img, session=session)
        
        alpha_orig = np.array(nobg.split()[3])
        non_transparent_count = np.count_nonzero(alpha_orig > 100)
        total_pixels = orig_w * orig_h
        coverage_ratio = non_transparent_count / total_pixels
        
        if coverage_ratio < 0.05:
            result_info["warnings"].append("Cobertura de objeto muy baja (<5% de la imagen)")
            result_info["status"] = "DUDOSA"
            
        # Detectar si la llanta esta cortada en la parte inferior (media llanta)
        bottom_row_pixels = np.count_nonzero(alpha_orig[-4:, :] > 100)
        is_bottom_cut = bottom_row_pixels > (orig_w * 0.20)
        result_info["type"] = "Media llanta" if is_bottom_cut else "Completa"

        bbox = nobg.getbbox()
        if not bbox:
            result_info["warnings"].append("No se detectó ningún objeto (bounding box vacío)")
            result_info["status"] = "ERROR"
            return result_info
            
        nobg = nobg.crop(bbox)
        w, h = nobg.size
        target_w, target_h = target_size

        # 2. Escala
        if is_bottom_cut:
            max_w = int(target_w * 0.90)
            max_h = int(target_h * 0.90)
            scale = min(max_w / w, max_h / h)
        else:
            max_dim = int(min(target_w, target_h) * 0.85)
            scale = min(max_dim / w, max_dim / h)

        new_w = int(w * scale)
        new_h = int(h * scale)
        nobg = nobg.resize((new_w, new_h), Image.Resampling.LANCZOS)

        r, g, b, alpha = nobg.split()
        rgb = Image.merge("RGB", (r, g, b))

        # 3. Calibracion de tono suave
        arr = np.array(rgb, dtype=np.float32) / 255.0
        arr_enhanced = np.zeros_like(arr)
        for c in range(3):
            ch = arr[:, :, c]
            ch_adj = np.clip((ch - 0.03) / 0.95, 0.0, 1.0)
            ch_adj = np.power(ch_adj, 1.06)
            arr_enhanced[:, :, c] = ch_adj

        arr_enhanced = np.clip(arr_enhanced * 255.0, 0, 255).astype(np.uint8)
        enhanced_pil = Image.fromarray(arr_enhanced)

        # 4. Nitidez suave y natural
        sharpened = enhanced_pil.filter(ImageFilter.UnsharpMask(radius=1.2, percent=50, threshold=3))

        # 5. Realce sutil de colores de etiquetas
        color_enh = ImageEnhance.Color(sharpened)
        sharpened = color_enh.enhance(1.10)

        final_rgba = sharpened.convert("RGBA")
        final_rgba.putalpha(alpha)

        # 6. Posicionamiento en lienzo blanco
        canvas = Image.new("RGBA", target_size, (255, 255, 255, 255))
        offset_x = (target_w - new_w) // 2

        if is_bottom_cut:
            offset_y = target_h - new_h
        else:
            offset_y = (target_h - new_h) // 2 - int(target_h * 0.02)
            shadow_layer = Image.new("RGBA", target_size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(shadow_layer)

            w1 = int(new_w * 0.85)
            h1 = int(target_h * 0.055)
            x0_1 = (target_w - w1) // 2
            y0_1 = offset_y + new_h - int(h1 * 0.5)
            draw.ellipse([x0_1, y0_1, x0_1 + w1, y0_1 + h1], fill=(60, 60, 60, 40))

            w2 = int(new_w * 0.65)
            h2 = int(target_h * 0.032)
            x0_2 = (target_w - w2) // 2
            y0_2 = offset_y + new_h - int(h2 * 0.42)
            draw.ellipse([x0_2, y0_2, x0_2 + w2, y0_2 + h2], fill=(30, 30, 30, 85))

            shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=10))
            canvas = Image.alpha_composite(canvas, shadow_layer)

        canvas.paste(final_rgba, (offset_x, offset_y), final_rgba)

        # 7. Convertir a RGB y guardar WebP
        rgb_final = Image.new("RGB", target_size, (255, 255, 255))
        rgb_final.paste(canvas, mask=canvas.split()[3])

        rgb_final.save(output_path, "WEBP", quality=92, method=6)
        size_kb = os.path.getsize(output_path) // 1024
        result_info["size_kb"] = size_kb
        
        elapsed = time.time() - start_t
        print(f"[{result_info['status']}] {result_info['file']} -> {result_info['output_file']} ({size_kb} KB, {result_info['type']}, {elapsed:.1f}s)")
        
    except Exception as e:
        result_info["status"] = "ERROR"
        result_info["warnings"].append(str(e))
        print(f"[ERROR] {result_info['file']}: {str(e)}")

    return result_info

if __name__ == "__main__":
    raw_dir = r"d:\SurLlantas\assets\img\raw"
    out_dir = r"d:\SurLlantas\assets\img\productos"
    os.makedirs(out_dir, exist_ok=True)

    print("Cargando modelo u2net en memoria...")
    session = new_session("u2net")
    print("Modelo cargado con éxito. Iniciando lote...")

    extensions = ("*.jpg", "*.jpeg", "*.png", "*.JPG", "*.JPEG", "*.PNG", "*.webp", "*.WEBP")
    files = []
    for ext in extensions:
        files.extend(glob.glob(os.path.join(raw_dir, ext)))

    # Ordenar alfabeticamente
    files = sorted(list(set(files)))
    print(f"Total de imágenes a procesar: {len(files)}")

    results = []
    for idx, f in enumerate(files, 1):
        print(f"({idx}/{len(files)}) Procesando: {os.path.basename(f)}...")
        res = master_tire_photo(f, out_dir, session)
        results.append(res)

    report_path = r"d:\SurLlantas\assets\img\productos\reporte_batch.json"
    with open(report_path, "w", encoding="utf-8") as rf:
        json.dump(results, rf, indent=2, ensure_ascii=False)

    print("BATCH_PROCESSING_COMPLETED_SUCCESSFULLY")
