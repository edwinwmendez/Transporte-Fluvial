# Frontend - Sistema de Transporte Fluvial Atalaya

## 🎯 Características de Responsividad

Este proyecto está completamente optimizado para dispositivos móviles, tablets y desktop, siguiendo un enfoque **mobile-first**.

### Breakpoints Implementados

Según el PRD del proyecto:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Características Principales

#### 1. **Mobile-First Design**
- Todos los componentes están diseñados primero para móviles
- Se escalan progresivamente hacia tablets y desktop
- Touch targets mínimos de 44x44px (accesibilidad)

#### 2. **Componentes Responsivos**

##### Navbar
- Menú hamburguesa en móviles/tablets
- Menú completo en desktop
- Sticky header con soporte para safe areas (notches)

##### Sidebar
- Overlay en móviles/tablets con animación slide-in
- Sidebar fija en desktop
- Cierre automático al hacer clic fuera en móviles

##### SeatMap (Mapa de Asientos)
- Tamaño de asientos adaptativo según tamaño de pantalla
- Scroll horizontal y vertical en móviles
- Grid responsivo que se adapta al espacio disponible
- Información de ocupación visible en todos los tamaños

##### TripCard
- Grid responsivo: 1 columna en móvil, 2 en tablet, 3 en desktop
- Texto y espaciado adaptativos
- Botones con tamaño touch-friendly

##### Formularios
- Inputs con tamaño de fuente 16px en móviles (previene zoom en iOS)
- Modales full-screen en móviles, modales centrados en desktop
- Botones con tamaño mínimo de 44x44px

#### 3. **Optimizaciones para Móviles**

- **Safe Areas**: Soporte para notches y áreas seguras en iOS
- **Touch Targets**: Todos los elementos interactivos tienen mínimo 44x44px
- **Font Size**: 16px mínimo en inputs para prevenir zoom automático en iOS
- **Scroll Smooth**: Scroll suave con `-webkit-overflow-scrolling: touch`
- **Viewport**: Configurado correctamente para evitar problemas de zoom

#### 4. **Utilidades Responsivas**

El archivo `src/lib/utils/responsive.ts` proporciona:

- `useBreakpoint()`: Hook para detectar el breakpoint actual
- `isMobile()`, `isTablet()`, `isDesktop()`: Funciones de detección
- `responsiveSpacing`: Clases predefinidas para espaciado
- `responsiveGrid`: Clases predefinidas para grids

### Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Layout administrativo
│   │   │   ├── layout.tsx    # Layout con Navbar y Sidebar
│   │   │   ├── dashboard/    # Página principal
│   │   │   └── ventas/      # Página de ventas con SeatMap
│   │   ├── globals.css      # Estilos globales con utilidades responsivas
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── ui/              # Componentes base (Button, Card, Input, Dialog)
│   │   ├── shared/          # Navbar, Sidebar
│   │   └── admin/           # SeatMap, TripCard
│   └── lib/
│       └── utils/
│           ├── cn.ts        # Utilidad para clases condicionales
│           └── responsive.ts # Utilidades responsivas
```

### Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start
```

### Testing de Responsividad

Para probar la responsividad:

1. **Chrome DevTools**: Usa el modo responsive y prueba diferentes dispositivos
2. **Breakpoints a probar**:
   - 320px (iPhone SE)
   - 375px (iPhone 12/13)
   - 768px (iPad)
   - 1024px (Desktop pequeño)
   - 1280px+ (Desktop grande)

3. **Funcionalidades a verificar**:
   - ✅ Navbar se adapta correctamente
   - ✅ Sidebar funciona en móvil y desktop
   - ✅ SeatMap es usable en móviles pequeños
   - ✅ Formularios no causan zoom en iOS
   - ✅ Touch targets son suficientemente grandes
   - ✅ Texto es legible en todos los tamaños

### Mejoras Futuras

- [ ] PWA completo con service workers
- [ ] Modo offline para ventas
- [ ] Optimización de imágenes responsivas
- [ ] Lazy loading de componentes pesados
- [ ] Testing automatizado de responsividad
