/**
 * ARCHIVO DE COMPATIBILIDAD - MANTENER HASTA MIGRACIÓN COMPLETA
 * 
 * Este archivo ahora re-exporta desde los nuevos módulos organizados.
 * El código original (1,769 líneas) ha sido dividido en:
 * - lib/types/ - Todos los tipos e interfaces
 * - lib/utils/ - Validadores, formateadores, helpers de fechas
 * - lib/api/ - APIs organizadas por entidad (routes, vessels, trips, bookings, schedules, payments, seats)
 * - lib/services/ - Servicios de Firebase y Storage
 * 
 * TODO: Después de migrar todos los imports, eliminar este archivo
 * y actualizar todos los imports para usar directamente los módulos de lib/api/
 */

// Re-exportar todos los tipos
export * from './types';

// Re-exportar todas las utilidades
export * from './utils';

// Re-exportar todas las APIs
export * from './api';

// Re-exportar funciones específicas que pueden estar en uso directo
export { getRoute } from './api/routes.api';
export { getVessel } from './api/vessels.api';
export { getTrip, getTripsForTodayAndTomorrow, getTripsByDateRange } from './api/trips.api';
export { getSeatsForTrip, subscribeToSeats } from './api/seats.api';
export {
  getBookingsForSeat,
  getBookingsForTrip,
  subscribeToBookings,
  buscarPasajeroPorDni,
  obtenerOrdenParadas,
  obtenerPuntoOrigenMasAvanzado,
  estaAsientoCompletamenteOcupado,
  obtenerDestinosDisponiblesDesde,
  verificarDisponibilidadTramo,
  createBooking,
  getCashSummaryForTrip,
  getBookingsWithPendingPayments,
  getBookingByTicketNumber,
  getBookingsByDni,
  markTicketAsUsed,
} from './api/bookings.api';
export { validatePayment } from './api/payments.api';
export {
  getAllHorariosRecurrentes,
  getHorariosActivos,
  createHorarioRecurrente,
  updateHorarioRecurrente,
  deleteHorarioRecurrente,
  calcularViajesDesdeHorario,
  generarViajesDesdeHorario,
  generarViajesProximoMes,
} from './api/schedules.api';

// Re-exportar utils para compatibilidad
export { parseLocalDate } from './utils/date-helpers';
export { formatLocalDate } from './utils/formatters';
