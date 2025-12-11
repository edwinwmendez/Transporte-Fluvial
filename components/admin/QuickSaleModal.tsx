'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Ticket, Wallet } from 'lucide-react';
import { useBookingForm } from '@/lib/hooks/useBookingForm';
import { useTicketGeneration } from '@/lib/hooks/useTicketGeneration';
import { usePaymentUpload } from '@/lib/hooks/usePaymentUpload';
import { useCreateBooking, useBuscarPasajeroPorDni } from '@/lib/hooks/useBookings';
import { useRoute } from '@/lib/hooks/useRoutes';
import { useAvailableDestinations } from '@/lib/hooks/useAvailableDestinations';
import type { Seat, Route, Booking } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { useUpdateBookingTicket } from '@/lib/hooks/useBookings';
import { PaymentScreenshotUploader } from './PaymentScreenshotUploader';
import { TicketPreviewModal } from './TicketPreviewModal';
import { PassengerForm } from './bookings/PassengerForm';
import { PaymentMethodSelector } from './bookings/PaymentMethodSelector';
import { DestinationSelector } from './bookings/DestinationSelector';
import { useToast } from '@/lib/hooks/useToast';
import { cn } from '@/lib/utils';
import { logError } from '@/lib/utils/logger';
import type { BookingFormErrors } from '@/lib/hooks/useBookingForm';

interface QuickSaleModalProps {
  tripId: string;
  rutaId: string;
  seat: Seat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  rutaPrecargada?: Route;
  bookingsPrecargados?: Booking[];
}

