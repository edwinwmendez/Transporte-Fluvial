import type { Trip, Vessel } from '../../types';

/**
 * Interfaz para el repositorio de Trips
 * Preparado para migración futura a NestJS
 */
export interface ITripRepository {
  getAllTrips(): Promise<Trip[]>;
  getTrip(viajeId: string): Promise<Trip | null>;
  getTripsForTodayAndTomorrow(): Promise<Trip[]>;
  getTripsByDateRange(
    fechaInicio: Date,
    fechaFin: Date,
    estados?: Trip['estado'][]
  ): Promise<Trip[]>;
  createTrip(
    tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>,
    embarcacion: Vessel
  ): Promise<string>;
  updateTrip(
    tripId: string,
    updates: Partial<Omit<Trip, 'id' | 'createdAt'>>
  ): Promise<void>;
  deleteTrip(tripId: string): Promise<void>;
}
