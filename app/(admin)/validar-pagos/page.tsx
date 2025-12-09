"use client";

import { useEffect, useState } from "react";
import { getBookingsWithPendingPayments, validatePayment, getTrip, getRoute, getVessel, getSeatsForTrip } from "@/lib/firestore-helpers";
import type { Booking, Trip, Route, Vessel, Seat } from "@/lib/firestore-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Image as ImageIcon, Calendar, MapPin, User, Phone, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ValidarPagosPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'yape' | 'plin'>('todos');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const pendientes = await getBookingsWithPendingPayments();
      setBookings(pendientes);
    } catch (error) {
      console.error("Error al cargar pagos pendientes:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = filter === 'todos' 
    ? bookings 
    : bookings.filter(b => b.pago?.metodoPago === filter);

  const handleValidate = async (bookingId: string) => {
    try {
      setValidating(bookingId);
      // TODO: Obtener userId del admin autenticado
      const validadoPor = "admin-user-id"; // Temporal
      await validatePayment(bookingId, 'validado', validadoPor);
      await loadBookings(); // Recargar lista
    } catch (error: any) {
      console.error("Error al validar pago:", error);
      alert(error.message || "Error al validar el pago");
    } finally {
      setValidating(null);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectReason.trim()) {
      alert("Por favor ingresa una razón de rechazo");
      return;
    }

    try {
      setValidating(selectedBooking.id);
      // TODO: Obtener userId del admin autenticado
      const validadoPor = "admin-user-id"; // Temporal
      await validatePayment(selectedBooking.id, 'rechazado', validadoPor, rejectReason);
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedBooking(null);
      await loadBookings(); // Recargar lista
    } catch (error: any) {
      console.error("Error al rechazar pago:", error);
      alert(error.message || "Error al rechazar el pago");
    } finally {
      setValidating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando pagos pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validar Pagos</h1>
        <p className="text-muted-foreground mt-2">
          Revisa y valida los comprobantes de pago YAPE/PLIN
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'todos' ? 'default' : 'outline'}
          onClick={() => setFilter('todos')}
          size="sm"
        >
          Todos ({bookings.length})
        </Button>
        <Button
          variant={filter === 'yape' ? 'default' : 'outline'}
          onClick={() => setFilter('yape')}
          size="sm"
        >
          YAPE ({bookings.filter(b => b.pago?.metodoPago === 'yape').length})
        </Button>
        <Button
          variant={filter === 'plin' ? 'default' : 'outline'}
          onClick={() => setFilter('plin')}
          size="sm"
        >
          PLIN ({bookings.filter(b => b.pago?.metodoPago === 'plin').length})
        </Button>
      </div>

      {/* Lista de pagos pendientes */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              No hay pagos pendientes de validación
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <PaymentCard
              key={booking.id}
              booking={booking}
              onValidate={() => handleValidate(booking.id)}
              onReject={() => {
                setSelectedBooking(booking);
                setShowRejectDialog(true);
              }}
              validating={validating === booking.id}
            />
          ))}
        </div>
      )}

      {/* Dialog para rechazar */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Pago</DialogTitle>
            <DialogDescription>
              Ingresa la razón por la cual se rechaza este pago. El boleto será anulado automáticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="razon">Razón de rechazo *</Label>
              <Textarea
                id="razon"
                placeholder="Ej: Comprobante no coincide con el monto, imagen no legible, etc."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
                setSelectedBooking(null);
              }}
              disabled={validating !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={validating !== null || !rejectReason.trim()}
            >
              {validating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PaymentCardProps {
  booking: Booking;
  onValidate: () => void;
  onReject: () => void;
  validating: boolean;
}

function PaymentCard({ booking, onValidate, onReject, validating }: PaymentCardProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [tripData, seatsData] = await Promise.all([
          getTrip(booking.viajeId),
          getSeatsForTrip(booking.viajeId),
        ]);
        
        if (tripData) {
          setTrip(tripData);
          
          // Obtener ruta y embarcación en paralelo
          const [routeData, vesselData] = await Promise.all([
            getRoute(tripData.rutaId),
            getVessel(tripData.embarcacionId),
          ]);
          
          if (routeData) setRoute(routeData);
          if (vesselData) setVessel(vesselData);
        }
        
        // Buscar el asiento correspondiente
        const seatData = seatsData.find(s => s.id === booking.asientoId);
        if (seatData) setSeat(seatData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [booking.viajeId, booking.asientoId]);

  const metodoPago = booking.pago?.metodoPago || 'efectivo';
  const monto = booking.pago?.monto || 0;
  const screenshotUrl = booking.pago?.screenshotUrl;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {booking.nombrePasajero}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-xs">
              <span>DNI: {booking.dniPasajero}</span>
              <span>•</span>
              <span>{booking.telefonoPasajero}</span>
            </CardDescription>
          </div>
          <Badge
            variant={metodoPago === 'yape' ? 'default' : 'secondary'}
            className={cn(
              metodoPago === 'yape' && "bg-purple-500/10 text-purple-600 border-purple-500/20",
              metodoPago === 'plin' && "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
            )}
          >
            {metodoPago.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información del viaje */}
        {!loading && trip && route && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {booking.origenIntermedio || route.origen} → {booking.destinoIntermedio || route.destino}
              </span>
            </div>
            {trip.fechaSalida && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {trip.fechaSalida.toDate ? trip.fechaSalida.toDate().toLocaleDateString('es-PE') : 'N/A'} - {trip.horaSalida}
                </span>
              </div>
            )}
            {seat && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-semibold">Asiento:</span>
                <Badge variant="outline" className="font-mono">
                  {seat.numeroAsiento}
                </Badge>
              </div>
            )}
            {vessel && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-semibold">Embarcación:</span>
                <span>{vessel.nombre}</span>
              </div>
            )}
          </div>
        )}

        {/* Monto */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
          <span className="text-sm font-medium text-muted-foreground">Monto</span>
          <span className="text-xl font-bold text-foreground">S/ {monto.toFixed(2)}</span>
        </div>

        {/* Screenshot del comprobante */}
        {screenshotUrl ? (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">
              Comprobante
            </Label>
            <div 
              className="relative rounded-lg border-2 border-border overflow-hidden bg-muted/20 group cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={screenshotUrl}
                alt="Comprobante de pago"
                className="w-full h-48 object-contain"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-white/0 group-hover:text-white/80 transition-colors" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Clic para ampliar
            </p>
            
            {/* Modal para ampliar imagen */}
            <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-4">
                  <DialogTitle>Comprobante de Pago</DialogTitle>
                  <DialogDescription>
                    {booking.nombrePasajero} - {metodoPago.toUpperCase()}
                  </DialogDescription>
                </DialogHeader>
                <div className="p-6 pt-0 overflow-auto">
                  <img
                    src={screenshotUrl}
                    alt="Comprobante de pago ampliado"
                    className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/20 p-8 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Sin comprobante</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onReject}
            disabled={validating}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rechazar
          </Button>
          <Button
            className="flex-1"
            onClick={onValidate}
            disabled={validating}
          >
            {validating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Validar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
