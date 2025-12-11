# Frontend - Sistema de Transporte Fluvial Atalaya

Sistema de gestión de reservas y ventas para transporte fluvial en Atalaya, Ucayali, Perú.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript (strict mode)
- **Estilos:** Tailwind CSS 4
- **UI Components:** Shadcn/ui + Radix UI
- **Estado del Servidor:** React Query (TanStack Query) v5
- **Base de Datos:** Firebase Firestore
- **Validación:** Zod + React Hook Form
- **Testing:** Vitest + Testing Library
- **Logging:** Pino
- **Notificaciones:** Sonner (Toast)

## 📁 Estructura del Proyecto

```
frontend/
├── app/                          # Next.js App Router
│   ├── (admin)/                 # Rutas administrativas
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── rutas/               # Gestión de rutas
│   │   ├── embarcaciones/       # Gestión de embarcaciones
│   │   ├── horarios/            # Horarios recurrentes
│   │   ├── viajes/              # Gestión de viajes
│   │   ├── ventas/              # Punto de venta (POS)
│   │   ├── validar-pagos/       # Validación de pagos
│   │   └── validar-boletos/     # Validación de boletos
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Estilos globales
│
├── components/
│   ├── ui/                      # Componentes base (Shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── shared/                  # Componentes compartidos
│   │   ├── Sidebar.tsx
│   │   ├── DataTable.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── EmptyState.tsx
│   └── admin/                   # Componentes específicos admin
│       ├── SeatMap.tsx
│       ├── TripCard.tsx
│       ├── QuickSaleModal.tsx
│       ├── TicketPreviewModal.tsx
│       └── ...
│
├── lib/
│   ├── api/                     # APIs modulares por entidad
│   │   ├── bookings.api.ts
│   │   ├── routes.api.ts
│   │   ├── trips.api.ts
│   │   ├── vessels.api.ts
│   │   ├── schedules.api.ts
│   │   ├── payments.api.ts
│   │   ├── seats.api.ts
│   │   └── interfaces/          # Interfaces de repositorios
│   ├── hooks/                   # Custom React hooks
│   │   ├── useBookings.ts
│   │   ├── useTrips.ts
│   │   ├── useRoutes.ts
│   │   ├── useVessels.ts
│   │   ├── useSchedules.ts
│   │   ├── useSeats.ts
│   │   ├── usePayments.ts
│   │   └── ...
│   ├── providers/               # React Context providers
│   │   ├── QueryProvider.tsx    # React Query provider
│   │   └── ToastProvider.tsx    # Toast notifications
│   ├── services/                 # Servicios externos
│   │   ├── firebase.service.ts
│   │   └── storage.service.ts
│   ├── types/                    # TypeScript types
│   │   ├── booking.types.ts
│   │   ├── trip.types.ts
│   │   ├── route.types.ts
│   │   └── ...
│   ├── schemas/                  # Zod schemas
│   │   ├── booking.schema.ts
│   │   ├── trip.schema.ts
│   │   └── ...
│   ├── utils/                    # Utilidades
│   │   ├── date-helpers.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── logger.ts
│   │   └── responsive.ts
│   ├── ticket-generator.ts       # Generación de boletos PDF
│   ├── qr-generator.ts           # Generación de códigos QR
│   └── firebase.ts               # Configuración Firebase
│
├── docs/                         # Documentación técnica
│   ├── ARCHITECTURE.md           # Arquitectura del proyecto
│   ├── COMPONENTS-GUIDE.md       # Guía de componentes
│   └── STATE-MANAGEMENT.md       # Gestión de estado
│
└── __tests__/                    # Tests unitarios
    ├── components/
    ├── hooks/
    └── utils/
```

## 🏗️ Arquitectura

### Principios de Diseño

