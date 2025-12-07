"use client";

import { useEffect, useState } from "react";
import { subscribeToSeats } from "@/lib/firestore-helpers";
import type { Seat } from "@/lib/firestore-helpers";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  tripId: string;
  rows: number;
  columns: number;
  onSeatClick: (seat: Seat) => void;
  selectedSeatId?: string | null;
}

export function SeatMap({
  tripId,
  rows,
  columns,
  onSeatClick,
  selectedSeatId,
}: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToSeats(tripId, (updatedSeats) => {
      setSeats(updatedSeats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tripId]);

  // Organizar asientos por fila y columna
  // Layout 2-2: cada fila tiene 2 asientos en columna A y 2 asientos en columna B
  const getSeatsByRowAndColumn = (row: number, column: string): Seat[] => {
    return seats.filter(
      (seat) => seat.row === row && seat.column === column
    ).sort((a, b) => {
      // Ordenar por posición: window primero, luego aisle
      if (a.position === 'window' && b.position === 'aisle') return -1;
      if (a.position === 'aisle' && b.position === 'window') return 1;
      return 0;
    });
  };

  // Determinar el estado visual del asiento
  const getSeatState = (seat: Seat | undefined): "available" | "sold" | "selected" => {
    if (!seat) return "available";
    if (selectedSeatId === seat.id) return "selected";
    if (seat.status === "sold") return "sold";
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
        <div className="w-4 border-l-2 border-dashed border-muted-foreground/30" />

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
    <div className="space-y-2">
      {/* Leyenda */}
      <div className="flex items-center justify-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-muted-foreground">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-muted-foreground">Vendido</span>
        </div>
      </div>

      {/* Mapa de asientos */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="space-y-1">
          {Array.from({ length: rows }, (_, i) => i + 1).map((row) =>
            renderRow(row)
          )}
        </div>

        {/* Indicador de ventana/pasillo */}
        <div className="mt-4 flex items-center justify-center gap-8 text-xs text-muted-foreground">
          <span>Ventana</span>
          <span className="text-muted-foreground/50">|</span>
          <span>Pasillo</span>
          <span className="text-muted-foreground/50">|</span>
          <span>Ventana</span>
        </div>
      </div>
    </div>
  );
}

interface SeatButtonProps {
  seat: Seat;
  state: "available" | "sold" | "selected";
  onClick: () => void;
}

function SeatButton({ seat, state, onClick }: SeatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "sold"}
      className={cn(
        "w-10 h-10 rounded text-xs font-medium transition-all",
        "hover:scale-105 active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-50",
        state === "available" &&
          "bg-green-500 hover:bg-green-600 text-white border-2 border-green-600",
        state === "selected" &&
          "bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-600 ring-2 ring-yellow-300",
        state === "sold" &&
          "bg-red-500 text-white border-2 border-red-600 cursor-not-allowed"
      )}
      title={`Asiento ${seat.seatNumber} - ${state === "available" ? "Disponible" : state === "sold" ? "Vendido" : "Seleccionado"}`}
    >
      {seat.seatNumber}
    </button>
  );
}
