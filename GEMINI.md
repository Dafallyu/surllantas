# Contexto de Proyecto y Directrices para Antigravity — SurLlantas

Bienvenido al espacio de trabajo de **SurLlantas** en Antigravity. Este archivo define la arquitectura técnica, automatización de catálogo con Python, despliegue en Vercel, skills sugeridas y conexiones MCP pertinentes.

---

## 1. 📌 Resumen del Proyecto y Propósito
- **Nombre:** SurLlantas
- **Propósito:** Portal comercial y catálogo digital de neumáticos en Tarija, Bolivia (distribución de llantas para vagonetas, camionetas 4x4, camiones y transporte pesado). Marca destacada: Roadone.
- **Dominio en Producción:** `surllantas.com.bo`
- **Infraestructura de Hosting:** Vercel (configurado en `web/vercel.json` y `web/.vercel/`).
- **Pipeline de Procesamiento Gráfico:** Scripts en Python para remoción de fondo (`rembg`), sombras de contacto realistas y exportación a WebP optimizado (1000x1000 px).

---

## 2. 🧠 Skills Recomendadas para este Proyecto

| Skill | Función en SurLlantas |
| :--- | :--- |
| **`ui-ux-pro-max`** / **`ui-styling`** | Interfaz de catálogo automotriz, selectores de medidas de llanta (aro, ancho, perfil) y microinteracciones de cotización. |
| **`banner-design`** / **`design`** | Creación de banners promocionales para marcas aliadas (Roadone, etc.) y assets comerciales. |
| **`brand`** | Mantenimiento de la identidad visual de SurLlantas (azul eléctrico, amarillo/dorado de acento, fondos oscuros y limpios). |
| **`vercel-cli`** / **`deployments-cicd`** | Gestión de despliegues, vista previa de ramas y vinculación de dominio en Vercel. |
| **`web-perf`** | Optimización de imágenes WebP del catálogo para mantener LCP < 1.5s en conexiones móviles. |
| **`chrome-devtools`** / **`verification`** | Pruebas visuales del filtrado de llantas y flujo de checkout/contacto hacia WhatsApp. |

---

## 3. 🔌 Conexiones MCP Pertinentes
- **`browser` (Playwright MCP)**:
  - Navegar `https://surllantas.com.bo` o el servidor local, validar que las imágenes de productos carguen sin distorsión, verificar tarjetas de catálogo y probar el scroll infinito o paginación.

---

## 4. 📁 Organización de Carpetas y Scripts

```text
F:\Proyectos\SurLlantas\
├── web/                     # Código fuente de producción desplegado en Vercel
│   ├── index.html           # Portada principal con buscador de llantas y categorías
│   ├── nosotros.html        # Historia, valores y distribución autorizada
│   ├── contacto.html        # Ubicación física en Tarija y enlaces de atención
│   ├── assets/              # CSS, JS, e imágenes WebP del catálogo de productos
│   ├── vercel.json          # Reglas de encabezados, caché y rutas Vercel
│   └── procesar_fotos.py    # Script local de procesamiento individual de imágenes
│
├── build_brand_pack.py      # Generador automatizado de paquetes de marca
├── build_black_pack.py      # Generador de variantes oscuras
├── build_white_pack.py      # Generador de variantes claras
└── .agents/skills/          # Colección de skills locales disponibles para este repositorio
```

> **Nota de Versiones:** Si necesitas consultar versiones o experimentos anteriores, se encuentran respaldados en la carpeta adyacente:
> `F:\Proyectos\SurLlantas_Versiones_Extra\`
> - `surllantas pro 3`: Versión previa del sitio estático.
> - `Surllantas-2`: Pipeline de sincronización con Google Firestore (`importar_a_firestore.py`).

---

## 5. 🛠️ Flujo de Trabajo Común

### Servidor Local para el Catálogo Web:
```bash
cd web
python -m http.server 5000
# Abrir: http://localhost:5000
```

### Despliegue con Vercel CLI:
```bash
cd web
vercel --prod
```

### Pipeline de Procesamiento de Llantas (Python):
Requiere librerías `Pillow`, `rembg`, `opencv-python`, `numpy`:
```bash
python build_brand_pack.py
```