export function QuickSaleModal({
  tripId,
  rutaId,
  seat,
  open,
  onOpenChange,
  onComplete,
  rutaPrecargada,
  bookingsPrecargados,
}: QuickSaleModalProps) {
  const toast = useToast();
  const { data: ruta } = useRoute(rutaId);
  const createBookingMutation = useCreateBooking();
  const updateBookingTicketMutation = useUpdateBookingTicket();
  const { generateTicket, generating: generatingTicket } = useTicketGeneration();
  const { uploadScreenshot, uploading: uploadingScreenshot } = usePaymentUpload();

  const {
    formData,
    errors,
    updateField,
    setFormData,
    validate,
    reset,
    sanitizeData,
  } = useBookingForm();

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [ticketBooking, setTicketBooking] = useState<Booking | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [ticketWhatsapp, setTicketWhatsapp] = useState<string>('');

  const rutaActual = rutaPrecargada || ruta;

  // Usar hook para cargar destinos disponibles
  const { destinosDisponibles, puntoOrigen, loading: loadingDestinos } = useAvailableDestinations({
    tripId,
    seatId: seat.id,
    route: rutaActual || null,
    bookingsPrecargados,
    enabled: open && !!rutaActual && !!rutaId && !!tripId && !!seat.id,
  });

  // Establecer destino y monto inicial cuando se cargan los destinos
  useEffect(() => {
    if (destinosDisponibles.length > 0 && rutaActual && !formData.destinoIntermedio) {
      const primerDestino = destinosDisponibles[0];
      const montoInicial = primerDestino.esDestinoFinal
        ? rutaActual.precio || 0
        : primerDestino.precio;

      updateField('destinoIntermedio', primerDestino.nombre);
      updateField('monto', montoInicial > 0 ? montoInicial.toString() : '');
    }
  }, [destinosDisponibles, rutaActual, formData.destinoIntermedio, updateField]);

  const { data: pasajeroData, isLoading: buscandoPasajero } = useBuscarPasajeroPorDni(
    formData.dni.length === 8 ? formData.dni : null
  );

  useEffect(() => {
    if (pasajeroData && !formData.nombre) {
      updateField('nombre', pasajeroData.nombre || '');
      updateField('telefono', pasajeroData.telefono || '');
    }
  }, [pasajeroData, formData.nombre, updateField]);

  const handleDestinoChange = (destino: string) => {
    const destinoData = destinosDisponibles.find((d) => d.nombre === destino);
    const esDestinoFinal = destinoData?.esDestinoFinal || destino === rutaActual?.destino;

    updateField('destinoIntermedio', destino);

    if (esDestinoFinal) {
      if (rutaActual && rutaActual.precio > 0) {
        updateField('monto', rutaActual.precio.toString());
      }
    } else if (destinoData) {
      if (destinoData.precio > 0) {
        updateField('monto', destinoData.precio.toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!rutaActual) {
      toast.error('No se pudo cargar la información de la ruta');
      return;
    }

    try {
      const sanitizedData = sanitizeData();
      const monto = parseFloat(sanitizedData.monto);

      // Upload screenshot si es necesario
      // NOTA: El screenshot se sube ANTES de crear el booking, usando un ID temporal
      // Una vez creado el booking, el archivo ya está en Storage con el path correcto
      let screenshotData: { url: string; path: string } | null = null;
      if (
        (sanitizedData.metodoPago === 'yape' || sanitizedData.metodoPago === 'plin') &&
        screenshotFile
      ) {
        try {
          console.log('[QuickSale] Iniciando subida de screenshot', { tripId, metodoPago: sanitizedData.metodoPago, fileName: screenshotFile.name });
          const tempId = `temp_${Date.now()}`;
          screenshotData = await uploadScreenshot(screenshotFile, tripId, tempId);
          console.log('[QuickSale] Screenshot subido exitosamente', { url: screenshotData.url, path: screenshotData.path });
        } catch (uploadError) {
          console.error('[QuickSale] Error al subir screenshot', uploadError);
          logError('Error al subir screenshot', uploadError, { tripId });
          toast.error('Error al subir el comprobante. La venta se registrará sin comprobante.');
          // Continuar sin screenshot - no es crítico para crear el booking
        }
      } else if ((sanitizedData.metodoPago === 'yape' || sanitizedData.metodoPago === 'plin') && !screenshotFile) {
        console.warn('[QuickSale] Método de pago YAPE/PLIN sin screenshot - continuando sin comprobante');
      }

      // Generar ticket y QR
      console.log('[QuickSale] Iniciando generación de ticket', { tripId, seatId: seat.id });
      let numeroTicket: string;
      let codigoQr: string;
      try {
        const ticketData = await generateTicket({
          viajeId: tripId,
          asientoId: seat.id,
          dniPasajero: sanitizedData.dni,
          asientoNumero: seat.numeroAsiento,
        });
        numeroTicket = ticketData.numeroTicket;
        codigoQr = ticketData.codigoQr;
        console.log('[QuickSale] Ticket generado exitosamente', { numeroTicket });
      } catch (ticketError) {
        console.error('[QuickSale] Error al generar ticket', ticketError);
        logError('Error al generar ticket', ticketError, { tripId, seatId: seat.id });
        throw new Error('Error al generar el ticket. Por favor, intenta nuevamente.');
      }

      // Crear reserva
      console.log('[QuickSale] Iniciando creación de reserva', { tripId, seatId: seat.id });
      let bookingId: string;
      try {
        bookingId = await createBookingMutation.mutateAsync({
          viajeId: tripId,
          asientoId: seat.id,
          datosPasajero: {
            nombre: sanitizedData.nombre,
            dni: sanitizedData.dni,
            telefono: sanitizedData.telefono,
            whatsapp: sanitizedData.whatsapp || undefined,
            destinoIntermedio:
              sanitizedData.destinoIntermedio && sanitizedData.destinoIntermedio !== rutaActual.destino
                ? sanitizedData.destinoIntermedio
                : undefined,
            monto,
            metodoPago: sanitizedData.metodoPago,
            origenIntermedio: puntoOrigen !== rutaActual.origen ? puntoOrigen : undefined,
            screenshotUrl: screenshotData?.url,
            screenshotPath: screenshotData?.path,
          },
          ruta: rutaActual,
        });
        console.log('[QuickSale] Reserva creada exitosamente', { bookingId });
      } catch (bookingError) {
        console.error('[QuickSale] Error al crear reserva', bookingError);
        logError('Error al crear reserva', bookingError, { tripId, seatId: seat.id });
        throw bookingError;
      }

      // Actualizar reserva con boleto
      console.log('[QuickSale] Iniciando actualización de boleto', { bookingId });
      try {
        await updateBookingTicketMutation.mutateAsync({
          bookingId,
          boleto: {
            numeroTicket,
            codigoQr,
            estado: 'emitido',
            emitidoEn: Timestamp.now(),
          },
        });
        console.log('[QuickSale] Boleto actualizado exitosamente', { bookingId, numeroTicket });
      } catch (updateError) {
        console.error('[QuickSale] Error al actualizar boleto', updateError);
        logError('Error al actualizar boleto', updateError, { bookingId });
        // No lanzar error aquí, la reserva ya está creada
        toast.error('La reserva se creó pero hubo un error al actualizar el boleto.');
      }

      // Construir bookingData para preview
      const bookingData: Booking = {
        id: bookingId,
        viajeId: tripId,
        asientoId: seat.id,
        nombrePasajero: sanitizedData.nombre,
        dniPasajero: sanitizedData.dni,
        telefonoPasajero: sanitizedData.telefono,
        whatsappPasajero: sanitizedData.whatsapp || undefined,
        origenIntermedio: puntoOrigen !== rutaActual.origen ? puntoOrigen : undefined,
        destinoIntermedio:
          sanitizedData.destinoIntermedio !== rutaActual.destino
            ? sanitizedData.destinoIntermedio
            : undefined,
        estado: 'confirmado',
        pago: {
          monto,
          metodoPago: sanitizedData.metodoPago,
          estado: sanitizedData.metodoPago === 'efectivo' ? 'validado' : 'pendiente',
          validadoPor: sanitizedData.metodoPago === 'efectivo' ? 'sistema' : undefined,
          validadoEn:
            sanitizedData.metodoPago === 'efectivo' ? Timestamp.now() : undefined,
          screenshotUrl: screenshotData?.url,
          screenshotPath: screenshotData?.path,
        },
        boleto: {
          numeroTicket,
          codigoQr,
          estado: 'emitido',
          emitidoEn: Timestamp.now(),
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      setTicketBooking(bookingData);
      setTicketNumber(numeroTicket);
      setTicketWhatsapp(sanitizedData.whatsapp || '');
      setShowTicketPreview(true);

      reset();
      setScreenshotFile(null);
      toast.success('Venta registrada correctamente');
    } catch (error: unknown) {
      logError('Error al crear reserva', error, { tripId, seatId: seat.id });
      const errorMessage =
        error instanceof Error ? error.message : 'Error al registrar la venta. Intenta nuevamente.';
      toast.error(errorMessage);
    }
  };

  const loading =
    createBookingMutation.isPending ||
    updateBookingTicketMutation.isPending ||
    generatingTicket ||
    uploadingScreenshot ||
    loadingDestinos;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-border bg-background max-h-[90vh] flex flex-col">
          <div className="border-b border-border p-4 sm:p-6 bg-muted/30 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Emisión de Boleto
              </DialogTitle>
              <div className="mt-2 sm:mt-3 flex items-center gap-2">
                <Badge variant="default" className="px-3 py-1.5 text-xs font-bold tracking-wide">
                  ASIENTO {seat.numeroAsiento}
                </Badge>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(90vh-12rem)]">
              <PassengerForm
                formData={formData}
                errors={errors}
                onFieldChange={updateField}
                onDniBlur={() => {}}
                buscandoPasajero={buscandoPasajero}
              />

              {puntoOrigen && puntoOrigen !== rutaActual?.origen && (
                <Badge variant="info" className="text-xs font-medium">
                  Desde: {puntoOrigen}
                </Badge>
              )}

              <DestinationSelector
                destinos={destinosDisponibles}
                destinoSeleccionado={formData.destinoIntermedio}
                onDestinoChange={handleDestinoChange}
                monto={formData.monto}
                onMontoChange={(monto) => updateField('monto', monto)}
                errors={errors}
              />

              <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-5 rounded-xl border-2 border-border space-y-4 shadow-sm">
                <PaymentMethodSelector
                  metodoPago={formData.metodoPago}
                  onSelect={(method) => updateField('metodoPago', method)}
                  errors={errors}
                />
              </div>

              {(formData.metodoPago === 'yape' || formData.metodoPago === 'plin') && (
                <div className="space-y-2">
                  <PaymentScreenshotUploader
                    viajeId={tripId}
                    onFileSelect={(file) => setScreenshotFile(file)}
                    onUploadError={(errorMsg) => {
                      toast.error(`Error al subir comprobante: ${errorMsg}`);
                    }}
                    disabled={loading}
                  />
                </div>
              )}

              {errors.general && (
                <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error flex items-center gap-2">
                  <span className="font-semibold">Error:</span> {errors.general}
                </div>
              )}
            </div>

            <DialogFooter className="p-4 sm:p-6 bg-muted/30 border-t border-border flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || destinosDisponibles.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Emitiendo...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Confirmar Venta
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showTicketPreview && ticketBooking && (
        <TicketPreviewModal
          open={showTicketPreview}
          onOpenChange={(open) => {
            setShowTicketPreview(open);
            if (!open) {
              setTicketBooking(null);
              setTicketNumber('');
              setTicketWhatsapp('');
              onComplete();
              onOpenChange(false);
            }
          }}
          booking={ticketBooking}
          numeroTicket={ticketNumber}
          whatsappPasajero={ticketWhatsapp}
        />
      )}
    </>
  );
}
