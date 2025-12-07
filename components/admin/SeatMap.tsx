"use client";

import { useEffect, useState } from "react";
import { subscribeToSeats, subscribeToBookings, getRoute, estaAsientoCompletamenteOcupado } from "@/lib/firestore-helpers";
import type { Seat, Booking, Route } from "@/lib/firestore-helpers";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  tripId: string;
  rutaId: string; // NUEVO: Para determinar si el asiento está completamente ocupado
  rows: number;
  columns: number;
  onSeatClick: (seat: Seat) => void;
  selectedSeatId?: string | null;
}

export function SeatMap({
  tripId,
  rutaId,
  rows,
  columns,
  onSeatClick,
  selectedSeatId,
}: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ruta, setRuta] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeSeats = subscribeToSeats(tripId, (updatedSeats) => {
      setSeats(updatedSeats);
      if (bookings.length >= 0 && ruta) { // bookings puede estar vacío pero ya se cargó
        setLoading(false);
      }
    });

    const unsubscribeBookings = subscribeToBookings(tripId, (updatedBookings) => {
      setBookings(updatedBookings);
      if (seats.length >= 0 && ruta) { // seats puede estar vacío pero ya se cargó
        setLoading(false);
      }
    });

    // Cargar ruta
    if (rutaId) {
      getRoute(rutaId).then((rutaData) => {
        if (rutaData) {
          setRuta(rutaData);
          if (seats.length >= 0 && bookings.length >= 0) {
            setLoading(false);
          }
        }
      }).catch((error) => {
        console.error("Error al cargar ruta:", error);
        setLoading(false);
      });
    }

    return () => {
      unsubscribeSeats();
      unsubscribeBookings();
    };
  }, [tripId, rutaId]);

  // Organizar asientos por fila y columna
  // Layout 2-2: cada fila tiene 2 asientos en columna A y 2 asientos en columna B
  const getSeatsByRowAndColumn = (row: number, column: string): Seat[] => {
    return seats.filter(
      (seat) => seat.fila === row && seat.columna === column
    ).sort((a, b) => {
      // Ordenar por posición: ventana primero, luego pasillo
      if (a.posicion === 'ventana' && b.posicion === 'pasillo') return -1;
      if (a.posicion === 'pasillo' && b.posicion === 'ventana') return 1;
      return 0;
    });
  };

  // Obtener reservas de un asiento específico
  const getBookingsForSeat = (asientoId: string): Booking[] => {
    return bookings.filter((booking) => booking.asientoId === asientoId && booking.estado === 'confirmado');
  };

  // Determinar el estado visual del asiento
  const getSeatState = (seat: Seat | undefined): "available" | "partial" | "sold" | "selected" => {
    if (!seat) return "available";
    if (selectedSeatId === seat.id) return "selected";
    
    const reservasAsiento = getBookingsForSeat(seat.id);
    
    // Si no tiene reservas, está disponible
    if (reservasAsiento.length === 0) {
      return "available";
    }
    
    // Si tiene reservas, verificar si está completamente ocupado
    if (ruta) {
      const completamenteOcupado = estaAsientoCompletamenteOcupado(reservasAsiento, ruta);
      if (completamenteOcupado) {
        return "sold"; // Completamente ocupado = vendido (rojo)
      } else {
        return "partial"; // Parcialmente ocupado (naranja)
      }
    }
    
    // Si no hay ruta cargada, usar el estado del asiento como fallback
    if (seat.estado === "vendido") {
      return "sold";
    }
    
    // Si tiene reservas pero no está completamente ocupado, está parcialmente ocupado
    if (reservasAsiento.length > 0) {
      return "partial";
    }
    
    return "available";
  };

  // Renderizar una fila de asientos
  const renderRow = (rowNumber: number) => {
    // Obtener todos los asientos de esta fila, organizados por columna
    const seatsA = getSeatsByRowAndColumn(rowNumber, "A"); // 2 asientos lado izquierdo
    const seatsB = getSeatsByRowAndColumn(rowNumber, "B"); // 2 asientos lado derecho

    return (
      <div key={rowNumber} className="flex items-center gap-2">
        {/* Número de fila */}
        <div className="w-8 text-sm text-muted-foreground text-right">
          {rowNumber}
        </div>

        {/* Asientos lado izquierdo (A) - 2 asientos */}
        <div className="flex gap-1">
          {seatsA.map((seat) => (
            <SeatButton
              key={seat.id}
              seat={seat}
              state={getSeatState(seat)}
              onClick={() => onSeatClick(seat)}
            />
          ))}
        </div>

        {/* Pasillo (representado visualmente) */}
        <div className="w-8 border-l-2 border-dashed border-muted-foreground/40 mx-2" />

        {/* Asientos lado derecho (B) - 2 asientos */}
        <div className="flex gap-1">
          {seatsB.map((seat) => (
            <SeatButton
              key={seat.id}
              seat={seat}
              state={getSeatState(seat)}
              onClick={() => onSeatClick(seat)}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Cargando mapa de asientos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Leyenda mejorada */}
      <div className="flex items-center justify-center gap-6 mb-6 text-sm flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
          <div className="w-4 h-4 rounded bg-green-500 shadow-sm" />
          <span className="font-medium text-green-700 dark:text-green-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
          <div className="w-4 h-4 rounded bg-orange-500 shadow-sm" />
          <span className="font-medium text-orange-700 dark:text-orange-400">Parcialmente Ocupado</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
          <div className="w-4 h-4 rounded bg-yellow-500 shadow-sm" />
          <span className="font-medium text-yellow-700 dark:text-yellow-400">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <div className="w-4 h-4 rounded bg-red-600 shadow-sm" />
          <span className="font-medium text-red-700 dark:text-red-400">Vendido</span>
        </div>
      </div>

      {/* Mapa de asientos - Centrado y mejorado */}
      <div className="border-2 rounded-xl p-8 bg-card shadow-lg">
        <div className="flex justify-center">
          <div className="space-y-1.5">
            {Array.from({ length: rows }, (_, i) => i + 1).map((row) =>
              renderRow(row)
            )}
          </div>
        </div>

        {/* Indicador de ventana/pasillo mejorado */}
        <div className="mt-6 flex items-center justify-center gap-8 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Ventana</span>
          </div>
          <span className="text-muted-foreground/30">|</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span>Pasillo</span>
          </div>
          <span className="text-muted-foreground/30">|</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Ventana</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SeatButtonProps {
  seat: Seat;
  state: "available" | "partial" | "sold" | "selected";
  onClick: () => void;
}

function SeatButton({ seat, state, onClick }: SeatButtonProps) {
  const getStateLabel = () => {
    switch (state) {
      case "available": return "Disponible";
      case "partial": return "Parcialmente Ocupado (puede tener más reservas)";
      case "sold": return "Vendido";
      case "selected": return "Seleccionado";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "sold"}
      className={cn(
        "w-12 h-12 rounded-lg text-xs font-bold transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-75",
        "shadow-md hover:shadow-lg",
        state === "available" &&
          "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-2 border-green-700",
        state === "partial" &&
          "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-2 border-orange-700",
        state === "selected" &&
          "bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-2 border-yellow-700 ring-4 ring-yellow-300 ring-opacity-50 animate-pulse",
        state === "sold" &&
          "bg-gradient-to-br from-red-600 to-red-700 text-white border-2 border-red-800 cursor-not-allowed opacity-90"
      )}
      title={`Asiento ${seat.numeroAsiento} - ${getStateLabel()}`}
    >
      {seat.numeroAsiento}
    </button>
  );
}
