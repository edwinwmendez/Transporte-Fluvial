# 📱 Guía de Responsividad - Sistema de Transporte Fluvial

Esta guía documenta todas las implementaciones de responsividad en el proyecto, asegurando que la aplicación funcione perfectamente en móviles, tablets y desktop.

## 🎯 Principios de Diseño Responsive

### Mobile-First Approach
- **Diseñamos primero para móvil** (320px - 767px)
- **Escalamos hacia desktop** (768px+)
- **Optimización para touch** en dispositivos móviles

### Breakpoints Definidos

Según el PRD (RNF-USAB-001):

| Breakpoint | Tamaño | Dispositivo |
|------------|--------|-------------|
| `xs` | 320px | Móvil pequeño |
| `sm` | 640px | Móvil grande |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop pequeño |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande |

## 📐 Configuración de Tailwind

### Breakpoints en `tailwind.config.ts`

```typescript
screens: {
  'xs': '320px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

### Uso de Breakpoints

```tsx
// Ejemplo: Ocultar en móvil, mostrar en desktop
<div className="hidden md:block">Solo visible en desktop</div>

// Ejemplo: Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## 🎨 Tipografía Responsive

### Tamaños de Fuente Adaptativos

Definidos en `globals.css`:

- **H1**: 28px móvil → 36px desktop
- **H2**: 24px móvil → 30px desktop
- **H3**: 20px móvil → 24px desktop
- **Body**: 15px móvil → 16px desktop

### Implementación

```tsx
// Automático en globals.css
h1 {
  @apply text-h1-mobile md:text-h1;
}
```

## 🧩 Componentes Responsive

### 1. Container

Componente base para contenedores con padding adaptativo:

```tsx
<Container maxWidth="xl" padding>
  {/* Contenido */}
</Container>
```

**Características:**
- Padding: `px-4 sm:px-6 md:px-8 lg:px-12`
- Max-width configurable
- Centrado automático

### 2. Navbar

**Móvil:**
- Menú hamburguesa
- Logo abreviado
- Menú desplegable vertical

**Desktop:**
- Menú horizontal
- Logo completo
- Todos los enlaces visibles

### 3. Button

**Características responsive:**
- Touch targets mínimos: 44x44px (iOS guidelines)
- Padding adaptativo: `px-4 py-2.5 md:px-6 md:py-3`
- Tamaños: `sm`, `md`, `lg`

### 4. Input

**Optimizaciones móvil:**
- Font-size: 16px (previene zoom en iOS)
- Padding aumentado para touch
- Labels y errores con tamaño adaptativo

### 5. Card

**Padding adaptativo:**
- `sm`: `p-3 md:p-4`
- `md`: `p-4 md:p-6` (default)
- `lg`: `p-6 md:p-8`

## 🛠️ Hooks y Utilidades

### useBreakpoint()

Detecta el breakpoint actual:

```tsx
import { useBreakpoint } from '@/lib/utils/responsive';

function MyComponent() {
  const breakpoint = useBreakpoint();
  
  if (breakpoint === 'xs' || breakpoint === 'sm') {
    // Lógica para móvil
  }
}
```

### useIsMobile(), useIsTablet(), useIsDesktop()

Hooks de conveniencia:

```tsx
import { useIsMobile } from '@/lib/utils/responsive';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## 📱 Mejoras Específicas para Móvil

### 1. Touch Targets

Todos los elementos interactivos tienen mínimo 44x44px:

```tsx
// Clase utility
<button className="touch-target">Click</button>
```

### 2. Safe Area Insets

Soporte para dispositivos con notch:

```tsx
// En globals.css
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
```

### 3. Prevención de Zoom en Inputs

Inputs con `font-size: 16px` para prevenir zoom automático en iOS:

```css
@media screen and (max-width: 768px) {
  input[type="text"] {
    font-size: 16px;
  }
}
```

### 4. Scroll Suave

```css
.scroll-smooth {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
```

## 🎯 Patrones de Layout Responsive

### Grid Responsive

```tsx
// 1 columna móvil, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

### Flex Responsive

```tsx
// Columna en móvil, fila en desktop
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
```

### Mostrar/Ocultar por Breakpoint

```tsx
// Ocultar en móvil
<div className="hidden md:block">Desktop only</div>

// Mostrar solo en móvil
<div className="block md:hidden">Mobile only</div>
```

## 📊 Ejemplos de Uso

### Página de Búsqueda

```tsx
export default function SearchPage() {
  return (
    <Container>
      {/* Filtros: vertical en móvil, horizontal en desktop */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <SearchFilters />
      </div>
      
      {/* Grid de resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </Container>
  );
}
```

### Formulario Responsive

```tsx
<form className="space-y-4 md:space-y-6">
  {/* Grid: 1 columna móvil, 2 desktop */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    <Input label="Nombre" />
    <Input label="Apellido" />
  </div>
  
  {/* Botón: full width móvil, auto desktop */}
  <div className="flex flex-col sm:flex-row gap-3">
    <Button className="w-full sm:w-auto sm:ml-auto">
      Enviar
    </Button>
  </div>
</form>
```

## ✅ Checklist de Responsividad

Al crear nuevos componentes, verifica:

- [ ] Funciona en móvil (320px+)
- [ ] Funciona en tablet (768px+)
- [ ] Funciona en desktop (1024px+)
- [ ] Touch targets mínimos 44x44px
- [ ] Texto legible sin zoom
- [ ] Padding y spacing adecuados
- [ ] Grid/Flex adaptativo
- [ ] Imágenes responsive (`max-w-full h-auto`)
- [ ] Sin overflow horizontal
- [ ] Safe area insets (si aplica)

## 🐛 Problemas Comunes y Soluciones

### 1. Zoom automático en iOS

**Problema:** Inputs causan zoom al enfocarse.

**Solución:** Usar `font-size: 16px` mínimo en inputs.

### 2. Overflow horizontal

**Problema:** Contenido se desborda en móvil.

**Solución:** Usar `max-w-full` y `overflow-x-hidden` cuando sea necesario.

### 3. Touch targets muy pequeños

**Problema:** Botones difíciles de tocar en móvil.

**Solución:** Usar clase `touch-target` o mínimo `min-h-[44px]`.

### 4. Texto muy pequeño

**Problema:** Texto ilegible en móvil.

**Solución:** Usar tamaños responsive definidos en `globals.css`.

## 📚 Recursos

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design - Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)

---

**Última actualización:** Diciembre 2025
