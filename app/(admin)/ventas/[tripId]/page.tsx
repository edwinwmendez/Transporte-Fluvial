"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTrip, getVessel } from "@/lib/firestore-helpers";
import type { Trip, Vessel } from "@/lib/firestore-helpers";
import { SeatMap } from "@/components/admin/SeatMap";
import { QuickSaleModal } from "@/components/admin/QuickSaleModal";
import { SeatOptionsModal } from "@/components/admin/SeatOptionsModal";
import { CashSummaryCard } from "@/components/admin/CashSummaryCard";
import { ManifestButton } from "@/components/admin/ManifestButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingsForSeat, getRoute, estaAsientoCompletamenteOcupado } from "@/lib/firestore-helpers";
import type { Seat, Route, Booking } from "@/lib/firestore-helpers";

export default function VentasPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showSeatOptionsModal, setShowSeatOptionsModal] = useState(false);
  const [selectedSeatState, setSelectedSeatState] = useState<'available' | 'partial' | 'sold'>('available');
  const [cachedRoute, setCachedRoute] = useState<Route | null>(null);
  const [cachedBookings, setCachedBookings] = useState<Booking[]>([]);

  useEffect(() => {
    async function loadTripData() {
      try {
        setLoading(true);
        const tripData = await getTrip(tripId);
        if (!tripData) {
          console.error("Viaje no encontrado");
          return;
        }
        setTrip(tripData);

        const vesselData = await getVessel(tripData.embarcacionId);
        setVessel(vesselData);
      } catch (error) {
        console.error("Error al cargar datos del viaje:", error);
      } finally {
        setLoading(false);
      }
    }

    if (tripId) {
      loadTripData();
    }
  }, [tripId]);

  const handleSeatClick = async (seat: Seat) => {
    if (!trip) return;

    setSelectedSeat(seat);

    // OPTIMIZACIÓN: Obtener ruta y bookings en paralelo
    const [bookings, ruta] = await Promise.all([
      getBookingsForSeat(trip.id, seat.id),
      // Usar ruta en caché si está disponible (mismo viaje = misma ruta)
      cachedRoute && cachedRoute.id === trip.rutaId 
        ? Promise.resolve(cachedRoute)
        : getRoute(trip.rutaId).then(route => {
            if (route) setCachedRoute(route);
            return route;
          }),
    ]);

    if (!ruta) {
      // Si no hay ruta, tratar como disponible
      setSelectedSeatState('available');
      setCachedBookings([]);
      setShowSaleModal(true);
      return;
    }

    // Guardar en caché para el modal
    setCachedBookings(bookings);

    // Determinar estado del asiento
    if (bookings.length === 0) {
      // Disponible - abrir modal de venta
      setSelectedSeatState('available');
      setShowSaleModal(true);
    } else {
      // Verificar si está completamente ocupado
      const completamenteOcupado = estaAsientoCompletamenteOcupado(bookings, ruta);
      
      if (completamenteOcupado) {
        // Rojo - completamente ocupado - abrir modal de opciones para ver boletos
        setSelectedSeatState('sold');
        setShowSeatOptionsModal(true);
      } else {
        // Naranja - parcialmente ocupado - abrir modal de opciones (ver boletos o agregar)
        setSelectedSeatState('partial');
        setShowSeatOptionsModal(true);
      }
    }
  };

  const handleSaleComplete = () => {
    setSelectedSeat(null);
    setShowSaleModal(false);
  };

  const handleCloseModal = (open: boolean) => {
    setShowSaleModal(open);
    // Si se cierra el modal (open = false), resetear el asiento seleccionado
    if (!open) {
      setSelectedSeat(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando viaje...</p>
        </div>
      </div>
    );
  }

  if (!trip || !vessel) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Viaje no encontrado</p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Gestión de Ventas</h1>
          <p className="text-muted-foreground mt-2">
            {vessel.nombre} - {formatDate(trip.fechaSalida)} {trip.horaSalida}
          </p>
        </div>
        <ManifestButton tripId={tripId} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mapa de Asientos - Ocupa 2 columnas */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Mapa de Asientos</CardTitle>
              <CardDescription className="text-base">
                Haz clic en un asiento: Verde para nueva venta, Naranja para ver boletos o agregar pasajero, Rojo para ver boletos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <SeatMap
                tripId={tripId}
                rutaId={trip.rutaId}
                rows={vessel.filas}
                columns={vessel.columnas}
                onSeatClick={handleSeatClick}
                selectedSeatId={selectedSeat?.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Cuadre de Caja - 1 columna */}
        <div className="lg:col-span-1">
          <CashSummaryCard tripId={tripId} />
        </div>
      </div>

      {/* Modal de Venta Rápida (solo para asientos disponibles) */}
      {showSaleModal && selectedSeat && trip && selectedSeatState === 'available' && (
        <QuickSaleModal
          tripId={tripId}
          rutaId={trip.rutaId}
          seat={selectedSeat}
          open={showSaleModal}
          onOpenChange={handleCloseModal}
          onComplete={handleSaleComplete}
          rutaPrecargada={cachedRoute || undefined}
          bookingsPrecargados={cachedBookings}
        />
      )}

      {/* Modal de Opciones de Asiento (para asientos rojos y naranjas) */}
      {showSeatOptionsModal && selectedSeat && trip && (
        <SeatOptionsModal
          open={showSeatOptionsModal}
          onOpenChange={(open) => {
            setShowSeatOptionsModal(open);
            if (!open) {
              setSelectedSeat(null);
            }
          }}
          tripId={tripId}
          seat={selectedSeat}
          isCompletelyOccupied={selectedSeatState === 'sold'}
        />
      )}
    </div>
  );
}
