# 🏗️ Arquitectura Frontend - Next.js 14 App Router

**Proyecto:** Sistema de Transporte Fluvial Atalaya
**Stack:** Next.js 14 + TypeScript + Tailwind CSS
**Última actualización:** 27 de Octubre, 2025

---

## Tabla de Contenidos
1. [Visión General](#1-visión-general)
2. [Estructura de Carpetas Completa](#2-estructura-de-carpetas-completa)
3. [App Router Structure](#3-app-router-structure)
4. [Route Groups](#4-route-groups)
5. [Server vs Client Components](#5-server-vs-client-components)
6. [Data Fetching Strategies](#6-data-fetching-strategies)
7. [Layouts y Metadata](#7-layouts-y-metadata)
8. [Convenciones de Código](#8-convenciones-de-código)

---

## 1. Visión General

### 1.1 Principios Arquitectónicos

Esta aplicación Next.js 14 sigue los siguientes principios:

- **App Router First**: Usamos exclusivamente el nuevo App Router (no Pages Router)
- **Server Components por Defecto**: Minimizamos el JavaScript enviado al cliente
- **Type Safety**: TypeScript estricto en toda la aplicación
- **Separation of Concerns**: Separación clara entre UI, lógica de negocio y datos
- **Modularidad**: Componentes reutilizables y bien encapsulados
- **Performance**: Optimización de carga mediante code splitting y lazy loading

### 1.2 Decisiones Técnicas Clave

| Decisión | Justificación |
|----------|---------------|
| **Next.js 14 App Router** | SSR optimizado, mejores web vitals, file-system routing |
| **TypeScript Strict Mode** | Prevención de errores en tiempo de desarrollo |
| **Tailwind CSS** | Desarrollo rápido, bundle optimizado, consistencia visual |
| **Shadcn/ui** | Componentes accesibles, customizables, sin dependencia pesada |
| **React Query (TanStack)** | Manejo profesional de server state, caching inteligente |
| **Zustand** | State management ligero para client state |

---

## 2. Estructura de Carpetas Completa

```
frontend/
├── public/
│   ├── icons/                      # Iconos PWA (16x16 hasta 512x512)
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── favicon.ico
│   ├── images/                     # Imágenes estáticas
│   │   ├── logo.svg
│   │   ├── hero-bg.jpg
│   │   └── placeholder-boat.jpg
│   └── manifest.json               # PWA manifest
│
├── src/
│   ├── app/                        # App Router (Next.js 14)
│   │   │
│   │   ├── (public)/              # Layout público (sin auth)
│   │   │   ├── layout.tsx         # Layout: Navbar + Footer
│   │   │   ├── page.tsx           # Landing page (/)
│   │   │   ├── about/
│   │   │   │   └── page.tsx       # Página "Sobre nosotros"
│   │   │   └── contact/
│   │   │       └── page.tsx       # Página de contacto
│   │   │
│   │   ├── (auth)/                # Layout autenticación
│   │   │   ├── layout.tsx         # Layout centrado, sin navbar
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Página de login
│   │   │   ├── register/
│   │   │   │   └── page.tsx       # Página de registro
│   │   │   └── forgot-password/
│   │   │       └── page.tsx       # Recuperar contraseña
│   │   │
│   │   ├── (cliente)/             # Layout de cliente (protegido)
│   │   │   ├── layout.tsx         # Layout: Navbar cliente + Footer
│   │   │   │
│   │   │   ├── buscar/
│   │   │   │   └── page.tsx       # Búsqueda de viajes
│   │   │   │
│   │   │   ├── viajes/
│   │   │   │   ├── page.tsx       # Lista de viajes (opcional)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Detalle viaje + mapa asientos
│   │   │   │       ├── loading.tsx # Skeleton de carga
│   │   │   │       └── checkout/
│   │   │   │           └── page.tsx # Checkout y pago
│   │   │   │
│   │   │   ├── reservas/
│   │   │   │   ├── page.tsx       # Mis reservas
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Detalle de reserva
│   │   │   │       └── comprobante.pdf.ts # API route para PDF
│   │   │   │
│   │   │   └── perfil/
│   │   │       └── page.tsx       # Perfil de usuario
│   │   │
│   │   ├── (admin)/               # Layout admin (protegido, rol ADMIN)
│   │   │   ├── layout.tsx         # Layout: Sidebar + Topbar
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Dashboard principal
│   │   │   │
│   │   │   ├── rutas/
│   │   │   │   ├── page.tsx       # Lista de rutas
│   │   │   │   ├── nueva/
│   │   │   │   │   └── page.tsx   # Crear ruta
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx # Editar ruta
│   │   │   │
│   │   │   ├── embarcaciones/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nueva/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── viajes/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nuevo/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Detalle viaje admin
│   │   │   │       └── pasajeros/
│   │   │   │           └── page.tsx # Lista pasajeros
│   │   │   │
│   │   │   ├── pagos/
│   │   │   │   └── pendientes/
│   │   │   │       └── page.tsx   # Validación de pagos
│   │   │   │
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nuevo/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── inventario/
│   │   │   │   └── page.tsx       # Control de inventario
│   │   │   │
│   │   │   ├── reportes/
│   │   │   │   └── page.tsx       # Generación de reportes
│   │   │   │
│   │   │   └── usuarios/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Detalle usuario
│   │   │
│   │   ├── (pos)/                 # Layout POS (offline-first)
│   │   │   ├── layout.tsx         # Layout simple, offline indicator
│   │   │   │
│   │   │   ├── seleccionar-viaje/
│   │   │   │   └── page.tsx       # Seleccionar viaje activo
│   │   │   │
│   │   │   ├── vender/
│   │   │   │   └── page.tsx       # Catálogo + carrito (POS)
│   │   │   │
│   │   │   └── historial/
│   │   │       └── page.tsx       # Historial de ventas
│   │   │
│   │   ├── api/                   # API Routes (opcional)
│   │   │   └── webhook/
│   │   │       └── route.ts       # Webhooks externos
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Estilos globales
│   │   ├── error.tsx              # Error boundary global
│   │   ├── not-found.tsx          # Página 404
│   │   └── loading.tsx            # Loading global
│   │
│   ├── components/
│   │   ├── ui/                    # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ... (más componentes)
│   │   │
│   │   ├── shared/                # Componentes compartidos
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx        # Sidebar admin
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── cliente/               # Componentes específicos cliente
│   │   │   ├── SeatMap.tsx        # ⭐ Mapa de asientos 2-2
│   │   │   ├── TripCard.tsx
│   │   │   ├── BookingCard.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   ├── PaymentUpload.tsx
│   │   │   └── PassengerForm.tsx
│   │   │
│   │   ├── admin/                 # Componentes admin
│   │   │   ├── KPICard.tsx
│   │   │   ├── Chart.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── PaymentValidation.tsx
│   │   │   ├── SeatDesigner.tsx   # Diseñador de asientos
│   │   │   └── StatCard.tsx
│   │   │
│   │   └── pos/                   # Componentes POS
│   │       ├── ProductGrid.tsx
│   │       ├── Cart.tsx
│   │       ├── SyncIndicator.tsx
│   │       ├── OfflineBanner.tsx
│   │       └── ProductCard.tsx
│   │
│   ├── lib/
│   │   ├── api/                   # API client
│   │   │   ├── client.ts          # Axios instance con interceptors
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── trips.ts
│   │   │   │   ├── bookings.ts
│   │   │   │   ├── payments.ts
│   │   │   │   ├── products.ts
│   │   │   │   └── sales.ts
│   │   │   └── types.ts           # Types de API responses
│   │   │
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTrips.ts
│   │   │   ├── useBookings.ts
│   │   │   ├── usePayments.ts
│   │   │   ├── useOfflineSync.ts  # ⭐ Hook para sincronización
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── store/                 # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── cartStore.ts       # Carrito POS
│   │   │   ├── bookingStore.ts    # Estado temporal de reserva
│   │   │   └── offlineStore.ts    # Cola de sincronización
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts              # clsx helper
│   │   │   ├── formatters.ts      # Formateo de fechas, moneda
│   │   │   ├── validators.ts      # Validaciones custom
│   │   │   ├── constants.ts       # Constantes de la app
│   │   │   └── helpers.ts         # Funciones auxiliares
│   │   │
│   │   └── validations/           # Zod schemas
│   │       ├── auth.schemas.ts
│   │       ├── booking.schemas.ts
│   │       ├── payment.schemas.ts
│   │       └── product.schemas.ts
│   │
│   ├── types/
│   │   ├── models.ts              # Types de modelos DB
│   │   ├── api.ts                 # Types de API
│   │   ├── components.ts          # Types de props
│   │   └── enums.ts               # Enums compartidos
│   │
│   └── workers/
│       └── service-worker.ts      # Service Worker para offline
│
├── .env.local                     # Variables de entorno (no commitear)
├── .env.example                   # Template de variables
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. App Router Structure

### 3.1 Diferencias Clave con Pages Router

| Aspecto | Pages Router (viejo) | App Router (Next.js 14) |
|---------|---------------------|-------------------------|
| **Ubicación** | `/pages` | `/app` |
| **Componentes** | Client por defecto | Server por defecto |
| **Layouts** | `_app.tsx` global | `layout.tsx` anidados |
| **Data Fetching** | `getServerSideProps` | `async/await` directamente |
| **Metadata** | `Head` component | `metadata` export |
| **Loading UI** | Manual | `loading.tsx` automático |
| **Error Handling** | `_error.tsx` | `error.tsx` granular |

### 3.2 Convenciones de Archivos

```typescript
// page.tsx - Define una ruta accesible
export default function Page() {
  return <div>Contenido</div>
}

// layout.tsx - Layout compartido
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

// loading.tsx - Skeleton de carga automático
export default function Loading() {
  return <div>Cargando...</div>
}

// error.tsx - Error boundary
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div>Error: {error.message}</div>
}

// not-found.tsx - 404 custom
export default function NotFound() {
  return <div>Página no encontrada</div>
}
```

---

## 4. Route Groups

Los **route groups** permiten organizar rutas sin afectar la URL. Se indican con paréntesis: `(nombre-grupo)`

### 4.1 (public) - Rutas Públicas

**URL:** `/`, `/about`, `/contact`
**Acceso:** Sin autenticación
**Layout:** Navbar + Footer públicos

```typescript
// app/(public)/layout.tsx
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
```

### 4.2 (auth) - Autenticación

**URL:** `/login`, `/register`, `/forgot-password`
**Acceso:** Solo usuarios no autenticados (redireccionar si ya logueados)
**Layout:** Centrado, sin navbar

```typescript
// app/(auth)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  // Si ya está logueado, redirigir
  if (session) {
    redirect('/buscar')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
```

### 4.3 (cliente) - Área de Cliente

**URL:** `/buscar`, `/viajes/[id]`, `/reservas`, `/perfil`
**Acceso:** Solo usuarios autenticados con rol CLIENTE
**Layout:** Navbar cliente + Footer

```typescript
// app/(cliente)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { ClientNavbar } from '@/components/shared/ClientNavbar'
import { Footer } from '@/components/shared/Footer'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role !== 'CLIENTE') {
    redirect('/dashboard') // O página de error
  }

  return (
    <>
      <ClientNavbar user={session.user} />
      <main className="min-h-screen container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  )
}
```

### 4.4 (admin) - Panel Administrativo

**URL:** `/dashboard`, `/rutas`, `/embarcaciones`, `/pagos/pendientes`, etc.
**Acceso:** Solo usuarios con rol ADMIN
**Layout:** Sidebar + Topbar

```typescript
// app/(admin)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { Sidebar } from '@/components/shared/Sidebar'
import { Topbar } from '@/components/shared/Topbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role !== 'ADMIN') {
    redirect('/buscar')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 4.5 (pos) - Punto de Venta

**URL:** `/seleccionar-viaje`, `/vender`, `/historial`
**Acceso:** Solo usuarios con rol VENDEDOR_BORDO
**Layout:** Simple, indicador offline

```typescript
// app/(pos)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { SyncIndicator } from '@/components/pos/SyncIndicator'
import { OfflineBanner } from '@/components/pos/OfflineBanner'

export default async function POSLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role !== 'VENDEDOR_BORDO') {
    redirect('/buscar')
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">POS - Ventas a Bordo</h1>
        <SyncIndicator />
      </header>
      <OfflineBanner />
      <main className="p-4">{children}</main>
    </div>
  )
}
```

---

## 5. Server vs Client Components

### 5.1 Cuándo Usar Server Components (Defecto)

Usa **Server Components** cuando:
- No necesitas interactividad (click handlers, state)
- Haces fetch de datos desde el servidor
- Accedes a recursos del backend (DB, APIs internas)
- Reduces el bundle size del cliente

**Ejemplo:**
```typescript
// app/(cliente)/buscar/page.tsx
// Este es un Server Component (no necesita 'use client')

import { api } from '@/lib/api/server' // API server-side

export default async function BuscarPage() {
  // Fetch directo en el servidor
  const rutas = await api.routes.getAll()

  return (
    <div>
      <h1>Buscar Viajes</h1>
      {/* Renderizado en servidor */}
      <RoutesList rutas={rutas} />
    </div>
  )
}
```

### 5.2 Cuándo Usar Client Components

Usa **Client Components** cuando necesitas:
- Estado de React (`useState`, `useReducer`)
- Efectos (`useEffect`)
- Event handlers (onClick, onChange)
- Hooks del navegador (useLocalStorage, useOnlineStatus)
- Librerías que usan browser APIs

**Ejemplo:**
```typescript
// components/cliente/SeatMap.tsx
'use client' // ⚠️ Declaración obligatoria

import { useState } from 'react'

interface SeatMapProps {
  seats: Seat[]
  onSelect: (seatIds: string[]) => void
}

export function SeatMap({ seats, onSelect }: SeatMapProps) {
  const [selected, setSelected] = useState<string[]>([])

  const handleSeatClick = (seatId: string) => {
    // Lógica interactiva - REQUIERE client component
    setSelected(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    )
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {seats.map(seat => (
        <button
          key={seat.id}
          onClick={() => handleSeatClick(seat.id)}
          className={/* ... */}
        >
          {seat.number}
        </button>
      ))}
    </div>
  )
}
```

### 5.3 Composición: Server + Client Components

**Patrón recomendado:** Server Component como padre, Client Component como hijo

```typescript
// app/(cliente)/viajes/[id]/page.tsx
// Server Component

import { api } from '@/lib/api/server'
import { SeatMap } from '@/components/cliente/SeatMap' // Client Component

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  // Fetch en servidor
  const trip = await api.trips.getById(params.id)
  const seats = await api.seats.getByTripId(params.id)

  return (
    <div>
      <h1>{trip.route.origin} → {trip.route.destination}</h1>

      {/* Client Component recibe datos del servidor */}
      <SeatMap
        seats={seats}
        onSelect={(selectedIds) => {
          // Esta lógica irá en el client component
        }}
      />
    </div>
  )
}
```

---

## 6. Data Fetching Strategies

### 6.1 Fetch Directo en Server Components

```typescript
// app/(admin)/dashboard/page.tsx

export default async function DashboardPage() {
  // Fetch directo, sin useEffect
  const kpis = await fetch('http://localhost:4000/api/dashboard/kpis', {
    cache: 'no-store' // Siempre datos frescos
  }).then(res => res.json())

  return (
    <div>
      <KPICard title="Ingresos" value={kpis.revenue} />
      <KPICard title="Reservas" value={kpis.bookings} />
    </div>
  )
}
```

### 6.2 React Query en Client Components

```typescript
// components/cliente/BookingsList.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

export function BookingsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.bookings.getMyBookings(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  if (isLoading) return <Loading />
  if (error) return <Error />

  return (
    <div>
      {data.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  )
}
```

### 6.3 Revalidación de Datos

```typescript
// Revalidar cada 60 segundos
export const revalidate = 60

// O sin cache (datos en tiempo real)
export const revalidate = 0

// O revalidar on-demand
import { revalidatePath } from 'next/cache'

async function someAction() {
  // ... mutación
  revalidatePath('/dashboard')
}
```

---

## 7. Layouts y Metadata

### 7.1 Root Layout

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Transporte Fluvial Atalaya',
    template: '%s | Transporte Fluvial Atalaya'
  },
  description: 'Sistema de reservas de transporte fluvial en Atalaya, Perú',
  keywords: ['transporte fluvial', 'atalaya', 'pucallpa', 'reservas'],
  manifest: '/manifest.json',
  themeColor: '#0066CC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### 7.2 Metadata Dinámica

```typescript
// app/(cliente)/viajes/[id]/page.tsx

import { Metadata } from 'next'
import { api } from '@/lib/api/server'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const trip = await api.trips.getById(params.id)

  return {
    title: `${trip.route.origin} → ${trip.route.destination}`,
    description: `Viaje el ${trip.departureDate} - S/ ${trip.price}`,
    openGraph: {
      title: `${trip.route.origin} → ${trip.route.destination}`,
      images: ['/images/boat-og.jpg'],
    },
  }
}

export default async function TripPage({ params }: { params: { id: string } }) {
  // ...
}
```

---

## 8. Convenciones de Código

### 8.1 Naming Conventions

```typescript
// ✅ Componentes: PascalCase
SeatMap.tsx
TripCard.tsx
PaymentValidation.tsx

// ✅ Funciones/hooks: camelCase
useAuth.ts
useOfflineSync.ts
formatCurrency()

// ✅ Constantes: UPPER_SNAKE_CASE
const MAX_SEATS = 5
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ✅ Types/Interfaces: PascalCase
interface TripCardProps { }
type BookingStatus = 'PENDING' | 'CONFIRMED'

// ✅ Archivos de configuración: kebab-case
tailwind.config.ts
next.config.js
```

### 8.2 Estructura de Componentes

```typescript
// Orden recomendado en un archivo de componente

// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

// 2. Types/Interfaces
interface SeatMapProps {
  seats: Seat[]
  onSelect: (ids: string[]) => void
}

// 3. Constantes locales
const MAX_SELECTION = 5

// 4. Componente principal
export function SeatMap({ seats, onSelect }: SeatMapProps) {
  // 4.1 State
  const [selected, setSelected] = useState<string[]>([])

  // 4.2 Hooks
  useEffect(() => {
    // ...
  }, [selected])

  // 4.3 Handlers
  const handleSeatClick = (seatId: string) => {
    // ...
  }

  // 4.4 Render helpers (opcional)
  const renderSeat = (seat: Seat) => {
    // ...
  }

  // 4.5 Return
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

// 5. Subcomponentes (si son pequeños y exclusivos)
function SeatButton({ seat }: { seat: Seat }) {
  // ...
}
```

### 8.3 Exports

```typescript
// ✅ Named exports (preferidos)
export function SeatMap() { }

// ✅ Default export para páginas
export default function Page() { }

// ❌ Evitar default exports en componentes
export default SeatMap // NO
```

---

## Referencias

- [Next.js 14 Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/getting-started/react-essentials)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

**Siguiente:** [COMPONENTS-GUIDE.md](./COMPONENTS-GUIDE.md) - Guía de componentes reutilizables
