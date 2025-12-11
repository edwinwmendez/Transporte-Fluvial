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
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <span>Detalles del Boleto</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Información del pasajero */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Pasajero
          </h3>
          <div className="space-y-2.5 text-sm pl-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{booking.nombrePasajero}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="font-medium">DNI:</span>
                <span className="font-mono">{booking.dniPasajero}</span>
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1.5">
                <span className="font-medium">Tel:</span>
                <span>{booking.telefonoPasajero}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Información del viaje */}
        {trip && vessel && route && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <Ship className="h-4 w-4 text-primary" />
              Viaje
            </h3>
            <div className="space-y-3 text-sm pl-6">
              <div className="flex items-center gap-2.5">
                <Ship className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{vessel.nombre}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  <span className="font-semibold">{booking.origenIntermedio || route.origen}</span>
                  <span className="mx-2 text-muted-foreground">→</span>
                  <span className="font-semibold">{booking.destinoIntermedio || route.destino}</span>
                </span>
              </div>
              {trip.fechaSalida && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
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
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  <span className="text-muted-foreground">Hora de salida:</span>{' '}
                  <span className="font-semibold">{trip.horaSalida}</span>
                </span>
              </div>
              {seat && (
                <div className="flex items-center gap-2.5 pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Asiento:</span>
                  <Badge variant="default" className="font-mono text-sm px-2.5 py-1">
                    {seat.numeroAsiento}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Código QR */}
        {booking.boleto?.codigoQr && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              Código QR
            </h3>
            <div className="flex justify-center p-6 rounded-xl border-2 border-dashed border-border bg-background">
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
