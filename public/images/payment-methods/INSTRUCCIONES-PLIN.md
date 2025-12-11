# 📥 Instrucciones para Descargar Logo de PLIN

## 🔍 Opciones Disponibles

### Opción 1: Logowik - Logo de Interbank en SVG (Más Fácil)
**URL:** https://logowik.com/interbank-logo-vector-39378.html

**Ventajas:**
- ✅ Disponible directamente en formato SVG
- ✅ No requiere conversión
- ✅ Descarga directa

**Pasos:**
1. Visita la URL arriba
2. Busca el botón de descarga "Download SVG" o similar
3. Descarga el archivo SVG
4. Renombra a `plin-logo.svg` (PLIN es parte de Interbank)

**Nota:** PLIN es el servicio de pagos de Interbank, así que el logo de Interbank es apropiado para representar PLIN.

### Opción 2: Brands of the World
**URL:** https://www.brandsoftheworld.com/logo/plin-logo-ai

**Pasos:**
1. Visita la URL arriba
2. Marca el checkbox "I Agree" para aceptar los términos
3. Haz clic en el botón "Download" (puede aparecer después de marcar el checkbox)
4. El archivo descargado será en formato **AI** (Adobe Illustrator)
5. Para convertir AI a SVG:
   - Abre el archivo en Adobe Illustrator
   - Exporta como SVG: File → Export → Export As → SVG
   - O usa un convertidor online: https://convertio.co/ai-svg/

### Opción 2: Contactar Interbank Directamente
**Recomendado para uso comercial**

- **Email:** atención al cliente de Interbank
- **Solicitud:** Logo oficial de PLIN en formato SVG para uso en aplicación web
- **Ventaja:** Obtienes logo oficial con permiso de uso comercial

### Opción 3: Buscar en Repositorios de GitHub
**URL:** https://github.com/search?q=plin+logo+svg

Busca repositorios que contengan logos de PLIN en formato SVG.

### Opción 4: Usar el Logo de Interbank como Base
**URL:** https://www.brandsoftheworld.com/logo/interbank-1

1. Descarga el logo de Interbank (formato EPS)
2. PLIN es parte de Interbank, así que puedes usar el logo de Interbank como referencia
3. Convierte EPS a SVG usando: https://convertio.co/eps-svg/

---

## 🎨 Colores Oficiales de PLIN

Según el código existente en `components/ui/payment-icons.tsx`:
- **Azul principal:** #00A3E0
- **Cian:** #00D4FF

Usa estos colores si necesitas recrear o ajustar el logo.

---

## 📋 Después de Descargar

1. **Renombra el archivo:** `plin-logo.svg`
2. **Colócalo en:** `frontend/public/images/payment-methods/`
3. **Verifica el tamaño:** Idealmente menos de 50KB
4. **Optimiza si es necesario:** Usa https://jakearchibald.github.io/svgomg/

---

## ⚠️ Consideraciones Legales

- Verifica los derechos de uso antes de usar el logo
- Para uso comercial, es recomendable contactar a Interbank
- Los logos descargados de sitios públicos pueden tener restricciones de uso

---

## 🚀 Uso en el Código

Una vez descargado, úsalo así:

```tsx
import Image from 'next/image';

<Image 
  src="/images/payment-methods/plin-logo.svg" 
  alt="PLIN" 
  width={48} 
  height={48}
/>
```
