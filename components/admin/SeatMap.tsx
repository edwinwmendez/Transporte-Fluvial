"use client";

import { useEffect, useState } from "react";
import { subscribeToSeats, subscribeToBookings, getRoute, estaAsientoCompletamenteOcupado } from "@/lib/firestore-helpers";
import type { Seat, Booking, Route } from "@/lib/firestore-helpers";
import { cn } from "@/lib/utils";
import { User, Check } from "lucide-react";

interface SeatMapProps {
  tripId: string;
  rutaId: string;
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
      if (bookings.length >= 0 && ruta) setLoading(false);
    });

    const unsubscribeBookings = subscribeToBookings(tripId, (updatedBookings) => {
      setBookings(updatedBookings);
      if (seats.length >= 0 && ruta) setLoading(false);
    });

    if (rutaId) {
      getRoute(rutaId).then((rutaData) => {
        if (rutaData) {
          setRuta(rutaData);
          if (seats.length >= 0 && bookings.length >= 0) setLoading(false);
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

  const getSeatsByRowAndColumn = (row: number, column: string): Seat[] => {
    return seats.filter(
      (seat) => seat.fila === row && seat.columna === column
    ).sort((a, b) => {
      if (a.posicion === 'ventana' && b.posicion === 'pasillo') return -1;
      if (a.posicion === 'pasillo' && b.posicion === 'ventana') return 1;
      return 0;
    });
  };

  const getBookingsForSeat = (asientoId: string): Booking[] => {
    return bookings.filter((booking) => booking.asientoId === asientoId && booking.estado === 'confirmado');
  };

  const getSeatState = (seat: Seat | undefined): "available" | "partial" | "sold" | "selected" => {
    if (!seat) return "available";
    if (selectedSeatId === seat.id) return "selected";

    const reservasAsiento = getBookingsForSeat(seat.id);

    if (reservasAsiento.length === 0) return "available";

    if (ruta) {
      const completamenteOcupado = estaAsientoCompletamenteOcupado(reservasAsiento, ruta);
      if (completamenteOcupado) return "sold";
      else return "partial";
    }

    if (seat.estado === "vendido") return "sold";
    if (reservasAsiento.length > 0) return "partial";

    return "available";
  };

  const renderRow = (rowNumber: number) => {
    const seatsA = getSeatsByRowAndColumn(rowNumber, "A");
    const seatsB = getSeatsByRowAndColumn(rowNumber, "B");

    return (
      <div key={rowNumber} className="flex items-center justify-between gap-8 mb-2">
        <div className="flex gap-2">
          {seatsA.map((seat) => (
            <SeatButton
              key={seat.id}
              seat={seat}
              state={getSeatState(seat)}
              onClick={() => onSeatClick(seat)}
            />
          ))}
        </div>

        <div className="flex items-center justify-center w-8">
          <span className="text-xs font-mono text-muted-foreground font-semibold">{rowNumber}</span>
        </div>

        <div className="flex gap-2">
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
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] rounded-xl border border-border bg-background animate-pulse">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Cargando embarcación...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leyenda limpia */}
      <div className="flex items-center justify-center gap-4 flex-wrap p-4 rounded-lg border border-border bg-muted/30">
        <LegendItem color="bg-emerald-500 border-emerald-600 text-white" label="Disponible" />
        <LegendItem color="bg-amber-500 border-amber-600 text-white" label="Parcial" />
        <LegendItem color="bg-red-500 border-red-600 text-white" label="Ocupado" />
        <LegendItem color="bg-primary border-primary text-primary-foreground" label="Tu Selección" />
      </div>

      {/* Contenedor de embarcación */}
      <div className="relative mx-auto max-w-2xl">
        {/* Forma del casco - sutil */}
        <div className="absolute inset-0 bg-background rounded-3xl border-2 border-border -z-10 transform scale-105" />

        {/* Proa (frente) - minimalista */}
        <div className="h-12 bg-primary/10 rounded-t-[50%] mx-8 mb-4 flex items-center justify-center border-t-2 border-x-2 border-primary/20">
          <span className="text-primary font-semibold tracking-wide text-xs uppercase">Cabina</span>
        </div>

        {/* Cubierta de asientos */}
        <div className="p-8 pb-12 bg-muted/20 rounded-b-3xl seat-grid-bg">
          {/* Línea central sutil */}
          <div className="absolute left-1/2 top-12 bottom-12 w-px bg-border -translate-x-1/2" />

          <div className="space-y-1 relative z-10">
            {Array.from({ length: rows }, (_, i) => i + 1).map((row) =>
              renderRow(row)
            )}
          </div>
        </div>

        {/* Popa (trasera) - minimalista */}
        <div className="h-3 bg-primary/5 mx-16 rounded-b-full mt-2" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background">
      <div className={cn("w-3 h-3 rounded-sm border", color)} />
      <span className="text-xs font-medium text-foreground uppercase tracking-wide">{label}</span>
    </div>
  );
}

interface SeatButtonProps {
  seat: Seat;
  state: "available" | "partial" | "sold" | "selected";
  onClick: () => void;
}

function SeatButton({ seat, state, onClick }: SeatButtonProps) {
  const isAvailable = state === "available";
  const isSelected = state === "selected";
  const isSold = state === "sold";
  const isPartial = state === "partial";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group transition-all duration-200 ease-out p-1",
        "flex flex-col items-center justify-center gap-1",
        "rounded-lg border-2",

        // DISPONIBLE - verde esmeralda vibrante
        isAvailable && [
          "bg-emerald-500 border-emerald-600 text-white",
          "hover:bg-emerald-600 hover:border-emerald-700",
          "hover:shadow-sm"
        ],

        // SELECCIONADO - azul primario
        isSelected && [
          "bg-primary border-primary text-primary-foreground",
          "shadow-md ring-2 ring-primary/20"
        ],

        // VENDIDO - rojo vibrante (ahora clickeable para ver boletos)
        isSold && [
          "bg-red-500 border-red-600 text-white",
          "hover:bg-red-600 hover:border-red-700",
          "hover:shadow-sm cursor-pointer"
        ],

        // PARCIAL - ámbar vibrante
        isPartial && [
          "bg-amber-500 border-amber-600 text-white",
          "hover:bg-amber-600 hover:border-amber-700"
        ]
      )}
      // disabled={isSold} // Ya no deshabilitamos asientos rojos para poder ver boletos
    >
      {/* Ícono de asiento simplificado */}
      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
        {/* Respaldo */}
        <div className={cn(
          "absolute top-0 w-[80%] h-[60%] rounded-t-md border-2 border-current transition-colors",
          "opacity-30"
        )} />
        {/* Asiento */}
        <div className={cn(
          "absolute bottom-0 w-full h-[45%] rounded-md border-2 border-current transition-colors",
          "opacity-40"
        )} />

        {/* Overlay de estado */}
        {isSelected && <Check className="absolute w-5 h-5 text-primary-foreground" strokeWidth={3} />}
        {isSold && <User className="absolute w-4 h-4 text-white/70" />}
      </div>

      <span className={cn(
        "text-[10px] font-bold",
        isSelected ? "text-primary-foreground" : "text-white"
      )}>
        {seat.numeroAsiento}
      </span>

      {/* Indicador de parcial */}
      {isPartial && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white shadow-sm" />
      )}
    </button>
  );
}
