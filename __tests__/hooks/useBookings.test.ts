import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, createElement } from 'react';
import { useBookingsForTrip, useCreateBooking } from '@/lib/hooks/useBookings';
import type { Booking, Route } from '@/lib/types';
import * as bookingsApi from '@/lib/api/bookings.api';

// Mock de la API
vi.mock('@/lib/api/bookings.api', () => ({
  getBookingsForTrip: vi.fn(),
  createBooking: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

describe('useBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBookingsForTrip', () => {
    it('debe obtener reservas de un viaje', async () => {
      const mockBookings = [
        {
          id: '1',
          viajeId: 'trip1',
          asientoId: 'seat1',
          nombrePasajero: 'Juan Pérez',
          dniPasajero: '12345678',
          telefonoPasajero: '987654321',
          estado: 'confirmado',
        },
      ];

      vi.mocked(bookingsApi.getBookingsForTrip).mockResolvedValue(mockBookings as unknown as Booking[]);

      const { result } = renderHook(() => useBookingsForTrip('trip1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockBookings);
      expect(bookingsApi.getBookingsForTrip).toHaveBeenCalledWith('trip1');
    });

    it('no debe hacer query si viajeId es null', () => {
      const { result } = renderHook(() => useBookingsForTrip(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
      expect(bookingsApi.getBookingsForTrip).not.toHaveBeenCalled();
    });
  });

  describe('useCreateBooking', () => {
    it('debe crear una reserva exitosamente', async () => {
      const mockBookingId = 'booking123';
      vi.mocked(bookingsApi.createBooking).mockResolvedValue(mockBookingId);

      const { result } = renderHook(() => useCreateBooking(), {
        wrapper: createWrapper(),
      });

      const bookingData = {
        viajeId: 'trip1',
        asientoId: 'seat1',
        datosPasajero: {
          nombre: 'Juan Pérez',
          dni: '12345678',
          telefono: '987654321',
          monto: 150,
          metodoPago: 'efectivo' as const,
        },
        ruta: {
          id: 'route1',
          origen: 'Atalaya',
          destino: 'Pucallpa',
          distancia: 500,
          horasEstimadas: 12,
          precio: 150,
          activa: true,
        } as unknown as Route,
      };

      result.current.mutate(bookingData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(bookingsApi.createBooking).toHaveBeenCalledWith(
        bookingData.viajeId,
        bookingData.asientoId,
        bookingData.datosPasajero,
        bookingData.ruta
      );
      expect(result.current.data).toBe(mockBookingId);
    });
  });
});
