# 💳 Métodos de Pago

Carpeta para imágenes de métodos de pago: YAPE, PLIN y Efectivo.

## 📋 Qué colocar aquí

- Logos oficiales de YAPE (BCP)
- Logos oficiales de PLIN (Interbank)
- Iconos o imágenes relacionadas con pago en efectivo
- QR codes de ejemplo (si aplica)

## 📝 Nombres sugeridos

```
yape-logo.svg
yape-logo.png
plin-logo.svg
plin-logo.png
efectivo-icon.svg
efectivo-icon.png
```

## 💡 Notas importantes

- **YAPE**: Colores oficiales - Púrpura #5F0B72 y verde aguamarina #01D0B5
- **PLIN**: Colores oficiales - Azul #00A3E0 y cian #00D4FF
- **Efectivo**: Verde #10B981 (ya usado en el código)

## 🔄 Uso en el código

Actualmente el proyecto usa componentes SVG personalizados en `components/ui/payment-icons.tsx`.

Si agregas imágenes aquí, puedes usarlas así:

```tsx
import Image from 'next/image';

// Opción 1: Reemplazar los SVG actuales
<Image src="/images/payment-methods/yape-logo.svg" alt="YAPE" width={48} height={48} />;

// Opción 2: Usar junto con los iconos SVG existentes
// (por ejemplo, en modales o documentos)
```

## ⚠️ Consideraciones

- Respeta los derechos de marca de YAPE y PLIN
- Usa logos oficiales cuando sea posible
- Mantén consistencia con los colores ya definidos en `globals.css`
