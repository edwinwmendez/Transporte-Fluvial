"use client";

import { useEffect, useState } from "react";
import { subscribeToBookings } from "@/lib/firestore-helpers";
import type { Booking } from "@/lib/firestore-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, DollarSign, Wallet, CreditCard, Coins, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CashSummaryCardProps {
  tripId: string;
}

export function CashSummaryCard({ tripId }: CashSummaryCardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualCount, setManualCount] = useState<string>("");

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

  const manualAmount = parseFloat(manualCount || "0");
  const difference = manualAmount - byMethod.efectivo;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  return (
    <Card className="border-border bg-background shadow-sm overflow-hidden">
      <CardHeader className="pb-4 bg-muted/20 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          Cuadre de Caja
        </CardTitle>
        <CardDescription>Total recaudado en tiempo real</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground animate-pulse">
            Cargando información de caja...
          </div>
        ) : (
          <>
            {/* Total General - limpio, SIN gradiente */}
            <div className="relative overflow-hidden rounded-xl bg-primary/5 p-6 border border-primary/20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                  <DollarSign className="w-4 h-4" />
                  Total Recaudado
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="px-2 py-1 rounded-md bg-background border border-border">
                    {bookings.length} venta{bookings.length !== 1 ? "s" : ""} registrada{bookings.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Desglose por método - cards sutiles */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Desglose por Método
              </h4>

              {/* Efectivo */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-success/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-success/10 border border-success/20">
                    <Wallet className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Efectivo</span>
                </div>
                <span className="font-bold text-foreground">{formatCurrency(byMethod.efectivo)}</span>
              </div>

              {/* YAPE */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-purple-500/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground">YAPE</span>
                </div>
                <span className="font-bold text-foreground">{formatCurrency(byMethod.yape)}</span>
              </div>

              {/* PLIN */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-cyan-500/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                    <CreditCard className="h-4 w-4 text-cyan-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground">PLIN</span>
                </div>
                <span className="font-bold text-foreground">{formatCurrency(byMethod.plin)}</span>
              </div>
            </div>

            {/* Conciliación de efectivo */}
            <div className="mt-6">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Conciliación de Efectivo
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={manualCount}
                      onChange={(e) => setManualCount(e.target.value)}
                      className="flex-1 h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Resultados de conciliación */}
                  {manualCount !== "" && (
                    <div className={cn(
                      "rounded-lg p-3 text-sm flex items-center justify-between border",
                      difference === 0
                        ? "bg-success/10 border-success/20 text-success"
                        : difference > 0
                          ? "bg-info/10 border-info/20 text-info"
                          : "bg-error/10 border-error/20 text-error"
                    )}>
                      <div className="flex items-center gap-2 font-medium">
                        {difference === 0 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Cuadre Perfecto</span>
                          </>
                        ) : difference > 0 ? (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            <span>Sobrante</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Faltante</span>
                          </>
                        )}
                      </div>
                      <span className="font-bold font-mono text-base">
                        {difference > 0 ? "+" : ""}{formatCurrency(difference)}
                      </span>
                    </div>
                  )}

                  {manualCount === "" && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Ingresa el monto contado para verificar diferencias
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
