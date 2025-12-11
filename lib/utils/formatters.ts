/**
 * Formatea una fecha a string YYYY-MM-DD para inputs de tipo date
 *
 * @param date Fecha a formatear
 * @returns String en formato YYYY-MM-DD
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea un precio a formato de moneda peruana
 *
 * @param precio Precio a formatear
 * @returns String formateado (ej: "S/ 150.00")
 */
export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(precio);
}

/**
 * Formatea una fecha a formato legible en español
 *
 * @param date Fecha a formatear
 * @returns String formateado (ej: "Lunes, 10 de Diciembre de 2025")
 */
export function formatearFecha(date: Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
