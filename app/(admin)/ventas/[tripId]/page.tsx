'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTrip } from '@/lib/hooks/useTrips';
import { useVessel } from '@/lib/hooks/useVessels';
import { getBookingsForSeat } from '@/lib/api/bookings.api';
import { getRoute } from '@/lib/api/routes.api';
import { estaAsientoCompletamenteOcupado } from '@/lib/api/bookings.api';
import type { Seat, Route, Booking } from '@/lib/types';
import { formatFirestoreDate } from '@/lib/types/common.types';
import { SeatMap } from '@/components/admin/SeatMap';
import { QuickSaleModal } from '@/components/admin/QuickSaleModal';
import { SeatOptionsModal } from '@/components/admin/SeatOptionsModal';
import { CashSummaryCard } from '@/components/admin/CashSummaryCard';
import { ManifestButton } from '@/components/admin/ManifestButton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logError } from '@/lib/utils/logger';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { handleError } from '@/lib/utils/error-handler';
import { useToast } from '@/lib/hooks/useToast';

/**
 * Página de gestión de ventas para un viaje específico
 * 
 * Permite:
 * - Ver mapa de asientos interactivo
 * - Realizar ventas rápidas
 * - Ver detalles de asientos ocupados
 * - Ver cuadre de caja en tiempo real
 * - Generar manifiesto de pasajeros
 */
export default function VentasPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const tripId = params.tripId as string;

  const { data: trip, isLoading: loadingTrip } = useTrip(tripId);
  const { data: vessel, isLoading: loadingVessel } = useVessel(trip?.embarcacionId || null);

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showSeatOptionsModal, setShowSeatOptionsModal] = useState(false);
  const [selectedSeatState, setSelectedSeatState] = useState<'available' | 'partial' | 'sold'>('available');
  const [cachedRoute, setCachedRoute] = useState<Route | null>(null);
  const [cachedBookings, setCachedBookings] = useState<Booking[]>([]);

  const loading = loadingTrip || loadingVessel;

  const handleSeatClick = async (seat: Seat) => {
    if (!trip) return;

    setSelectedSeat(seat);

    try {
      // Obtener bookings y ruta en paralelo
      let ruta = cachedRoute && cachedRoute.id === trip.rutaId ? cachedRoute : null;
      
      if (!ruta) {
        ruta = await getRoute(trip.rutaId);
        if (ruta) {
          setCachedRoute(ruta);
        }
      }

      const bookings = await getBookingsForSeat(trip.id, seat.id);

      if (!ruta) {
        setSelectedSeatState('available');
        setCachedBookings([]);
        setShowSaleModal(true);
        return;
      }

      setCachedBookings(bookings);

      if (bookings.length === 0) {
        setSelectedSeatState('available');
        setShowSaleModal(true);
      } else {
        const completamenteOcupado = estaAsientoCompletamenteOcupado(bookings, ruta);

        if (completamenteOcupado) {
          setSelectedSeatState('sold');
          setShowSeatOptionsModal(true);
        } else {
          setSelectedSeatState('partial');
          setShowSeatOptionsModal(true);
        }
      }
    } catch (error) {
      logError('Error al cargar datos del asiento', error, { tripId, seatId: seat.id });
      const message = handleError(error, { action: 'loadSeatData', tripId, seatId: seat.id });
      toast.error(message);
    }
  };

  const handleSaleComplete = () => {
    setSelectedSeat(null);
    setShowSaleModal(false);
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Cargando viaje..." />;
  }

  if (!trip || !vessel) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <EmptyState
          icon={ArrowLeft}
          title="Viaje no encontrado"
          description="El viaje solicitado no existe o no está disponible"
          action={{
            label: 'Volver al Dashboard',
            onClick: () => router.push('/dashboard'),
          }}
        />
      </div>
    );
  }

  const fechaSalida = trip.fechaSalida?.toDate
    ? trip.fechaSalida.toDate()
    : trip.fechaSalida instanceof Date
      ? trip.fechaSalida
      : new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4" aria-label="Volver al dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Volver
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Ventas</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {vessel.nombre} - {fechaSalida.toLocaleDateString('es-PE')} {trip.horaSalida}
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
                Haz clic en un asiento: Verde para nueva venta, Naranja para ver boletos o agregar pasajero, Rojo
                para ver boletos
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
          onOpenChange={(open) => {
            setShowSaleModal(open);
            if (!open) {
              setSelectedSeat(null);
            }
          }}
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
