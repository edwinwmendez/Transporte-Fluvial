/**
 * Interfaz para el repositorio de Payments
 * Preparado para migración futura a NestJS
 */
export interface IPaymentRepository {
  validatePayment(
    bookingId: string,
    estado: 'validado' | 'rechazado',
    validadoPor: string,
    razonRechazo?: string
  ): Promise<void>;
}
