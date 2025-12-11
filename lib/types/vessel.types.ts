import { Timestamp } from 'firebase/firestore';

/**
 * Embarcación (vessel)
 */
export interface Vessel {
  id: string;
  nombre: string;
  capacidad: number;
  filas: number;
  columnas: number;
  activa: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
