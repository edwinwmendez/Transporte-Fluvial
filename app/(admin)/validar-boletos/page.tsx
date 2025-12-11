'use client';

import { useState, useEffect } from 'react';
import { useBookingByTicketNumber, useBookingsByDni, useMarkTicketAsUsed } from '@/lib/hooks/useBookings';
import { BookingSearchForm } from './components/BookingSearchForm';
import { BookingDetails } from './components/BookingDetails';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Ticket, User } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { handleError } from '@/lib/utils/error-handler';
import type { Booking } from '@/lib/types';

/**
 * Página para validar y buscar boletos
 * 
 * Permite:
 * - Buscar boletos por número de ticket
 * - Buscar boletos por DNI del pasajero
 * - Ver detalles completos del boleto
 * - Marcar boletos como usados (embarcados)
 */
export default function ValidarBoletosPage() {
  const toast = useToast();
  const [searchMode, setSearchMode] = useState<'ticket' | 'dni'>('ticket');
  const [searchValue, setSearchValue] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const markTicketAsUsed = useMarkTicketAsUsed();

  // Queries condicionales basadas en el modo de búsqueda
  const { data: bookingByTicket, isLoading: loadingTicket } = useBookingByTicketNumber(
    searchMode === 'ticket' && searchValue.trim().length > 0 ? searchValue.trim() : null
  );
  const { data: bookingsByDni = [], isLoading: loadingDni } = useBookingsByDni(
    searchMode === 'dni' && searchValue.length === 8 ? searchValue : null
  );

  const searching = loadingTicket || loadingDni;
  const bookings = searchMode === 'ticket' && bookingByTicket ? [bookingByTicket] : bookingsByDni;

  const handleSearch = () => {
    if (!searchValue.trim()) {
      return;
    }

    setSelectedBooking(null);

    // Las queries se ejecutan automáticamente cuando cambian los valores
    // Solo necesitamos esperar a que se completen
  };

  // Actualizar selectedBooking cuando cambian los resultados
  useEffect(() => {
    if (bookings.length === 1) {
      setSelectedBooking(bookings[0]);
    } else if (bookings.length === 0) {
      setSelectedBooking(null);
    }
  }, [bookings]);

  const handleMarkAsUsed = async () => {
    if (!selectedBooking) return;

    try {
      await markTicketAsUsed.mutateAsync(selectedBooking.id);
      toast.success('Boleto marcado como usado exitosamente');
      setSelectedBooking((prev) =>
        prev
          ? {
              ...prev,
              estado: 'embarcado',
              boleto: prev.boleto
                ? {
                    ...prev.boleto,
                    estado: 'usado',
                  }
                : undefined,
            }
          : null
      );
    } catch (error) {
      const message = handleError(error, { action: 'markTicketAsUsed', bookingId: selectedBooking.id });
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Validar Boletos</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Busca y valida boletos por número de ticket o DNI del pasajero
        </p>
      </div>

      <BookingSearchForm
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        onSearch={handleSearch}
        searching={searching}
      />

      {searching && (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Ticket}
              title="Buscando boletos..."
              description="Por favor espera mientras se realiza la búsqueda"
            />
          </CardContent>
        </Card>
      )}

      {!searching && searchValue.trim() && bookings.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={searchMode === 'ticket' ? Ticket : User}
              title={`No se encontraron boletos${searchMode === 'ticket' ? ' con ese número' : ' para ese DNI'}`}
              description="Verifica que el número ingresado sea correcto"
            />
          </CardContent>
        </Card>
      )}

      {!searching && bookings.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Se encontraron {bookings.length} boletos:</h3>
              <div className="space-y-2">
                {bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedBooking(booking)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedBooking(booking);
                      }
                    }}
                    aria-label={`Ver detalles de boleto de ${booking.nombrePasajero}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.nombrePasajero}</p>
                          <p className="text-sm text-muted-foreground">
                            DNI: {booking.dniPasajero} • Ticket: {booking.boleto?.numeroTicket || 'N/A'}
                          </p>
                        </div>
                        {selectedBooking?.id === booking.id && (
                          <div className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!searching && selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onMarkAsUsed={handleMarkAsUsed}
          marking={markTicketAsUsed.isPending}
        />
      )}
    </div>
  );
}
