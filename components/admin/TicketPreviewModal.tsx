'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMarkTicketAsUsed } from '@/lib/hooks/useBookings';
import { useTicketData } from '@/lib/hooks/useTicketData';
import { useToast } from '@/lib/hooks/useToast';
import { downloadFile } from '@/lib/storage-helpers';
import { generateTicketPDF, type TicketData } from '@/lib/ticket-generator';
import type { Booking } from '@/lib/types';
import { handleError } from '@/lib/utils/error-handler';

import { TicketActions } from './bookings/TicketActions';
import { TicketDetails } from './bookings/TicketDetails';

interface TicketPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  numeroTicket: string;
  whatsappPasajero?: string;
}

/**
 * Modal para previsualizar y gestionar un boleto digital
 *
 * Permite:
 * - Ver detalles del boleto (pasajero, viaje, QR)
 * - Descargar PDF
 * - Imprimir
 * - Compartir por WhatsApp
 * - Marcar como usado (embarcado)
 */
export function TicketPreviewModal({
  open,
  onOpenChange,
  booking,
  numeroTicket,
  whatsappPasajero,
}: TicketPreviewModalProps) {
  const toast = useToast();
  const { trip, vessel, route, seat, loading } = useTicketData(booking, open && !!booking);
  const markTicketAsUsed = useMarkTicketAsUsed();

  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const boletoEstado = booking?.boleto?.estado || 'emitido';
  const puedeMarcar = boletoEstado === 'emitido' && booking?.estado !== 'embarcado';

  const handleDownload = async () => {
    if (!booking || !trip || !vessel || !route || !seat) {
      toast.error('No hay datos suficientes para generar el PDF');
      return;
    }

    try {
      setGeneratingPDF(true);

      const ticketData: TicketData = {
        numeroTicket,
        pasajero: {
          nombre: booking.nombrePasajero,
          dni: booking.dniPasajero,
          telefono: booking.telefonoPasajero,
          whatsapp: booking.whatsappPasajero,
        },
        viaje: trip,
        embarcacion: vessel,
        ruta: route,
        asiento: seat,
        origen: booking.origenIntermedio || route.origen,
        destino: booking.destinoIntermedio || route.destino,
        monto: booking.pago?.monto || 0,
        metodoPago: booking.pago?.metodoPago || 'efectivo',
        fechaEmision: booking.boleto?.emitidoEn?.toDate
          ? booking.boleto.emitidoEn.toDate()
          : new Date(),
      };

      const blob = await generateTicketPDF(ticketData);
      setPdfBlob(blob);
      downloadFile(blob, `boleto_${numeroTicket}.pdf`);
      toast.success('PDF descargado correctamente');
    } catch (error) {
      const message = handleError(error, { action: 'downloadTicketPDF', bookingId: booking?.id });
      toast.error(message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } else {
      toast.error('Primero debe generar el PDF');
    }
  };

  const handleShare = async () => {
    if (!whatsappPasajero) {
      toast.error('No hay número de WhatsApp disponible');
      return;
    }

    if (!booking || !trip || !vessel || !route || !seat) {
      toast.error('No hay datos suficientes para compartir');
      return;
    }

    try {
      setGeneratingPDF(true);

      const ticketData: TicketData = {
        numeroTicket,
        pasajero: {
          nombre: booking.nombrePasajero,
          dni: booking.dniPasajero,
          telefono: booking.telefonoPasajero,
          whatsapp: booking.whatsappPasajero,
        },
        viaje: trip,
        embarcacion: vessel,
        ruta: route,
        asiento: seat,
        origen: booking.origenIntermedio || route.origen,
        destino: booking.destinoIntermedio || route.destino,
        monto: booking.pago?.monto || 0,
        metodoPago: booking.pago?.metodoPago || 'efectivo',
        fechaEmision: booking.boleto?.emitidoEn?.toDate
          ? booking.boleto.emitidoEn.toDate()
          : new Date(),
      };

      const blob = await generateTicketPDF(ticketData);
      const url = URL.createObjectURL(blob);
      const whatsappUrl = `https://wa.me/51${whatsappPasajero}?text=Tu%20boleto%20${numeroTicket}`;
      window.open(whatsappUrl, '_blank');

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 500);
      toast.success('Boleto compartido por WhatsApp');
    } catch (error) {
      const message = handleError(error, { action: 'shareTicket', bookingId: booking?.id });
      toast.error(message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleMarkAsUsed = async () => {
    if (!booking) return;

    try {
      await markTicketAsUsed.mutateAsync(booking.id);
      toast.success('Boleto marcado como usado');
      onOpenChange(false);
    } catch (error) {
      const message = handleError(error, { action: 'markTicketAsUsed', bookingId: booking.id });
      toast.error(message);
    }
  };

  const isLoading = loading || generatingPDF || markTicketAsUsed.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista Previa del Boleto</DialogTitle>
          <DialogDescription>
            {numeroTicket} - {booking?.nombrePasajero}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : booking && trip && vessel && route && seat ? (
          <div className="space-y-6">
            <TicketDetails
              booking={booking}
              trip={trip}
              vessel={vessel}
              route={route}
              seat={seat}
              numeroTicket={numeroTicket}
            />

            <TicketActions
              onDownload={handleDownload}
              onPrint={handlePrint}
              onShare={handleShare}
              onMarkAsUsed={puedeMarcar ? handleMarkAsUsed : undefined}
              canMarkAsUsed={puedeMarcar}
              loading={isLoading}
              marking={markTicketAsUsed.isPending}
              hasPDF={!!booking.boleto?.pdfUrl}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se pudieron cargar los datos del boleto</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
