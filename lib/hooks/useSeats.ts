import { useQuery } from '@tanstack/react-query';
import { getSeatsForTrip, subscribeToSeats } from '../api/seats.api';
import { useEffect, useState } from 'react';
import type { Seat } from '../types';

/**
 * Hook para obtener asientos de un viaje (una sola vez)
 */
export function useSeatsForTrip(viajeId: string | null) {
  return useQuery({
    queryKey: ['seats', viajeId],
    queryFn: () => (viajeId ? getSeatsForTrip(viajeId) : []),
    enabled: !!viajeId,
  });
}

/**
 * Hook para suscribirse a cambios de asientos en tiempo real
 * 
 * NOTA: React Query no soporta suscripciones en tiempo real nativamente.
 * Este hook usa useState/useEffect para manejar la suscripción de Firestore.
 * 
 * Para casos donde necesitas actualizaciones en tiempo real (como mapas de asientos),
 * este hook es apropiado. Para datos que no cambian frecuentemente, usa useSeatsForTrip.
 */
export function useSeatsSubscription(viajeId: string | null) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!viajeId) {
      setSeats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToSeats(viajeId, (updatedSeats) => {
      setSeats(updatedSeats);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [viajeId]);

  return { data: seats, isLoading };
}
