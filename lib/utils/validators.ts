/**
 * Valida que un DNI peruano sea válido (8 dígitos)
 *
 * @param dni DNI a validar
 * @returns true si es válido, false en caso contrario
 */
export function validarDNI(dni: string): boolean {
  // DNI en Perú: 8 dígitos
  const dniRegex = /^\d{8}$/;
  return dniRegex.test(dni.trim());
}

/**
 * Valida que un teléfono peruano sea válido (9 dígitos, empieza con 9)
 *
 * @param telefono Teléfono a validar
 * @returns true si es válido, false en caso contrario
 */
export function validarTelefono(telefono: string): boolean {
  // Celular en Perú: 9 dígitos, empieza con 9
  const telefonoRegex = /^9\d{8}$/;
  return telefonoRegex.test(telefono.replace(/\s/g, '')); // Remover espacios
}

/**
 * Valida que un email sea válido (formato básico)
 *
 * @param email Email a validar
 * @returns true si es válido, false en caso contrario
 */
export function validarEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitiza una cadena de texto para prevenir XSS
 * Remueve caracteres peligrosos y limita longitud
 *
 * @param texto Texto a sanitizar
 * @param maxLength Longitud máxima permitida
 * @returns Texto sanitizado
 */
export function sanitizarTexto(texto: string, maxLength: number = 500): string {
  // Remover caracteres peligrosos
  let sanitizado = texto
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .trim();

  // Limitar longitud
  if (sanitizado.length > maxLength) {
    sanitizado = sanitizado.substring(0, maxLength);
  }

  return sanitizado;
}
