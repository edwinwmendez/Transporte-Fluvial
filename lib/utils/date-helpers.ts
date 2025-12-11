/**
 * Convierte un string de fecha (YYYY-MM-DD) a Date en hora local medianoche
 *
 * IMPORTANTE: Evita problemas de zona horaria al interpretar strings como UTC.
 * new Date("2026-01-01") interpreta como UTC, lo que causa desfases.
 * Esta función crea la fecha en la timezone local del usuario.
 *
 * @param dateString String en formato YYYY-MM-DD (de input type="date")
 * @returns Date en hora local medianoche (00:00:00.000)
 *
 * @example
 * // Usuario en Perú (UTC-5)
 * new Date("2026-01-01") // → 2025-12-31T19:00:00-05:00 (INCORRECTO)
 * parseLocalDate("2026-01-01") // → 2026-01-01T00:00:00-05:00 (CORRECTO)
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Crear fecha en hora local (mes es 0-indexed en JavaScript)
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}