- **Separación de Responsabilidades:** APIs modulares, hooks especializados, componentes reutilizables
- **Single Responsibility:** Cada módulo tiene una responsabilidad clara
- **DRY (Don't Repeat Yourself):** Lógica compartida en hooks y utilidades
- **Type Safety:** TypeScript estricto en todo el proyecto
- **Mobile-First:** Diseño responsive desde móviles hacia desktop

### Gestión de Estado

**Server State (React Query):**

- Datos del servidor (viajes, reservas, pagos, etc.)
- Cache inteligente con invalidación automática
- Optimistic updates para mejor UX
- Suscripciones en tiempo real para datos críticos

**Client State:**

- Estado de UI (modales abiertos, filtros, etc.)
- Estado local en componentes cuando es apropiado

### APIs Modulares

El proyecto usa una arquitectura modular donde cada entidad tiene su propio archivo de API:

```typescript
// lib/api/bookings.api.ts
export async function getBookingsForTrip(tripId: string): Promise<Booking[]>;
export async function createBooking(data: CreateBookingDto): Promise<Booking>;
export async function updateBooking(id: string, data: UpdateBookingDto): Promise<Booking>;
```

### Hooks Personalizados

Hooks especializados encapsulan la lógica de React Query:

```typescript
// lib/hooks/useBookings.ts
export function useBookingsForTrip(tripId: string);
export function useCreateBooking();
export function useBookingsSubscription(tripId: string);
```

## 🎨 Responsividad

### Breakpoints

- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

### Características Mobile-First

- Touch targets mínimos de 44x44px
- Inputs con fuente de 16px (previene zoom en iOS)
- Modales full-screen en móviles
- Sidebar como overlay en móviles
- Grid responsivo adaptativo

## 📦 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- npm o pnpm

### Instalación

```bash
# Instalar dependencias
npm install

# O con pnpm
pnpm install
```

### Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_dominio
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
# ... más variables
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en http://localhost:3000

# Producción
npm run build        # Build para producción
npm start            # Inicia servidor de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint
npm run lint:fix     # Corrige errores de ESLint automáticamente
npm run format       # Formatea código con Prettier
npm run format:check # Verifica formato sin modificar

# Testing
npm test             # Ejecuta tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con cobertura
```

## 🧪 Testing

El proyecto usa **Vitest** y **Testing Library** para tests unitarios e integración.

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Modo watch (desarrollo)
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Estructura de Tests

```
__tests__/
├── components/      # Tests de componentes
├── hooks/          # Tests de hooks
└── utils/          # Tests de utilidades
```

## 📚 Documentación

Documentación técnica disponible en `docs/`:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Arquitectura completa del proyecto
- **[COMPONENTS-GUIDE.md](./docs/COMPONENTS-GUIDE.md)** - Guía de componentes y patrones
- **[STATE-MANAGEMENT.md](./docs/STATE-MANAGEMENT.md)** - Gestión de estado con React Query

## 🔧 Configuración

### TypeScript

Configuración estricta en `tsconfig.json`:

- Strict mode habilitado
- Path aliases configurados (`@/*`)
- JSX transform automático

### ESLint + Prettier

- ESLint con reglas de Next.js y TypeScript
- Prettier para formato consistente
- Pre-commit hooks con Husky y lint-staged

### Tailwind CSS

- Tailwind CSS 4 con configuración personalizada
- Variables CSS para temas
- Utilidades responsivas personalizadas

## 🚦 Flujo de Desarrollo

### Agregar una Nueva Feature

1. **Crear API** (si es necesario):

   ```typescript
   // lib/api/nueva-entidad.api.ts
   export async function getNuevaEntidad(): Promise<NuevaEntidad[]> {
     // Implementación
   }
   ```

2. **Crear Hook**:

   ```typescript
   // lib/hooks/useNuevaEntidad.ts
   export function useNuevaEntidad() {
     return useQuery({
       queryKey: ['nueva-entidad'],
       queryFn: () => nuevaEntidadAPI.getAll(),
     });
   }
   ```

3. **Crear Componente**:

   ```typescript
   // components/admin/NuevaEntidadList.tsx
   export function NuevaEntidadList() {
     const { data, isLoading } = useNuevaEntidad();
     // Render
   }
   ```

4. **Agregar Tests**:
   ```typescript
   // __tests__/hooks/useNuevaEntidad.test.ts
   describe('useNuevaEntidad', () => {
     // Tests
   });
   ```

## 🎯 Mejores Prácticas

### Código

- ✅ Usar TypeScript estricto (evitar `any`)
- ✅ Componentes pequeños y enfocados (< 200 líneas)
- ✅ Hooks personalizados para lógica reutilizable
- ✅ APIs modulares por entidad
- ✅ Logging estructurado con Pino
- ✅ Manejo de errores consistente

### React

- ✅ Server Components por defecto
- ✅ Client Components solo cuando es necesario (`'use client'`)
- ✅ React Query para server state
- ✅ Memoización cuando sea necesario (`useMemo`, `useCallback`)
- ✅ Error boundaries para manejo de errores

### Estilos

- ✅ Mobile-first approach
- ✅ Tailwind utility classes
- ✅ Componentes UI reutilizables (Shadcn/ui)
- ✅ Variables CSS para temas

## 📊 Estado del Proyecto

### ✅ Completado

- [x] Arquitectura modular con APIs separadas
- [x] React Query implementado
- [x] Hooks especializados para todas las entidades
- [x] Sistema de logging centralizado (Pino)
- [x] Eliminación de console.log/error
- [x] Componentes refactorizados y optimizados
- [x] Testing setup con Vitest
- [x] Documentación técnica completa
- [x] Responsive design mobile-first
- [x] Sistema de notificaciones (Sonner)

### 🚧 En Progreso / Pendiente

- [ ] PWA completo con service workers
- [ ] Modo offline para ventas POS
- [ ] Optimización de imágenes
- [ ] Lazy loading de componentes pesados
- [ ] Tests E2E con Playwright
- [ ] Storybook para documentación de componentes

## 🤝 Contribuir

1. Crear una rama desde `main`
2. Hacer cambios siguiendo las convenciones del proyecto
3. Ejecutar `npm run lint` y `npm test` antes de commitear
4. Crear un Pull Request con descripción clara

## 📝 Convenciones

### Nomenclatura

- **Componentes:** PascalCase (`TripCard.tsx`)
- **Hooks:** camelCase con prefijo `use` (`useBookings.ts`)
- **Utilidades:** kebab-case (`date-helpers.ts`)
- **APIs:** kebab-case con sufijo `.api.ts` (`bookings.api.ts`)
- **Types:** kebab-case con sufijo `.types.ts` (`booking.types.ts`)

### Commits

Los commits deben estar en español y seguir el formato:

```
tipo: descripción breve

Descripción detallada (opcional)
```

Tipos: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`

## 📄 Licencia

Este proyecto es privado y propietario.

---

**Última actualización:** Diciembre 2025  
**Versión:** 0.1.0
