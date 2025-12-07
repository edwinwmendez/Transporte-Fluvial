"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Ship, ArrowRight } from "lucide-react";
import type { Trip } from "@/lib/firestore-helpers";
import { useEffect, useState } from "react";
import { getVessel, getSeatsForTrip } from "@/lib/firestore-helpers";
import type { Vessel, Seat } from "@/lib/firestore-helpers";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const router = useRouter();
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTripData() {
      try {
        const [vesselData, seatsData] = await Promise.all([
          getVessel(trip.vesselId),
          getSeatsForTrip(trip.id),
        ]);
        setVessel(vesselData);
        setSeats(seatsData);
      } catch (error) {
        console.error("Error al cargar datos del viaje:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTripData();
  }, [trip]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const soldSeats = seats.filter((s) => s.status === "sold").length;
  const totalSeats = seats.length || vessel?.capacity || 0;
  const availableSeats = totalSeats - soldSeats;
  const occupancyPercentage = totalSeats > 0 ? (soldSeats / totalSeats) * 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Viaje {trip.departureTime}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4" />
              {formatDate(trip.departureDate)}
            </CardDescription>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              trip.status === "scheduled"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {trip.status === "scheduled" ? "Programado" : trip.status}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {vessel && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ship className="h-4 w-4" />
            <span>{vessel.name}</span>
          </div>
        )}

        {/* Indicador de ocupación */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ocupación</span>
            <span className="font-medium">
              {soldSeats}/{totalSeats} asientos
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{availableSeats} disponibles</span>
            <span>{Math.round(occupancyPercentage)}% ocupado</span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => router.push(`/ventas/${trip.id}`)}
        >
          Gestionar Ventas
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
