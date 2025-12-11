import { z } from 'zod';

/**
 * Schema para validación de ParadaIntermedia
 */
export const paradaIntermediaSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la parada es requerido'),
  distanciaDesdeOrigen: z.number().min(0, 'La distancia debe ser mayor o igual a 0'),
  precio: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  orden: z.number().int().min(1, 'El orden debe ser mayor a 0'),
});

/**
 * Schema para validación de Route
 */
export const routeSchema = z.object({
  origen: z.string().min(1, 'El origen es requerido'),
  destino: z.string().min(1, 'El destino es requerido'),
  distancia: z.number().min(0, 'La distancia debe ser mayor o igual a 0'),
  horasEstimadas: z.number().min(0, 'Las horas estimadas deben ser mayor o igual a 0'),
  precio: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  paradasIntermedias: z.array(paradaIntermediaSchema).optional(),
  activa: z.boolean().default(true),
});

export type RouteFormData = z.infer<typeof routeSchema>;
export type ParadaIntermediaFormData = z.infer<typeof paradaIntermediaSchema>;
