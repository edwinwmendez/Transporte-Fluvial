import { z } from 'zod';

/**
 * Schema para validación de Trip
 */
export const tripSchema = z.object({
  rutaId: z.string().min(1, 'La ruta es requerida'),
  embarcacionId: z.string().min(1, 'La embarcación es requerida'),
  fechaSalida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  horaSalida: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  estado: z.enum(['programado', 'en_curso', 'completado', 'cancelado']).default('programado'),
});

export type TripFormData = z.infer<typeof tripSchema>;
