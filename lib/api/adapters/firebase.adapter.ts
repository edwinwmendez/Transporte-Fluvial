/**
 * Adapter de Firebase que implementa las interfaces de repositorios
 * 
 * Este adapter implementa todas las interfaces de repositorios usando Firebase.
 * Cuando se migre a NestJS, solo se cambiará este adapter por implementaciones
 * que llamen a la API REST de NestJS.
 */

import type { IBookingRepository } from '../interfaces/IBookingRepository';
import type { ITripRepository } from '../interfaces/ITripRepository';
import type { IRouteRepository } from '../interfaces/IRouteRepository';
import type { IVesselRepository } from '../interfaces/IVesselRepository';
import type { IScheduleRepository } from '../interfaces/IScheduleRepository';
import type { IPaymentRepository } from '../interfaces/IPaymentRepository';

import * as bookingsApi from '../bookings.api';
import * as tripsApi from '../trips.api';
import * as routesApi from '../routes.api';
import * as vesselsApi from '../vessels.api';
import * as schedulesApi from '../schedules.api';
import * as paymentsApi from '../payments.api';

/**
 * Adapter de Firebase para Bookings
 */
export const firebaseBookingRepository: IBookingRepository = {
  getBookingsForTrip: bookingsApi.getBookingsForTrip,
  getBookingsForSeat: bookingsApi.getBookingsForSeat,
  getBookingsWithPendingPayments: bookingsApi.getBookingsWithPendingPayments,
  getBookingByTicketNumber: bookingsApi.getBookingByTicketNumber,
  getBookingsByDni: bookingsApi.getBookingsByDni,
  buscarPasajeroPorDni: bookingsApi.buscarPasajeroPorDni,
  createBooking: bookingsApi.createBooking,
  markTicketAsUsed: bookingsApi.markTicketAsUsed,
  getCashSummaryForTrip: bookingsApi.getCashSummaryForTrip,
  verificarDisponibilidadTramo: bookingsApi.verificarDisponibilidadTramo,
  obtenerPuntoOrigenMasAvanzado: bookingsApi.obtenerPuntoOrigenMasAvanzado,
  obtenerDestinosDisponiblesDesde: bookingsApi.obtenerDestinosDisponiblesDesde,
  estaAsientoCompletamenteOcupado: bookingsApi.estaAsientoCompletamenteOcupado,
};

/**
 * Adapter de Firebase para Trips
 */
export const firebaseTripRepository: ITripRepository = {
  getAllTrips: tripsApi.getAllTrips,
  getTrip: tripsApi.getTrip,
  getTripsForTodayAndTomorrow: tripsApi.getTripsForTodayAndTomorrow,
  getTripsByDateRange: tripsApi.getTripsByDateRange,
  createTrip: tripsApi.createTrip,
  updateTrip: tripsApi.updateTrip,
  deleteTrip: tripsApi.deleteTrip,
};

/**
 * Adapter de Firebase para Routes
 */
export const firebaseRouteRepository: IRouteRepository = {
  getAllRoutes: routesApi.getAllRoutes,
  getRoute: routesApi.getRoute,
  createRoute: routesApi.createRoute,
  updateRoute: routesApi.updateRoute,
  deleteRoute: routesApi.deleteRoute,
};

/**
 * Adapter de Firebase para Vessels
 */
export const firebaseVesselRepository: IVesselRepository = {
  getAllVessels: vesselsApi.getAllVessels,
  getVessel: vesselsApi.getVessel,
  createVessel: vesselsApi.createVessel,
  updateVessel: vesselsApi.updateVessel,
  deleteVessel: vesselsApi.deleteVessel,
};

/**
 * Adapter de Firebase para Schedules
 */
export const firebaseScheduleRepository: IScheduleRepository = {
  getAllHorariosRecurrentes: schedulesApi.getAllHorariosRecurrentes,
  getHorariosActivos: schedulesApi.getHorariosActivos,
  createHorarioRecurrente: schedulesApi.createHorarioRecurrente,
  updateHorarioRecurrente: schedulesApi.updateHorarioRecurrente,
  deleteHorarioRecurrente: schedulesApi.deleteHorarioRecurrente,
  calcularViajesDesdeHorario: schedulesApi.calcularViajesDesdeHorario,
  generarViajesDesdeHorario: schedulesApi.generarViajesDesdeHorario,
  generarViajesProximoMes: schedulesApi.generarViajesProximoMes,
};

/**
 * Adapter de Firebase para Payments
 */
export const firebasePaymentRepository: IPaymentRepository = {
  validatePayment: paymentsApi.validatePayment,
};
