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
  obtenerDestinosDisponiblesDesde
} from "@/lib/firestore-helpers";
import type { Seat, Route } from "@/lib/firestore-helpers";
import { Loader2 } from "lucide-react";

interface QuickSaleModalProps {
  tripId: string;
  rutaId: string; // NUEVO: Para obtener paradas intermedias
  seat: Seat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function QuickSaleModal({
  tripId,
  rutaId,
  seat,
  open,
  onOpenChange,
  onComplete,
}: QuickSaleModalProps) {
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    telefono: "",
    destinoIntermedio: "",
    monto: "",
    metodoPago: "efectivo" as "efectivo" | "yape" | "plin",
  });
  const [loading, setLoading] = useState(false);
  const [buscandoPasajero, setBuscandoPasajero] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ruta, setRuta] = useState<Route | null>(null);
  const [destinosDisponibles, setDestinosDisponibles] = useState<Array<{ nombre: string; precio: number; esDestinoFinal: boolean }>>([]);
  const [puntoOrigen, setPuntoOrigen] = useState<string>("");

  // Cargar ruta y destinos disponibles basados en reservas existentes del asiento
  useEffect(() => {
    if (open && rutaId && tripId && seat.id) {
      loadRouteAndDestinos();
    }
  }, [open, rutaId, tripId, seat.id]);

  async function loadRouteAndDestinos() {
    try {
      const rutaData = await getRoute(rutaId);
      if (rutaData) {
        setRuta(rutaData);
        
        // Determinar el punto de origen más avanzado basado en reservas existentes
        const puntoOrigenAvanzado = await obtenerPuntoOrigenMasAvanzado(
          tripId,
          seat.id,
          rutaData
        );
        setPuntoOrigen(puntoOrigenAvanzado);
        
        // Obtener destinos disponibles desde ese punto
        const destinos = obtenerDestinosDisponiblesDesde(rutaData, puntoOrigenAvanzado);
        setDestinosDisponibles(destinos);
        
        // Preseleccionar el primer destino disponible y cargar su monto automáticamente
        if (destinos.length > 0) {
          const primerDestino = destinos[0];
          const esDestinoFinal = primerDestino.esDestinoFinal;
          const montoInicial = esDestinoFinal 
            ? (rutaData.precio || 0)
            : primerDestino.precio;
          
          // Preseleccionar el primer destino
          setFormData((prev) => ({
            ...prev,
            destinoIntermedio: esDestinoFinal ? "" : primerDestino.nombre,
            monto: montoInicial > 0 ? montoInicial.toString() : prev.monto,
          }));
        }
      }
    } catch (error) {
      console.error("Error al cargar ruta y destinos:", error);
    }
  }

  // Autocompletar pasajero por DNI
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

  // Actualizar monto cuando se selecciona destino intermedio
  const handleDestinoChange = (destino: string) => {
    // Buscar el destino en la lista de destinos disponibles
    const destinoData = destinosDisponibles.find((d) => d.nombre === destino);
    
    // Si el destino es el destino final (valor vacío en el option o esDestinoFinal), no es destino intermedio
    const esDestinoFinal = destinoData?.esDestinoFinal || destino === ruta?.destino || destino === "";
    
    setFormData((prev) => ({
      ...prev,
      destinoIntermedio: esDestinoFinal ? "" : destino,
    }));
    
    // Cargar precio automáticamente
    if (esDestinoFinal) {
      // Si es destino final, usar el precio de la ruta completa
      if (ruta && ruta.precio > 0) {
        setFormData((prev) => ({
          ...prev,
          monto: ruta.precio.toString(),
        }));
      }
    } else if (destinoData) {
      // Si es parada intermedia, usar el precio de la parada
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
      // Validar campos
      if (!formData.dni || !formData.nombre || !formData.telefono || !formData.monto) {
        setError("Por favor completa todos los campos obligatorios");
        setLoading(false);
        return;
      }
      

      const monto = parseFloat(formData.monto);
      if (isNaN(monto) || monto <= 0) {
        setError("El monto debe ser un número válido mayor a 0");
        setLoading(false);
        return;
      }

      // Crear reserva con transacción
      // Solo incluir destinoIntermedio si tiene un valor válido
      const datosReserva: {
        nombre: string;
        dni: string;
        telefono: string;
        destinoIntermedio?: string;
        monto: number;
        metodoPago: 'efectivo' | 'yape' | 'plin';
      } = {
        nombre: formData.nombre,
        dni: formData.dni,
        telefono: formData.telefono,
        monto: monto,
        metodoPago: formData.metodoPago,
      };
      
      // Solo agregar destinoIntermedio si tiene valor
      if (formData.destinoIntermedio && formData.destinoIntermedio.trim() !== '' && formData.destinoIntermedio !== ruta?.destino) {
        datosReserva.destinoIntermedio = formData.destinoIntermedio;
      }
      
      if (!ruta) {
        setError("No se pudo cargar la información de la ruta");
        setLoading(false);
        return;
      }
      
      await createBooking(tripId, seat.id, datosReserva, ruta);

      // Limpiar formulario y cerrar modal
      setFormData({
        dni: "",
        nombre: "",
        telefono: "",
        destinoIntermedio: "",
        monto: "",
        metodoPago: "efectivo",
      });
      onComplete();
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Venta - Asiento {seat.numeroAsiento}</DialogTitle>
          <DialogDescription>
            Completa los datos del pasajero para confirmar la venta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* DNI con autocompletado */}
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <div className="relative">
                <Input
                  id="dni"
                  name="dni"
                  type="text"
                  placeholder="12345678"
                  value={formData.dni}
                  onChange={handleChange}
                  onBlur={handleDniBlur}
                  required
                  maxLength={8}
                  pattern="[0-9]{8}"
                />
                {buscandoPasajero && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Ingresa el DNI y se buscará información del pasajero si existe
              </p>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Juan Pérez García"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="987654321"
                value={formData.telefono}
                onChange={handleChange}
                required
                maxLength={9}
                pattern="[0-9]{9}"
              />
            </div>

            {/* Destino (con escalas) - Filtrado según reservas existentes */}
            {ruta && destinosDisponibles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="destinoIntermedio">Destino *</Label>
                {puntoOrigen && puntoOrigen !== ruta.origen && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Origen: {puntoOrigen} (el asiento ya tiene reservas hasta aquí)
                  </p>
                )}
                <Select
                  id="destinoIntermedio"
                  name="destinoIntermedio"
                  value={formData.destinoIntermedio || (destinosDisponibles.find(d => d.esDestinoFinal) ? "" : destinosDisponibles[0]?.nombre || "")}
                  onChange={(e) => handleDestinoChange(e.target.value)}
                  required
                >
                  {destinosDisponibles.map((destino) => (
                    <option key={destino.nombre} value={destino.esDestinoFinal ? "" : destino.nombre}>
                      {destino.nombre} {destino.esDestinoFinal ? `(Destino final - S/ ${destino.precio > 0 ? destino.precio.toFixed(2) : 'N/A'})` : `(S/ ${destino.precio.toFixed(2)})`}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.destinoIntermedio
                    ? `El pasajero se bajará en ${formData.destinoIntermedio}`
                    : formData.destinoIntermedio === "" && destinosDisponibles.find(d => d.esDestinoFinal)
                    ? `El pasajero viaja hasta ${destinosDisponibles.find(d => d.esDestinoFinal)?.nombre || ruta.destino}`
                    : "Selecciona un destino para continuar"}
                </p>
              </div>
            )}
            {ruta && destinosDisponibles.length === 0 && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  ⚠️ Este asiento ya está completamente ocupado hasta el destino final. No se pueden realizar más reservas.
                </p>
              </div>
            )}

            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="monto">Monto (S/) *</Label>
              <Input
                id="monto"
                name="monto"
                type="number"
                step="0.01"
                min="0"
                placeholder="50.00"
                value={formData.monto}
                onChange={handleChange}
                required
              />
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
              <Label htmlFor="metodoPago">Método de Pago *</Label>
              <Select
                id="metodoPago"
                name="metodoPago"
                value={formData.metodoPago}
                onChange={handleChange}
                required
              >
                <option value="efectivo">Efectivo</option>
                <option value="yape">YAPE</option>
                <option value="plin">PLIN</option>
              </Select>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Confirmar Venta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
