import type { Route } from '../../types';

/**
 * Interfaz para el repositorio de Routes
 * Preparado para migración futura a NestJS
 */
export interface IRouteRepository {
  getAllRoutes(): Promise<Route[]>;
  getRoute(rutaId: string): Promise<Route | null>;
  createRoute(rutaData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateRoute(
    rutaId: string,
    updates: Partial<Omit<Route, 'id' | 'createdAt'>>
  ): Promise<void>;
  deleteRoute(rutaId: string): Promise<void>;
}
