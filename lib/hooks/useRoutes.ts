import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../api/routes.api';
import type { Route } from '../types';

/**
 * Hook para obtener todas las rutas disponibles
 * 
 * @returns Query result con todas las rutas del sistema
 * @example
 * ```tsx
 * const { data: rutas, isLoading } = useRoutes();
 * ```
 */
export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: getAllRoutes,
  });
}

/**
 * Hook para obtener una ruta específica por ID
 * 
 * @param rutaId - ID de la ruta a obtener, o null para deshabilitar la query
 * @returns Query result con la ruta solicitada, o null si rutaId es null
 * @example
 * ```tsx
 * const { data: ruta } = useRoute('ruta123');
 * ```
 */
export function useRoute(rutaId: string | null) {
  return useQuery({
    queryKey: ['routes', rutaId],
    queryFn: () => (rutaId ? getRoute(rutaId) : null),
    enabled: !!rutaId,
  });
}

/**
 * Hook para crear una nueva ruta
 * 
 * @returns Mutation object para crear rutas
 * @example
 * ```tsx
 * const createRoute = useCreateRoute();
 * createRoute.mutate({
 *   origen: 'Atalaya',
 *   destino: 'Pucallpa',
 *   distancia: 500,
 *   horasEstimadas: 12,
 *   precio: 150
 * });
 * ```
 */
export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

/**
 * Hook para actualizar una ruta existente
 * 
 * @returns Mutation object para actualizar rutas
 * @example
 * ```tsx
 * const updateRoute = useUpdateRoute();
 * updateRoute.mutate({
 *   rutaId: 'ruta123',
 *   updates: { precio: 160 }
 * });
 * ```
 */
export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rutaId, updates }: { rutaId: string; updates: Partial<Omit<Route, 'id' | 'createdAt'>> }) =>
      updateRoute(rutaId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['routes', variables.rutaId] });
    },
  });
}

/**
 * Hook para eliminar una ruta
 * 
 * @returns Mutation object para eliminar rutas
 * @example
 * ```tsx
 * const deleteRoute = useDeleteRoute();
 * deleteRoute.mutate('ruta123');
 * ```
 */
export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}
