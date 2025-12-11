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
import { Download, Eye, Loader2, FileSpreadsheet, Printer } from 'lucide-react';
import { generateManifestPDF } from '@/lib/pdf-generator';
import { useRoute } from '@/lib/hooks/useRoutes';
import type { Booking, Trip, Vessel, Seat, Route } from '@/lib/types';
import { logError } from '@/lib/utils/logger';
import type { FirestoreTimestamp } from '@/lib/types/common.types';
import { formatFirestoreDate } from '@/lib/types/common.types';
import { useToast } from '@/lib/hooks/useToast';
import { handleError } from '@/lib/utils/error-handler';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ManifestPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  vessel: Vessel;
  bookings: Booking[];
  seats: Seat[];
  route?: Route | null;
}

/**
 * Modal para previsualizar y descargar el manifiesto de pasajeros en PDF
 * 
 * Permite:
 * - Ver preview del manifiesto
 * - Descargar PDF
 * - Imprimir PDF
 */
export function ManifestPreviewModal({
  open,
  onOpenChange,
  trip,
  vessel,
  bookings,
  seats,
  route: routeProp,
}: ManifestPreviewModalProps) {
  const toast = useToast();
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);

  // Cargar ruta con React Query si no viene como prop
  const { data: route, isLoading: loadingRoute } = useRoute(
    open && !routeProp && trip.rutaId ? trip.rutaId : null
  );

  const routeData = routeProp || route;

  useEffect(() => {
    if (open && bookings.length > 0 && routeData) {
      generatePDFBlob();
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, bookings.length, trip.rutaId, routeData]);

  const generatePDFBlob = async () => {
    if (!routeData) return;

    try {
      setGenerating(true);

      const blob = await generateManifestPDF({
        trip,
        vessel,
        route: routeData,
        bookings,
        seats,
      });

      setPdfBlob(blob);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      logError('Error al generar manifiesto PDF', error, { tripId: trip.id });
      const message = handleError(error, { action: 'generateManifestPDF', tripId: trip.id });
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) {
      toast.error('El PDF aún no está listo');
      return;
    }

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifiesto_${trip.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Manifiesto descargado correctamente');
  };

  const handlePrint = () => {
    if (!pdfUrl) {
      toast.error('El PDF aún no está listo');
      return;
    }

    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const formatDate = (timestamp: FirestoreTimestamp) => {
    if (!timestamp) return 'N/A';
    const date = formatFirestoreDate(timestamp);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loadingRoute || generating) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generando Manifiesto</DialogTitle>
            <DialogDescription>Por favor espera mientras se genera el PDF...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Generando manifiesto..." />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!routeData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>No se pudo cargar la información de la ruta</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
            Manifiesto de Pasajeros
          </DialogTitle>
          <DialogDescription>
            {formatDate(trip.fechaSalida)} - {routeData.origen} → {routeData.destino}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del viaje */}
          <div className="rounded-xl border-2 border-border bg-gradient-to-br from-muted/40 to-muted/20 p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Embarcación:</span>
                <span className="font-semibold text-foreground">{vessel.nombre}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Fecha:</span>
                <span className="font-semibold text-foreground">{formatDate(trip.fechaSalida)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Hora:</span>
                <span className="font-semibold text-foreground">{trip.horaSalida}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Ruta:</span>
                <span className="font-semibold text-foreground">
                  {routeData.origen} → {routeData.destino}
                </span>
              </div>
            </div>
          </div>

          {/* Lista de pasajeros */}
          <div className="rounded-xl border-2 border-border overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-muted/60 to-muted/40 p-4 border-b border-border">
              <h3 className="font-semibold">Pasajeros ({bookings.length})</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 sticky top-0 border-b border-border">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">DNI</th>
                    <th className="p-2 text-left">Asiento</th>
                    <th className="p-2 text-left">Tramo</th>
                    <th className="p-2 text-left">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter((b) => b.estado === 'confirmado')
                    .map((booking, index) => {
                      const seat = seats.find((s) => s.id === booking.asientoId);
                      return (
                        <tr key={booking.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2 font-medium">{booking.nombrePasajero}</td>
                          <td className="p-2">{booking.dniPasajero}</td>
                          <td className="p-2">{seat?.numeroAsiento || 'N/A'}</td>
                          <td className="p-2">
                            {booking.origenIntermedio || routeData.origen} →{' '}
                            {booking.destinoIntermedio || routeData.destino}
                          </td>
                          <td className="p-2">S/ {booking.pago?.monto?.toFixed(2) || '0.00'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button variant="outline" onClick={handlePrint} disabled={!pdfUrl} aria-label="Imprimir manifiesto">
            <Printer className="h-4 w-4 mr-2" aria-hidden="true" />
            Imprimir
          </Button>
          <Button onClick={handleDownload} disabled={!pdfBlob} aria-label="Descargar manifiesto">
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            Descargar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
