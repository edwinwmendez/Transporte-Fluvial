# 🗄️ Gestión de Estado - Transporte Fluvial Atalaya

**Stack:** React Query (TanStack Query) + Zustand
**Última actualización:** 27 de Octubre, 2025

---

## Tabla de Contenidos
1. [Estrategia de Estado](#1-estrategia-de-estado)
2. [Server State con React Query](#2-server-state-con-react-query)
3. [Client State con Zustand](#3-client-state-con-zustand)
4. [Stores Específicas](#4-stores-específicas)
5. [Hooks Custom](#5-hooks-custom)
6. [Patterns y Best Practices](#6-patterns-y-best-practices)

---

## 1. Estrategia de Estado

### 1.1 Separación de Responsabilidades

```
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION STATE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────┐      ┌────────────────────┐   │
│  │   SERVER STATE     │      │   CLIENT STATE     │   │
│  │  (React Query)     │      │    (Zustand)       │   │
│  ├────────────────────┤      ├────────────────────┤   │
│  │ - Trips            │      │ - Auth (UI)        │   │
│  │ - Bookings         │      │ - Cart (POS)       │   │
│  │ - Payments         │      │ - Selected Seats   │   │
│  │ - Products         │      │ - Filters          │   │
│  │ - Dashboard KPIs   │      │ - UI State         │   │
│  │ - User data        │      │ - Offline Queue    │   │
│  └────────────────────┘      └────────────────────┘   │
│         ↓                             ↓                │
│    Backend API                 Browser Memory         │
│    (cache inteligente)         (localStorage)         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Cuándo Usar Cada Uno

**React Query (Server State):**
- Datos que vienen del backend
- Datos que necesitan sincronización
- Datos que se cachean
- Ejemplos: viajes, reservas, pagos, usuarios

**Zustand (Client State):**
- Estado de UI efímero
- Estado que no se sincroniza con backend
- Carrito de compras (POS)
- Filtros de búsqueda
- Ejemplos: asientos seleccionados temporalmente, sidebar abierto/cerrado

---

## 2. Server State con React Query

### 2.1 Setup Inicial

```typescript
// app/layout.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            cacheTime: 10 * 60 * 1000, // 10 minutos
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 2.2 API Client

```typescript
// lib/api/client.ts
import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/lib/store/authStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Agregar token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: Manejo de errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar refresh
      try {
        await useAuthStore.getState().refreshToken()
        // Reintentar request original
        return api.request(error.config!)
      } catch {
        // Refresh falló, logout
        useAuthStore.getState().logout()
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

### 2.3 Endpoints Tipados

```typescript
// lib/api/endpoints/trips.ts
import api from '@/lib/api/client'
import { Trip, TripFilters } from '@/types/models'

export const tripsApi = {
  search: async (filters: TripFilters): Promise<Trip[]> => {
    const { data } = await api.get('/trips/search', { params: filters })
    return data
  },

  getById: async (id: string): Promise<Trip> => {
    const { data } = await api.get(`/trips/${id}`)
    return data
  },

  create: async (tripData: CreateTripDTO): Promise<Trip> => {
    const { data } = await api.post('/trips', tripData)
    return data
  },

  update: async (id: string, tripData: UpdateTripDTO): Promise<Trip> => {
    const { data } = await api.put(`/trips/${id}`, tripData)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/trips/${id}`)
  },
}
```

### 2.4 Hooks Custom con React Query

#### useTrips (Búsqueda)

```typescript
// lib/hooks/useTrips.ts
import { useQuery } from '@tanstack/react-query'
import { tripsApi } from '@/lib/api/endpoints/trips'
import { TripFilters } from '@/types/models'

export function useTrips(filters: TripFilters) {
  return useQuery({
    queryKey: ['trips', filters],
    queryFn: () => tripsApi.search(filters),
    enabled: !!filters.origin && !!filters.destination, // Solo ejecutar si hay filtros
    staleTime: 2 * 60 * 1000, // 2 minutos (viajes cambian frecuentemente)
  })
}

// Uso:
const { data: trips, isLoading, error } = useTrips({
  origin: 'Atalaya',
  destination: 'Pucallpa',
  date: '2025-10-28',
})
```

#### useBookings (Mis Reservas)

```typescript
// lib/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '@/lib/api/endpoints/bookings'

export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: () => bookingsApi.getMyBookings(),
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      // Invalidar cache para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] }) // Actualizar disponibilidad
    },
    onError: (error) => {
      console.error('Error creating booking:', error)
      // Mostrar toast de error
    },
  })
}

// Uso:
const { mutate: createBooking, isPending } = useCreateBooking()

const handleSubmit = () => {
  createBooking({
    tripId: 'xxx',
    seatIds: ['seat-1', 'seat-2'],
    passengers: [...],
  })
}
```

#### useOptimisticUpdate

```typescript
// lib/hooks/usePaymentValidation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/lib/api/endpoints/payments'

export function useApprovePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.approve(paymentId),

    // Actualización optimista (UI se actualiza antes de confirmar con servidor)
    onMutate: async (paymentId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['payments', 'pending'] })

      // Snapshot del estado anterior
      const previousPayments = queryClient.getQueryData(['payments', 'pending'])

      // Actualizar cache optimistamente
      queryClient.setQueryData(['payments', 'pending'], (old: any[]) =>
        old.filter(p => p.id !== paymentId)
      )

      return { previousPayments }
    },

    onError: (err, paymentId, context) => {
      // Rollback en caso de error
      queryClient.setQueryData(['payments', 'pending'], context?.previousPayments)
    },

    onSettled: () => {
      // Refrescar datos del servidor (confirmación)
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}
```

### 2.5 Infinite Queries (Paginación)

```typescript
// lib/hooks/useInfiniteBookings.ts
import { useInfiniteQuery } from '@tanstack/react-query'
import { bookingsApi } from '@/lib/api/endpoints/bookings'

export function useInfiniteBookings() {
  return useInfiniteQuery({
    queryKey: ['bookings', 'infinite'],
    queryFn: ({ pageParam = 1 }) => bookingsApi.getAll({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.hasMore) {
        return pages.length + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })
}

// Uso:
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteBookings()

<button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
  {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
</button>
```

---

## 3. Client State con Zustand

### 3.1 Características de Zustand

- **Ligero**: <1KB gzipped
- **Sin boilerplate**: No actions, reducers, providers
- **TypeScript-first**: Tipado excelente
- **DevTools**: Integración con Redux DevTools
- **Middleware**: Persist, immer, devtools

### 3.2 Store Básica

```typescript
// lib/store/authStore.ts
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'CLIENTE' | 'ADMIN' | 'VENDEDOR_BORDO'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  refreshToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        login: (user, token) => {
          set({ user, token, isAuthenticated: true })
        },

        logout: () => {
          set({ user: null, token: null, isAuthenticated: false })
          // Limpiar cache de React Query
        },

        refreshToken: async () => {
          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { Authorization: `Bearer ${get().token}` },
            })
            const { token } = await response.json()
            set({ token })
          } catch (error) {
            get().logout()
          }
        },
      }),
      {
        name: 'auth-storage',
        // Solo persistir user y token (no isAuthenticated)
        partialize: (state) => ({ user: state.user, token: state.token }),
      }
    )
  )
)

// Uso:
const { user, isAuthenticated, login, logout } = useAuthStore()
```

---

## 4. Stores Específicas

### 4.1 bookingStore (Estado Temporal de Reserva)

```typescript
// lib/store/bookingStore.ts
import { create } from 'zustand'
import { Seat, Passenger } from '@/types/models'

interface BookingState {
  tripId: string | null
  selectedSeats: Seat[]
  passengers: Passenger[]
  timeRemaining: number // Segundos

  // Actions
  setTrip: (tripId: string) => void
  selectSeat: (seat: Seat) => void
  deselectSeat: (seatId: string) => void
  clearSelection: () => void
  addPassenger: (passenger: Passenger) => void
  setTimeRemaining: (seconds: number) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  tripId: null,
  selectedSeats: [],
  passengers: [],
  timeRemaining: 600, // 10 minutos

  setTrip: (tripId) => set({ tripId }),

  selectSeat: (seat) =>
    set((state) => ({
      selectedSeats: [...state.selectedSeats, seat],
    })),

  deselectSeat: (seatId) =>
    set((state) => ({
      selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId),
    })),

  clearSelection: () => set({ selectedSeats: [] }),

  addPassenger: (passenger) =>
    set((state) => ({
      passengers: [...state.passengers, passenger],
    })),

  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  reset: () =>
    set({
      tripId: null,
      selectedSeats: [],
      passengers: [],
      timeRemaining: 600,
    }),
}))
```

### 4.2 cartStore (Carrito POS)

```typescript
// lib/store/cartStore.ts
import { create } from 'zustand'
import { Product } from '@/types/models'

interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number

  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  calculateTotal: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id)

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }

      return {
        items: [...state.items, { product, quantity: 1 }],
      }
    })
    get().calculateTotal()
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }))
    get().calculateTotal()
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }))
    get().calculateTotal()
  },

  clearCart: () => set({ items: [], total: 0 }),

  calculateTotal: () => {
    const total = get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    set({ total })
  },
}))
```

### 4.3 offlineStore (Cola de Sincronización)

```typescript
// lib/store/offlineStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { salesApi } from '@/lib/api/endpoints/sales'

interface Sale {
  id: string
  tripId: string
  items: SaleItem[]
  total: number
  paymentMethod: string
  seatNumber?: string
  timestamp: Date
}

interface OfflineState {
  pendingSales: Sale[]
  isSyncing: boolean

  // Actions
  addSale: (sale: Sale) => void
  removeSale: (saleId: string) => void
  syncAll: () => Promise<void>
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      pendingSales: [],
      isSyncing: false,

      addSale: (sale) =>
        set((state) => ({
          pendingSales: [...state.pendingSales, sale],
        })),

      removeSale: (saleId) =>
        set((state) => ({
          pendingSales: state.pendingSales.filter((s) => s.id !== saleId),
        })),

      syncAll: async () => {
        const { pendingSales } = get()
        if (pendingSales.length === 0) return

        set({ isSyncing: true })

        try {
          // Sincronizar en lotes (bulk)
          await salesApi.syncBulk(pendingSales)

          // Limpiar todas las ventas sincronizadas
          set({ pendingSales: [] })
        } catch (error) {
          console.error('Sync failed:', error)
          // Mantener en cola para retry
        } finally {
          set({ isSyncing: false })
        }
      },
    }),
    {
      name: 'offline-sales',
      // Persistir en localStorage
    }
  )
)
```

---

## 5. Hooks Custom

### 5.1 useCountdown (Timer de Bloqueo)

```typescript
// lib/hooks/useCountdown.ts
import { useState, useEffect } from 'react'

export function useCountdown(initialSeconds: number, onExpire?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive || seconds <= 0) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsActive(false)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, seconds, onExpire])

  const reset = () => {
    setSeconds(initialSeconds)
    setIsActive(true)
  }

  return { seconds, isActive, reset }
}

// Uso:
const { seconds, isActive } = useCountdown(600, () => {
  alert('Tiempo expirado. Selección liberada.')
  clearSelection()
})
```

### 5.2 useOfflineSync (Auto-sincronización)

```typescript
// lib/hooks/useOfflineSync.ts
import { useEffect } from 'react'
import { useOfflineStore } from '@/lib/store/offlineStore'
import { useOnlineStatus } from './useOnlineStatus'

export function useOfflineSync() {
  const isOnline = useOnlineStatus()
  const { pendingSales, isSyncing, syncAll } = useOfflineStore()

  // Auto-sync cuando se detecta conexión
  useEffect(() => {
    if (isOnline && pendingSales.length > 0 && !isSyncing) {
      syncAll()
    }
  }, [isOnline, pendingSales.length, isSyncing, syncAll])

  return {
    pendingCount: pendingSales.length,
    isSyncing,
    manualSync: syncAll,
  }
}
```

### 5.3 useOnlineStatus

```typescript
// lib/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

---

## 6. Patterns y Best Practices

### 6.1 Derivar Estado en Lugar de Duplicar

```typescript
// ❌ MAL: Duplicar estado
const [items, setItems] = useState([])
const [total, setTotal] = useState(0)

// Cada vez que items cambia, hay que actualizar total manualmente
setItems(newItems)
setTotal(calculateTotal(newItems))

// ✅ BIEN: Derivar estado
const [items, setItems] = useState([])
const total = useMemo(() => calculateTotal(items), [items])
```

### 6.2 Colocación de Estado

```typescript
// ✅ Estado lo más cercano posible a donde se usa
function SeatMap() {
  const [hoveredSeat, setHoveredSeat] = useState(null) // Solo se usa aquí

  return (
    <div>
      {seats.map(seat => (
        <Seat
          key={seat.id}
          onHover={() => setHoveredSeat(seat)}
        />
      ))}
    </div>
  )
}
```

### 6.3 Composición de Stores

```typescript
// Usar múltiples stores en un componente
function Checkout() {
  const { user } = useAuthStore()
  const { selectedSeats, passengers } = useBookingStore()
  const { mutate: createBooking } = useCreateBooking()

  const handleSubmit = () => {
    createBooking({
      userId: user.id,
      seatIds: selectedSeats.map(s => s.id),
      passengers,
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### 6.4 Selectors (Evitar Re-renders Innecesarios)

```typescript
// ❌ MAL: Re-render cuando cualquier parte del state cambia
const state = useAuthStore()

// ✅ BIEN: Solo re-render cuando user cambia
const user = useAuthStore((state) => state.user)
const logout = useAuthStore((state) => state.logout)
```

---

## Referencias

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [React Hooks](https://react.dev/reference/react)

---

**Siguiente:** [ROUTING-NAVIGATION.md](./ROUTING-NAVIGATION.md) - Guía de rutas y navegación
