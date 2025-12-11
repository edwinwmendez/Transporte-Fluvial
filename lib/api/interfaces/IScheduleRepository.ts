import type { HorarioRecurrente } from '../../types';

/**
 * Interfaz para el repositorio de Schedules
 * Preparado para migración futura a NestJS
 */
export interface IScheduleRepository {
  getAllHorariosRecurrentes(): Promise<HorarioRecurrente[]>;
  getHorariosActivos(): Promise<HorarioRecurrente[]>;
  createHorarioRecurrente(
    horarioData: Omit<HorarioRecurrente, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string>;
  updateHorarioRecurrente(
    horarioId: string,
    updates: Partial<Omit<HorarioRecurrente, 'id' | 'createdAt'>>
  ): Promise<void>;
  deleteHorarioRecurrente(horarioId: string): Promise<void>;
  calcularViajesDesdeHorario(
    horarioId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<number>;
  generarViajesDesdeHorario(
    horarioId: string,
    fechaInicio: Date,
    fechaFin: Date,
    onProgress?: (viajeCreado: number, total: number) => void
  ): Promise<string[]>;
  generarViajesProximoMes(): Promise<{
    totalGenerados: number;
    porHorario: Array<{ horarioId: string; nombre: string; cantidad: number }>;
  }>;
}
