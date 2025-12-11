import { z } from 'zod';

/**
 * Schema para validación de HorarioRecurrente
 */
export const scheduleSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  rutaId: z.string().min(1, 'La ruta es requerida'),
  embarcacionId: z.string().min(1, 'La embarcación es requerida'),
  horaSalida: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  diasSemana: z.array(z.number().int().min(0).max(6)).min(1, 'Debe seleccionar al menos un día'),
  activo: z.boolean().default(true),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;
