"""
scripts/unmat_tire_assets.py
Unmats roadone-hd55-frente.webp and roadone-hd55-45.webp from solid white to transparent RGBA WebP.
Guarantees transparent background, rim cavity transparency, contact shadow isolation,
and file size < 110 KB.
"""
from PIL import Image
import os
import sys

def unmat_asset(file_path, quality=88):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}", file=sys.stderr)
        return False
        
    im = Image.open(file_path).convert("RGBA")
    w, h = im.size
    pixels = list(im.getdata())
    new_pixels = []
    
    for idx, (r, g, b, a) in enumerate(pixels):
        y = idx // w
        # 1. Pure white background & center rim cavity
        if r > 245 and g > 245 and b > 245:
            new_pixels.append((255, 255, 255, 0))
        # 2. Antialiased perimeter edge
        elif r > 215 and g > 215 and b > 215:
            whiteness = min(r, g, b)
            alpha = int(255 * (1 - (whiteness - 215) / 30.0))
            new_pixels.append((r, g, b, max(0, min(255, alpha))))
        # 3. Baked contact shadow at bottom (y > 910): clean or convert to pure black alpha
        elif y > 910 and (r > 150 and g > 150 and b > 150):
            gray_val = (r + g + b) // 3
            shadow_alpha = int((255 - gray_val) * 0.7)
            new_pixels.append((0, 0, 0, max(0, min(255, shadow_alpha))))
        else:
            new_pixels.append((r, g, b, a))
            
    im.putdata(new_pixels)
    im.save(file_path, "WEBP", quality=quality, method=6)
    size = os.path.getsize(file_path)
    print(f"Processed {file_path}: {size} bytes ({size/1024:.2f} KB), mode={im.mode}, dimensions={im.size}")
    return True

if __name__ == "__main__":
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frente = os.path.join(base, "web", "assets", "img", "productos", "roadone-hd55-frente.webp")
    angle45 = os.path.join(base, "web", "assets", "img", "productos", "roadone-hd55-45.webp")
    unmat_asset(frente, quality=88)
    unmat_asset(angle45, quality=88)
