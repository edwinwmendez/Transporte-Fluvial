"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Card } from "@/components/ui/card"

export type SeatStatus = "available" | "occupied" | "selected" | "blocked"

export interface Seat {
  id: string
  number: string
  row: number
  column: number
  status: SeatStatus
}

interface SeatMapProps {
  seats: Seat[]
  rows: number
  columns: number
  onSeatClick?: (seat: Seat) => void
  selectedSeatId?: string | null
  className?: string
}

export function SeatMap({
  seats,
  rows,
  columns,
  onSeatClick,
  selectedSeatId,
  className,
}: SeatMapProps) {
  // Organizar asientos por fila
  const seatsByRow = React.useMemo(() => {
    const organized: Record<number, Seat[]> = {}
    seats.forEach((seat) => {
      if (!organized[seat.row]) {
        organized[seat.row] = []
      }
      organized[seat.row].push(seat)
    })
    // Ordenar asientos por columna dentro de cada fila
    Object.keys(organized).forEach((row) => {
      organized[Number(row)].sort((a, b) => a.column - b.column)
    })
    return organized
  }, [seats])

  const getSeatColor = (status: SeatStatus, isSelected: boolean) => {
    if (isSelected) return "bg-warning border-warning"
    switch (status) {
      case "available":
        return "bg-success hover:bg-success/80 border-success"
      case "occupied":
        return "bg-error border-error cursor-not-allowed opacity-60"
      case "blocked":
        return "bg-muted border-muted cursor-not-allowed opacity-40"
      default:
        return "bg-muted border-muted"
    }
  }

  // Calcular tamaño de asiento responsivo
  const getSeatSize = () => {
    if (typeof window === 'undefined') return 'w-8 h-8 sm:w-10 sm:h-10'
    
    const width = window.innerWidth
    if (width < 640) return 'w-7 h-7 text-xs' // Móvil pequeño
    if (width < 768) return 'w-8 h-8 text-xs' // Móvil grande
    if (width < 1024) return 'w-10 h-10 text-sm' // Tablet
    return 'w-12 h-12 text-sm' // Desktop
  }

  const seatSize = getSeatSize()

  return (
    <Card className={cn("p-4 sm:p-6", className)}>
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Mapa de Asientos</h3>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-success rounded border"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-error rounded border"></div>
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-warning rounded border"></div>
            <span>Seleccionado</span>
          </div>
        </div>
      </div>

      {/* Contenedor scrollable para móviles */}
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] sm:max-h-[70vh] lg:max-h-none hide-scrollbar scroll-smooth-mobile">
        <div className="inline-block min-w-full">
          {/* Indicador de pasillo - Responsive */}
          <div className="mb-2 sm:mb-4 text-center">
            <div className="inline-flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="hidden sm:inline">Pasillo</span>
              <div className="w-8 sm:w-12 h-0.5 bg-border"></div>
              <span className="sm:hidden">|</span>
            </div>
          </div>

          {/* Grid de asientos - Responsive */}
          <div className="space-y-2 sm:space-y-3">
            {Array.from({ length: rows }, (_, rowIndex) => {
              const rowNumber = rowIndex + 1
              const rowSeats = seatsByRow[rowNumber] || []
              
              // Dividir asientos en dos grupos (izquierda y derecha del pasillo)
              const leftSeats = rowSeats.filter(s => s.column <= columns / 2)
              const rightSeats = rowSeats.filter(s => s.column > columns / 2)

              return (
                <div
                  key={rowNumber}
                  className="flex items-center gap-2 sm:gap-4 justify-center"
                >
                  {/* Número de fila - Responsive */}
                  <div className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                    {rowNumber}
                  </div>

                  {/* Asientos izquierda */}
                  <div className="flex gap-1 sm:gap-2">
                    {leftSeats.map((seat) => {
                      const isSelected = selectedSeatId === seat.id
                      return (
                        <button
                          key={seat.id}
                          onClick={() => {
                            if (seat.status === "available" && onSeatClick) {
                              onSeatClick(seat)
                            }
                          }}
                          disabled={seat.status !== "available"}
                          className={cn(
                            seatSize,
                            "rounded border-2 flex items-center justify-center font-medium transition-all",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                            getSeatColor(seat.status, isSelected),
                            seat.status === "available" && "cursor-pointer active:scale-95",
                            seat.status !== "available" && "cursor-not-allowed"
                          )}
                          aria-label={`Asiento ${seat.number} - ${seat.status === "available" ? "Disponible" : "Ocupado"}`}
                        >
                          <span className="text-[10px] sm:text-xs font-semibold">
                            {seat.column}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Pasillo visual - Responsive */}
                  <div className="w-4 sm:w-8 sm:h-10 flex items-center justify-center">
                    <div className="w-full h-0.5 sm:h-full sm:w-0.5 bg-border"></div>
                  </div>

                  {/* Asientos derecha */}
                  <div className="flex gap-1 sm:gap-2">
                    {rightSeats.map((seat) => {
                      const isSelected = selectedSeatId === seat.id
                      return (
                        <button
                          key={seat.id}
                          onClick={() => {
                            if (seat.status === "available" && onSeatClick) {
                              onSeatClick(seat)
                            }
                          }}
                          disabled={seat.status !== "available"}
                          className={cn(
                            seatSize,
                            "rounded border-2 flex items-center justify-center font-medium transition-all",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                            getSeatColor(seat.status, isSelected),
                            seat.status === "available" && "cursor-pointer active:scale-95",
                            seat.status !== "available" && "cursor-not-allowed"
                          )}
                          aria-label={`Asiento ${seat.number} - ${seat.status === "available" ? "Disponible" : "Ocupado"}`}
                        >
                          <span className="text-[10px] sm:text-xs font-semibold">
                            {seat.column}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Número de fila (derecha) - Solo en desktop */}
                  <div className="hidden lg:block w-8 text-center text-sm font-medium text-muted-foreground">
                    {rowNumber}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Información adicional - Responsive */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-muted-foreground">Total:</span>
            <span className="ml-2 font-semibold">{seats.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Disponibles:</span>
            <span className="ml-2 font-semibold text-success">
              {seats.filter(s => s.status === "available").length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Ocupados:</span>
            <span className="ml-2 font-semibold text-error">
              {seats.filter(s => s.status === "occupied").length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Ocupación:</span>
            <span className="ml-2 font-semibold">
              {Math.round((seats.filter(s => s.status === "occupied").length / seats.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
