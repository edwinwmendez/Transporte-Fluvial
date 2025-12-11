import { z } from 'zod';

/**
 * Schema para validación de Payment
 */
export const paymentSchema = z.object({
  metodoPago: z.enum(['efectivo', 'yape', 'plin']),
  monto: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  estado: z.enum(['pendiente', 'validado', 'rechazado']).default('pendiente'),
  screenshotUrl: z.string().url().optional(),
  screenshotPath: z.string().optional(),
  validadoPor: z.string().optional(),
  validadoEn: z.date().optional(),
  razonRechazo: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
