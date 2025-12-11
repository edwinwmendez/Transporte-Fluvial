import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllHorariosRecurrentes,
  getHorariosActivos,
  createHorarioRecurrente,
  updateHorarioRecurrente,
  deleteHorarioRecurrente,
  calcularViajesDesdeHorario,
  generarViajesDesdeHorario,
  generarViajesProximoMes,
} from '../api/schedules.api';
import type { HorarioRecurrente } from '../types';

/**
 * Hook para obtener todos los horarios recurrentes
 */
export function useHorarios() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: getAllHorariosRecurrentes,
  });
}

/**
 * Hook para obtener horarios activos
 */
export function useHorariosActivos() {
  return useQuery({
    queryKey: ['schedules', 'active'],
    queryFn: getHorariosActivos,
  });
}

/**
 * Hook para crear un horario recurrente
 */
export function useCreateHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHorarioRecurrente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

/**
 * Hook para actualizar un horario recurrente
 */
export function useUpdateHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      horarioId,
      updates,
    }: {
      horarioId: string;
      updates: Partial<Omit<HorarioRecurrente, 'id' | 'createdAt'>>;
    }) => updateHorarioRecurrente(horarioId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.horarioId] });
    },
  });
}

/**
 * Hook para eliminar un horario recurrente
 */
export function useDeleteHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHorarioRecurrente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

/**
 * Hook para calcular viajes desde un horario (sin generarlos)
 */
export function useCalcularViajesDesdeHorario(
  horarioId: string | null,
  fechaInicio: Date | null,
  fechaFin: Date | null
) {
  return useQuery({
    queryKey: ['schedules', 'calculate', horarioId, fechaInicio, fechaFin],
    queryFn: () => {
      if (!horarioId || !fechaInicio || !fechaFin) return 0;
      return calcularViajesDesdeHorario(horarioId, fechaInicio, fechaFin);
    },
    enabled: !!horarioId && !!fechaInicio && !!fechaFin,
  });
}

/**
 * Hook para generar viajes desde un horario
 */
export function useGenerateTripsFromSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      horarioId,
      fechaInicio,
      fechaFin,
      onProgress,
    }: {
      horarioId: string;
      fechaInicio: Date;
      fechaFin: Date;
      onProgress?: (viajeCreado: number, total: number) => void;
    }) => generarViajesDesdeHorario(horarioId, fechaInicio, fechaFin, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

/**
 * Hook para generar viajes del próximo mes
 */
export function useGenerateTripsNextMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generarViajesProximoMes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}
