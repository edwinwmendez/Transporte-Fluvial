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
import { Download, Eye, Loader2, FileSpreadsheet, Printer } from "lucide-react";
import { generateManifestPDF } from "@/lib/pdf-generator";
import { getRoute } from "@/lib/firestore-helpers";
import type { Booking, Trip, Vessel, Seat, Route } from "@/lib/firestore-helpers";

interface ManifestPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  vessel: Vessel;
  bookings: Booking[];
  seats: Seat[];
  route?: Route | null;
}

export function ManifestPreviewModal({
  open,
  onOpenChange,
  trip,
  vessel,
  bookings,
  seats,
  route: routeProp,
}: ManifestPreviewModalProps) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);
  const [route, setRoute] = useState<Route | null>(null);

  useEffect(() => {
    if (open && bookings.length > 0) {
      loadRoute();
    }

    return () => {
      // Limpiar URL cuando el modal se cierra
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, bookings.length, trip.rutaId]);

  useEffect(() => {
    if (open && bookings.length > 0 && route) {
      generatePDFBlob();
    }
  }, [route]);

  async function loadRoute() {
    if (routeProp) {
      setRoute(routeProp);
    } else if (trip.rutaId) {
      try {
        const routeData = await getRoute(trip.rutaId);
        setRoute(routeData);
      } catch (error) {
        console.error("Error al cargar ruta:", error);
      }
    }
  }

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

      // Color de fondo para el header (Azul primario)
      doc.setFillColor(44, 107, 142); // primary color (#2c6b8e)
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Título (Blanco)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("MANIFIESTO DE PASAJEROS", pageWidth / 2, 25, {
        align: "center",
      });

      // Reset text color
      doc.setTextColor(0, 0, 0);
      yPosition = 50;

      // Información del viaje
      doc.setFontSize(11);
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

      // Box for metadata
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'FD');

      yPosition += 8;
      doc.setFont("helvetica", "bold");
      doc.text("DETALLES DEL VIAJE", margin + 5, yPosition);
      doc.setFont("helvetica", "normal");

      yPosition += 8;
      doc.text(`Embarcación:`, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(`${vessel.nombre}`, margin + 35, yPosition);
      doc.setFont("helvetica", "normal");

      // Segunda columna en metadata
      doc.text(`Fecha:`, margin + 100, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(`${formatDate(trip.fechaSalida)}`, margin + 115, yPosition);
      doc.setFont("helvetica", "normal");

      yPosition += 8;
      doc.text(`Hora Salida:`, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(`${trip.horaSalida}`, margin + 35, yPosition);
      doc.setFont("helvetica", "normal");

      doc.text(`Pasajeros:`, margin + 100, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(`${bookings.length}`, margin + 115, yPosition);
      doc.setFont("helvetica", "normal");

      yPosition += 15;

      // Encabezados de tabla
      doc.setFillColor(30, 41, 59); // slate-800
      doc.setTextColor(255, 255, 255);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);

      const colWidths = [8, 45, 20, 20, 15, 25, 25, 25]; // Adjusted widths
      const headers = ["N°", "APELLIDOS Y NOMBRES", "DNI", "CELULAR", "ASIENTO", "ORIGEN", "DESTINO", "MONTO"];

      let xPosition = margin + 2;
      let yText = yPosition + 5;

      headers.forEach((header, index) => {
        doc.text(header, xPosition, yText);
        xPosition += colWidths[index];
      });

      yPosition += 8;
      doc.setTextColor(0, 0, 0);

      // Datos de pasajeros
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      bookings.forEach((booking, index) => {
        if (yPosition > 270) {
          doc.addPage();
          // Re-draw header on new page? Maybe later. for now simple logic.
          yPosition = margin;
        }

        let seatNumber = "N/A";
        if (seats) {
          const seat = seats.find((s) => s.id === booking.asientoId);
          seatNumber = seat?.numeroAsiento || booking.asientoId.split("_").pop() || "N/A";
        } else {
          seatNumber = booking.asientoId.split("_").pop() || "N/A";
        }

        const origen = booking.origenIntermedio || route?.origen || "N/A";
        const destino = booking.destinoIntermedio || route?.destino || "Final";
        const monto = booking.pago?.monto || 0;

        const row = [
          (index + 1).toString(),
          booking.nombrePasajero.toUpperCase(),
          booking.dniPasajero,
          booking.telefonoPasajero,
          seatNumber,
          origen.toUpperCase(),
          destino.toUpperCase(),
          `S/ ${monto.toFixed(2)}`,
        ];

        xPosition = margin + 2;

        // Striped rows
        if (index % 2 === 0) {
          doc.setFillColor(241, 245, 249); // slate-100
          doc.rect(margin, yPosition, contentWidth, 7, 'F');
        }

        row.forEach((cell, cellIndex) => {
          //   const maxWidth = colWidths[cellIndex] - 2;
          //   const text = doc.splitTextToSize(cell, maxWidth);
          doc.text(cell, xPosition, yPosition + 5);
          xPosition += colWidths[cellIndex];
        });

        yPosition += 7;
      });

      // Totales Footer
      yPosition += 5;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const totalAmount = bookings.reduce((sum, b) => sum + (b.pago?.monto || 0), 0);

      //   doc.text(
      //     `TOTAL RECAUDADO: S/ ${totalAmount.toFixed(2)}`,
      //     pageWidth - margin,
      //     yPosition,
      //     { align: "right" }
      //   );

      // Pie de página oficial
      yPosition = doc.internal.pageSize.getHeight() - 15;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Documento generado digitalmente por Sistema Ventanilla Digital - ${new Date().toLocaleDateString("es-PE")} ${new Date().toLocaleTimeString("es-PE")}`,
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-2xl">
        {/* Header limpio - SIN gradiente */}
        <div className="bg-muted/30 p-6 border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              Manifiesto de Pasajeros
            </DialogTitle>
            <DialogDescription>
              Vista previa del documento oficial de zarpe
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20 p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl h-full shadow-lg rounded-sm overflow-hidden bg-background border border-border">
            {generating ? (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Generando documento PDF...
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
                <p className="text-sm text-red-500 font-medium">
                  Error al generar la vista previa
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/30 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar Preview
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!pdfBlob || generating}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Manifiesto Oficial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
