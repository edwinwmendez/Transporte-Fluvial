# 📁 Estructura de Imágenes

Esta carpeta contiene todas las imágenes estáticas del proyecto.

## 📂 Carpetas

- **`logos/`** - Logos de la empresa, marca, y branding
- **`icons/`** - Iconos personalizados y gráficos
- **`banners/`** - Banners, hero images, y imágenes promocionales
- **`vessels/`** - Fotos de embarcaciones (si son estáticas)
- **`payment-methods/`** - Imágenes de métodos de pago (YAPE, PLIN, Efectivo)

## 📝 Uso en el código

### Con Next.js Image (recomendado)
```tsx
import Image from 'next/image';

<Image 
  src="/images/logos/logo-transporte.svg" 
  alt="Logo Transporte Fluvial" 
  width={200} 
  height={50}
/>
```

### Con HTML img (para casos especiales)
```tsx
<img src="/images/banners/hero-banner.jpg" alt="Banner principal" />
```

## ⚠️ Notas importantes

- Las imágenes en `public/` son accesibles directamente por URL
- Usa `<Image>` de Next.js para optimización automática (WebP, AVIF)
- Mantén nombres descriptivos y en minúsculas con guiones: `logo-transporte.svg`
- Para imágenes dinámicas de usuarios, usa Supabase Storage
