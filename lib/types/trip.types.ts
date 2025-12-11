import { Timestamp } from 'firebase/firestore';

/**
 * Viaje (trip) - Un viaje específico en una fecha y hora
 */
export interface Trip {
  id: string;
  rutaId: string;
  embarcacionId: string;
  fechaSalida: Timestamp;
  horaSalida: string;
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Asiento (seat) en un viaje
 */
export interface Seat {
  id: string;
  viajeId: string;
  numeroAsiento: string;
  fila: number;
  columna: string;
  posicion: 'ventana' | 'pasillo';
  estado: 'disponible' | 'bloqueado' | 'vendido';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
