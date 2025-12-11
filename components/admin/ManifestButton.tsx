'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Loader2, FileSpreadsheet } from 'lucide-react';
import { useTrip } from '@/lib/hooks/useTrips';
import { useVessel } from '@/lib/hooks/useVessels';
import { useBookingsForTrip } from '@/lib/hooks/useBookings';
import { useSeatsForTrip } from '@/lib/hooks/useSeats';
import { useRoute } from '@/lib/hooks/useRoutes';
import { ManifestPreviewModal } from './ManifestPreviewModal';
import type { Trip, Vessel, Booking, Seat, Route } from '@/lib/types';
import { logError } from '@/lib/utils/logger';
import { handleError } from '@/lib/utils/error-handler';
import { useToast } from '@/lib/hooks/useToast';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ManifestButtonProps {
  tripId: string;
}

/**
 * Botón para generar y previsualizar el manifiesto de pasajeros
 * 
 * Carga todos los datos necesarios (trip, vessel, bookings, seats, route)
 * y muestra un modal con el preview del manifiesto en PDF
 */
export function ManifestButton({ tripId }: ManifestButtonProps) {
  const toast = useToast();
  const [showPreview, setShowPreview] = useState(false);

  // Cargar datos con React Query
  const { data: trip, isLoading: loadingTrip } = useTrip(tripId);
  const { data: vessel, isLoading: loadingVessel } = useVessel(trip?.embarcacionId || null);
  const { data: bookings = [], isLoading: loadingBookings } = useBookingsForTrip(tripId);
  const { data: seats = [], isLoading: loadingSeats } = useSeatsForTrip(tripId);
  const { data: route, isLoading: loadingRoute } = useRoute(trip?.rutaId || null);

  const loading = loadingTrip || loadingVessel || loadingBookings || loadingSeats || loadingRoute;

  const handlePreviewManifest = () => {
    if (!trip || !vessel || bookings.length === 0) {
      toast.error('No hay datos suficientes para generar el manifiesto');
      return;
    }

    setShowPreview(true);
  };

  if (loading) {
    return (
      <Button variant="outline" disabled aria-label="Cargando datos del manifiesto">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        Cargando...
      </Button>
    );
  }

  if (!trip || !vessel) {
    return (
      <Button variant="outline" disabled aria-label="Datos no disponibles">
        <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
        Manifiesto (No disponible)
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handlePreviewManifest}
        disabled={bookings.length === 0}
        aria-label="Ver manifiesto de pasajeros"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
        Ver Manifiesto
      </Button>

      {showPreview && trip && vessel && route && (
        <ManifestPreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          trip={trip}
          vessel={vessel}
          bookings={bookings}
          seats={seats}
          route={route}
        />
      )}
    </>
  );
}
