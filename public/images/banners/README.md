# 🎨 Banners

Carpeta para banners, hero images y imágenes promocionales.

## 📋 Qué colocar aquí

- Hero images (imágenes principales de páginas)
- Banners promocionales
- Imágenes de fondo
- Sliders y carruseles

## 📝 Ejemplos de nombres

```
hero-home.jpg
banner-promocional.jpg
background-ruta.jpg
slider-embarcacion-1.jpg
```

## 💡 Formatos recomendados

- **JPG** - Para fotografías (mejor compresión)
- **WebP** - Para mejor rendimiento (Next.js lo convierte automáticamente)
- **PNG** - Solo si necesitas transparencia

## ⚠️ Optimización

Next.js optimiza automáticamente estas imágenes. Asegúrate de usar el componente `<Image>`:

```tsx
import Image from 'next/image';

<Image
  src="/images/banners/hero-home.jpg"
  alt="Banner principal"
  width={1920}
  height={1080}
  priority // Para imágenes above-the-fold
/>;
```
