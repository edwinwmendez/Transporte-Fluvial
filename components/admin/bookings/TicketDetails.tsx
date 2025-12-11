'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Calendar, Clock, Ship, Ticket, QrCode } from 'lucide-react';
import type { Booking, Trip, Vessel, Route, Seat } from '@/lib/types';

interface TicketDetailsProps {
  booking: Booking;
  trip: Trip | null;
  vessel: Vessel | null;
  route: Route | null;
  seat: Seat | null;
  numeroTicket: string;
}

/**
 * Componente para mostrar los detalles del boleto
 */
export function TicketDetails({
  booking,
  trip,
  vessel,
  route,
  seat,
  numeroTicket,
}: TicketDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Detalles del Boleto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información del pasajero */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">Pasajero</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{booking.nombrePasajero}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>DNI: {booking.dniPasajero}</span>
              <span>•</span>
              <span>Tel: {booking.telefonoPasajero}</span>
            </div>
          </div>
        </div>

        {/* Información del viaje */}
        {trip && vessel && route && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase">Viaje</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-muted-foreground" />
                <span>{vessel.nombre}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {booking.origenIntermedio || route.origen} → {booking.destinoIntermedio || route.destino}
                </span>
              </div>
              {trip.fechaSalida && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {trip.fechaSalida.toDate
                      ? trip.fechaSalida.toDate().toLocaleDateString('es-PE', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Hora de salida: {trip.horaSalida}</span>
              </div>
              {seat && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Asiento:</span>
                  <Badge variant="outline" className="font-mono">
                    {seat.numeroAsiento}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Código QR */}
        {booking.boleto?.codigoQr && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Código QR
            </h3>
            <div className="flex justify-center p-4 rounded-lg border border-border bg-muted/20">
              <img
                src={booking.boleto.codigoQr}
                alt="Código QR del boleto"
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
