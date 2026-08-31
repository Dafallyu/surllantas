"""
PROCESADOR MAESTRO DE FOTOS PARA SUR LLANTAS (TARIJA, BOLIVIA)
Optimizaciones implementadas:
1. Instanciaci?n ?nica de sesiones IA (u2net e isnet) fuera del loop.
2. Post-procesamiento robusto con cv2.findContours (RETR_CCOMP / RETR_EXTERNAL):
   - Aislamiento del componente conexo principal (elimina residuos en esquinas/bordes).
   - Detecci?n y vaciado a blanco puro (alpha=0) del hueco central del aro.
   - Relleno morfol?gico de reflejos en el labrado para evitar perforaciones/inversi?n.
3. Centrado inteligente: 'Media llanta' asentada abajo y 'Llanta completa' centrada con sombra de estudio.
4. Exportaci?n en WebP de alta fidelidad (calidad 92, m?todo 6).
"""

import os
import glob
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
import scipy.ndimage as ndi
from rembg import remove, new_session

def master_tire_pipeline(input_dir, output_dir, quality=92):
    os.makedirs(output_dir, exist_ok=True)
    
    print("Iniciando modelos neuronales...")
    s_u2 = new_session("u2net")
    s_is = new_session("isnet-general-use")
    
    raw_files = sorted(glob.glob(os.path.join(input_dir, "*.[jJ][pP][gG]")) + 
                       glob.glob(os.path.join(input_dir, "*.[pP][nN][gG]")) +
                       glob.glob(os.path.join(input_dir, "*.[wW][eE][bB][pP]")))
    
    total = len(raw_files)
    print(f"Encontradas {total} im?genes para procesar en {input_dir}\n")
    
    for idx, raw_path in enumerate(raw_files, 1):
        filename = os.path.basename(raw_path)
        base_name = os.path.splitext(filename)[0]
        out_path = os.path.join(output_dir, f"{base_name}.webp")
        
        try:
            img = Image.open(raw_path).convert("RGB")
            orig_w, orig_h = img.size
            
            nobg_is = remove(img, session=s_is)
            alpha_is = np.array(nobg_is.split()[3])
            
            nobg_u2 = remove(img, session=s_u2)
            alpha_u2 = np.array(nobg_u2.split()[3])
            
            is_transp_is = (alpha_is < 80)
            border_mask = np.zeros((orig_h, orig_w), dtype=bool)
            border_mask[0, :] = border_mask[-1, :] = border_mask[:, 0] = border_mask[:, -1] = True
            
            labeled_holes, num_h = ndi.label(is_transp_is)
            border_labs = np.unique(labeled_holes[border_mask])
            
            has_large_center_hole = False
            center_hole_mask = np.zeros((orig_h, orig_w), dtype=bool)
            for lab in range(1, num_h + 1):
                if lab not in border_labs:
                    sz = np.count_nonzero(labeled_holes == lab)
                    if sz > 15000:
                        cy, cx = ndi.center_of_mass(labeled_holes == lab)
                        if (0.20 * orig_h < cy < 0.80 * orig_h) and (0.20 * orig_w < cx < 0.80 * orig_w):
                            has_large_center_hole = True
                            center_hole_mask = center_hole_mask | (labeled_holes == lab)
                            
            is_circular_side = (orig_w > 0.85 * orig_h) and (has_large_center_hole or "181107" in base_name or "192829" in base_name)
            
            if is_circular_side:
                base_alpha = np.where(alpha_is > 100, 255, 0).astype(np.uint8)
                labeled_body, num_b = ndi.label(base_alpha > 128)
                if num_b > 0:
                    sizes_b = ndi.sum(base_alpha > 128, labeled_body, range(1, num_b + 1))
                    largest_idx = np.argmax(sizes_b) + 1
                    base_alpha = (labeled_body == largest_idx).astype(np.uint8) * 255
                    
                cy, cx = orig_h // 2, orig_w // 2
                y, x = np.ogrid[:orig_h, :orig_w]
                r_outer = min(cx, cy) * 1.08
                mask_circ = ((x - cx)**2 + (y - cy)**2) <= (r_outer**2)
                base_alpha = np.where(mask_circ, base_alpha, 0).astype(np.uint8)
                if has_large_center_hole:
                    base_alpha[center_hole_mask] = 0
            else:
                base_alpha = np.where(alpha_u2 > 90, 255, 0).astype(np.uint8)
                contours, _ = cv2.findContours(base_alpha, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
                clean_mask = np.zeros((orig_h, orig_w), dtype=np.uint8)
                if contours:
                    areas = [cv2.contourArea(c) for c in contours]
                    main_idx = int(np.argmax(areas))
                    cv2.drawContours(clean_mask, contours, main_idx, 255, thickness=cv2.FILLED)
                if has_large_center_hole:
                    hole_smooth = ndi.binary_dilation(center_hole_mask, iterations=2)
                    clean_mask[hole_smooth] = 0
                base_alpha = clean_mask
                
            base_alpha[:int(orig_h*0.03), :] = 0
            base_alpha[-int(orig_h*0.015):, :] = 0
            base_alpha[:, :int(orig_w*0.02)] = 0
            base_alpha[:, -int(orig_w*0.02):] = 0
            
            alpha_pil = Image.fromarray(base_alpha).filter(ImageFilter.GaussianBlur(radius=0.7))
            nobg = img.copy()
            nobg.putalpha(alpha_pil)
            
            bottom_row_pixels = np.count_nonzero(base_alpha[-8:, :] > 100)
            is_bottom_cut = bottom_row_pixels > (orig_w * 0.20)
            
            bbox = nobg.getbbox()
            if bbox:
                nobg = nobg.crop(bbox)
                
            w, h = nobg.size
            target_w, target_h = (1000, 1000)
            
            if is_bottom_cut:
                scale = min(int(target_w * 0.90) / w, int(target_h * 0.90) / h)
            else:
                scale = min(int(target_w * 0.85) / w, int(target_h * 0.85) / h)
                
            new_w, new_h = int(w * scale), int(h * scale)
            nobg = nobg.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            r, g, b, alpha = nobg.split()
            rgb = Image.merge("RGB", (r, g, b))
            
            arr = np.array(rgb, dtype=np.float32) / 255.0
            arr_enhanced = np.zeros_like(arr)
            for c in range(3):
                ch = arr[:, :, c]
                ch_adj = np.clip((ch - 0.03) / 0.95, 0.0, 1.0)
                ch_adj = np.power(ch_adj, 1.06)
                arr_enhanced[:, :, c] = ch_adj
                
            arr_enhanced = np.clip(arr_enhanced * 255.0, 0, 255).astype(np.uint8)
            enhanced_pil = Image.fromarray(arr_enhanced)
            sharpened = enhanced_pil.filter(ImageFilter.UnsharpMask(radius=1.2, percent=50, threshold=3))
            color_enh = ImageEnhance.Color(sharpened)
            sharpened = color_enh.enhance(1.10)
            
            final_rgba = sharpened.convert("RGBA")
            final_rgba.putalpha(alpha)
            
            canvas = Image.new("RGBA", (1000, 1000), (255, 255, 255, 255))
            offset_x = (target_w - new_w) // 2
            
            if is_bottom_cut:
                offset_y = target_h - new_h
            else:
                offset_y = (target_h - new_h) // 2 - int(target_h * 0.02)
                shadow_layer = Image.new("RGBA", (1000, 1000), (255, 255, 255, 0))
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
            rgb_final = Image.new("RGB", (1000, 1000), (255, 255, 255))
            rgb_final.paste(canvas, mask=canvas.split()[3])
            
            rgb_final.save(out_path, "WEBP", quality=quality, method=6)
            print(f"[{idx}/{total}] Procesada: {base_name}.webp ({os.path.getsize(out_path)//1024} KB)")
            
        except Exception as e:
            print(f"[{idx}/{total}] Error en {filename}: {str(e)}")

if __name__ == "__main__":
    RAW = r"d:\SurLlantas\Web\assets\img\raw"
    PROD = r"d:\SurLlantas\Web\assets\img\productos"
    master_tire_pipeline(RAW, PROD)
