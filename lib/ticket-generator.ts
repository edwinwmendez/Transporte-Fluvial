import jsPDF from 'jspdf';
import type { Trip, Vessel, Route, Seat } from './firestore-helpers';
import { generateTicketQR, type QRTicketData } from './qr-generator';

/**
 * Datos necesarios para generar el boleto
 */
export interface TicketData {
  numeroTicket: string;
  pasajero: {
    nombre: string;
    dni: string;
    telefono: string;
    whatsapp?: string;
  };
  viaje: Trip;
  embarcacion: Vessel;
  ruta: Route;
  asiento: Seat;
  origen: string;
  destino: string;
  monto: number;
  metodoPago: 'efectivo' | 'yape' | 'plin';
  fechaEmision: Date;
}

/**
 * Genera el PDF del boleto en formato A6 (105 x 148 mm) - ticket compacto
 */
export async function generateTicketPDF(data: TicketData): Promise<Blob> {
  const { numeroTicket, pasajero, viaje, embarcacion, ruta, asiento, origen, destino, monto, metodoPago, fechaEmision } = data;

  // Crear documento PDF en formato A6 (105 x 148 mm) - tamaño ticket compacto
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 148], // A6
  });

  const pageWidth = 105;
  const pageHeight = 148;
  const margin = 5; // Márgenes pequeños para A6
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // ============================================================================
  // HEADER - Compacto para A6
  // ============================================================================
  doc.setFillColor(30, 58, 82);
  doc.rect(0, 0, pageWidth, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSPORTE FLUVIAL', pageWidth / 2, 8, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('ATALAYA - UCAYALI', pageWidth / 2, 12, { align: 'center' });

  // Número de boleto a la derecha
  doc.setFontSize(6);
  doc.text('BOLETO', pageWidth - margin - 2, 6, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(numeroTicket, pageWidth - margin - 2, 9, { align: 'right' });

  yPosition = 22;

  // Línea separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 3;

  // ============================================================================
  // DATOS DEL PASAJERO - Compacto
  // ============================================================================
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('PASAJERO', margin, yPosition);
  yPosition += 3;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(pasajero.nombre.toUpperCase(), margin, yPosition, { maxWidth: contentWidth });
  yPosition += 3.5;

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`DNI: ${pasajero.dni}`, margin, yPosition);
  doc.text(`Tel: ${pasajero.telefono}`, margin + 35, yPosition);
  yPosition += 4;

  // ============================================================================
  // DETALLES DEL VIAJE - Compacto
  // ============================================================================
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('VIAJE', margin, yPosition);
  yPosition += 3;

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Emb: ${embarcacion.nombre}`, margin, yPosition);
  doc.text(`Asiento: ${asiento.numeroAsiento}`, margin + 50, yPosition);
  yPosition += 3.5;

  // Ruta destacada
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 82);
  doc.text(`${origen} → ${destino}`, margin, yPosition);
  yPosition += 3.5;

  const fechaSalida = viaje.fechaSalida?.toDate ? viaje.fechaSalida.toDate() : (viaje.fechaSalida instanceof Date ? viaje.fechaSalida : new Date());
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(50, 50, 50);
  doc.text(`Fecha: ${fechaSalida.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' })}`, margin, yPosition);
  doc.text(`Hora: ${viaje.horaSalida}`, margin + 50, yPosition);
  yPosition += 4;

  // ============================================================================
  // INFORMACIÓN DE PAGO - Compacto
  // ============================================================================
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('PAGO', margin, yPosition);
  yPosition += 3;

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Método: ${metodoPago === 'efectivo' ? 'Efectivo' : metodoPago.toUpperCase()}`, margin, yPosition);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 82);
  doc.text(`S/ ${monto.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 5;

  // ============================================================================
  // INSTRUCCIONES Y QR LADO A LADO
  // ============================================================================
  if (yPosition > pageHeight - 30) {
    doc.addPage();
    yPosition = margin;
  }

  const instruccionesY = yPosition;
  
  // Instrucciones a la izquierda
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('INSTRUCCIONES', margin, yPosition);
  yPosition += 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(50, 50, 50);
  const instrucciones = [
    '• Presente al embarque',
    '• Llegue 30 min antes',
    '• Traiga DNI',
  ];
  instrucciones.forEach((inst) => {
    doc.text(inst, margin, yPosition);
    yPosition += 2.5;
  });

  // QR a la derecha (alineado con instrucciones)
  try {
    const qrData: QRTicketData = {
      numeroTicket,
      viajeId: viaje.id,
      asientoId: asiento.id,
      dniPasajero: pasajero.dni,
      asientoNumero: asiento.numeroAsiento,
      timestamp: fechaEmision.toISOString(),
    };

    const qrDataUrl = await generateTicketQR(qrData, 80);
    const qrSize = 25; // mm (compacto para A6)
    const qrX = pageWidth - margin - qrSize; // Alineado a la derecha
    const qrY = instruccionesY + 1; // Alineado con el inicio de instrucciones

    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('QR', qrX + qrSize / 2, qrY, { align: 'center' });

    doc.addImage(qrDataUrl, 'PNG', qrX, qrY + 2, qrSize, qrSize);
  } catch (error) {
    console.error('Error al generar QR:', error);
  }

  // Actualizar yPosition al máximo entre instrucciones y QR
  yPosition = Math.max(yPosition, instruccionesY + 28);

  // ============================================================================
  // FOOTER
  // ============================================================================
  yPosition = pageHeight - 6;
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Emitido: ${fechaEmision.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  return doc.output('blob');
}
