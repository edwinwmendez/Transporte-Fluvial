"use client";

import { useState } from "react";
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
import { createBooking } from "@/lib/firestore-helpers";
import type { Seat } from "@/lib/firestore-helpers";
import { Loader2 } from "lucide-react";

interface QuickSaleModalProps {
  tripId: string;
  seat: Seat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function QuickSaleModal({
  tripId,
  seat,
  open,
  onOpenChange,
  onComplete,
}: QuickSaleModalProps) {
  const [formData, setFormData] = useState({
    dni: "",
    name: "",
    phone: "",
    amount: "",
    paymentMethod: "efectivo" as "efectivo" | "yape" | "plin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validar campos
      if (!formData.dni || !formData.name || !formData.phone || !formData.amount) {
        setError("Por favor completa todos los campos");
        setLoading(false);
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setError("El monto debe ser un número válido mayor a 0");
        setLoading(false);
        return;
      }

      // Crear booking con transacción
      await createBooking(tripId, seat.id, {
        name: formData.name,
        dni: formData.dni,
        phone: formData.phone,
        amount: amount,
        paymentMethod: formData.paymentMethod,
      });

      // Limpiar formulario y cerrar modal
      setFormData({
        dni: "",
        name: "",
        phone: "",
        amount: "",
        paymentMethod: "efectivo",
      });
      onComplete();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error al crear booking:", err);
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
          <DialogTitle>Registrar Venta - Asiento {seat.seatNumber}</DialogTitle>
          <DialogDescription>
            Completa los datos del pasajero para confirmar la venta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* DNI */}
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                name="dni"
                type="text"
                placeholder="12345678"
                value={formData.dni}
                onChange={handleChange}
                required
                maxLength={8}
                pattern="[0-9]{8}"
              />
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Juan Pérez García"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="987654321"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength={9}
                pattern="[0-9]{9}"
              />
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (S/) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="50.00"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pago *</Label>
              <Select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
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
