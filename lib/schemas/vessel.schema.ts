import { z } from 'zod';

/**
 * Schema para validación de Vessel
 */
export const vesselSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  capacidad: z.number().int().min(1, 'La capacidad debe ser mayor a 0'),
  filas: z.number().int().min(1, 'Las filas deben ser mayor a 0'),
  columnas: z.number().int().min(2, 'Las columnas deben ser al menos 2').refine(
    (val) => val % 2 === 0,
    'Las columnas deben ser un número par para el layout 2-2'
  ),
  activa: z.boolean().default(true),
}).refine(
  (data) => data.capacidad === data.filas * data.columnas,
  {
    message: 'La capacidad debe ser igual a filas × columnas',
    path: ['capacidad'],
  }
);

export type VesselFormData = z.infer<typeof vesselSchema>;
