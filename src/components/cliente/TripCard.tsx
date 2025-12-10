'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface Trip {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  price: number;
  availableSeats: number;
  vessel: {
    name: string;
  };
}

interface TripCardProps {
  trip: Trip;
  onSelect?: (tripId: string) => void;
  className?: string;
}

/**
 * TripCard component responsive
 * Se adapta a diferentes tamaños de pantalla con layout flexible
 */
export function TripCard({ trip, onSelect, className }: TripCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base md:text-lg">
            {trip.origin} → {trip.destination}
          </CardTitle>
          <span className="text-lg md:text-xl font-bold text-primary">
            {formatPrice(trip.price)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4">
        {/* Información del viaje */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm md:text-base">
          <div>
            <p className="text-text-secondary text-xs md:text-sm mb-1">Salida</p>
            <p className="font-medium">{formatDate(trip.departureDate)}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs md:text-sm mb-1">Llegada</p>
            <p className="font-medium">{formatDate(trip.arrivalDate)}</p>
          </div>
        </div>

        {/* Embarcación y asientos */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="text-sm md:text-base">
            <span className="text-text-secondary">Embarcación: </span>
            <span className="font-medium">{trip.vessel.name}</span>
          </div>
          <div className="text-sm md:text-base">
            <span className="text-text-secondary">Asientos disponibles: </span>
            <span className={cn(
              'font-medium',
              trip.availableSeats < 5 ? 'text-warning' : 'text-success'
            )}>
              {trip.availableSeats}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onSelect?.(trip.id)}
          className="w-full"
          disabled={trip.availableSeats === 0}
        >
          {trip.availableSeats === 0 ? 'Sin disponibilidad' : 'Seleccionar Viaje'}
        </Button>
      </CardFooter>
    </Card>
  );
}
