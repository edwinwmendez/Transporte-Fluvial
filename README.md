# 🚢 Frontend - Sistema de Transporte Fluvial

Frontend del sistema de reservas de transporte fluvial construido con Next.js 16, TypeScript y Tailwind CSS.

## 📱 Responsividad Completa

Este proyecto está diseñado con **enfoque mobile-first** y es completamente responsive para:
- 📱 **Móviles** (320px - 767px)
- 📱 **Tablets** (768px - 1023px)
- 💻 **Desktop** (1024px+)

### Características de Responsividad

✅ **Mobile-First Design**: Diseñado primero para móvil, escalado a desktop  
✅ **Touch Targets**: Mínimo 44x44px para elementos interactivos  
✅ **Tipografía Adaptativa**: Tamaños de fuente que se ajustan por breakpoint  
✅ **Layouts Flexibles**: Grid y Flex que se adaptan automáticamente  
✅ **Safe Area Support**: Soporte para dispositivos con notch  
✅ **Prevención de Zoom**: Inputs optimizados para iOS  
✅ **Hooks Responsive**: Utilidades para detectar breakpoints

Ver [RESPONSIVE-GUIDE.md](./RESPONSIVE-GUIDE.md) para documentación completa.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20.x o superior
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar producción
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js 16)
│   │   ├── (cliente)/          # Rutas de cliente
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Página de inicio
│   │   └── globals.css         # Estilos globales
│   ├── components/
│   │   ├── shared/             # Componentes compartidos
│   │   │   ├── Navbar.tsx      # Navbar responsive
│   │   │   ├── Footer.tsx      # Footer responsive
│   │   │   └── Container.tsx   # Contenedor responsive
│   │   ├── ui/                 # Componentes UI base
│   │   │   ├── Button.tsx      # Botón responsive
│   │   │   ├── Card.tsx        # Card responsive
│   │   │   └── Input.tsx       # Input responsive
│   │   └── cliente/            # Componentes específicos
│   │       ├── TripCard.tsx    # Card de viaje
│   │       └── SearchFilters.tsx
│   └── lib/
│       └── utils/
│           ├── cn.ts           # Helper para clases
│           └── responsive.ts  # Hooks responsive
├── tailwind.config.ts          # Configuración Tailwind
├── next.config.js              # Configuración Next.js
└── package.json
```

## 🎨 Componentes Responsive

### Container

Contenedor con padding adaptativo:

```tsx
<Container maxWidth="xl" padding>
  {/* Contenido */}
</Container>
```

### Button

Botón con touch targets adecuados:

```tsx
<Button variant="primary" size="md" fullWidth>
  Click me
</Button>
```

### Card

Card con padding adaptativo:

```tsx
<Card padding="md" hover>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Contenido</CardContent>
</Card>
```

## 🛠️ Hooks Responsive

### useBreakpoint()

Detecta el breakpoint actual:

```tsx
import { useBreakpoint } from '@/lib/utils/responsive';

const breakpoint = useBreakpoint();
```

### useIsMobile(), useIsTablet(), useIsDesktop()

Hooks de conveniencia:

```tsx
import { useIsMobile } from '@/lib/utils/responsive';

const isMobile = useIsMobile();
```

## 📐 Breakpoints

| Breakpoint | Tamaño | Uso |
|------------|--------|-----|
| `xs` | 320px | Móvil pequeño |
| `sm` | 640px | Móvil grande |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop pequeño |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande |

## 🎯 Mejores Prácticas

1. **Siempre usar mobile-first**: Diseña primero para móvil
2. **Touch targets**: Mínimo 44x44px para elementos interactivos
3. **Tipografía**: Usar tamaños responsive definidos en `globals.css`
4. **Grid/Flex**: Usar clases responsive de Tailwind
5. **Testing**: Probar en diferentes tamaños de pantalla

## 📚 Documentación

- [Guía de Responsividad](./RESPONSIVE-GUIDE.md) - Guía completa de responsividad
- [Next.js Docs](https://nextjs.org/docs) - Documentación de Next.js
- [Tailwind CSS](https://tailwindcss.com/docs) - Documentación de Tailwind

## 🧪 Testing Responsive

Para probar la responsividad:

1. **DevTools**: Usar herramientas de desarrollador del navegador
2. **Dispositivos reales**: Probar en móviles y tablets reales
3. **Breakpoints**: Verificar cada breakpoint definido

## 🐛 Problemas Comunes

### Zoom automático en iOS
**Solución**: Inputs deben tener `font-size: 16px` mínimo

### Overflow horizontal
**Solución**: Usar `max-w-full` y contenedores apropiados

### Touch targets pequeños
**Solución**: Usar clase `touch-target` o mínimo `min-h-[44px]`

## 📝 Licencia

Este proyecto es parte del Sistema de Transporte Fluvial Atalaya.

---

**Desarrollado con ❤️ para la Amazonía peruana**
