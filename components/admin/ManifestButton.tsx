"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Loader2, FileSpreadsheet } from "lucide-react";
import { getTrip, getVessel, getBookingsForTrip, getSeatsForTrip, getRoute } from "@/lib/firestore-helpers";
import { ManifestPreviewModal } from "./ManifestPreviewModal";
import type { Trip, Vessel, Booking, Seat, Route } from "@/lib/firestore-helpers";

interface ManifestButtonProps {
  tripId: string;
}

export function ManifestButton({ tripId }: ManifestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [manifestData, setManifestData] = useState<{
    trip: Trip;
    vessel: Vessel;
    bookings: Booking[];
    seats: Seat[];
    route: Route | null;
  } | null>(null);

  const handlePreviewManifest = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos necesarios
      const [trip, bookings, seats] = await Promise.all([
        getTrip(tripId),
        getBookingsForTrip(tripId),
        getSeatsForTrip(tripId),
      ]);

      if (!trip) {
        throw new Error("Viaje no encontrado");
      }

      const vessel = await getVessel(trip.embarcacionId);
      if (!vessel) {
        throw new Error("Embarcación no encontrada");
      }

      const route = trip.rutaId ? await getRoute(trip.rutaId) : null;

      if (bookings.length === 0) {
        setError("No hay reservas para este viaje");
        return;
      }

      // Guardar datos y mostrar preview
      setManifestData({ trip, vessel, bookings, seats, route });
      setShowPreview(true);
    } catch (err: any) {
      console.error("Error al cargar datos del manifiesto:", err);
      setError(err.message || "Error al cargar el manifiesto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <Button
          onClick={handlePreviewManifest}
          disabled={loading}
          variant="outline"
          className="gap-2 font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4" />
              Ver Manifiesto
            </>
          )}
        </Button>
        {error && (
          <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>
        )}
      </div>

      {showPreview && manifestData && (
        <ManifestPreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          trip={manifestData.trip}
          vessel={manifestData.vessel}
          bookings={manifestData.bookings}
          seats={manifestData.seats}
          route={manifestData.route}
        />
      )}
    </>
  );
}
