'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Calendar, Clock, Ship, CheckCircle2, Loader2, QrCode } from 'lucide-react';
import type { Booking } from '@/lib/types';
import { useTrip } from '@/lib/hooks/useTrips';
import { useVessel } from '@/lib/hooks/useVessels';
import { useRoute } from '@/lib/hooks/useRoutes';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface BookingDetailsProps {
  booking: Booking;
  onMarkAsUsed: () => void;
  marking: boolean;
}

/**
 * Componente para mostrar los detalles de un boleto encontrado
 */
export function BookingDetails({ booking, onMarkAsUsed, marking }: BookingDetailsProps) {
  const { data: trip, isLoading: loadingTrip } = useTrip(booking.viajeId);
  const { data: vessel, isLoading: loadingVessel } = useVessel(trip?.embarcacionId || null);
  const { data: route, isLoading: loadingRoute } = useRoute(trip?.rutaId || null);

  const loading = loadingTrip || loadingVessel || loadingRoute;

  if (loading) {
    return <LoadingSpinner size="lg" text="Cargando detalles del boleto..." />;
  }

  if (!trip || !vessel || !route) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No se pudieron cargar los detalles del viaje</p>
        </CardContent>
      </Card>
    );
  }

  const fechaSalida = trip.fechaSalida?.toDate
    ? trip.fechaSalida.toDate()
    : trip.fechaSalida instanceof Date
      ? trip.fechaSalida
      : new Date();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" aria-hidden="true" />
                {booking.nombrePasajero}
              </CardTitle>
              <CardDescription className="mt-1">
                DNI: {booking.dniPasajero} • Tel: {booking.telefonoPasajero}
              </CardDescription>
            </div>
            <Badge
              variant={
                booking.estado === 'confirmado'
                  ? 'default'
                  : booking.estado === 'embarcado'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {booking.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Ruta:</span>
              <span className="font-medium">
                {booking.origenIntermedio || route.origen} → {booking.destinoIntermedio || route.destino}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">{fechaSalida.toLocaleDateString('es-PE')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Hora:</span>
              <span className="font-medium">{trip.horaSalida}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Embarcación:</span>
              <span className="font-medium">{vessel.nombre}</span>
            </div>
          </div>

          {booking.boleto && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Boleto:</span>
                <Badge variant="outline">{booking.boleto.numeroTicket}</Badge>
              </div>
              {booking.boleto.codigoQr && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <QrCode className="h-3 w-3" aria-hidden="true" />
                  <span>Código QR disponible</span>
                </div>
              )}
              {booking.boleto.estado && (
                <Badge
                  variant={booking.boleto.estado === 'emitido' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {booking.boleto.estado}
                </Badge>
              )}
            </div>
          )}

          {booking.pago && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pago:</span>
                <span className="font-semibold text-primary">S/ {booking.pago.monto?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Método:</span>
                <Badge variant="outline" className="text-xs">
                  {booking.pago.metodoPago?.toUpperCase() || 'EFECTIVO'}
                </Badge>
                {booking.pago.estado && (
                  <Badge
                    variant={
                      booking.pago.estado === 'validado'
                        ? 'default'
                        : booking.pago.estado === 'pendiente'
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="text-xs"
                  >
                    {booking.pago.estado}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {booking.estado === 'confirmado' && booking.boleto?.estado === 'emitido' && (
            <Button onClick={onMarkAsUsed} disabled={marking} className="w-full" aria-label="Marcar boleto como usado">
              {marking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Marcando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Marcar como Usado (Embarcado)
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
