"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Ship, ArrowRight } from "lucide-react";
import type { Trip } from "@/lib/firestore-helpers";
import { useEffect, useState } from "react";
import { getVessel, getSeatsForTrip, getBookingsForTrip } from "@/lib/firestore-helpers";
import type { Vessel, Seat, Booking } from "@/lib/firestore-helpers";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const router = useRouter();
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTripData() {
      try {
        const [vesselData, seatsData, bookingsData] = await Promise.all([
          getVessel(trip.embarcacionId),
          getSeatsForTrip(trip.id),
          getBookingsForTrip(trip.id),
        ]);
        setVessel(vesselData);
        setSeats(seatsData);
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error al cargar datos del viaje:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTripData();
  }, [trip]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  };

  // Contar asientos únicos ocupados (no reservas, porque un asiento puede tener múltiples reservas en diferentes tramos)
  const confirmedBookings = bookings.filter((b) => b.estado === "confirmado");
  const uniqueOccupiedSeats = new Set(confirmedBookings.map((b) => b.asientoId)).size;
  const totalSeats = seats.length || vessel?.capacidad || 0;
  const availableSeats = totalSeats - uniqueOccupiedSeats;
  const occupancyPercentage = totalSeats > 0 ? (uniqueOccupiedSeats / totalSeats) * 100 : 0;

  // Determinar estado de ocupación (colores sutiles)
  const isHighOccupancy = occupancyPercentage > 80;
  const isMediumOccupancy = occupancyPercentage > 50 && occupancyPercentage <= 80;

  const statusColor = isHighOccupancy
    ? "text-error"
    : isMediumOccupancy
    ? "text-warning"
    : "text-success";

  const statusBg = isHighOccupancy
    ? "bg-error"
    : isMediumOccupancy
    ? "bg-warning"
    : "bg-success";

  return (
    <Card className="relative h-full flex flex-col overflow-hidden border-border bg-background transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Calendar className="w-4 h-4" />
              {formatDate(trip.fechaSalida)}
            </div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              {trip.horaSalida}
            </CardTitle>
          </div>

          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border",
              trip.estado === "programado"
                ? "text-success border-success/30 bg-success/10"
                : "text-muted-foreground border-border bg-muted"
            )}
          >
            {trip.estado}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Información de embarcación */}
        {vessel && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
            <div className="p-2 bg-background rounded-md border border-border">
              <Ship className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase">
                Embarcación
              </span>
              <span className="font-semibold text-foreground">{vessel.nombre}</span>
            </div>
          </div>
        )}

        {/* Estadísticas de ocupación */}
        <div className="space-y-3 mt-auto">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Disponibilidad
              </span>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-bold", statusColor)}>
                  {availableSeats}
                </span>
                <span className="text-sm text-muted-foreground">/ {totalSeats}</span>
              </div>
            </div>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-1 rounded-md",
                isHighOccupancy && "bg-error/10 text-error",
                isMediumOccupancy && "bg-warning/10 text-warning",
                !isHighOccupancy && !isMediumOccupancy && "bg-success/10 text-success"
              )}
            >
              {Math.round(occupancyPercentage)}% Ocupado
            </span>
          </div>

          {/* Barra de progreso limpia */}
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300 ease-out", statusBg)}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Botón de acción */}
        <Button
          onClick={() => router.push(`/ventas/${trip.id}`)}
          className="w-full mt-4 group"
        >
          Abrir Ventanilla
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
