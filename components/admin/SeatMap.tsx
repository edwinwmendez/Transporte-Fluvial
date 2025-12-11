'use client';

import { useEffect, useState } from 'react';
import { useSeatsSubscription } from '@/lib/hooks/useSeats';
import { useBookingsSubscription } from '@/lib/hooks/useBookings';
import { useRoute } from '@/lib/hooks/useRoutes';
import { estaAsientoCompletamenteOcupado } from '@/lib/api/bookings.api';
import type { Seat, Booking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { User, Check } from 'lucide-react';

interface SeatMapProps {
  tripId: string;
  rutaId: string;
  rows: number;
  columns: number;
  onSeatClick: (seat: Seat) => void;
  selectedSeatId?: string | null;
}

/**
 * Mapa de asientos interactivo para un viaje
 * 
 * Muestra asientos en layout 2-2 (ventana-pasillo | pasillo-ventana)
 * Con estados visuales: disponible, parcialmente ocupado, completamente ocupado, seleccionado
 */
export function SeatMap({
  tripId,
  rutaId,
  rows,
  columns,
  onSeatClick,
  selectedSeatId,
}: SeatMapProps) {
  // Usar hooks de suscripción para datos en tiempo real
  const { data: seats = [], isLoading: loadingSeats } = useSeatsSubscription(tripId);
  const { data: bookings = [], isLoading: loadingBookings } = useBookingsSubscription(tripId);
  const { data: ruta, isLoading: loadingRoute } = useRoute(rutaId);

  const loading = loadingSeats || loadingBookings || loadingRoute;

  const getSeatsByRowAndColumn = (row: number, column: string): Seat[] => {
    return seats
      .filter((seat) => seat.fila === row && seat.columna === column)
      .sort((a, b) => {
        if (a.posicion === 'ventana' && b.posicion === 'pasillo') return -1;
        if (a.posicion === 'pasillo' && b.posicion === 'ventana') return 1;
        return 0;
      });
  };

  const getBookingsForSeat = (asientoId: string): Booking[] => {
    return bookings.filter(
      (booking) => booking.asientoId === asientoId && booking.estado === 'confirmado'
    );
  };

  const getSeatState = (
    seat: Seat | undefined
  ): 'available' | 'partial' | 'sold' | 'selected' => {
    if (!seat) return 'available';
    if (selectedSeatId === seat.id) return 'selected';

    const reservasAsiento = getBookingsForSeat(seat.id);

    if (reservasAsiento.length === 0) return 'available';

    if (ruta) {
      const completamenteOcupado = estaAsientoCompletamenteOcupado(reservasAsiento, ruta);
      if (completamenteOcupado) return 'sold';
      else return 'partial';
    }

    if (seat.estado === 'vendido') return 'sold';
    if (reservasAsiento.length > 0) return 'partial';

    return 'available';
  };

  const getSeatClasses = (state: 'available' | 'partial' | 'sold' | 'selected') => {
    const base = 'relative w-12 h-12 rounded-md border-2 transition-all flex items-center justify-center text-xs font-semibold';
    const variants = {
      available: 'bg-[hsl(var(--seat-available-bg))] border-[hsl(var(--seat-available-border))] text-[hsl(var(--seat-available-text))] hover:opacity-80',
      partial: 'bg-[hsl(var(--seat-partial-bg))] border-[hsl(var(--seat-partial-border))] text-[hsl(var(--seat-partial-text))] hover:opacity-80',
      sold: 'bg-[hsl(var(--seat-sold-bg))] border-[hsl(var(--seat-sold-border))] text-[hsl(var(--seat-sold-text))] cursor-not-allowed opacity-60',
      selected: 'bg-[hsl(var(--seat-selected-bg))] border-[hsl(var(--seat-selected-border))] text-[hsl(var(--seat-selected-text))] ring-2 ring-primary',
    };
    return cn(base, variants[state]);
  };

  const renderRow = (rowNumber: number) => {
    const seatsA = getSeatsByRowAndColumn(rowNumber, 'A');
    const seatsB = getSeatsByRowAndColumn(rowNumber, 'B');

    return (
      <div key={rowNumber} className="flex items-center justify-between gap-8 mb-2">
        {/* Columna A (izquierda) */}
        <div className="flex gap-2">
          {seatsA.map((seat) => {
            const state = getSeatState(seat);
            const reservas = getBookingsForSeat(seat.id);
            return (
              <button
                key={seat.id}
                onClick={() => onSeatClick(seat)}
                className={getSeatClasses(state)}
                disabled={state === 'sold'}
                aria-label={`Asiento ${seat.numeroAsiento} - ${state === 'available' ? 'Disponible' : state === 'partial' ? 'Parcialmente ocupado' : 'Ocupado'}`}
                title={`Asiento ${seat.numeroAsiento} - ${reservas.length} reserva${reservas.length !== 1 ? 's' : ''}`}
              >
                {seat.numeroAsiento}
                {reservas.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold"
                    aria-label={`${reservas.length} reserva${reservas.length !== 1 ? 's' : ''}`}
                  >
                    {reservas.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pasillo (centro) */}
        <div className="w-12 text-center text-xs text-muted-foreground font-medium">PASILLO</div>

        {/* Columna B (derecha) */}
        <div className="flex gap-2">
          {seatsB.map((seat) => {
            const state = getSeatState(seat);
            const reservas = getBookingsForSeat(seat.id);
            return (
              <button
                key={seat.id}
                onClick={() => onSeatClick(seat)}
                className={getSeatClasses(state)}
                disabled={state === 'sold'}
                aria-label={`Asiento ${seat.numeroAsiento} - ${state === 'available' ? 'Disponible' : state === 'partial' ? 'Parcialmente ocupado' : 'Ocupado'}`}
                title={`Asiento ${seat.numeroAsiento} - ${reservas.length} reserva${reservas.length !== 1 ? 's' : ''}`}
              >
                {seat.numeroAsiento}
                {reservas.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold"
                    aria-label={`${reservas.length} reserva${reservas.length !== 1 ? 's' : ''}`}
                  >
                    {reservas.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 bg-muted animate-pulse" />
            <span className="text-muted-foreground">Cargando...</span>
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Cargando mapa de asientos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-[hsl(var(--seat-available-bg))] border-[hsl(var(--seat-available-border))]" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-[hsl(var(--seat-partial-bg))] border-[hsl(var(--seat-partial-border))]" />
          <span>Parcialmente Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-[hsl(var(--seat-sold-bg))] border-[hsl(var(--seat-sold-border))] opacity-60" />
          <span>Completamente Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-[hsl(var(--seat-selected-bg))] border-[hsl(var(--seat-selected-border))]" />
          <span>Seleccionado</span>
        </div>
      </div>

      {/* Mapa de asientos */}
      <div className="border rounded-lg p-4 bg-muted/20">
        {Array.from({ length: rows }, (_, i) => i + 1).map((rowNumber) => renderRow(rowNumber))}
      </div>
    </div>
  );
}
