"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingsForSeat, getTrip, getVessel, getRoute } from "@/lib/firestore-helpers";
import type { Seat, Booking, Trip, Vessel, Route } from "@/lib/firestore-helpers";
import { TicketPreviewModal } from "./TicketPreviewModal";
import { QuickSaleModal } from "./QuickSaleModal";
import { Loader2, User, Ticket, Plus, MapPin, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeatOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  seat: Seat;
  isCompletelyOccupied: boolean; // true = rojo, false = naranja
}

export function SeatOptionsModal({
  open,
  onOpenChange,
  tripId,
  seat,
  isCompletelyOccupied,
}: SeatOptionsModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [ticketPdfBlob, setTicketPdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (open) {
      loadData();
    } else {
      // Limpiar estado al cerrar
      setBookings([]);
      setSelectedBooking(null);
      setShowTicketPreview(false);
      setShowNewSaleModal(false);
      setTicketPdfBlob(null);
    }
  }, [open, tripId, seat.id]);

  async function loadData() {
    try {
      setLoading(true);
      const [bookingsData, tripData] = await Promise.all([
        getBookingsForSeat(tripId, seat.id),
        getTrip(tripId),
      ]);

      // Filtrar solo reservas confirmadas y ordenar por fecha de creación
      const bookingsConfirmadas = bookingsData.filter(b => b.estado === 'confirmado');
      setBookings(bookingsConfirmadas);
      setTrip(tripData);

      if (tripData) {
        const [vesselData, routeData] = await Promise.all([
          getVessel(tripData.embarcacionId),
          getRoute(tripData.rutaId),
        ]);
        setVessel(vesselData);
        setRoute(routeData);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleViewTicket = async (booking: Booking) => {
    // Verificar que el booking tenga boleto (numeroTicket y codigoQr)
    if (!booking.boleto?.numeroTicket) {
      alert("Este pasajero no tiene boleto disponible. El boleto se genera al confirmar la venta.");
      return;
    }

    try {
      // Mostrar el preview del boleto usando los datos del booking
      setSelectedBooking(booking);
      setShowTicketPreview(true);
    } catch (error: any) {
      console.error("Error al cargar boleto:", error);
      alert(error.message || "Error al cargar el boleto.");
    }
  };

  const handleAddNewPassenger = () => {
    setShowNewSaleModal(true);
    onOpenChange(false); // Cerrar este modal
  };

  const handleNewSaleComplete = () => {
    setShowNewSaleModal(false);
    loadData(); // Recargar datos para actualizar lista
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
            <DialogDescription>
              Cargando información del asiento...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando información del asiento...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              Asiento {seat.numeroAsiento}
            </DialogTitle>
            <DialogDescription>
              {isCompletelyOccupied
                ? "Este asiento está completamente ocupado. Selecciona un pasajero para ver su boleto."
                : "Este asiento tiene reservas parciales. Puedes ver boletos existentes o agregar un nuevo pasajero."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Información del viaje */}
            {trip && vessel && route && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Ruta:</span>
                      <span className="font-medium">{route.origen} → {route.destino}</span>
                    </div>
                    {trip.fechaSalida && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Fecha:</span>
                        <span className="font-medium">
                          {trip.fechaSalida.toDate ? trip.fechaSalida.toDate().toLocaleDateString('es-PE') : 'N/A'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Hora:</span>
                      <span className="font-medium">{trip.horaSalida}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
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
                <h3 className="text-lg font-semibold">
                  Pasajeros ({bookings.length})
                </h3>
                <div className="space-y-2">
                  {bookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className={cn(
                        "hover:bg-muted/50 transition-colors cursor-pointer",
                        selectedBooking?.id === booking.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleViewTicket(booking)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-lg">
                                {booking.nombrePasajero}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>DNI: {booking.dniPasajero}</span>
                              <span>•</span>
                              <span>Tel: {booking.telefonoPasajero}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Tramo:</span>
                              <span className="font-medium">
                                {booking.origenIntermedio || route?.origen || "N/A"} → {booking.destinoIntermedio || route?.destino || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Monto:</span>
                              <span className="font-semibold text-primary">
                                S/ {booking.pago?.monto?.toFixed(2) || "0.00"}
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
                                <Ticket className="h-3 w-3" />
                                <span>Boleto: {booking.boleto.numeroTicket}</span>
                                {booking.boleto.estado && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {booking.boleto.estado}
                                  </Badge>
                                )}
                                {booking.pago?.estado && (
                                  <Badge 
                                    variant={
                                      booking.pago.estado === 'validado' ? 'default' :
                                      booking.pago.estado === 'pendiente' ? 'secondary' :
                                      'destructive'
                                    }
                                    className="ml-1 text-xs"
                                  >
                                    {booking.pago.estado === 'validado' ? '✓ Pagado' :
                                     booking.pago.estado === 'pendiente' ? '⏳ Pendiente' :
                                     '✗ Rechazado'}
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
                          >
                            <Ticket className="h-4 w-4 mr-2" />
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
              <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2">Agregar Nuevo Pasajero</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Registra una venta para un tramo diferente en este asiento
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddNewPassenger}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Venta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mensaje si no hay pasajeros (no debería pasar, pero por si acaso) */}
            {bookings.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No hay reservas registradas para este asiento</p>
                  <Button onClick={handleAddNewPassenger} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
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
          numeroTicket={selectedBooking.boleto?.numeroTicket || ""}
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
          onOpenChange={(open) => {
            setShowNewSaleModal(open);
            if (!open) {
              // Al cerrar, recargar datos y volver a abrir este modal
              loadData();
              onOpenChange(true);
            }
          }}
          onComplete={handleNewSaleComplete}
        />
      )}
    </>
  );
}
