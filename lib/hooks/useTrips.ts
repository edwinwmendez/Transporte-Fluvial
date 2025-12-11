import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTrips,
  getTrip,
  getTripsForTodayAndTomorrow,
  getTripsByDateRange,
  createTrip,
  updateTrip,
  deleteTrip,
} from '../api/trips.api';
import type { Trip, Vessel } from '../types';

/**
 * Hook para obtener todos los viajes del sistema
 * 
 * @returns Query result con todos los viajes
 * @example
 * ```tsx
 * const { data: viajes, isLoading } = useTrips();
 * ```
 */
export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: getAllTrips,
  });
}

/**
 * Hook para obtener un viaje por ID
 */
export function useTrip(viajeId: string | null) {
  return useQuery({
    queryKey: ['trips', viajeId],
    queryFn: () => (viajeId ? getTrip(viajeId) : null),
    enabled: !!viajeId,
  });
}

/**
 * Hook para obtener viajes de hoy y mañana
 */
export function useTripsForTodayAndTomorrow() {
  return useQuery({
    queryKey: ['trips', 'today-tomorrow'],
    queryFn: getTripsForTodayAndTomorrow,
  });
}

/**
 * Hook para obtener viajes dentro de un rango de fechas específico
 * 
 * @param fechaInicio - Fecha de inicio del rango, o null para deshabilitar
 * @param fechaFin - Fecha de fin del rango, o null para deshabilitar
 * @param estados - Array opcional de estados para filtrar (ej: ['programado', 'en_curso'])
 * @param enabled - Si false, deshabilita la query (default: true si hay fechas válidas)
 * @returns Query result con viajes en el rango de fechas
 * @example
 * ```tsx
 * const { data: viajes } = useTripsByDateRange(
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31'),
 *   ['programado']
 * );
 * ```
 */
export function useTripsByDateRange(
  fechaInicio: Date | null,
  fechaFin: Date | null,
  estados?: Trip['estado'][],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['trips', 'date-range', fechaInicio, fechaFin, estados],
    queryFn: () => {
      if (!fechaInicio || !fechaFin) return [];
      return getTripsByDateRange(fechaInicio, fechaFin, estados);
    },
    enabled: enabled && !!fechaInicio && !!fechaFin,
  });
}

/**
 * Hook para crear un viaje
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripData,
      embarcacion,
    }: {
      tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>;
      embarcacion: Vessel;
    }) => createTrip(tripData, embarcacion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

/**
 * Hook para actualizar un viaje
 */
export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripId,
      updates,
    }: {
      tripId: string;
      updates: Partial<Omit<Trip, 'id' | 'createdAt'>>;
    }) => updateTrip(tripId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trips', variables.tripId] });
    },
  });
}

/**
 * Hook para eliminar un viaje
 */
export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
