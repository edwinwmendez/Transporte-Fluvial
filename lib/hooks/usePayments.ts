import { useMutation, useQueryClient } from '@tanstack/react-query';
import { validatePayment } from '../api/payments.api';

/**
 * Hook para validar o rechazar un pago
 * 
 * @returns Mutation object para validar/rechazar pagos
 * 
 * @example
 * ```tsx
 * const validatePayment = useValidatePayment();
 * 
 * // Validar
 * validatePayment.mutate({
 *   bookingId: 'booking123',
 *   estado: 'validado',
 *   validadoPor: 'admin-user-id'
 * });
 * 
 * // Rechazar
 * validatePayment.mutate({
 *   bookingId: 'booking123',
 *   estado: 'rechazado',
 *   validadoPor: 'admin-user-id',
 *   razonRechazo: 'Comprobante no coincide'
 * });
 * ```
 */
export function useValidatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      estado,
      validadoPor,
      razonRechazo,
    }: {
      bookingId: string;
      estado: 'validado' | 'rechazado';
      validadoPor: string;
      razonRechazo?: string;
    }) => validatePayment(bookingId, estado, validadoPor, razonRechazo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'pending-payments'] });
    },
  });
}
