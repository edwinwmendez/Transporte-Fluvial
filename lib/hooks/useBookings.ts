import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import {
  buscarPasajeroPorDni,
  createBooking,
  getBookingByTicketNumber,
  getBookingsByDni,
  getBookingsForSeat,
  getBookingsForTrip,
  getBookingsWithPendingPayments,
  getCashSummaryForTrip,
  markTicketAsUsed,
  subscribeToBookings,
  updateBookingTicket,
} from '../api/bookings.api';
import type { Booking, Route } from '../types';

/**
 * Hook para obtener todas las reservas de un viaje específico
 *
 * @param viajeId - ID del viaje, o null para deshabilitar la query
 * @returns Query result con las reservas del viaje, o array vacío si viajeId es null
 * @example
 * ```tsx
 * const { data: reservas } = useBookingsForTrip('viaje123');
 * ```
 */
export function useBookingsForTrip(viajeId: string | null) {
  return useQuery({
    queryKey: ['bookings', 'trip', viajeId],
    queryFn: () => (viajeId ? getBookingsForTrip(viajeId) : []),
    enabled: !!viajeId,
  });
}

/**
 * Hook para obtener todas las reservas de un asiento específico en un viaje
 *
 * @param viajeId - ID del viaje, o null para deshabilitar la query
 * @param asientoId - ID del asiento, o null para deshabilitar la query
 * @returns Query result con las reservas del asiento, o array vacío si algún ID es null
 * @example
 * ```tsx
 * const { data: reservas } = useBookingsForSeat('viaje123', 'asiento456');
 * ```
 */
export function useBookingsForSeat(viajeId: string | null, asientoId: string | null) {
  return useQuery({
    queryKey: ['bookings', 'seat', viajeId, asientoId],
    queryFn: () => (viajeId && asientoId ? getBookingsForSeat(viajeId, asientoId) : []),
    enabled: !!viajeId && !!asientoId,
  });
}

/**
 * Hook para suscribirse a cambios de reservas en tiempo real
 *
 * NOTA: React Query no soporta suscripciones en tiempo real nativamente.
 * Este hook usa useState/useEffect para manejar la suscripción de Firestore.
 *
 * Para casos donde necesitas actualizaciones en tiempo real (como cuadre de caja),
 * este hook es apropiado. Para datos que no cambian frecuentemente, usa useBookingsForTrip.
 */
export function useBookingsSubscription(viajeId: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(!!viajeId);

  useEffect(() => {
    if (!viajeId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    const unsubscribe = subscribeToBookings(viajeId, (updatedBookings) => {
      setBookings(updatedBookings);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [viajeId]);

  return { data: bookings, isLoading };
}

/**
 * Hook para obtener todas las reservas con pagos pendientes de validación
 *
 * @returns Query result con reservas que tienen pagos en estado 'pendiente'
 * @example
 * ```tsx
 * const { data: reservasPendientes } = useBookingsWithPendingPayments();
 * ```
 */
export function useBookingsWithPendingPayments() {
  return useQuery({
    queryKey: ['bookings', 'pending-payments'],
    queryFn: getBookingsWithPendingPayments,
  });
}

/**
 * Hook para buscar boleto por número de ticket
 */
export function useBookingByTicketNumber(numeroTicket: string | null) {
  return useQuery({
    queryKey: ['bookings', 'ticket', numeroTicket],
    queryFn: () => (numeroTicket ? getBookingByTicketNumber(numeroTicket) : null),
    enabled: !!numeroTicket && numeroTicket.length > 0,
  });
}

/**
 * Hook para buscar boletos por DNI
 */
export function useBookingsByDni(dni: string | null) {
  return useQuery({
    queryKey: ['bookings', 'dni', dni],
    queryFn: () => (dni ? getBookingsByDni(dni) : []),
    enabled: !!dni && dni.length === 8,
  });
}

/**
 * Hook para buscar pasajero por DNI (autocompletar)
 */
export function useBuscarPasajeroPorDni(dni: string | null) {
  return useQuery({
    queryKey: ['passengers', 'dni', dni],
    queryFn: () => (dni ? buscarPasajeroPorDni(dni) : null),
    enabled: !!dni && dni.length === 8,
  });
}

/**
 * Hook para crear una nueva reserva
 *
 * @returns Mutation object para crear reservas
 * @example
 * ```tsx
 * const createBooking = useCreateBooking();
 * createBooking.mutate({
 *   viajeId: 'viaje123',
 *   asientoId: 'asiento456',
 *   datosPasajero: {
 *     nombre: 'Juan Pérez',
 *     dni: '12345678',
 *     telefono: '987654321',
 *     monto: 150,
 *     metodoPago: 'efectivo'
 *   },
 *   ruta: { ... }
 * });
 * ```
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      viajeId,
      asientoId,
      datosPasajero,
      ruta,
    }: {
      viajeId: string;
      asientoId: string;
      datosPasajero: {
        nombre: string;
        dni: string;
        telefono: string;
        whatsapp?: string;
        destinoIntermedio?: string;
        monto: number;
        metodoPago: 'efectivo' | 'yape' | 'plin';
        origenIntermedio?: string;
        screenshotUrl?: string;
        screenshotPath?: string;
      };
      ruta: Route;
    }) => createBooking(viajeId, asientoId, datosPasajero, ruta),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'trip', variables.viajeId] });
      queryClient.invalidateQueries({
        queryKey: ['bookings', 'seat', variables.viajeId, variables.asientoId],
      });
      queryClient.invalidateQueries({ queryKey: ['seats', variables.viajeId] });
    },
    onSettled: () => {
      // Garantizar que isPending se resetee incluso si hay error
      // React Query maneja esto automáticamente, pero onSettled asegura el comportamiento
    },
  });
}

/**
 * Hook para actualizar el boleto de una reserva
 */
export function useUpdateBookingTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      boleto,
    }: {
      bookingId: string;
      boleto: {
        numeroTicket: string;
        codigoQr: string;
        estado: 'emitido' | 'usado';
        emitidoEn?: Timestamp;
        usadoEn?: Timestamp;
      };
    }) => updateBookingTicket(bookingId, boleto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.bookingId] });
    },
    onSettled: () => {
      // Garantizar que isPending se resetee incluso si hay error
      // React Query maneja esto automáticamente, pero onSettled asegura el comportamiento
    },
  });
}

/**
 * Hook para marcar boleto como usado
 */
export function useMarkTicketAsUsed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markTicketAsUsed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * Hook para obtener resumen de caja de un viaje
 */
export function useCashSummaryForTrip(viajeId: string | null) {
  return useQuery({
    queryKey: ['cash-summary', viajeId],
    queryFn: () => (viajeId ? getCashSummaryForTrip(viajeId) : null),
    enabled: !!viajeId,
  });
}
