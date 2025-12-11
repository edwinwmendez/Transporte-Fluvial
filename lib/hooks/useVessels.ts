import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllVessels,
  getVessel,
  createVessel,
  updateVessel,
  deleteVessel,
} from '../api/vessels.api';
import type { Vessel } from '../types';

/**
 * Hook para obtener todas las embarcaciones
 */
export function useVessels() {
  return useQuery({
    queryKey: ['vessels'],
    queryFn: getAllVessels,
  });
}

/**
 * Hook para obtener una embarcación por ID
 */
export function useVessel(embarcacionId: string | null) {
  return useQuery({
    queryKey: ['vessels', embarcacionId],
    queryFn: () => (embarcacionId ? getVessel(embarcacionId) : null),
    enabled: !!embarcacionId,
  });
}

/**
 * Hook para crear una embarcación
 */
export function useCreateVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVessel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
}

/**
 * Hook para actualizar una embarcación
 */
export function useUpdateVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      embarcacionId,
      updates,
    }: {
      embarcacionId: string;
      updates: Partial<Omit<Vessel, 'id' | 'createdAt'>>;
    }) => updateVessel(embarcacionId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      queryClient.invalidateQueries({ queryKey: ['vessels', variables.embarcacionId] });
    },
  });
}

/**
 * Hook para eliminar una embarcación
 */
export function useDeleteVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVessel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
}
