"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, X, Loader2 } from "lucide-react";
import { downloadFile } from "@/lib/storage-helpers";
import { generateTicketPDF, type TicketData } from "@/lib/ticket-generator";
import type { Trip, Vessel, Route, Seat, Booking } from "@/lib/firestore-helpers";
import { getTrip, getVessel, getRoute, getSeatsForTrip } from "@/lib/firestore-helpers";
import { cn } from "@/lib/utils";

interface TicketPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  numeroTicket: string;
  whatsappPasajero?: string;
}

export function TicketPreviewModal({
  open,
  onOpenChange,
  booking,
  numeroTicket,
  whatsappPasajero,
}: TicketPreviewModalProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (open && booking) {
      loadData();
    }
  }, [open, booking]);

  async function loadData() {
    if (!booking) return;

    try {
      setLoading(true);
      const tripData = await getTrip(booking.viajeId);
      setTrip(tripData);

      if (tripData) {
        const [vesselData, routeData, seatsData] = await Promise.all([
          getVessel(tripData.embarcacionId),
          getRoute(tripData.rutaId),
          getSeatsForTrip(booking.viajeId),
        ]);
        setVessel(vesselData);
        setRoute(routeData);
        
        const foundSeat = seatsData.find(s => s.id === booking.asientoId);
        if (foundSeat) {
          setSeat(foundSeat);
        } else {
          setSeat({
            id: booking.asientoId,
            viajeId: booking.viajeId,
            numeroAsiento: booking.asientoId.split('_').pop() || 'N/A',
            fila: 0,
            columna: 'A',
            posicion: 'ventana',
            estado: 'vendido',
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
          } as Seat);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async () => {
    if (!booking || !trip || !vessel || !route || !seat) {
      alert("No hay datos suficientes para generar el PDF");
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
        fechaEmision: booking.boleto?.emitidoEn?.toDate ? booking.boleto.emitidoEn.toDate() : new Date(),
      };

      const pdfBlob = await generateTicketPDF(ticketData);
      downloadFile(pdfBlob, `boleto_${numeroTicket}.pdf`);
    } catch (error: any) {
      console.error("Error al generar PDF:", error);
      alert(error.message || "Error al generar el PDF del boleto");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = async () => {
    if (!whatsappPasajero || !booking || !trip || !vessel || !route || !seat) {
      alert("No hay datos suficientes para generar el PDF");
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
        fechaEmision: booking.boleto?.emitidoEn?.toDate ? booking.boleto.emitidoEn.toDate() : new Date(),
      };

      const pdfBlob = await generateTicketPDF(ticketData);

      const message = encodeURIComponent(
        `¡Hola! Aquí está tu boleto de viaje número ${numeroTicket}.`
      );
      const whatsappUrl = `https://wa.me/${whatsappPasajero.replace(/[^0-9]/g, '')}?text=${message}`;
      
      window.open(whatsappUrl, '_blank');
      
      setTimeout(() => {
        downloadFile(pdfBlob, `boleto_${numeroTicket}.pdf`);
      }, 500);
    } catch (error: any) {
      console.error("Error al compartir por WhatsApp:", error);
      alert(error.message || "Error al generar el PDF para compartir");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (!booking) {
    return null;
  }

  const fechaSalida = trip?.fechaSalida?.toDate ? trip.fechaSalida.toDate() : null;
  const fechaEmision = booking.boleto?.emitidoEn?.toDate ? booking.boleto.emitidoEn.toDate() : new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full print:max-w-none print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-xl font-bold">Boleto de Viaje</DialogTitle>
          <DialogDescription className="text-sm">
            Número: {numeroTicket}
          </DialogDescription>
        </DialogHeader>

        {/* Boleto en HTML - Diseño compacto tipo ticket */}
        <div className="mt-4 print:mt-0">
          <div className="border-2 border-gray-800 rounded-sm bg-white shadow-lg print:shadow-none print:border-0 print:rounded-none max-w-[105mm] mx-auto print:max-w-[105mm]">
            {/* Header compacto - más delgado */}
            <div className="bg-gray-900 text-white px-2.5 py-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-xs leading-tight">TRANSPORTE FLUVIAL</div>
                  <div className="text-[9px] opacity-90">ATALAYA - UCAYALI</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] opacity-80">BOLETO</div>
                  <div className="font-mono font-bold text-[10px]">{numeroTicket}</div>
                </div>
              </div>
            </div>

            {/* Contenido compacto - más delgado */}
            <div className="px-2.5 py-2 space-y-1 text-xs">
              {/* Pasajero - línea compacta */}
              <div className="border-b border-gray-300 pb-0.5">
                <div className="text-[8px] font-semibold text-gray-600 uppercase mb-0.5">Pasajero</div>
                <div className="font-bold text-xs leading-tight">{booking.nombrePasajero.toUpperCase()}</div>
                <div className="flex gap-2 text-[9px] text-gray-600 mt-0.5">
                  <span>DNI: {booking.dniPasajero}</span>
                  <span className="text-gray-400">|</span>
                  <span>Tel: {booking.telefonoPasajero}</span>
                </div>
              </div>

              {/* Viaje - grid compacto */}
              {trip && vessel && route && (
                <div className="border-b border-gray-300 pb-0.5">
                  <div className="text-[8px] font-semibold text-gray-600 uppercase mb-0.5">Viaje</div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px]">
                    <div>
                      <span className="text-gray-600">Emb:</span>
                      <span className="font-semibold ml-1">{vessel.nombre}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Asiento:</span>
                      <span className="font-semibold ml-1">{seat?.numeroAsiento || 'N/A'}</span>
                    </div>
                    <div className="col-span-2 mt-0.5">
                      <span className="text-gray-600">Ruta:</span>
                      <span className="font-bold text-primary ml-1 text-[10px]">
                        {booking.origenIntermedio || route.origen} → {booking.destinoIntermedio || route.destino}
                      </span>
                    </div>
                    {fechaSalida && (
                      <div>
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-semibold ml-1">
                          {fechaSalida.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' })}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Hora:</span>
                      <span className="font-semibold ml-1">{trip.horaSalida}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pago - línea compacta */}
              <div className="border-b border-gray-300 pb-0.5">
                <div className="text-[8px] font-semibold text-gray-600 uppercase mb-0.5">Pago</div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] text-gray-600">
                    Método: <span className="font-semibold text-gray-900">{(booking.pago?.metodoPago || 'efectivo').toUpperCase()}</span>
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    S/ {(booking.pago?.monto || 0).toFixed(2)}
                  </span>
                </div>
                {/* Estado de validación */}
                {booking.pago?.estado && (
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-gray-600">Estado:</span>
                    <span className={cn(
                      "text-[8px] font-semibold px-1 py-0.5 rounded",
                      booking.pago.estado === 'validado' && "bg-green-100 text-green-700",
                      booking.pago.estado === 'pendiente' && "bg-amber-100 text-amber-700",
                      booking.pago.estado === 'rechazado' && "bg-red-100 text-red-700"
                    )}>
                      {booking.pago.estado === 'validado' ? '✓ VALIDADO' : 
                       booking.pago.estado === 'pendiente' ? '⏳ PENDIENTE' : 
                       '✗ RECHAZADO'}
                    </span>
                  </div>
                )}
              </div>

              {/* Instrucciones y QR lado a lado */}
              <div className="flex items-start gap-2 pt-0.5">
                {/* Instrucciones a la izquierda */}
                <div className="flex-1">
                  <div className="text-[8px] font-semibold text-gray-600 uppercase mb-0.5">Instrucciones</div>
                  <ul className="text-[8px] text-gray-700 space-y-0 leading-tight">
                    <li>• Presente este boleto al embarque</li>
                    <li>• Llegue 30 min antes de la salida</li>
                    <li>• Traiga DNI o Pasaporte</li>
                  </ul>
                </div>
                {/* QR a la derecha */}
                {booking.boleto?.codigoQr && (
                  <div className="flex-shrink-0">
                    <div className="text-[8px] font-semibold text-gray-600 uppercase mb-0.5 text-center">QR</div>
                    <img
                      src={booking.boleto.codigoQr}
                      alt="QR"
                      className="w-16 h-16 border border-gray-300"
                    />
                  </div>
                )}
              </div>

              {/* Footer compacto - más delgado */}
              <div className="pt-0.5 text-center">
                <div className="text-[7px] text-gray-500">
                  Emitido: {fechaEmision.toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 mt-4 print:hidden">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={generatingPDF || !trip || !vessel || !route || !seat}
            className="flex-1"
            size="sm"
          >
            {generatingPDF ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex-1"
            size="sm"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          {whatsappPasajero && (
            <Button
              variant="outline"
              onClick={handleShareWhatsApp}
              disabled={generatingPDF || !trip || !vessel || !route || !seat}
              className="flex-1"
              size="sm"
            >
              {generatingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparando...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  WhatsApp
                </>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
