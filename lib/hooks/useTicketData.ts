import { useState, useEffect } from 'react';
import { useTrip } from './useTrips';
import { useVessel } from './useVessels';
import { useRoute } from './useRoutes';
import { useSeatsForTrip } from './useSeats';
import type { Booking, Trip, Vessel, Route, Seat } from '../types';
import { Timestamp } from 'firebase/firestore';

interface UseTicketDataResult {
  trip: Trip | null;
  vessel: Vessel | null;
  route: Route | null;
  seat: Seat | null;
  loading: boolean;
}

/**
 * Hook para cargar todos los datos necesarios para mostrar un boleto
 * 
 * Carga en paralelo: trip, vessel, route, y seat basado en el booking.
 * Las queries de vessel y route dependen de que trip se cargue primero.
 * 
 * @param booking - Booking del cual extraer los IDs necesarios
 * @param enabled - Si false, no ejecuta las queries
 * @returns Objeto con trip, vessel, route, seat y loading
 * 
 * @example
 * ```tsx
 * const { trip, vessel, route, seat, loading } = useTicketData(booking, !!booking);
 * ```
 */
export function useTicketData(booking: Booking | null, enabled = true): UseTicketDataResult {
  const viajeId = booking?.viajeId || null;
  const asientoId = booking?.asientoId || null;

  const { data: trip, isLoading: loadingTrip } = useTrip(viajeId);
  const { data: vessel, isLoading: loadingVessel } = useVessel(trip?.embarcacionId || null);
  const { data: route, isLoading: loadingRoute } = useRoute(trip?.rutaId || null);
  const { data: seats = [], isLoading: loadingSeats } = useSeatsForTrip(viajeId);

  const [seat, setSeat] = useState<Seat | null>(null);

  useEffect(() => {
    if (asientoId && seats.length > 0) {
      const foundSeat = seats.find((s) => s.id === asientoId);
      if (foundSeat) {
        setSeat(foundSeat);
      } else {
        // Crear seat temporal si no se encuentra
        const now = Timestamp.now();
        setSeat({
          id: asientoId,
          viajeId: viajeId || '',
          numeroAsiento: asientoId.split('_').pop() || 'N/A',
          fila: 0,
          columna: 'A',
          posicion: 'ventana',
          estado: 'vendido',
          createdAt: booking?.createdAt || now,
          updatedAt: booking?.updatedAt || now,
        } as Seat);
      }
    } else {
      setSeat(null);
    }
  }, [asientoId, seats, viajeId, booking]);

  const loading = enabled && (loadingTrip || loadingVessel || loadingRoute || loadingSeats || !trip || (trip && (!vessel || !route)));

  return {
    trip: trip || null,
    vessel: vessel || null,
    route: route || null,
    seat,
    loading,
  };
}
