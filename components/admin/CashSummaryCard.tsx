"use client";

import { useState } from 'react';
import { useBookingsSubscription } from '@/lib/hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, DollarSign, Coins, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { CashIcon, YapeIcon, PlinIcon } from '@/components/ui/payment-icons';
import { cn } from '@/lib/utils';

interface CashSummaryCardProps {
  tripId: string;
}

/**
 * Tarjeta de resumen de caja en tiempo real
 * 
 * Muestra:
 * - Total recaudado
 * - Desglose por método de pago (efectivo, YAPE, PLIN)
 * - Conciliación de efectivo (conteo manual vs sistema)
 */
export function CashSummaryCard({ tripId }: CashSummaryCardProps) {
  const { data: bookings = [], isLoading: loading } = useBookingsSubscription(tripId);
  const [manualCount, setManualCount] = useState<string>('');

  // Calcular totales
  const total = bookings.reduce((sum, booking) => sum + (booking.pago?.monto || 0), 0);
  const byMethod = {
    efectivo: bookings
      .filter((b) => b.pago?.metodoPago === "efectivo")
      .reduce((sum, b) => sum + (b.pago?.monto || 0), 0),
    yape: bookings
      .filter((b) => b.pago?.metodoPago === "yape")
      .reduce((sum, b) => sum + (b.pago?.monto || 0), 0),
    plin: bookings
      .filter((b) => b.pago?.metodoPago === "plin")
      .reduce((sum, b) => sum + (b.pago?.monto || 0), 0),
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
    <Card className="border-2 border-border bg-background shadow-lg overflow-hidden">
      <CardHeader className="pb-5 bg-gradient-to-r from-primary/10 via-primary/5 to-muted/20 border-b-2 border-border">
        <CardTitle className="flex items-center gap-3 text-xl text-foreground">
          <div className="p-2.5 bg-primary/15 rounded-xl border-2 border-primary/30 shadow-sm">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <span>Cuadre de Caja</span>
        </CardTitle>
        <CardDescription className="mt-2 text-muted-foreground font-medium">
          Total recaudado en tiempo real
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded-xl" />
            <div className="space-y-3">
              <div className="h-16 bg-muted animate-pulse rounded-xl" />
              <div className="h-16 bg-muted animate-pulse rounded-xl" />
              <div className="h-16 bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Total General - diseño mejorado */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border-2 border-primary/30 shadow-md">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <div className="p-1.5 rounded-lg bg-primary/20">
                    <DollarSign className="w-3.5 h-3.5 text-primary" />
                  </div>
                  Total Recaudado
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-primary drop-shadow-sm">
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">
                    {bookings.length} venta{bookings.length !== 1 ? "s" : ""} registrada{bookings.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Desglose por método - cards sutiles */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Desglose por Método
              </h4>

              {/* Efectivo */}
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-gradient-to-r from-background to-success/5 hover:border-success/30 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-success/10 border-2 border-success/20 shadow-sm">
                    <CashIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">Efectivo</span>
                    <span className="text-xs text-muted-foreground">Dinero en efectivo</span>
                  </div>
                </div>
                <span className="font-bold text-lg text-foreground">{formatCurrency(byMethod.efectivo)}</span>
              </div>

              {/* YAPE */}
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-gradient-to-r from-background to-[hsl(var(--payment-yape))]/5 hover:border-[hsl(var(--payment-yape))]/30 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-[hsl(var(--payment-yape))]/10 border-2 border-[hsl(var(--payment-yape))]/20 shadow-sm">
                    <YapeIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">YAPE</span>
                    <span className="text-xs text-muted-foreground">BCP - Pago digital</span>
                  </div>
                </div>
                <span className="font-bold text-lg text-foreground">{formatCurrency(byMethod.yape)}</span>
              </div>

              {/* PLIN */}
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-gradient-to-r from-background to-[hsl(var(--payment-plin))]/5 hover:border-[hsl(var(--payment-plin))]/30 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-[hsl(var(--payment-plin))]/10 border-2 border-[hsl(var(--payment-plin))]/20 shadow-sm">
                    <PlinIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">PLIN</span>
                    <span className="text-xs text-muted-foreground">Interbank - Pago digital</span>
                  </div>
                </div>
                <span className="font-bold text-lg text-foreground">{formatCurrency(byMethod.plin)}</span>
              </div>
            </div>

            {/* Conciliación de efectivo */}
            <div className="mt-6">
              <div className="rounded-xl border-2 border-border p-5 bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 rounded-lg bg-muted-foreground/10">
                    <Coins className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Conciliación de Efectivo
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-foreground px-2 py-2 bg-muted rounded-lg border border-border">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={manualCount}
                      onChange={(e) => setManualCount(e.target.value)}
                      className="flex-1 h-11 rounded-lg border-2 border-border bg-background px-4 py-2 text-base font-semibold focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                    />
                  </div>

                  {/* Resultados de conciliación */}
                  {manualCount !== "" && (
                    <div className={cn(
                      "rounded-xl p-4 text-sm flex items-center justify-between border-2 shadow-md",
                      difference === 0
                        ? "bg-gradient-to-r from-success/15 to-success/5 border-success/40 text-success"
                        : difference > 0
                          ? "bg-gradient-to-r from-info/15 to-info/5 border-info/40 text-info"
                          : "bg-gradient-to-r from-error/15 to-error/5 border-error/40 text-error"
                    )}>
                      <div className="flex items-center gap-3 font-bold">
                        {difference === 0 ? (
                          <>
                            <div className="p-1.5 rounded-full bg-success/20">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-base">Cuadre Perfecto</span>
                          </>
                        ) : difference > 0 ? (
                          <>
                            <div className="p-1.5 rounded-full bg-info/20">
                              <PlusCircle className="w-5 h-5" />
                            </div>
                            <span className="text-base">Sobrante</span>
                          </>
                        ) : (
                          <>
                            <div className="p-1.5 rounded-full bg-error/20">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="text-base">Faltante</span>
                          </>
                        )}
                      </div>
                      <span className="font-extrabold font-mono text-xl">
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
