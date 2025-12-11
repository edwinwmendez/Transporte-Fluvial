import QRCode from 'qrcode';
import { logError } from './utils/logger';

/**
 * Datos que se codifican en el QR del boleto
 */
export interface QRTicketData {
  numeroTicket: string;
  viajeId: string;
  asientoId: string;
  dniPasajero: string;
  asientoNumero: string;
  timestamp: string; // ISO string de la fecha de emisión
}

/**
 * Genera un código QR como Data URL (base64) para el boleto
 * 
 * @param data Datos del boleto a codificar
 * @param size Tamaño del QR en píxeles (default: 200)
 * @returns Data URL del QR (formato: data:image/png;base64,...)
 */
export async function generateTicketQR(
  data: QRTicketData,
  size: number = 200
): Promise<string> {
  try {
    // Convertir datos a JSON string
    const jsonData = JSON.stringify(data);

    // Generar QR con opciones profesionales
    const qrDataUrl = await QRCode.toDataURL(jsonData, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000', // Negro para los módulos
        light: '#FFFFFF', // Blanco para el fondo
      },
      errorCorrectionLevel: 'H', // Alto nivel de corrección (permite logo en centro en futuro)
    });

    return qrDataUrl;
  } catch (error) {
    logError('Error al generar código QR', error, { data });
    throw new Error('No se pudo generar el código QR del boleto');
  }
}

/**
 * Genera un código QR con logo placeholder en el centro
 * (Para uso futuro cuando se tenga logo empresarial)
 * 
 * @param data Datos del boleto
 * @param size Tamaño del QR
 * @param logoUrl URL del logo (opcional)
 * @returns Data URL del QR con logo
 */
export async function generateTicketQRWithLogo(
  data: QRTicketData,
  size: number = 200,
  logoUrl?: string
): Promise<string> {
  // Por ahora, generar QR simple
  // En el futuro se puede usar qr-code-styling para agregar logo
  return generateTicketQR(data, size);
}
