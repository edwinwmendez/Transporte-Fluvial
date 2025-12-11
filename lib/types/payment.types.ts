import { Timestamp } from 'firebase/firestore';

/**
 * Información de pago con validación
 */
export interface PagoInfo {
  metodoPago: 'efectivo' | 'yape' | 'plin';
  monto: number;
  estado: 'pendiente' | 'validado' | 'rechazado';
  screenshotUrl?: string; // URL del screenshot en Storage
  screenshotPath?: string; // Path del screenshot en Storage
  validadoPor?: string; // userId del admin que validó
  validadoEn?: Timestamp;
  razonRechazo?: string;
}
