import { logError } from './logger';
import type { AppError } from '../types/common.types';

/**
 * Mensajes de error amigables para el usuario en español
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Errores de red
  'network-error': 'Error de conexión. Por favor verifica tu internet e intenta nuevamente.',
  'timeout': 'La solicitud tardó demasiado. Por favor intenta nuevamente.',
  
  // Errores de autenticación
  'unauthorized': 'No tienes permisos para realizar esta acción.',
  'forbidden': 'Acceso denegado. Contacta al administrador.',
  
  // Errores de validación
  'validation-error': 'Los datos ingresados no son válidos. Por favor revisa el formulario.',
  'invalid-dni': 'El DNI debe tener 8 dígitos numéricos.',
  'invalid-phone': 'El teléfono debe tener 9 dígitos y empezar con 9.',
  
  // Errores de negocio
  'seat-unavailable': 'El asiento seleccionado ya no está disponible.',
  'trip-not-found': 'El viaje no fue encontrado.',
  'booking-not-found': 'La reserva no fue encontrada.',
  'payment-pending': 'El pago aún está pendiente de validación.',
  
  // Errores genéricos
  'unknown-error': 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
  'server-error': 'Error del servidor. Por favor intenta más tarde.',
};

/**
 * Obtiene un mensaje de error amigable para el usuario
 * 
 * @param error - Error a procesar
 * @param defaultMessage - Mensaje por defecto si no se encuentra uno específico
 * @returns Mensaje de error amigable en español
 * 
 * @example
 * ```ts
 * const message = getErrorMessage(error, 'Error al guardar');
 * toast.error(message);
 * ```
 */
export function getErrorMessage(error: unknown, defaultMessage = 'Ocurrió un error inesperado'): string {
  if (!error) return defaultMessage;

  // Si es un Error con mensaje
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // Buscar mensaje específico por código o palabra clave
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (errorMessage.includes(key) || error.message.includes(key)) {
        return message;
      }
    }
    
    // Si el mensaje ya está en español y es amigable, usarlo
    if (error.message && !error.message.includes('Error') && !error.message.includes('Failed')) {
      return error.message;
    }
  }

  // Si es un objeto con código
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String(error.code);
    if (ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }
  }

  return defaultMessage;
}

/**
 * Procesa y loguea un error de manera consistente
 * 
 * @param error - Error a procesar
 * @param context - Contexto adicional para el log (ej: { viajeId: '123', action: 'createBooking' })
 * @param userMessage - Mensaje opcional para mostrar al usuario
 * @returns Mensaje de error amigable para el usuario
 * 
 * @example
 * ```ts
 * try {
 *   await createBooking(data);
 * } catch (error) {
 *   const message = handleError(error, { viajeId: data.viajeId }, 'Error al crear reserva');
 *   toast.error(message);
 * }
 * ```
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>,
  userMessage?: string
): string {
  // Loguear error con contexto
  logError('Error en operación', error, context);

  // Retornar mensaje amigable
  return getErrorMessage(error, userMessage || ERROR_MESSAGES['unknown-error']);
}

/**
 * Crea un error tipado de aplicación
 * 
 * @param message - Mensaje de error
 * @param code - Código de error opcional
 * @param statusCode - Código de estado HTTP opcional
 * @returns Error tipado AppError
 * 
 * @example
 * ```ts
 * throw createAppError('Asiento no disponible', 'seat-unavailable', 409);
 * ```
 */
export function createAppError(
  message: string,
  code?: string,
  statusCode?: number
): AppError {
  const error = new Error(message) as AppError;
  if (code) error.code = code;
  if (statusCode) error.statusCode = statusCode;
  return error;
}
