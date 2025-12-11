# 📥 Guía para Descargar Logos de Métodos de Pago

Esta guía te ayudará a encontrar y descargar los logos oficiales de YAPE, PLIN y Efectivo.

---

## 🟣 YAPE (BCP)

### Opción 1: Wikimedia Commons (Recomendado - Oficial)

**URL:** https://commons.wikimedia.org/wiki/File:Yape_peru_logotype.svg

**Descarga directa:**

- Haz clic en "Descargar" o usa este enlace directo:
  ```
  https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Yape_peru_logotype.svg/512px-Yape_peru_logotype.svg.png
  ```
- Para SVG completo, busca el botón "Descargar archivo original"

**Licencia:** Creative Commons Attribution-Share Alike 4.0 International

### Opción 2: Yape Negocios (Material Oficial)

**URL:** https://www.yape.com.pe/preguntas-frecuentes/yape-negocios/

- Puedes solicitar material publicitario oficial
- También puedes acercarte a cualquier agencia BCP para recoger jalavistas y stickers

### Opción 3: Repositorio GitHub de Bancos

**URL:** https://github.com/Tgentil/Bancos-em-SVG

- Busca "Yape" o "BCP" en el repositorio
- Logos en formato SVG de alta calidad (2500x2500px)

---

## 🔵 PLIN (Interbank)

### Opción 1: Contactar Interbank (Recomendado)

Como no hay fuente oficial pública, la mejor opción es:

- Contactar directamente a Interbank
- Solicitar el logo oficial para uso comercial
- Email: atención al cliente o departamento de marketing

### Opción 2: Repositorio GitHub de Bancos

**URL:** https://github.com/Tgentil/Bancos-em-SVG

- Busca "Plin" o "Interbank"
- Puede que encuentres variantes del logo

### Opción 3: Sitios de Logos

- **Worldvectorlogo:** https://worldvectorlogo.com/es/logo/interbank
- **Logo-teka:** Busca "Plin" o "Interbank"
- **Icon-icons:** https://icon-icons.com (busca "plin")

**⚠️ Nota:** Verifica los derechos de uso antes de usar logos de terceros.

---

## 💵 Efectivo

Para el icono de efectivo, tienes varias opciones:

### Opción 1: Crear tu propio SVG

Ya tienes un icono SVG personalizado en `components/ui/payment-icons.tsx` que puedes exportar.

### Opción 2: Iconos gratuitos

- **Flaticon:** https://www.flaticon.com (busca "cash", "money", "billete")
- **Icons8:** https://icons8.com (busca "cash" o "money")
- **Lucide Icons:** Ya tienes `lucide-react` instalado, puedes usar `DollarSign` o `Banknote`

### Opción 3: Símbolo de Sol Peruano

- Puedes usar el símbolo S/ (Sol peruano) como icono
- Busca "sol peruano svg" en Google Images con filtro de uso comercial

---

## 🌐 Sitios Generales de Logos (Útiles para ambos)

### 1. Worldvectorlogo

**URL:** https://worldvectorlogo.com

- Logos vectoriales de alta calidad
- Formato SVG y PNG
- Busca: "yape", "plin", "interbank", "bcp"

### 2. Logo-teka

**URL:** https://logo-teka.com

- Logos en SVG y PNG sin fondo
- Colección extensa de marcas

### 3. LogosDown

**URL:** https://logosdown.com

- Plataforma colaborativa
- Recursos gráficos gratuitos

### 4. Icon-icons

**URL:** https://icon-icons.com

- Iconos y logotipos en diversos formatos
- Filtros por formato (SVG, PNG)

### 5. GitHub - Bancos-em-SVG

**URL:** https://github.com/Tgentil/Bancos-em-SVG

- Repositorio con logos de bancos en SVG
- Alta resolución (2500x2500px)
- Puede incluir YAPE y PLIN

---

## 📋 Checklist de Descarga

- [ ] **YAPE:** Descargar desde Wikimedia Commons o GitHub
- [ ] **PLIN:** Buscar en GitHub o contactar Interbank
- [ ] **Efectivo:** Usar icono existente o descargar de Flaticon/Icons8
- [ ] Verificar licencias y derechos de uso
- [ ] Optimizar imágenes si es necesario
- [ ] Renombrar archivos según convención: `yape-logo.svg`, `plin-logo.svg`, `efectivo-icon.svg`

---

## 🎨 Formatos Recomendados

1. **SVG** (Prioridad) - Escalable sin pérdida, mejor para web
2. **PNG** (Alternativa) - Si no encuentras SVG, usa PNG de alta resolución
3. **WebP** (Optimización) - Next.js lo convierte automáticamente

---

## ⚠️ Consideraciones Legales

- **YAPE:** El logo de Wikimedia Commons tiene licencia CC BY-SA 4.0 (requiere atribución)
- **PLIN:** Verifica derechos de marca antes de usar
- **Efectivo:** Usa iconos genéricos o crea tu propio diseño

**Recomendación:** Para uso comercial, contacta directamente a los bancos para obtener logos oficiales con permiso de uso.

---

## 🚀 Después de Descargar

1. Coloca los archivos en esta carpeta: `frontend/public/images/payment-methods/`
2. Nombres sugeridos:
   - `yape-logo.svg`
   - `plin-logo.svg`
   - `efectivo-icon.svg`
3. Usa en el código con `<Image>` de Next.js (ver README.md principal)
