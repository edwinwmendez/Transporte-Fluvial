import { Timestamp } from 'firebase/firestore';

/**
 * Tipo unión para timestamps de Firestore que puede ser:
 * - Timestamp de Firestore
 * - Date de JavaScript
 * - String ISO
 * - Number (timestamp Unix)
 * 
 * @example
 * ```ts
 * const timestamp1: FirestoreTimestamp = Timestamp.now();
 * const timestamp2: FirestoreTimestamp = new Date();
 * const timestamp3: FirestoreTimestamp = "2025-01-15T10:00:00Z";
 * ```
 */
export type FirestoreTimestamp = Timestamp | Date | string | number;

/**
 * Tipo extendido de Error para errores de aplicación con información adicional
 * 
 * @property message - Mensaje de error legible
 * @property code - Código de error opcional para identificación
 * @property statusCode - Código de estado HTTP opcional
 */
export type AppError = Error & {
  message: string;
  code?: string;
  statusCode?: number;
};

/**
 * Convierte un timestamp de Firestore a Date de JavaScript
 * 
 * Maneja diferentes formatos de entrada y siempre retorna un Date válido.
 * Útil para evitar problemas de zona horaria al trabajar con Firestore.
 * 
 * @param timestamp - Timestamp en cualquier formato soportado
 * @returns Date de JavaScript en la zona horaria local
 * 
 * @example
 * ```ts
 * const date = formatFirestoreDate(Timestamp.now());
 * const date2 = formatFirestoreDate("2025-01-15T10:00:00Z");
 * ```
 */
export function formatFirestoreDate(timestamp: FirestoreTimestamp): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as Timestamp).toDate();
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  return new Date();
}
