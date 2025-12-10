"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ship, Calendar, Users, MapPin } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface Trip {
  id: string
  route: {
    origin: string
    destination: string
  }
  vessel: {
    name: string
  }
  departureDate: Date | string
  totalSeats: number
  occupiedSeats: number
}

interface TripCardProps {
  trip: Trip
  onSelect?: (tripId: string) => void
  className?: string
}

export function TripCard({ trip, onSelect, className }: TripCardProps) {
  const occupancyPercentage = (trip.occupiedSeats / trip.totalSeats) * 100
  const availableSeats = trip.totalSeats - trip.occupiedSeats

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg mb-1 sm:mb-2 truncate">
              {trip.route.origin} → {trip.route.destination}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                <Ship className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{trip.vessel.name}</span>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {/* Fecha y hora */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{formatDate(trip.departureDate)}</span>
          </div>

          {/* Ruta */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              {trip.route.origin} → {trip.route.destination}
            </span>
          </div>

          {/* Ocupación */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-muted-foreground">Ocupación</span>
              </div>
              <span className="font-semibold">
                {trip.occupiedSeats}/{trip.totalSeats}
              </span>
            </div>
            
            {/* Barra de progreso - Responsive */}
            <div className="w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  occupancyPercentage >= 90
                    ? "bg-error"
                    : occupancyPercentage >= 70
                    ? "bg-warning"
                    : "bg-success"
                )}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {availableSeats} disponibles
              </span>
              <span className="font-medium">
                {Math.round(occupancyPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
        <Button
          onClick={() => onSelect?.(trip.id)}
          className="w-full sm:w-auto touch-target"
          size="mobile"
        >
          Ver Asientos
        </Button>
      </CardFooter>
    </Card>
  )
}
