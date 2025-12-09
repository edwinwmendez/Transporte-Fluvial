import jsPDF from "jspdf";
import type { Booking, Trip, Vessel, Seat, Route } from "./firestore-helpers";
import { getRoute } from "./firestore-helpers";

interface ManifestData {
  trip: Trip;
  vessel: Vessel;
  bookings: Booking[];
  seats?: Seat[]; // Opcional: si se proporciona, se usa para obtener seatNumber
  route?: Route; // Opcional: ruta para obtener origen/destino
}

export async function generateManifestPDF(data: ManifestData): Promise<Blob> {
  const { trip, vessel, bookings, seats, route } = data;
  
  // Obtener ruta si no se proporcionó
  let routeData: Route | null = route || null;
  if (!routeData && trip.rutaId) {
    routeData = await getRoute(trip.rutaId);
  }

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
  
  const colWidths = [10, 40, 20, 20, 15, 25, 25, 25]; // Nro, Nombre, DNI, Teléfono, Asiento, Origen, Destino, Monto
  const headers = ["N°", "Nombre Completo", "DNI", "Teléfono", "Asiento", "Origen", "Destino", "Monto"];
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
    // Verificar si necesitamos una nueva página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    // Obtener numeroAsiento del asiento si está disponible
    let seatNumber = "N/A";
    if (seats) {
      const seat = seats.find((s) => s.id === booking.asientoId);
      seatNumber = seat?.numeroAsiento || booking.asientoId.split("_").pop() || "N/A";
    } else {
      // Fallback: intentar extraer del asientoId
      seatNumber = booking.asientoId.split("_").pop() || "N/A";
    }

    const origen = booking.origenIntermedio || (routeData ? routeData.origen : "N/A");
    const destino = booking.destinoIntermedio || (routeData ? routeData.destino : "N/A");

    const row = [
      (index + 1).toString(),
      booking.nombrePasajero,
      booking.dniPasajero,
      booking.telefonoPasajero,
      seatNumber,
      origen,
      destino,
      `S/ ${(booking.pago?.monto || 0).toFixed(2)}`,
    ];

    xPosition = margin;
    row.forEach((cell, cellIndex) => {
      // Truncar texto si es muy largo
      const maxWidth = colWidths[cellIndex] - 2;
      const text = doc.splitTextToSize(cell, maxWidth);
      doc.text(text[0], xPosition, yPosition);
      xPosition += colWidths[cellIndex];
    });

    yPosition += 6;
  });

  // Totales al final
  yPosition += 5;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const totalAmount = bookings.reduce((sum, b) => sum + (b.pago?.monto || 0), 0);
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

  // Retornar el blob del PDF (no descargar directamente)
  return doc.output("blob");
}
