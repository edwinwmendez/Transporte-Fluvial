'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Ship, ArrowRight } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { useVessel } from '@/lib/hooks/useVessels';
import { useSeatsForTrip } from '@/lib/hooks/useSeats';
import { useBookingsForTrip } from '@/lib/hooks/useBookings';
import { formatLocalDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

interface TripCardProps {
  trip: Trip;
}

/**
 * Tarjeta para mostrar información de un viaje
 * 
 * Muestra:
 * - Fecha y hora de salida
 * - Información de la embarcación
 * - Ocupación de asientos
 * - Acción para ver detalles
 */
export const TripCard = React.memo(function TripCard({ trip }: TripCardProps) {
  const router = useRouter();
  const { data: vessel } = useVessel(trip.embarcacionId);
  const { data: seats = [] } = useSeatsForTrip(trip.id);
  const { data: bookings = [] } = useBookingsForTrip(trip.id);

  const fechaSalida = trip.fechaSalida?.toDate
    ? trip.fechaSalida.toDate()
    : trip.fechaSalida instanceof Date
      ? trip.fechaSalida
      : new Date();

  const asientosOcupados = seats.filter((s) => s.estado === 'vendido').length;
  const totalAsientos = seats.length;
  const ocupacion = totalAsientos > 0 ? (asientosOcupados / totalAsientos) * 100 : 0;

  const handleViewDetails = () => {
    router.push(`/ventas/${trip.id}`);
  };

  return (
    <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
              <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              {formatLocalDate(fechaSalida)}
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {trip.horaSalida}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {vessel && (
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1 rounded bg-muted">
              <Ship className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </div>
            <span className="font-medium text-foreground">{vessel.nombre}</span>
          </div>
        )}

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Ocupación:</span>
            <span className="font-semibold text-foreground">
              {asientosOcupados} / {totalAsientos} asientos
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                ocupacion >= 80
                  ? 'bg-destructive'
                  : ocupacion >= 50
                    ? 'bg-warning'
                    : 'bg-success'
              )}
              style={{ width: `${Math.min(ocupacion, 100)}%` }}
              role="progressbar"
              aria-valuenow={ocupacion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${ocupacion.toFixed(0)}% de ocupación`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
          <span className="text-muted-foreground font-medium">Reservas:</span>
          <span className="font-bold text-foreground">{bookings.length}</span>
        </div>

        <Button 
          onClick={handleViewDetails} 
          className="w-full group/btn" 
          aria-label={`Ver detalles del viaje del ${formatLocalDate(fechaSalida)}`}
        >
          Ver Detalles
          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
});
