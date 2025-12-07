"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTrip, getVessel } from "@/lib/firestore-helpers";
import type { Trip, Vessel } from "@/lib/firestore-helpers";
import { SeatMap } from "@/components/admin/SeatMap";
import { QuickSaleModal } from "@/components/admin/QuickSaleModal";
import { CashSummaryCard } from "@/components/admin/CashSummaryCard";
import { ManifestButton } from "@/components/admin/ManifestButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VentasPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);

  useEffect(() => {
    async function loadTripData() {
      try {
        setLoading(true);
        const tripData = await getTrip(tripId);
        if (!tripData) {
          console.error("Viaje no encontrado");
          return;
        }
        setTrip(tripData);

        const vesselData = await getVessel(tripData.vesselId);
        setVessel(vesselData);
      } catch (error) {
        console.error("Error al cargar datos del viaje:", error);
      } finally {
        setLoading(false);
      }
    }

    if (tripId) {
      loadTripData();
    }
  }, [tripId]);

  const handleSeatClick = (seat: any) => {
    if (seat.status === "sold") {
      return; // No hacer nada si el asiento ya está vendido
    }
    setSelectedSeat(seat);
    setShowSaleModal(true);
  };

  const handleSaleComplete = () => {
    setSelectedSeat(null);
    setShowSaleModal(false);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando viaje...</p>
        </div>
      </div>
    );
  }

  if (!trip || !vessel) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Viaje no encontrado</p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Gestión de Ventas</h1>
          <p className="text-muted-foreground mt-2">
            {vessel.name} - {formatDate(trip.departureDate)} {trip.departureTime}
          </p>
        </div>
        <ManifestButton tripId={tripId} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mapa de Asientos - Ocupa 2 columnas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Asientos</CardTitle>
              <CardDescription>
                Haz clic en un asiento disponible para registrar una venta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeatMap
                tripId={tripId}
                rows={vessel.rows}
                columns={vessel.columns}
                onSeatClick={handleSeatClick}
                selectedSeatId={selectedSeat?.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Cuadre de Caja - 1 columna */}
        <div className="lg:col-span-1">
          <CashSummaryCard tripId={tripId} />
        </div>
      </div>

      {/* Modal de Venta Rápida */}
      {showSaleModal && selectedSeat && (
        <QuickSaleModal
          tripId={tripId}
          seat={selectedSeat}
          open={showSaleModal}
          onOpenChange={setShowSaleModal}
          onComplete={handleSaleComplete}
        />
      )}
    </div>
  );
}
