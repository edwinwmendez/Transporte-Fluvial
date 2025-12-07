"use client";

import { useEffect, useState } from "react";
import { subscribeToBookings } from "@/lib/firestore-helpers";
import type { Booking } from "@/lib/firestore-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, DollarSign, CreditCard, Wallet } from "lucide-react";

interface CashSummaryCardProps {
  tripId: string;
}

export function CashSummaryCard({ tripId }: CashSummaryCardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToBookings(tripId, (updatedBookings) => {
      setBookings(updatedBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tripId]);

  // Calcular totales
  const total = bookings.reduce((sum, booking) => sum + booking.monto, 0);
  const byMethod = {
    efectivo: bookings
      .filter((b) => b.metodoPago === "efectivo")
      .reduce((sum, b) => sum + b.monto, 0),
    yape: bookings
      .filter((b) => b.metodoPago === "yape")
      .reduce((sum, b) => sum + b.monto, 0),
    plin: bookings
      .filter((b) => b.metodoPago === "plin")
      .reduce((sum, b) => sum + b.monto, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Cuadre de Caja
        </CardTitle>
        <CardDescription>Total recaudado en tiempo real</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Cargando...
          </div>
        ) : (
          <>
            {/* Total General */}
            <div className="rounded-lg bg-primary/10 p-4 border-2 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Recaudado
                  </span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {bookings.length} venta{bookings.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Desglose por método de pago */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Desglose por Método</h4>

              {/* Efectivo */}
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Efectivo</span>
                </div>
                <span className="font-medium">{formatCurrency(byMethod.efectivo)}</span>
              </div>

              {/* YAPE */}
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">YAPE</span>
                </div>
                <span className="font-medium">{formatCurrency(byMethod.yape)}</span>
              </div>

              {/* PLIN */}
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">PLIN</span>
                </div>
                <span className="font-medium">{formatCurrency(byMethod.plin)}</span>
              </div>
            </div>

            {/* Comparación con dinero físico (placeholder) */}
            <div className="rounded-lg border-2 border-dashed p-4 bg-muted/50">
              <p className="text-xs text-muted-foreground mb-2">
                Comparar con dinero físico contado:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                />
                <span className="text-xs text-muted-foreground">S/</span>
              </div>
              {total > 0 && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Diferencia: {formatCurrency(0)} {/* Se puede calcular cuando se ingrese el monto físico */}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
