import { describe, it, expect } from 'vitest';
import { formatLocalDate, formatearPrecio, formatearFecha } from '@/lib/utils/formatters';

describe('formatters', () => {
  describe('formatLocalDate', () => {
    it('debe formatear fecha a YYYY-MM-DD', () => {
      const date = new Date(2025, 0, 15); // 15 de enero de 2025
      expect(formatLocalDate(date)).toBe('2025-01-15');
    });

    it('debe manejar meses y días con un solo dígito', () => {
      const date = new Date(2025, 0, 5); // 5 de enero de 2025
      expect(formatLocalDate(date)).toBe('2025-01-05');
    });
  });

  describe('formatearPrecio', () => {
    it('debe formatear precio en soles peruanos', () => {
      expect(formatearPrecio(150)).toContain('S/');
      expect(formatearPrecio(150)).toContain('150');
    });

    it('debe formatear precios con decimales', () => {
      const formatted = formatearPrecio(150.5);
      expect(formatted).toContain('150');
      expect(formatted).toContain('50');
    });
  });

  describe('formatearFecha', () => {
    it('debe formatear fecha en español', () => {
      const date = new Date(2025, 0, 15); // 15 de enero de 2025
      const formatted = formatearFecha(date);
      expect(formatted).toContain('2025');
      expect(formatted).toContain('enero');
    });
  });
});
