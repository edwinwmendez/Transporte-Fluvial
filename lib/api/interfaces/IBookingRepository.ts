import type { Booking, Route } from '../../types';

/**
 * Interfaz para el repositorio de Bookings
 * Preparado para migración futura a NestJS
 */
export interface IBookingRepository {
  getBookingsForTrip(viajeId: string): Promise<Booking[]>;
  getBookingsForSeat(viajeId: string, asientoId: string): Promise<Booking[]>;
  getBookingsWithPendingPayments(): Promise<Booking[]>;
  getBookingByTicketNumber(numeroTicket: string): Promise<Booking | null>;
  getBookingsByDni(dni: string): Promise<Booking[]>;
  buscarPasajeroPorDni(dni: string): Promise<{
    nombre?: string;
    telefono?: string;
    ultimaReserva?: Date;
  } | null>;
  createBooking(
    viajeId: string,
    asientoId: string,
    datosPasajero: {
      nombre: string;
      dni: string;
      telefono: string;
      whatsapp?: string;
      destinoIntermedio?: string;
      monto: number;
      metodoPago: 'efectivo' | 'yape' | 'plin';
      origenIntermedio?: string;
      screenshotUrl?: string;
      screenshotPath?: string;
    },
    ruta: Route
  ): Promise<string>;
  markTicketAsUsed(bookingId: string): Promise<void>;
  getCashSummaryForTrip(viajeId: string): Promise<{
    total: number;
    porMetodo: {
      efectivo: number;
      yape: number;
      plin: number;
    };
    cantidadReservas: number;
  }>;
  verificarDisponibilidadTramo(
    viajeId: string,
    asientoId: string,
    ruta: Route,
    destinoSeleccionado: string,
    origenPersonalizado?: string
  ): Promise<{ disponible: boolean; motivo?: string }>;
  obtenerPuntoOrigenMasAvanzado(
    viajeId: string,
    asientoId: string,
    ruta: Route
  ): Promise<string>;
  obtenerDestinosDisponiblesDesde(
    ruta: Route,
    puntoOrigen: string
  ): Array<{ nombre: string; precio: number; esDestinoFinal: boolean }>;
  estaAsientoCompletamenteOcupado(reservas: Booking[], ruta: Route): boolean;
}
