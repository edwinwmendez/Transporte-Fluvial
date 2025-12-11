import { useState, useEffect } from 'react';
import {
  obtenerPuntoOrigenMasAvanzado,
  obtenerDestinosDisponiblesDesde,
} from '../api/bookings.api';
import type { Route } from '../types';
import { logError } from '../utils/logger';
import { useToast } from './useToast';

interface UseAvailableDestinationsOptions {
  tripId: string;
  seatId: string;
  route: Route | null;
  bookingsPrecargados?: Array<{ destinoIntermedio?: string }>;
  enabled?: boolean;
}

interface Destination {
  nombre: string;
  precio: number;
  esDestinoFinal: boolean;
}

/**
 * Hook para obtener destinos disponibles desde un punto de origen
 * 
 * Calcula el punto de origen más avanzado basado en reservas existentes
 * y devuelve los destinos disponibles desde ese punto.
 */
export function useAvailableDestinations({
  tripId,
  seatId,
  route,
  bookingsPrecargados,
  enabled = true,
}: UseAvailableDestinationsOptions) {
  const toast = useToast();
  const [destinosDisponibles, setDestinosDisponibles] = useState<Destination[]>([]);
  const [puntoOrigen, setPuntoOrigen] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !route || !tripId || !seatId) {
      setDestinosDisponibles([]);
      setPuntoOrigen('');
      return;
    }

    async function loadDestinos() {
      if (!route) return;
      
      setLoading(true);
      try {
        let puntoOrigenAvanzado: string;

        if (bookingsPrecargados && bookingsPrecargados.length > 0) {
          const orden = new Map<string, number>();
          orden.set(route.origen, 0);
          if (route.paradasIntermedias) {
            const paradasOrdenadas = [...route.paradasIntermedias].sort(
              (a, b) => a.orden - b.orden
            );
            paradasOrdenadas.forEach((parada) => {
              orden.set(parada.nombre, parada.orden);
            });
            const maxOrden = Math.max(...paradasOrdenadas.map((p) => p.orden));
            orden.set(route.destino, maxOrden + 1);
          } else {
            orden.set(route.destino, 1);
          }

          let maxOrden = -1;
          let puntoMasAvanzado = route.origen;

          for (const reserva of bookingsPrecargados) {
            const destinoReserva = reserva.destinoIntermedio || route.destino;
            const ordenDestino = orden.get(destinoReserva) ?? -1;
            if (ordenDestino > maxOrden) {
              maxOrden = ordenDestino;
              puntoMasAvanzado = destinoReserva;
            }
          }
          puntoOrigenAvanzado = puntoMasAvanzado;
        } else {
          puntoOrigenAvanzado = await obtenerPuntoOrigenMasAvanzado(tripId, seatId, route);
        }

        setPuntoOrigen(puntoOrigenAvanzado);
        const destinos = obtenerDestinosDisponiblesDesde(route, puntoOrigenAvanzado);
        setDestinosDisponibles(destinos);
      } catch (error) {
        logError('Error al cargar destinos', error, { tripId, seatId });
        toast.error('Error al cargar destinos disponibles');
      } finally {
        setLoading(false);
      }
    }

    loadDestinos();
  }, [enabled, tripId, seatId, route, bookingsPrecargados, toast]);

  return {
    destinosDisponibles,
    puntoOrigen,
    loading,
  };
}
