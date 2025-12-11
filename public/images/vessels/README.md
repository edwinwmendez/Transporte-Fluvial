# 🚢 Embarcaciones

Carpeta para fotos de embarcaciones (si son estáticas).

## 📋 Qué colocar aquí

- Fotos de embarcaciones que se muestran en el catálogo
- Imágenes por defecto de embarcaciones
- Placeholders de embarcaciones

## 📝 Ejemplos de nombres

```
vessel-default.jpg
vessel-placeholder.svg
embarcacion-tipo-1.jpg
```

## ⚠️ Nota importante

**Para fotos dinámicas de embarcaciones** (subidas por admins):
- Usa **Supabase Storage** en lugar de esta carpeta
- Las imágenes dinámicas deben almacenarse en Firebase Storage
- Esta carpeta es solo para imágenes estáticas/por defecto

## 💡 Uso

```tsx
import Image from 'next/image';

// Imagen estática
<Image 
  src="/images/vessels/vessel-default.jpg" 
  alt="Embarcación" 
  width={400} 
  height={300}
/>

// Imagen dinámica desde Storage
const imageUrl = await storageService.getPublicUrl('vessels/vessel-123.jpg');
<Image src={imageUrl} alt="Embarcación" width={400} height={300} />
```
