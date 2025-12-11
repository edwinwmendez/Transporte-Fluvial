'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Image as ImageIcon, Calendar, MapPin, User, Phone, DollarSign } from 'lucide-react';
import type { Booking } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PaymentCardProps {
  booking: Booking;
  onValidate: () => void;
  onReject: () => void;
  validating?: boolean;
}

/**
 * Tarjeta para mostrar información de un pago pendiente
 */
export function PaymentCard({
  booking,
  onValidate,
  onReject,
  validating = false,
}: PaymentCardProps) {
  const metodoPago = booking.pago?.metodoPago || 'efectivo';
  const monto = booking.pago?.monto || 0;
  const screenshotUrl = booking.pago?.screenshotUrl;

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {booking.nombrePasajero}
            </CardTitle>
            <CardDescription className="mt-1">
              DNI: {booking.dniPasajero} • Tel: {booking.telefonoPasajero}
            </CardDescription>
          </div>
          <Badge
            variant={metodoPago === 'yape' ? 'default' : metodoPago === 'plin' ? 'secondary' : 'outline'}
          >
            {metodoPago.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Monto:
            </span>
            <span className="font-semibold text-lg">S/ {monto.toFixed(2)}</span>
          </div>

          {booking.origenIntermedio || booking.destinoIntermedio ? (
            <div className="text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Tramo:
              </span>
              <span className="font-medium ml-5">
                {booking.origenIntermedio || 'Origen'} → {booking.destinoIntermedio || 'Destino'}
              </span>
            </div>
          ) : null}

          {screenshotUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Comprobante:
              </Label>
              <a
                href={screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={screenshotUrl}
                  alt="Comprobante de pago"
                  className="w-full h-auto rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              onClick={onValidate}
              disabled={validating}
              className="flex-1"
              aria-label={`Validar pago de ${booking.nombrePasajero}`}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" aria-hidden="true" />
              Validar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onReject}
              disabled={validating}
              className="flex-1"
              aria-label={`Rechazar pago de ${booking.nombrePasajero}`}
            >
              <XCircle className="h-4 w-4 mr-1" aria-hidden="true" />
              Rechazar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
