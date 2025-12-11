import { Timestamp } from 'firebase/firestore';

/**
 * Horario recurrente para programación automática de viajes
 */
export interface HorarioRecurrente {
  id: string;
  nombre: string; // Ej: "Atalaya-Pucallpa Lunes/Miércoles/Viernes 6AM"
  rutaId: string;
  embarcacionId: string;
  diasSemana: number[]; // [1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 0=Domingo]
  horaSalida: string; // "06:00"
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
