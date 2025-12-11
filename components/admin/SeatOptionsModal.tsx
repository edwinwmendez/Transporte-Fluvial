'use client';

import { Calendar, Clock, MapPin, Plus, Ticket, User } from 'lucide-react';
import { useState } from 'react';

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBookingsForSeat } from '@/lib/hooks/useBookings';
import { useRoute } from '@/lib/hooks/useRoutes';
import { useToast } from '@/lib/hooks/useToast';
import { useTrip } from '@/lib/hooks/useTrips';
import { useVessel } from '@/lib/hooks/useVessels';
import type { Booking, Seat } from '@/lib/types';
import { cn } from '@/lib/utils';

import { QuickSaleModal } from './QuickSaleModal';
import { TicketPreviewModal } from './TicketPreviewModal';

interface SeatOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  seat: Seat;
  isCompletelyOccupied: boolean; // true = rojo, false = naranja
}

/**
 * Modal para ver y gestionar las reservas de un asiento específico
 *
 * Muestra:
 * - Información del viaje (ruta, fecha, hora, embarcación)
 * - Lista de pasajeros confirmados en el asiento
 * - Opción para ver boletos
 * - Opción para agregar nuevo pasajero (si el asiento no está completamente ocupado)
 */
export function SeatOptionsModal({
  open,
  onOpenChange,
  tripId,
  seat,
  isCompletelyOccupied,
}: SeatOptionsModalProps) {
  const toast = useToast();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);

  // Cargar datos con React Query
  const { data: bookingsData = [], isLoading: loadingBookings } = useBookingsForSeat(
    open ? tripId : null,
    open ? seat.id : null
  );
  const { data: trip, isLoading: loadingTrip } = useTrip(open ? tripId : null);
  const { data: vessel, isLoading: loadingVessel } = useVessel(trip?.embarcacionId || null);
  const { data: route, isLoading: loadingRoute } = useRoute(trip?.rutaId || null);

  // Filtrar solo reservas confirmadas y ordenar por fecha de creación
  const bookings = bookingsData.filter((b) => b.estado === 'confirmado');

  const loading = loadingBookings || loadingTrip || loadingVessel || loadingRoute;

  const handleViewTicket = (booking: Booking) => {
    if (!booking.boleto?.numeroTicket) {
      toast.error(
        'Este pasajero no tiene boleto disponible. El boleto se genera al confirmar la venta.'
      );
      return;
    }

    setSelectedBooking(booking);
    setShowTicketPreview(true);
  };

  const handleAddNewPassenger = () => {
    setShowNewSaleModal(true);
    // No cerrar el modal padre para mantener los datos cargados (trip, vessel, route)
    // El QuickSaleModal se mostrará encima
  };

  const handleNewSaleComplete = () => {
    setShowNewSaleModal(false);
    // El SeatOptionsModal sigue abierto, mostrándose de nuevo
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              Asiento {seat.numeroAsiento}
            </DialogTitle>
            <DialogDescription>Cargando información del asiento...</DialogDescription>
          </DialogHeader>
          <LoadingSpinner size="lg" text="Cargando información del asiento..." />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open && !showNewSaleModal} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              Asiento {seat.numeroAsiento}
            </DialogTitle>
            <DialogDescription>
              {isCompletelyOccupied
                ? 'Este asiento está completamente ocupado. Selecciona un pasajero para ver su boleto.'
                : 'Este asiento tiene reservas parciales. Puedes ver boletos existentes o agregar un nuevo pasajero.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Información del viaje */}
            {trip && vessel && route && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-muted-foreground">Ruta:</span>
                      <span className="font-medium">
                        {route.origen} → {route.destino}
                      </span>
                    </div>
                    {trip.fechaSalida && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-muted-foreground">Fecha:</span>
                        <span className="font-medium">
                          {trip.fechaSalida.toDate
                            ? trip.fechaSalida.toDate().toLocaleDateString('es-PE')
                            : 'N/A'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-muted-foreground">Hora:</span>
                      <span className="font-medium">{trip.horaSalida}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-muted-foreground">Embarcación:</span>
                      <span className="font-medium">{vessel.nombre}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de pasajeros */}
            {bookings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Pasajeros ({bookings.length})</h3>
                <div className="space-y-2">
                  {bookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className={cn(
                        'hover:bg-muted/50 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer',
                        selectedBooking?.id === booking.id &&
                          'ring-2 ring-primary border-primary/30 shadow-md'
                      )}
                      onClick={() => handleViewTicket(booking)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleViewTicket(booking);
                        }
                      }}
                      aria-label={`Ver boleto de ${booking.nombrePasajero}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              <span className="font-semibold text-lg">
                                {booking.nombrePasajero}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>DNI: {booking.dniPasajero}</span>
                              <span aria-hidden="true">•</span>
                              <span>Tel: {booking.telefonoPasajero}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin
                                className="h-3 w-3 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <span className="text-muted-foreground">Tramo:</span>
                              <span className="font-medium">
                                {booking.origenIntermedio || route?.origen || 'N/A'} →{' '}
                                {booking.destinoIntermedio || route?.destino || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Monto:</span>
                              <span className="font-semibold text-primary">
                                S/ {booking.pago?.monto?.toFixed(2) || '0.00'}
                              </span>
                              <Badge
                                variant={
                                  booking.pago?.metodoPago === 'efectivo'
                                    ? 'default'
                                    : booking.pago?.metodoPago === 'yape'
                                      ? 'secondary'
                                      : 'outline'
                                }
                                className="ml-2"
                              >
                                {booking.pago?.metodoPago?.toUpperCase() || 'EFECTIVO'}
                              </Badge>
                            </div>
                            {booking.boleto?.numeroTicket ? (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Ticket className="h-3 w-3" aria-hidden="true" />
                                <span>Boleto: {booking.boleto.numeroTicket}</span>
                                {booking.boleto.estado && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {booking.boleto.estado}
                                  </Badge>
                                )}
                                {booking.pago?.estado && (
                                  <Badge
                                    variant={
                                      booking.pago.estado === 'validado'
                                        ? 'default'
                                        : booking.pago.estado === 'pendiente'
                                          ? 'secondary'
                                          : 'destructive'
                                    }
                                    className="ml-1 text-xs"
                                  >
                                    {booking.pago.estado === 'validado'
                                      ? '✓ Pagado'
                                      : booking.pago.estado === 'pendiente'
                                        ? '⏳ Pendiente'
                                        : '✗ Rechazado'}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-amber-600 italic">
                                Boleto pendiente de emisión
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTicket(booking);
                            }}
                            disabled={!booking.boleto?.numeroTicket}
                            aria-label={`Ver boleto de ${booking.nombrePasajero}`}
                          >
                            <Ticket className="h-4 w-4 mr-2" aria-hidden="true" />
                            Ver Boleto
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Opción para agregar nuevo pasajero (solo para asientos parciales) */}
            {!isCompletelyOccupied && (
              <Card className="border-dashed border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary/60 hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Agregar Nuevo Pasajero
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Registra una venta para un tramo diferente en este asiento
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddNewPassenger} aria-label="Agregar nuevo pasajero">
                      <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                      Nueva Venta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mensaje si no hay pasajeros */}
            {bookings.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No hay reservas registradas para este asiento
                  </p>
                  <Button
                    onClick={handleAddNewPassenger}
                    className="mt-4"
                    aria-label="Registrar primera venta"
                  >
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Registrar Primera Venta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de preview del boleto */}
      {showTicketPreview && selectedBooking && (
        <TicketPreviewModal
          open={showTicketPreview}
          onOpenChange={(open) => {
            setShowTicketPreview(open);
            if (!open) {
              setSelectedBooking(null);
            }
          }}
          booking={selectedBooking}
          numeroTicket={selectedBooking.boleto?.numeroTicket || ''}
          whatsappPasajero={selectedBooking.whatsappPasajero}
        />
      )}

      {/* Modal de nueva venta */}
      {showNewSaleModal && trip && (
        <QuickSaleModal
          tripId={tripId}
          rutaId={trip.rutaId}
          seat={seat}
          open={showNewSaleModal}
          onOpenChange={setShowNewSaleModal}
          onComplete={handleNewSaleComplete}
        />
      )}
    </>
  );
}
