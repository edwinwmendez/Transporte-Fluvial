import { describe, it, expect } from 'vitest';
import { parseLocalDate } from '@/lib/utils/date-helpers';

describe('date-helpers', () => {
  describe('parseLocalDate', () => {
    it('debe convertir string YYYY-MM-DD a Date en hora local medianoche', () => {
      const date = parseLocalDate('2025-01-15');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // Enero es 0
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });

    it('debe manejar diferentes fechas correctamente', () => {
      const date1 = parseLocalDate('2025-12-31');
      expect(date1.getFullYear()).toBe(2025);
      expect(date1.getMonth()).toBe(11); // Diciembre es 11
      expect(date1.getDate()).toBe(31);

      const date2 = parseLocalDate('2026-01-01');
      expect(date2.getFullYear()).toBe(2026);
      expect(date2.getMonth()).toBe(0);
      expect(date2.getDate()).toBe(1);
    });
  });
});
