"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import { generateManifestPDF } from "@/lib/pdf-generator";
import type { Booking, Trip, Vessel, Seat } from "@/lib/firestore-helpers";

interface ManifestPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  vessel: Vessel;
  bookings: Booking[];
  seats: Seat[];
}

export function ManifestPreviewModal({
  open,
  onOpenChange,
  trip,
  vessel,
  bookings,
  seats,
}: ManifestPreviewModalProps) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    if (open && bookings.length > 0) {
      generatePDFBlob();
    }

    return () => {
      // Limpiar URL cuando el modal se cierra
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, bookings.length]);

  const generatePDFBlob = async () => {
    try {
      setGenerating(true);
      
      // Importar jsPDF
      const jsPDF = (await import("jspdf")).default;
      
      // Crear documento PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Configuración
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("MANIFIESTO DE PASAJEROS", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Información del viaje
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      };

      yPosition += 5;
      doc.text(`Embarcación: ${vessel.nombre}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Fecha: ${formatDate(trip.fechaSalida)}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Hora de Salida: ${trip.horaSalida}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Total de Pasajeros: ${bookings.length}`, margin, yPosition);
      yPosition += 10;

      // Línea separadora
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Encabezados de tabla
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      
      const colWidths = [15, 50, 30, 25, 25, 35];
      const headers = ["N°", "Nombre Completo", "DNI", "Teléfono", "Asiento", "Monto"];
      let xPosition = margin;

      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });

      yPosition += 5;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Datos de pasajeros
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      bookings.forEach((booking, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }

        let seatNumber = "N/A";
        if (seats) {
          const seat = seats.find((s) => s.id === booking.asientoId);
          seatNumber = seat?.numeroAsiento || booking.asientoId.split("_").pop() || "N/A";
        } else {
          seatNumber = booking.asientoId.split("_").pop() || "N/A";
        }

        const row = [
          (index + 1).toString(),
          booking.nombrePasajero,
          booking.dniPasajero,
          booking.telefonoPasajero,
          seatNumber,
          `S/ ${booking.monto.toFixed(2)}`,
        ];

        xPosition = margin;
        row.forEach((cell, cellIndex) => {
          const maxWidth = colWidths[cellIndex] - 2;
          const text = doc.splitTextToSize(cell, maxWidth);
          doc.text(text[0], xPosition, yPosition);
          xPosition += colWidths[cellIndex];
        });

        yPosition += 6;
      });

      // Totales
      yPosition += 5;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const totalAmount = bookings.reduce((sum, b) => sum + b.monto, 0);
      doc.text(
        `TOTAL RECAUDADO: S/ ${totalAmount.toFixed(2)}`,
        pageWidth - margin,
        yPosition,
        { align: "right" }
      );

      // Pie de página
      yPosition = doc.internal.pageSize.getHeight() - 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        `Generado el ${new Date().toLocaleDateString("es-PE")} a las ${new Date().toLocaleTimeString("es-PE")}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );

      // Generar blob
      const blob = doc.output("blob");
      setPdfBlob(blob);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      };

      const fileName = `Manifiesto_${vessel.nombre}_${formatDate(trip.fechaSalida).replace(/\s/g, "_")}.pdf`;
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pdfBlob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa del Manifiesto
          </DialogTitle>
          <DialogDescription>
            Revisa el manifiesto antes de descargarlo
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden border rounded-lg bg-muted/20">
          {generating ? (
            <div className="flex items-center justify-center h-full min-h-[500px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Generando vista previa...
                </p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full min-h-[500px] border-0"
              title="Vista previa del manifiesto"
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[500px]">
              <p className="text-sm text-muted-foreground">
                Error al generar la vista previa
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDownload} disabled={!pdfBlob || generating}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
