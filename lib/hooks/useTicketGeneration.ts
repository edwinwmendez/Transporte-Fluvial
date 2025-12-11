import { useState, useCallback } from 'react';
import { generateTicketNumber } from '../ticket-number-generator';
import { generateTicketQR, type QRTicketData } from '../qr-generator';

/**
 * Hook para generar números de ticket únicos y códigos QR asociados
 * 
 * Genera:
 * - Número de ticket único usando el generador de números
 * - Código QR con los datos del ticket para validación
 * 
 * @returns Objeto con generateTicket (función async) y generating (estado booleano)
 * 
 * @example
 * ```tsx
 * const { generateTicket, generating } = useTicketGeneration();
 * 
 * const handleGenerate = async () => {
 *   const { numeroTicket, codigoQr } = await generateTicket({
 *     viajeId: 'viaje123',
 *     asientoId: 'asiento456',
 *     dniPasajero: '12345678',
 *     asientoNumero: 'A1'
 *   });
 * };
 * ```
 */
export function useTicketGeneration() {
  const [generating, setGenerating] = useState(false);

  const generateTicket = useCallback(async (data: {
    viajeId: string;
    asientoId: string;
    dniPasajero: string;
    asientoNumero: string;
  }): Promise<{ numeroTicket: string; codigoQr: string }> => {
    setGenerating(true);
    try {
      const numeroTicket = await generateTicketNumber();

      const qrData: QRTicketData = {
        numeroTicket,
        viajeId: data.viajeId,
        asientoId: data.asientoId,
        dniPasajero: data.dniPasajero,
        asientoNumero: data.asientoNumero,
        timestamp: new Date().toISOString(),
      };

      const codigoQr = await generateTicketQR(qrData, 150);

      return { numeroTicket, codigoQr };
    } finally {
      setGenerating(false);
    }
  }, []);

  return {
    generateTicket,
    generating,
  };
}
