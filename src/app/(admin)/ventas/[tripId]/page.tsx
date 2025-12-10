"use client"

import * as React from "react"
import { use } from "react"
import { SeatMap, Seat, SeatStatus } from "@/components/admin/SeatMap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft } from "lucide-react"

// Datos de ejemplo - En producción vendrán de Firestore
function generateMockSeats(rows: number, columns: number): Seat[] {
  const seats: Seat[] = []
  let seatNumber = 1

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      const status: SeatStatus =
        Math.random() > 0.6 ? "occupied" : "available"
      seats.push({
        id: `seat-${row}-${col}`,
        number: `${String.fromCharCode(64 + row)}${col}`,
        row,
        column: col,
        status,
      })
      seatNumber++
    }
  }
  return seats
}

export default function VentasPage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = use(params)
  const [seats, setSeats] = React.useState<Seat[]>([])
  const [selectedSeat, setSelectedSeat] = React.useState<Seat | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    dni: "",
    nombre: "",
    celular: "",
    monto: "",
  })

  // Configuración del barco: 20 filas x 4 columnas (2-2 layout)
  const rows = 20
  const columns = 4

  React.useEffect(() => {
    // Simular carga de asientos desde Firestore
    const mockSeats = generateMockSeats(rows, columns)
    setSeats(mockSeats)
  }, [tripId])

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "available") {
      setSelectedSeat(seat)
      setIsDialogOpen(true)
    }
  }

  const handleSubmit = () => {
    // Aquí se guardaría en Firestore
    console.log("Venta registrada:", { seat: selectedSeat, ...formData })
    
    // Actualizar estado del asiento
    if (selectedSeat) {
      setSeats((prev) =>
        prev.map((s) =>
          s.id === selectedSeat.id ? { ...s, status: "occupied" } : s
        )
      )
    }

    // Limpiar formulario y cerrar diálogo
    setFormData({ dni: "", nombre: "", celular: "", monto: "" })
    setSelectedSeat(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
          className="touch-target"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Venta de Asientos</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Viaje ID: {tripId}
          </p>
        </div>
      </div>

      {/* Grid responsivo: Mapa de asientos y formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Mapa de asientos - Ocupa todo el ancho en móvil, 2/3 en desktop */}
        <div className="lg:col-span-2">
          <SeatMap
            seats={seats}
            rows={rows}
            columns={columns}
            onSeatClick={handleSeatClick}
            selectedSeatId={selectedSeat?.id || null}
          />
        </div>

        {/* Panel lateral - Oculto en móvil, visible en desktop */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total asientos:</span>
                  <span className="ml-2 font-semibold">{seats.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Disponibles:</span>
                  <span className="ml-2 font-semibold text-success">
                    {seats.filter((s) => s.status === "available").length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ocupados:</span>
                  <span className="ml-2 font-semibold text-error">
                    {seats.filter((s) => s.status === "occupied").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para venta rápida - Responsive */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Venta Rápida - Asiento {selectedSeat?.number}
            </DialogTitle>
            <DialogDescription>
              Ingresa los datos del pasajero para confirmar la venta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="dni" className="text-sm font-medium">
                DNI
              </label>
              <Input
                id="dni"
                placeholder="12345678"
                value={formData.dni}
                onChange={(e) =>
                  setFormData({ ...formData, dni: e.target.value })
                }
                maxLength={8}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium">
                Nombre Completo
              </label>
              <Input
                id="nombre"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="celular" className="text-sm font-medium">
                Celular
              </label>
              <Input
                id="celular"
                placeholder="987654321"
                value={formData.celular}
                onChange={(e) =>
                  setFormData({ ...formData, celular: e.target.value })
                }
                inputMode="tel"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="monto" className="text-sm font-medium">
                Monto (S/)
              </label>
              <Input
                id="monto"
                placeholder="50.00"
                value={formData.monto}
                onChange={(e) =>
                  setFormData({ ...formData, monto: e.target.value })
                }
                inputMode="decimal"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto touch-target"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="w-full sm:w-auto touch-target"
              disabled={
                !formData.dni ||
                !formData.nombre ||
                !formData.celular ||
                !formData.monto
              }
            >
              Confirmar Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
