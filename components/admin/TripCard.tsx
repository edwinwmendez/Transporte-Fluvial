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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
              {formatLocalDate(fechaSalida)}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {trip.horaSalida}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {vessel && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ship className="h-4 w-4" aria-hidden="true" />
            <span>{vessel.nombre}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ocupación:</span>
            <span className="font-medium">
              {asientosOcupados} / {totalAsientos} asientos
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                ocupacion >= 80
                  ? 'bg-destructive'
                  : ocupacion >= 50
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
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

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reservas:</span>
          <span className="font-medium">{bookings.length}</span>
        </div>

        <Button onClick={handleViewDetails} className="w-full" aria-label={`Ver detalles del viaje del ${formatLocalDate(fechaSalida)}`}>
          Ver Detalles
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
});
