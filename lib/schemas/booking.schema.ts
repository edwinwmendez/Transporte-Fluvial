import { z } from 'zod';

/**
 * Schema para validación de Booking
 */
export const bookingSchema = z.object({
  viajeId: z.string().min(1, 'El viaje es requerido'),
  asientoId: z.string().min(1, 'El asiento es requerido'),
  nombrePasajero: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  dniPasajero: z.string().regex(/^\d{8}$/, 'El DNI debe tener 8 dígitos'),
  telefonoPasajero: z.string().regex(/^9\d{8}$/, 'El teléfono debe tener 9 dígitos y empezar con 9'),
  whatsappPasajero: z.string().regex(/^9\d{8}$/, 'El WhatsApp debe tener 9 dígitos y empezar con 9').optional(),
  origenIntermedio: z.string().optional(),
  destinoIntermedio: z.string().optional(),
});

/**
 * Schema para validación de Passenger (datos del pasajero)
 */
export const passengerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  dni: z.string().regex(/^\d{8}$/, 'El DNI debe tener 8 dígitos'),
  telefono: z.string().regex(/^9\d{8}$/, 'El teléfono debe tener 9 dígitos y empezar con 9'),
  whatsapp: z.string().regex(/^9\d{8}$/, 'El WhatsApp debe tener 9 dígitos y empezar con 9').optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
export type PassengerFormData = z.infer<typeof passengerSchema>;
