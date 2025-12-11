import { describe, it, expect } from 'vitest';
import { validarDNI, validarTelefono, validarEmail, sanitizarTexto } from '@/lib/utils/validators';

describe('validators', () => {
  describe('validarDNI', () => {
    it('debe validar DNI correcto de 8 dígitos', () => {
      expect(validarDNI('12345678')).toBe(true);
      expect(validarDNI('87654321')).toBe(true);
    });

    it('debe rechazar DNI con menos de 8 dígitos', () => {
      expect(validarDNI('1234567')).toBe(false);
      expect(validarDNI('12345')).toBe(false);
    });

    it('debe rechazar DNI con más de 8 dígitos', () => {
      expect(validarDNI('123456789')).toBe(false);
    });

    it('debe rechazar DNI con letras', () => {
      expect(validarDNI('1234567a')).toBe(false);
      expect(validarDNI('abcdefgh')).toBe(false);
    });

    it('debe ignorar espacios en blanco', () => {
      expect(validarDNI(' 12345678 ')).toBe(true);
    });
  });

  describe('validarTelefono', () => {
    it('debe validar teléfono correcto de 9 dígitos que empieza con 9', () => {
      expect(validarTelefono('987654321')).toBe(true);
      expect(validarTelefono('912345678')).toBe(true);
    });

    it('debe rechazar teléfono que no empieza con 9', () => {
      expect(validarTelefono('812345678')).toBe(false);
      expect(validarTelefono('123456789')).toBe(false);
    });

    it('debe rechazar teléfono con menos de 9 dígitos', () => {
      expect(validarTelefono('98765432')).toBe(false);
    });

    it('debe ignorar espacios en blanco', () => {
      expect(validarTelefono(' 987654321 ')).toBe(true);
      expect(validarTelefono('987 654 321')).toBe(true);
    });
  });

  describe('validarEmail', () => {
    it('debe validar emails correctos', () => {
      expect(validarEmail('test@example.com')).toBe(true);
      expect(validarEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('debe rechazar emails sin @', () => {
      expect(validarEmail('testexample.com')).toBe(false);
    });

    it('debe rechazar emails sin dominio', () => {
      expect(validarEmail('test@')).toBe(false);
    });

    it('debe ignorar espacios en blanco', () => {
      expect(validarEmail(' test@example.com ')).toBe(true);
    });
  });

  describe('sanitizarTexto', () => {
    it('debe remover caracteres peligrosos', () => {
      expect(sanitizarTexto('<script>alert("xss")</script>')).not.toContain('<');
      expect(sanitizarTexto('<script>alert("xss")</script>')).not.toContain('>');
    });

    it('debe remover javascript:', () => {
      expect(sanitizarTexto('javascript:alert("xss")')).not.toContain('javascript:');
    });

    it('debe limitar la longitud del texto', () => {
      const longText = 'a'.repeat(1000);
      const sanitized = sanitizarTexto(longText, 100);
      expect(sanitized.length).toBeLessThanOrEqual(100);
    });

    it('debe mantener texto válido sin cambios', () => {
      const text = 'Texto válido sin problemas';
      expect(sanitizarTexto(text)).toBe(text);
    });
  });
});
