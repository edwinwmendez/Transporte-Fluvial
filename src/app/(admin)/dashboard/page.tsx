"use client"

import * as React from "react"
import { TripCard, Trip } from "@/components/admin/TripCard"

// Datos de ejemplo - En producción vendrán de Firestore
const mockTrips: Trip[] = [
  {
    id: "1",
    route: {
      origin: "Atalaya",
      destination: "Pucallpa",
    },
    vessel: {
      name: "Rápido Ucayali",
    },
    departureDate: new Date(Date.now() + 86400000), // Mañana
    totalSeats: 80,
    occupiedSeats: 45,
  },
  {
    id: "2",
    route: {
      origin: "Atalaya",
      destination: "Sepahua",
    },
    vessel: {
      name: "Rápido Ucayali",
    },
    departureDate: new Date(Date.now() + 86400000 * 2), // Pasado mañana
    totalSeats: 80,
    occupiedSeats: 20,
  },
]

export default function DashboardPage() {
  const [selectedTrip, setSelectedTrip] = React.useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Selecciona un viaje para gestionar las ventas
        </p>
      </div>

      {/* Grid responsivo de viajes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {mockTrips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onSelect={(tripId) => {
              setSelectedTrip(tripId)
              // Navegar a página de ventas
              window.location.href = `/ventas/${tripId}`
            }}
          />
        ))}
      </div>

      {mockTrips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm sm:text-base">
            No hay viajes programados
          </p>
        </div>
      )}
    </div>
  )
}
