'use client';

import { useState } from 'react';
import { Container } from '@/components/shared/Container';
import { SearchFilters, SearchFiltersData } from '@/components/cliente/SearchFilters';
import { TripCard } from '@/components/cliente/TripCard';

// Datos de ejemplo - en producción vendrían de una API
const mockTrips = [
  {
    id: '1',
    origin: 'Atalaya',
    destination: 'Pucallpa',
    departureDate: '2025-12-20T08:00:00',
    arrivalDate: '2025-12-20T20:00:00',
    price: 80,
    availableSeats: 15,
    vessel: { name: 'Amazonas I' },
  },
  {
    id: '2',
    origin: 'Atalaya',
    destination: 'Sepahua',
    departureDate: '2025-12-21T06:00:00',
    arrivalDate: '2025-12-21T16:00:00',
    price: 50,
    availableSeats: 8,
    vessel: { name: 'Urubamba Express' },
  },
  {
    id: '3',
    origin: 'Atalaya',
    destination: 'Puerto Ocopa',
    departureDate: '2025-12-22T07:00:00',
    arrivalDate: '2025-12-22T19:00:00',
    price: 45,
    availableSeats: 3,
    vessel: { name: 'Tambo II' },
  },
];

export default function BuscarPage() {
  const [trips, setTrips] = useState(mockTrips);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (filters: SearchFiltersData) => {
    setIsSearching(true);
    // Simular búsqueda
    setTimeout(() => {
      // En producción, aquí harías la llamada a la API
      setTrips(mockTrips.filter(trip => 
        trip.origin.toLowerCase().includes(filters.origin.toLowerCase()) &&
        trip.destination.toLowerCase().includes(filters.destination.toLowerCase())
      ));
      setIsSearching(false);
    }, 500);
  };

  const handleSelectTrip = (tripId: string) => {
    // Navegar a página de detalle
    window.location.href = `/viajes/${tripId}`;
  };

  return (
    <div className="min-h-screen bg-background-alternate py-6 md:py-8 lg:py-12">
      <Container>
        <div className="space-y-6 md:space-y-8 lg:space-y-12">
          {/* Header */}
          <div className="text-center space-y-2 md:space-y-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Buscar Viajes
            </h1>
            <p className="text-text-secondary text-sm md:text-base lg:text-lg max-w-2xl mx-auto">
              Encuentra el viaje perfecto para ti. Selecciona origen, destino y fecha.
            </p>
          </div>

          {/* Filtros de búsqueda */}
          <SearchFilters onSearch={handleSearch} />

          {/* Resultados */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-semibold">
                Viajes Disponibles
              </h2>
              <span className="text-sm md:text-base text-text-secondary">
                {trips.length} {trips.length === 1 ? 'resultado' : 'resultados'}
              </span>
            </div>

            {isSearching ? (
              <div className="text-center py-12 md:py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-text-secondary">Buscando viajes...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <p className="text-text-secondary text-lg md:text-xl">
                  No se encontraron viajes para tu búsqueda
                </p>
                <p className="text-text-secondary text-sm md:text-base mt-2">
                  Intenta con otros filtros o fechas
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {trips.map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onSelect={handleSelectTrip}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
