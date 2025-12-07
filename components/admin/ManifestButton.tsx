"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { getTrip, getVessel, getBookingsForTrip, getSeatsForTrip } from "@/lib/firestore-helpers";
import { generateManifestPDF } from "@/lib/pdf-generator";

interface ManifestButtonProps {
  tripId: string;
}

export function ManifestButton({ tripId }: ManifestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateManifest = async () => {
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

      const vessel = await getVessel(trip.vesselId);
      if (!vessel) {
        throw new Error("Embarcación no encontrada");
      }

      if (bookings.length === 0) {
        setError("No hay reservas para este viaje");
        return;
      }

      // Generar PDF
      generateManifestPDF({
        trip,
        vessel,
        bookings,
        seats,
      });
    } catch (err: any) {
      console.error("Error al generar manifiesto:", err);
      setError(err.message || "Error al generar el manifiesto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleGenerateManifest}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Imprimir Manifiesto
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
