import type { Vessel } from '../../types';

/**
 * Interfaz para el repositorio de Vessels
 * Preparado para migración futura a NestJS
 */
export interface IVesselRepository {
  getAllVessels(): Promise<Vessel[]>;
  getVessel(embarcacionId: string): Promise<Vessel | null>;
  createVessel(
    embarcacionData: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string>;
  updateVessel(
    embarcacionId: string,
    updates: Partial<Omit<Vessel, 'id' | 'createdAt'>>
  ): Promise<void>;
  deleteVessel(embarcacionId: string): Promise<void>;
}
