"use client";

import { useEffect, useState } from "react";
import { getTripsForTodayAndTomorrow } from "@/lib/firestore-helpers";
import type { Trip } from "@/lib/firestore-helpers";
import { TripCard } from "@/components/admin/TripCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      try {
        setLoading(true);
        const tripsData = await getTripsForTodayAndTomorrow();
        setTrips(tripsData);
        setError(null);
      } catch (err) {
        console.error("Error al cargar viajes:", err);
        setError("Error al cargar los viajes. Verifica tu conexión a Firebase.");
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando viajes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Viajes programados para hoy y mañana
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No hay viajes programados para hoy o mañana.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Ejecuta el script de seed data para crear viajes de prueba.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
