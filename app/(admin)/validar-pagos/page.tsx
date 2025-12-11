'use client';

import { useState } from 'react';
import { useBookingsWithPendingPayments } from '@/lib/hooks/useBookings';
import { useValidatePayment } from '@/lib/hooks/usePayments';
import type { Booking } from '@/lib/types';
import { PaymentCard } from './components/PaymentCard';
import { PaymentFilters } from './components/PaymentFilters';
import { RejectPaymentDialog } from './components/RejectPaymentDialog';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { handleError } from '@/lib/utils/error-handler';
import { EmptyState } from '@/components/shared/EmptyState';

/**
 * Página de validación de pagos pendientes
 * 
 * Permite a los administradores revisar y validar/rechazar
 * comprobantes de pago YAPE/PLIN subidos por los clientes.
 */
export default function ValidarPagosPage() {
  const toast = useToast();
  const { data: bookings = [], isLoading: loadingBookings, refetch: refetchBookings } = useBookingsWithPendingPayments();
  const validatePayment = useValidatePayment();

  const [filter, setFilter] = useState<'todos' | 'yape' | 'plin'>('todos');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const filteredBookings = filter === 'todos'
    ? bookings
    : bookings.filter((b) => b.pago?.metodoPago === filter);

  const counts = {
    todos: bookings.length,
    yape: bookings.filter((b) => b.pago?.metodoPago === 'yape').length,
    plin: bookings.filter((b) => b.pago?.metodoPago === 'plin').length,
  };

  const handleValidate = async (bookingId: string) => {
    try {
      // TODO: Obtener userId del admin autenticado
      const validadoPor = 'admin-user-id'; // Temporal
      await validatePayment.mutateAsync({
        bookingId,
        estado: 'validado',
        validadoPor,
      });
      toast.success('Pago validado correctamente');
      refetchBookings();
    } catch (error) {
      const message = handleError(error, { action: 'validatePayment', bookingId });
      toast.error(message);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedBooking) return;

    try {
      // TODO: Obtener userId del admin autenticado
      const validadoPor = 'admin-user-id'; // Temporal
      await validatePayment.mutateAsync({
        bookingId: selectedBooking.id,
        estado: 'rechazado',
        validadoPor,
        razonRechazo: reason,
      });
      setShowRejectDialog(false);
      setSelectedBooking(null);
      toast.success('Pago rechazado');
      refetchBookings();
    } catch (error) {
      const message = handleError(error, { action: 'rejectPayment', bookingId: selectedBooking.id });
      toast.error(message);
    }
  };

  const loading = loadingBookings || validatePayment.isPending;

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando pagos pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Validar Pagos</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Revisa y valida los comprobantes de pago YAPE/PLIN
        </p>
      </div>

      <PaymentFilters filter={filter} onFilterChange={setFilter} counts={counts} />

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No hay pagos pendientes de validación"
          description={
            filter === 'todos'
              ? 'Todos los pagos han sido procesados'
              : `No hay pagos pendientes de ${filter.toUpperCase()}`
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <PaymentCard
              key={booking.id}
              booking={booking}
              onValidate={() => handleValidate(booking.id)}
              onReject={() => {
                setSelectedBooking(booking);
                setShowRejectDialog(true);
              }}
              validating={validatePayment.isPending}
            />
          ))}
        </div>
      )}

      <RejectPaymentDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={handleReject}
        loading={validatePayment.isPending}
      />
    </div>
  );
}
