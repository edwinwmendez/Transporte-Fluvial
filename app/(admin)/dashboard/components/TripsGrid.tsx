'use client';

import { TripCard } from '@/components/admin/TripCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Calendar } from 'lucide-react';
import type { Trip } from '@/lib/types';

interface TripsGridProps {
  trips: Trip[];
  loading?: boolean;
}

/**
 * Componente para mostrar la grilla de viajes
 */
export function TripsGrid({ trips, loading = false }: TripsGridProps) {
  if (loading) {
    return <LoadingSpinner size="lg" text="Cargando viajes..." />;
  }

  if (trips.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No hay viajes en el rango seleccionado"
        description="Intenta cambiar los filtros o selecciona otro rango de fechas"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
