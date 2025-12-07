# 🧩 Guía de Componentes - Transporte Fluvial Atalaya

**Stack:** React 19 + TypeScript + Tailwind CSS 4 + Shadcn/ui
**Última actualización:** 27 de Octubre, 2025

---

## Tabla de Contenidos
1. [Estructura de Componentes](#1-estructura-de-componentes)
2. [Shadcn/ui Base Components](#2-shadcnui-base-components)
3. [Shared Components](#3-shared-components)
4. [Cliente Components](#4-cliente-components)
5. [Admin Components](#5-admin-components)
6. [POS Components](#6-pos-components)
7. [Patterns y Best Practices](#7-patterns-y-best-practices)
8. [Testing Components](#8-testing-components)

---

## 1. Estructura de Componentes

### 1.1 Organización por Carpetas

```
src/components/
├── ui/              # Primitivos de Shadcn/ui (no modificar directamente)
├── shared/          # Componentes compartidos entre módulos
├── cliente/         # Específicos del módulo cliente
├── admin/           # Específicos del módulo admin
└── pos/             # Específicos del módulo POS
```

### 1.2 Principios de Diseño

1. **Single Responsibility**: Un componente hace una cosa bien
2. **Composición sobre Configuración**: Componentes pequeños que se combinan
3. **Props Explícitas**: TypeScript para todas las props
4. **Accesibilidad**: Uso de atributos ARIA cuando corresponda
5. **Performance**: Memoización cuando sea necesario

---

## 2. Shadcn/ui Base Components

### 2.1 Instalación y Setup

```bash
# Instalar Shadcn/ui
npx shadcn-ui@latest init

# Agregar componentes individuales
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
```

### 2.2 Componentes Esenciales

#### Button

```typescript
import { Button } from '@/components/ui/button'

// Variantes disponibles
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Tamaños
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// Con icono
import { Loader2 } from 'lucide-react'

<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Cargando...
</Button>
```

#### Input

```typescript
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="tu@email.com"
    required
  />
</div>

// Con error
<Input
  type="text"
  className={cn(errors.email && "border-red-500")}
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
)}
```

#### Card

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Atalaya → Pucallpa</CardTitle>
    <CardDescription>Lunes 28/10 - 6:00 AM</CardDescription>
  </CardHeader>
  <CardContent>
    <p>32 asientos disponibles</p>
  </CardContent>
  <CardFooter>
    <Button>Ver Asientos</Button>
  </CardFooter>
</Card>
```

#### Dialog (Modal)

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmar Reserva</DialogTitle>
      <DialogDescription>
        ¿Estás seguro de reservar estos asientos?
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Contenido */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Select

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Selecciona ciudad" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="atalaya">Atalaya</SelectItem>
    <SelectItem value="pucallpa">Pucallpa</SelectItem>
    <SelectItem value="sepahua">Sepahua</SelectItem>
  </SelectContent>
</Select>
```

---

## 3. Shared Components

### 3.1 Navbar

```typescript
// components/shared/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface NavbarProps {
  user?: {
    name: string
    role: string
  }
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/about', label: 'Nosotros' },
    { href: '/buscar', label: 'Buscar Viajes' },
  ]

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Transporte Fluvial
            </Link>

            <div className="hidden md:flex space-x-4">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-600",
                    pathname === link.href
                      ? "text-blue-600"
                      : "text-gray-600"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  Hola, {user.name}
                </span>
                <Button variant="outline" size="sm">
                  Mi Perfil
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### 3.2 Loading

```typescript
// components/shared/Loading.tsx
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  text?: string
  fullScreen?: boolean
}

export function Loading({ text = 'Cargando...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return <div className="py-12">{content}</div>
}
```

### 3.3 EmptyState

```typescript
// components/shared/EmptyState.tsx
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}

// Uso:
import { Ship } from 'lucide-react'

<EmptyState
  icon={Ship}
  title="No hay viajes disponibles"
  description="No encontramos viajes para esta ruta y fecha. Intenta con otra búsqueda."
  actionLabel="Nueva Búsqueda"
  onAction={() => router.push('/buscar')}
/>
```

---

## 4. Cliente Components

### 4.1 SeatMap (⭐ Componente Crítico)

```typescript
// components/cliente/SeatMap.tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type SeatStatus = 'AVAILABLE' | 'OCCUPIED' | 'SELECTED' | 'BLOCKED'

interface Seat {
  id: string
  number: string
  row: number
  column: number
  position: 'LEFT_A' | 'LEFT_B' | 'RIGHT_A' | 'RIGHT_B'
  status: SeatStatus
}

interface SeatMapProps {
  seats: Seat[]
  maxSelection?: number
  onSelectionChange: (selectedIds: string[]) => void
  timeRemaining?: number // Segundos restantes de bloqueo
}

export function SeatMap({
  seats,
  maxSelection = 5,
  onSelectionChange,
  timeRemaining,
}: SeatMapProps) {
  const [selected, setSelected] = useState<string[]>([])

  // Agrupar asientos por fila
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = []
    acc[seat.row].push(seat)
    return acc
  }, {} as Record<number, Seat[]>)

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'OCCUPIED' || seat.status === 'BLOCKED') return

    setSelected(prev => {
      if (prev.includes(seat.id)) {
        // Deseleccionar
        return prev.filter(id => id !== seat.id)
      } else {
        // Seleccionar (si no excede límite)
        if (prev.length >= maxSelection) {
          return prev // No agregar más
        }
        return [...prev, seat.id]
      }
    })
  }

  // Notificar cambios al padre
  useEffect(() => {
    onSelectionChange(selected)
  }, [selected, onSelectionChange])

  // Formatear tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header con información */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Selecciona tus asientos</h3>
          <p className="text-sm text-gray-600">
            Has seleccionado {selected.length} de {maxSelection} asientos
          </p>
        </div>

        {timeRemaining !== undefined && timeRemaining > 0 && (
          <Badge variant="secondary" className="text-base px-4 py-2">
            ⏱️ {formatTime(timeRemaining)}
          </Badge>
        )}
      </div>

      {/* Leyenda */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-500 rounded"></div>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-500 rounded"></div>
          <span>Tu selección</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-400 rounded"></div>
          <span>Bloqueado</span>
        </div>
      </div>

      {/* Mapa de asientos */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="text-center mb-4 text-sm font-medium text-gray-500">
          ⬆️ FRENTE DE LA EMBARCACIÓN
        </div>

        <div className="space-y-3">
          {Object.keys(seatsByRow)
            .sort((a, b) => Number(a) - Number(b))
            .map(rowNum => {
              const rowSeats = seatsByRow[Number(rowNum)]

              // Ordenar: LEFT_A, LEFT_B, (pasillo), RIGHT_A, RIGHT_B
              const leftA = rowSeats.find(s => s.position === 'LEFT_A')
              const leftB = rowSeats.find(s => s.position === 'LEFT_B')
              const rightA = rowSeats.find(s => s.position === 'RIGHT_A')
              const rightB = rowSeats.find(s => s.position === 'RIGHT_B')

              return (
                <div key={rowNum} className="flex items-center justify-center space-x-2">
                  {/* Número de fila */}
                  <div className="w-8 text-center text-sm text-gray-500 font-medium">
                    {rowNum}
                  </div>

                  {/* LEFT_A */}
                  {leftA && <SeatButton seat={leftA} onClick={handleSeatClick} isSelected={selected.includes(leftA.id)} />}

                  {/* LEFT_B */}
                  {leftB && <SeatButton seat={leftB} onClick={handleSeatClick} isSelected={selected.includes(leftB.id)} />}

                  {/* Pasillo */}
                  <div className="w-8"></div>

                  {/* RIGHT_A */}
                  {rightA && <SeatButton seat={rightA} onClick={handleSeatClick} isSelected={selected.includes(rightA.id)} />}

                  {/* RIGHT_B */}
                  {rightB && <SeatButton seat={rightB} onClick={handleSeatClick} isSelected={selected.includes(rightB.id)} />}
                </div>
              )
            })}
        </div>
      </div>

      {/* Asientos seleccionados */}
      {selected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Asientos seleccionados:
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map(seatId => {
              const seat = seats.find(s => s.id === seatId)
              return (
                <Badge key={seatId} variant="default">
                  {seat?.number}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente auxiliar: Botón de asiento individual
function SeatButton({
  seat,
  onClick,
  isSelected,
}: {
  seat: Seat
  onClick: (seat: Seat) => void
  isSelected: boolean
}) {
  const getVariant = () => {
    if (isSelected) return 'bg-yellow-500 hover:bg-yellow-600'
    if (seat.status === 'OCCUPIED') return 'bg-red-500 cursor-not-allowed'
    if (seat.status === 'BLOCKED') return 'bg-gray-400 cursor-not-allowed'
    return 'bg-green-500 hover:bg-green-600'
  }

  const isDisabled = seat.status === 'OCCUPIED' || seat.status === 'BLOCKED'

  return (
    <button
      onClick={() => !isDisabled && onClick(seat)}
      disabled={isDisabled}
      className={cn(
        "w-12 h-12 rounded font-medium text-white transition-colors",
        getVariant()
      )}
      title={
        seat.status === 'OCCUPIED'
          ? 'Asiento ocupado'
          : seat.status === 'BLOCKED'
          ? 'Asiento bloqueado'
          : `Asiento ${seat.number}`
      }
    >
      {seat.number}
    </button>
  )
}
```

### 4.2 TripCard

```typescript
// components/cliente/TripCard.tsx
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Ship, Users } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Trip {
  id: string
  route: {
    origin: string
    destination: string
  }
  vessel: {
    name: string
  }
  departureDate: Date
  arrivalDate: Date
  price: number
  availableSeats: number
  totalSeats: number
}

interface TripCardProps {
  trip: Trip
  onSelect: (tripId: string) => void
}

export function TripCard({ trip, onSelect }: TripCardProps) {
  const occupancyPercentage = ((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Ruta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span className="font-semibold text-lg">
                {trip.route.origin} → {trip.route.destination}
              </span>
            </div>
            {occupancyPercentage > 80 && (
              <Badge variant="destructive">Pocos asientos</Badge>
            )}
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Salida</p>
                <p className="font-medium">
                  {format(new Date(trip.departureDate), "EEE dd/MM - HH:mm", { locale: es })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Llegada estimada</p>
                <p className="font-medium">
                  {format(new Date(trip.arrivalDate), "EEE dd/MM - HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          </div>

          {/* Embarcación y asientos */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2 text-sm">
              <Ship className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{trip.vessel.name}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {trip.availableSeats} asientos disponibles
              </span>
            </div>
          </div>

          {/* Precio */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-3xl font-bold text-blue-600">
                S/ {trip.price.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">por persona</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onSelect(trip.id)}
          disabled={trip.availableSeats === 0}
        >
          {trip.availableSeats === 0 ? 'Agotado' : 'Ver Asientos'}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### 4.3 PaymentUpload

```typescript
// components/cliente/PaymentUpload.tsx
'use client'

import { useState } from 'react'
import { Upload, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PaymentUploadProps {
  onUpload: (file: File, operationNumber?: string) => Promise<void>
  accountInfo: {
    yape: string
    plin: string
    titular: string
  }
  amount: number
}

export function PaymentUpload({ onUpload, accountInfo, amount }: PaymentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [operationNumber, setOperationNumber] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Solo se aceptan imágenes JPG, PNG o PDF')
      return
    }

    // Validar tamaño (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar 5MB')
      return
    }

    setFile(selectedFile)
    setError(null)

    // Preview (solo para imágenes)
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      await onUpload(file, operationNumber || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instrucciones de pago */}
      <Alert>
        <AlertDescription>
          <h4 className="font-semibold mb-3">Instrucciones de pago:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Realiza una transferencia a uno de estos números:</li>
            <ul className="ml-6 mt-2 space-y-1">
              <li><strong>YAPE:</strong> {accountInfo.yape}</li>
              <li><strong>PLIN:</strong> {accountInfo.plin}</li>
              <li><strong>Titular:</strong> {accountInfo.titular}</li>
            </ul>
            <li className="mt-2">
              Monto exacto: <strong className="text-blue-600">S/ {amount.toFixed(2)}</strong>
            </li>
            <li>Sube la captura de pantalla del comprobante</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Carga de archivo */}
      <div className="space-y-2">
        <Label htmlFor="comprobante">Comprobante de Pago *</Label>

        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              id="comprobante"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="comprobante" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Haz click o arrastra tu comprobante aquí
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG o PDF (máx. 5MB)
              </p>
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded border"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Número de operación (opcional) */}
      <div className="space-y-2">
        <Label htmlFor="operacion">Número de Operación (opcional)</Label>
        <Input
          id="operacion"
          placeholder="Ej: 20251027123456"
          value={operationNumber}
          onChange={(e) => setOperationNumber(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Botón de confirmación */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!file || isUploading}
      >
        {isUploading ? 'Subiendo...' : 'Confirmar Pago'}
      </Button>
    </div>
  )
}
```

---

## 5. Admin Components

### 5.1 KPICard

```typescript
// components/admin/KPICard.tsx
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: {
    value: number
    label: string
  }
  trend?: 'up' | 'down' | 'neutral'
}

export function KPICard({ title, value, icon: Icon, change, trend = 'neutral' }: KPICardProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>

            {change && (
              <div className="flex items-center mt-2">
                <span className={cn("text-sm font-medium px-2 py-1 rounded", trendColors[trend])}>
                  {trendIcons[trend]} {change.value}%
                </span>
                <span className="text-xs text-gray-500 ml-2">{change.label}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Uso:
import { DollarSign, Users, Calendar } from 'lucide-react'

<KPICard
  title="Ingresos del Mes"
  value="S/ 45,200"
  icon={DollarSign}
  change={{ value: 12.5, label: 'vs mes anterior' }}
  trend="up"
/>
```

### 5.2 DataTable

```typescript
// components/admin/DataTable.tsx
'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  itemsPerPage?: number
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Filtrar
  const filteredData = searchable
    ? data.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(search.toLowerCase())
        )
      )
    : data

  // Ordenar
  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aVal = (a as any)[sortKey]
        const bVal = (b as any)[sortKey]

        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    : filteredData

  // Paginar
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead
                  key={String(column.key)}
                  className={column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  {column.label}
                  {column.sortable && sortKey === column.key && (
                    <span className="ml-2">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  No hay datos para mostrar
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map(row => (
                <TableRow key={row.id}>
                  {columns.map(column => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row)
                        : String((row as any)[column.key] ?? '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedData.length)} de {sortedData.length}
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 6. POS Components

### 6.1 ProductGrid

```typescript
// components/pos/ProductGrid.tsx
'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { ProductCard } from './ProductCard'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  imageUrl?: string
}

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Categorías únicas
  const categories = Array.from(new Set(products.map(p => p.category)))

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 text-lg h-12"
        />
      </div>

      {/* Filtros de categoría */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </Badge>
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={() => onAddToCart(product)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron productos
        </div>
      )}
    </div>
  )
}
```

### 6.2 SyncIndicator

```typescript
// components/pos/SyncIndicator.tsx
'use client'

import { useOfflineStore } from '@/lib/store/offlineStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'

export function SyncIndicator() {
  const isOnline = useOnlineStatus()
  const { pendingSales, isSyncing, manualSync } = useOfflineStore()

  if (!isOnline) {
    return (
      <Badge variant="destructive" className="px-3 py-1">
        <WifiOff className="h-4 w-4 mr-2" />
        Sin conexión
      </Badge>
    )
  }

  if (isSyncing) {
    return (
      <Badge variant="secondary" className="px-3 py-1">
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        Sincronizando...
      </Badge>
    )
  }

  if (pendingSales.length > 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={manualSync}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Sincronizar ({pendingSales.length})
      </Button>
    )
  }

  return (
    <Badge variant="default" className="px-3 py-1 bg-green-500">
      <Check className="h-4 w-4 mr-2" />
      Sincronizado
    </Badge>
  )
}
```

---

## 7. Patterns y Best Practices

### 7.1 Composición de Componentes

```typescript
// ✅ BIEN: Componentes pequeños y componibles
function UserProfile() {
  return (
    <Card>
      <CardHeader>
        <UserAvatar />
        <UserName />
      </CardHeader>
      <CardContent>
        <UserStats />
      </CardContent>
    </Card>
  )
}

// ❌ MAL: Todo en un componente monolítico
function UserProfile() {
  return (
    <div className="...">
      <div className="...">
        <img src="..." />
        <h2>...</h2>
        <p>...</p>
        <div>
          <span>...</span>
          <span>...</span>
        </div>
      </div>
    </div>
  )
}
```

### 7.2 Props con TypeScript

```typescript
// ✅ BIEN: Props tipadas explícitamente
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  // ...
}

// ❌ MAL: Props sin tipar
export function Button(props: any) {
  // ...
}
```

### 7.3 Memoización

```typescript
import { memo, useMemo, useCallback } from 'react'

// Memoizar componente completo si props no cambian frecuentemente
export const TripCard = memo(function TripCard({ trip }: { trip: Trip }) {
  // ...
})

// useMemo para cálculos costosos
function TripsList({ trips }: { trips: Trip[] }) {
  const sortedTrips = useMemo(() => {
    return trips.sort((a, b) => a.price - b.price)
  }, [trips])

  // ...
}

// useCallback para funciones pasadas como props
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  return <Child onClick={handleClick} />
}
```

### 7.4 Error Boundaries

```typescript
// components/shared/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Algo salió mal</div>
    }

    return this.props.children
  }
}

// Uso:
<ErrorBoundary fallback={<ErrorFallback />}>
  <SeatMap />
</ErrorBoundary>
```

---

## 8. Testing Components

### 8.1 Setup de Testing

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 8.2 Test Básico

```typescript
// components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await userEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### 8.3 Test de Componente Complejo (SeatMap)

```typescript
// components/cliente/SeatMap.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SeatMap } from './SeatMap'

const mockSeats = [
  { id: '1', number: 'A1', row: 1, column: 1, position: 'LEFT_A', status: 'AVAILABLE' },
  { id: '2', number: 'A2', row: 1, column: 2, position: 'LEFT_B', status: 'AVAILABLE' },
  { id: '3', number: 'B1', row: 1, column: 3, position: 'RIGHT_A', status: 'OCCUPIED' },
]

describe('SeatMap', () => {
  it('renders all seats', () => {
    render(<SeatMap seats={mockSeats} onSelectionChange={vi.fn()} />)

    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('A2')).toBeInTheDocument()
    expect(screen.getByText('B1')).toBeInTheDocument()
  })

  it('selects seat on click', () => {
    const handleSelection = vi.fn()
    render(<SeatMap seats={mockSeats} onSelectionChange={handleSelection} />)

    fireEvent.click(screen.getByText('A1'))
    expect(handleSelection).toHaveBeenCalledWith(['1'])
  })

  it('does not select occupied seat', () => {
    const handleSelection = vi.fn()
    render(<SeatMap seats={mockSeats} onSelectionChange={handleSelection} />)

    fireEvent.click(screen.getByText('B1'))
    expect(handleSelection).not.toHaveBeenCalled()
  })

  it('respects max selection', () => {
    const handleSelection = vi.fn()
    render(<SeatMap seats={mockSeats} maxSelection={1} onSelectionChange={handleSelection} />)

    fireEvent.click(screen.getByText('A1'))
    fireEvent.click(screen.getByText('A2'))

    // Solo A1 debe estar seleccionado
    expect(handleSelection).toHaveBeenLastCalledWith(['1'])
  })
})
```

---

## Referencias

- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Testing Library](https://testing-library.com/react)

---

**Siguiente:** [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Gestión de estado con React Query y Zustand
