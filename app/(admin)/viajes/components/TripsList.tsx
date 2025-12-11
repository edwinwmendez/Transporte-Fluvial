'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Calendar, Clock, MapPin, Ship } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { formatLocalDate } from '@/lib/utils/formatters';

interface TripsListProps {
  trips: Trip[];
  loading?: boolean;
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  onView?: (tripId: string) => void;
}

/**
 * Componente para mostrar la lista de viajes
 */
export function TripsList({
  trips,
  loading = false,
  onEdit,
  onDelete,
  onView,
}: TripsListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cargando viajes...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay viajes programados</p>
      </div>
    );
  }

  const getEstadoBadge = (estado: Trip['estado']) => {
    const variants: Record<Trip['estado'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      programado: 'default',
      en_curso: 'default',
      completado: 'secondary',
      cancelado: 'destructive',
    };
    return variants[estado] || 'outline';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => {
        const fecha = trip.fechaSalida?.toDate
          ? trip.fechaSalida.toDate()
          : trip.fechaSalida instanceof Date
            ? trip.fechaSalida
            : new Date();

        return (
          <Card key={trip.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {formatLocalDate(fecha)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {trip.horaSalida}
                  </CardDescription>
                </div>
                <Badge variant={getEstadoBadge(trip.estado)}>
                  {trip.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ruta ID:</span>
                  <span>{trip.rutaId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Embarcación ID:</span>
                  <span>{trip.embarcacionId}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(trip.id)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(trip)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(trip.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
