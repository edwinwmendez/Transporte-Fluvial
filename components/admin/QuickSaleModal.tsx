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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createBooking,
  buscarPasajeroPorDni,
  getRoute,
  obtenerPuntoOrigenMasAvanzado,
  obtenerDestinosDisponiblesDesde,
  obtenerOrdenParadas,
  getTrip,
  getVessel,
  validarDNI,
  validarTelefono,
  sanitizarTexto,
} from "@/lib/firestore-helpers";
import type { Seat, Route, Booking } from "@/lib/firestore-helpers";
import { generateTicketNumber, verificarNumeroTicketUnico } from "@/lib/ticket-number-generator";
import { generateTicketQR, type QRTicketData } from "@/lib/qr-generator";
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, User, Phone, MapPin, Wallet, CheckCircle2, Ticket, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentScreenshotUploader } from "./PaymentScreenshotUploader";
import { uploadPaymentScreenshot } from "@/lib/storage-helpers";
import { TicketPreviewModal } from "./TicketPreviewModal";

interface QuickSaleModalProps {
  tripId: string;
  rutaId: string;
  seat: Seat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  // Props opcionales para optimización - evitar consultas duplicadas
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
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    telefono: "",
    whatsapp: "",
    destinoIntermedio: "",
    monto: "",
    metodoPago: "efectivo" as "efectivo" | "yape" | "plin",
  });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [buscandoPasajero, setBuscandoPasajero] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ruta, setRuta] = useState<Route | null>(null);
  const [destinosDisponibles, setDestinosDisponibles] = useState<Array<{ nombre: string; precio: number; esDestinoFinal: boolean }>>([]);
  const [puntoOrigen, setPuntoOrigen] = useState<string>("");
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [ticketBooking, setTicketBooking] = useState<Booking | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const [ticketWhatsapp, setTicketWhatsapp] = useState<string>("");

  useEffect(() => {
    if (open && rutaId && tripId && seat.id) {
      loadRouteAndDestinos();
    }
  }, [open, rutaId, tripId, seat.id]);

  async function loadRouteAndDestinos() {
    try {
      // Usar ruta precargada si está disponible (evitar consulta duplicada)
      let rutaData: Route | null = rutaPrecargada || null;
      
      if (!rutaData) {
        rutaData = await getRoute(rutaId);
      }
      
      if (rutaData) {
        setRuta(rutaData);

        // Usar bookings precargados si están disponibles (evitar consulta duplicada)
        let puntoOrigenAvanzado: string;

        if (bookingsPrecargados && bookingsPrecargados.length > 0) {
          // Calcular punto de origen usando bookings precargados (más rápido)
          const orden = obtenerOrdenParadas(rutaData);
          let maxOrden = -1;
          let puntoMasAvanzado = rutaData.origen;

          for (const reserva of bookingsPrecargados) {
            const destinoReserva = reserva.destinoIntermedio || rutaData.destino;
            const ordenDestino = orden.get(destinoReserva) ?? -1;

            if (ordenDestino > maxOrden) {
              maxOrden = ordenDestino;
              puntoMasAvanzado = destinoReserva;
            }
          }
          puntoOrigenAvanzado = puntoMasAvanzado;
        } else {
          // Fallback: consultar si no hay bookings precargados O el array está vacío
          puntoOrigenAvanzado = await obtenerPuntoOrigenMasAvanzado(
            tripId,
            seat.id,
            rutaData
          );
        }
        
        setPuntoOrigen(puntoOrigenAvanzado);

        const destinos = obtenerDestinosDisponiblesDesde(rutaData, puntoOrigenAvanzado);
        setDestinosDisponibles(destinos);

        if (destinos.length > 0) {
          const primerDestino = destinos[0];
          const esDestinoFinal = primerDestino.esDestinoFinal;
          const montoInicial = esDestinoFinal
            ? (rutaData.precio || 0)
            : primerDestino.precio;

          setFormData((prev) => ({
            ...prev,
            destinoIntermedio: primerDestino.nombre,
            monto: montoInicial > 0 ? montoInicial.toString() : prev.monto,
          }));
        }
      }
    } catch (error) {
      console.error("Error al cargar ruta y destinos:", error);
    }
  }

  const handleDniBlur = async () => {
    if (formData.dni.length === 8 && !formData.nombre) {
      setBuscandoPasajero(true);
      try {
        const pasajero = await buscarPasajeroPorDni(formData.dni);
        if (pasajero) {
          setFormData((prev) => ({
            ...prev,
            nombre: pasajero.nombre || "",
            telefono: pasajero.telefono || "",
          }));
        }
      } catch (error) {
        console.error("Error al buscar pasajero:", error);
      } finally {
        setBuscandoPasajero(false);
      }
    }
  };

  const handleDestinoChange = (destino: string) => {
    const destinoData = destinosDisponibles.find((d) => d.nombre === destino);
    const esDestinoFinal = destinoData?.esDestinoFinal || destino === ruta?.destino;

    setFormData((prev) => ({
      ...prev,
      destinoIntermedio: destino,
    }));

    if (esDestinoFinal) {
      if (ruta && ruta.precio > 0) {
        setFormData((prev) => ({
          ...prev,
          monto: ruta.precio.toString(),
        }));
      }
    } else if (destinoData) {
      if (destinoData.precio > 0) {
        setFormData((prev) => ({
          ...prev,
          monto: destinoData.precio.toString(),
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ========================================================================
      // VALIDACIONES DE ENTRADA
      // ========================================================================

      // Validar campos obligatorios
      if (!formData.dni || !formData.nombre || !formData.telefono || !formData.monto) {
        setError("Por favor completa todos los campos obligatorios");
        setLoading(false);
        return;
      }

      // Validar formato de DNI (8 dígitos en Perú)
      if (!validarDNI(formData.dni)) {
        setError("El DNI debe tener exactamente 8 dígitos numéricos");
        setLoading(false);
        return;
      }

      // Validar formato de teléfono (9 dígitos, empieza con 9 en Perú)
      if (!validarTelefono(formData.telefono)) {
        setError("El teléfono debe tener 9 dígitos y empezar con 9");
        setLoading(false);
        return;
      }

      // Validar WhatsApp para YAPE/PLIN
      if ((formData.metodoPago === 'yape' || formData.metodoPago === 'plin') && !formData.whatsapp) {
        setError("El número de WhatsApp es obligatorio para pagos YAPE/PLIN");
        setLoading(false);
        return;
      }

      // Validar formato de WhatsApp si se proporciona
      if (formData.whatsapp && !validarTelefono(formData.whatsapp)) {
        setError("El WhatsApp debe tener 9 dígitos y empezar con 9");
        setLoading(false);
        return;
      }

      // Validar monto
      const monto = parseFloat(formData.monto);
      if (isNaN(monto) || monto <= 0) {
        setError("El monto debe ser un número válido mayor a 0");
        setLoading(false);
        return;
      }

      if (!ruta) {
        setError("No se pudo cargar la información de la ruta");
        setLoading(false);
        return;
      }

      // ========================================================================
      // PASO 0: Subir screenshot PRIMERO si es necesario (antes de crear reserva)
      // ========================================================================
      let screenshotData: { url: string; path: string } | null = null;

      if ((formData.metodoPago === 'yape' || formData.metodoPago === 'plin') && screenshotFile) {
        try {
          // Generar ID temporal para el screenshot (usaremos el booking ID real después)
          const tempId = `temp_${Date.now()}`;
          screenshotData = await uploadPaymentScreenshot(screenshotFile, tripId, tempId);
        } catch (uploadError) {
          setError('Error al subir el comprobante de pago. Por favor, intenta nuevamente.');
          setLoading(false);
          return; // Detener la venta si falla el upload
        }
      }

      // ========================================================================
      // PASO 1: Preparar datos de reserva con screenshot (si existe)
      // ========================================================================
      const datosReservaInicial: {
        nombre: string;
        dni: string;
        telefono: string;
        whatsapp?: string;
        destinoIntermedio?: string;
        monto: number;
        metodoPago: 'efectivo' | 'yape' | 'plin';
        origenIntermedio?: string;
        screenshotUrl?: string;
        screenshotPath?: string;
      } = {
        nombre: sanitizarTexto(formData.nombre, 200), // Sanitizar nombre
        dni: formData.dni.trim(),
        telefono: formData.telefono.replace(/\s/g, ''), // Remover espacios
        monto: monto,
        metodoPago: formData.metodoPago,
        origenIntermedio: puntoOrigen,
        ...(formData.whatsapp && { whatsapp: formData.whatsapp.replace(/\s/g, '') }), // Remover espacios
        ...(screenshotData && {
          screenshotUrl: screenshotData.url,
          screenshotPath: screenshotData.path
        }),
      };

      if (formData.destinoIntermedio && formData.destinoIntermedio.trim() !== '' && formData.destinoIntermedio !== ruta?.destino) {
        datosReservaInicial.destinoIntermedio = formData.destinoIntermedio;
      }

      // ========================================================================
      // PASO 2: Ejecutar operaciones en paralelo para reducir tiempo
      // ========================================================================

      // Generar número de ticket y obtener datos del viaje EN PARALELO
      const [numeroTicket, viaje] = await Promise.all([
        generateTicketNumber(), // Generar ticket
        getTrip(tripId), // Obtener viaje
      ]);

      if (!viaje) {
        throw new Error('No se pudo obtener información del viaje');
      }

      // Obtener embarcación (ya tenemos viaje)
      const embarcacionData = await getVessel(viaje.embarcacionId);
      if (!embarcacionData) {
        throw new Error('No se pudo obtener información de la embarcación');
      }

      // Preparar datos del QR
      const qrData: QRTicketData = {
        numeroTicket,
        viajeId: tripId,
        asientoId: seat.id,
        dniPasajero: formData.dni,
        asientoNumero: seat.numeroAsiento,
        timestamp: new Date().toISOString(),
      };

      // Generar QR primero (más rápido que crear reserva)
      const codigoQr = await generateTicketQR(qrData, 150); // Tamaño más pequeño = generación más rápida

      // Crear reserva (esta es la operación más lenta, pero necesaria)
      const bookingId = await createBooking(tripId, seat.id, datosReservaInicial, ruta);

      // Actualizar reserva con boleto completo (UNA SOLA operación)
      const bookingRef = doc(db, 'reservas', bookingId);
      await updateDoc(bookingRef, {
        boleto: {
          numeroTicket,
          codigoQr,
          estado: 'emitido',
          emitidoEn: Timestamp.now(),
        },
        updatedAt: Timestamp.now(),
      });

      // 8. Construir bookingData directamente (evitar consulta innecesaria)
      const bookingData: Booking = {
        id: bookingId,
        viajeId: tripId,
        asientoId: seat.id,
        nombrePasajero: formData.nombre,
        dniPasajero: formData.dni,
        telefonoPasajero: formData.telefono,
        whatsappPasajero: formData.whatsapp,
        origenIntermedio: puntoOrigen,
        destinoIntermedio: formData.destinoIntermedio || ruta?.destino,
        estado: 'confirmado',
        pago: {
          monto: monto,
          metodoPago: formData.metodoPago,
          estado: formData.metodoPago === 'efectivo' ? 'validado' : 'pendiente',
          validadoPor: formData.metodoPago === 'efectivo' ? 'sistema' : undefined,
          validadoEn: formData.metodoPago === 'efectivo' ? Timestamp.now() : undefined,
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

      // ========================================================================
      // PASO 7: Mostrar preview del boleto en HTML (sin generar PDF)
      // NO cerrar el modal de venta todavía - se cerrará cuando el usuario cierre el preview
      // ========================================================================
      setTicketBooking(bookingData);
      setTicketNumber(numeroTicket);
      setTicketWhatsapp(formData.whatsapp || "");
      setShowTicketPreview(true);

      // ========================================================================
      // PASO 8: Limpiar formulario (pero NO cerrar el modal todavía)
      // ========================================================================
      setFormData({
        dni: "",
        nombre: "",
        telefono: "",
        whatsapp: "",
        destinoIntermedio: "",
        monto: "",
        metodoPago: "efectivo",
      });
      setScreenshotFile(null);
      
      // NO llamar onComplete() ni onOpenChange(false) aquí
      // El modal se cerrará cuando el usuario cierre el preview del boleto
    } catch (err: any) {
      console.error("Error al crear reserva:", err);
      setError(
        err.message || "Error al registrar la venta. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodSelect = (method: 'efectivo' | 'yape' | 'plin') => {
    setFormData(prev => ({ ...prev, metodoPago: method }));
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-border bg-background max-h-[90vh] flex flex-col">
        {/* Header limpio - SIN gradiente */}
        <div className="border-b border-border p-6 bg-muted/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
              <Ticket className="w-6 h-6 text-primary" />
              Emisión de Boleto
            </DialogTitle>
            <DialogDescription className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                ASIENTO {seat.numeroAsiento}
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              {/* DNI */}
              <div className="space-y-2">
                <Label htmlFor="dni" className="text-xs font-semibold text-muted-foreground uppercase">
                  DNI / Pasaporte
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="dni"
                    name="dni"
                    className="pl-9"
                    placeholder="12345678"
                    value={formData.dni}
                    onChange={handleChange}
                    onBlur={handleDniBlur}
                    required
                    maxLength={8}
                  />
                  {buscandoPasajero && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-xs font-semibold text-muted-foreground uppercase">
                  Celular
                </Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    className="pl-9"
                    placeholder="999 999 999"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            {/* Nombre completo */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-xs font-semibold text-muted-foreground uppercase">
                Nombre del Pasajero
              </Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Nombres y Apellidos"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            {/* WhatsApp (solo para YAPE/PLIN) */}
            {(formData.metodoPago === 'yape' || formData.metodoPago === 'plin') && (
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-xs font-semibold text-muted-foreground uppercase">
                  WhatsApp <span className="text-error">*</span>
                </Label>
                <div className="relative group">
                  <MessageCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    className="pl-9"
                    placeholder="999 999 999"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    maxLength={9}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Para enviar el boleto por WhatsApp
                </p>
              </div>
            )}

            {/* Separador */}
            <div className="h-px bg-border w-full my-1" />

            {/* Destino */}
            <div className="space-y-2">
              <Label htmlFor="destinoIntermedio" className="text-xs font-semibold text-muted-foreground uppercase">
                Destino
              </Label>
              {puntoOrigen && puntoOrigen !== ruta?.origen && (
                <div className="text-xs px-2 py-1 bg-info/10 text-info rounded-md inline-block border border-info/20">
                  Desde: <b>{puntoOrigen}</b>
                </div>
              )}
              <div className="relative group">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Select
                  id="destinoIntermedio"
                  name="destinoIntermedio"
                  value={formData.destinoIntermedio || (destinosDisponibles.find(d => d.esDestinoFinal) ? destinosDisponibles.find(d => d.esDestinoFinal)?.nombre : "")}
                  onChange={(e) => handleDestinoChange(e.target.value)}
                  required
                  className="pl-9 w-full"
                >
                  {destinosDisponibles.map((destino) => (
                    <option key={destino.nombre} value={destino.nombre}>
                      {destino.nombre} {destino.esDestinoFinal ? '(Destino Final)' : '(Parada)'}
                    </option>
                  ))}
                </Select>
              </div>
              {ruta && destinosDisponibles.length === 0 && (
                <p className="text-xs text-error font-medium">Asiento no disponible para tramos restantes.</p>
              )}
            </div>

            {/* Sección de pago */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Monto a Cobrar
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">S/</span>
                  <Input
                    type="number"
                    value={formData.monto}
                    onChange={handleChange}
                    name="monto"
                    id="monto"
                    className="w-24 text-right font-bold text-lg h-8 border-transparent bg-transparent hover:bg-background focus:bg-background transition-colors"
                  />
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePaymentMethodSelect('efectivo')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all duration-200",
                    formData.metodoPago === 'efectivo'
                      ? "border-success bg-success/10 text-success"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <Wallet className="w-4 h-4 mb-1" />
                  <span className="text-xs font-semibold">Efectivo</span>
                  {formData.metodoPago === 'efectivo' && (
                    <CheckCircle2 className="w-3 h-3 mt-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentMethodSelect('yape')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all duration-200",
                    formData.metodoPago === 'yape'
                      ? "border-purple-500 bg-purple-500/10 text-purple-600"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <span className="text-lg mb-1">💳</span>
                  <span className="text-xs font-semibold">YAPE</span>
                  {formData.metodoPago === 'yape' && (
                    <CheckCircle2 className="w-3 h-3 mt-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentMethodSelect('plin')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all duration-200",
                    formData.metodoPago === 'plin'
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-600"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <span className="text-lg mb-1">💳</span>
                  <span className="text-xs font-semibold">PLIN</span>
                  {formData.metodoPago === 'plin' && (
                    <CheckCircle2 className="w-3 h-3 mt-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Carga de screenshot (solo para YAPE/PLIN) */}
            {(formData.metodoPago === 'yape' || formData.metodoPago === 'plin') && (
              <div className="space-y-2">
                <PaymentScreenshotUploader
                  viajeId={tripId}
                  onFileSelect={(file) => {
                    setScreenshotFile(file);
                  }}
                  onUploadError={(errorMsg) => {
                    setError(`Error al subir comprobante: ${errorMsg}`);
                  }}
                  disabled={loading}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error flex items-center gap-2">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-muted/30 border-t border-border flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (!!ruta && destinosDisponibles.length === 0)}
            >
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
            // Cuando se cierra el preview, cerrar también el modal de venta y limpiar
            setTicketBooking(null);
            setTicketNumber("");
            setTicketWhatsapp("");
            onComplete(); // Notificar que la venta se completó
            onOpenChange(false); // Cerrar el modal de venta
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
