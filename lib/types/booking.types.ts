import { Timestamp } from 'firebase/firestore';
import { PagoInfo } from './payment.types';

/**
 * Información del boleto digital generado para una reserva
 * 
 * El boleto incluye un número único, código QR para validación,
 * y opcionalmente el PDF generado almacenado en Firebase Storage.
 * 
 * @property numeroTicket - Número único del ticket (formato: "TKT-YYYYMMDD-####")
 * @property codigoQr - Data URL del código QR generado (base64)
 * @property pdfUrl - URL pública del PDF en Firebase Storage (opcional)
 * @property pdfPath - Path del archivo PDF en Storage (opcional)
 * @property estado - Estado del boleto: 'emitido' | 'usado' | 'anulado'
 * @property emitidoEn - Timestamp de cuando se emitió el boleto
 * @property usadoEn - Timestamp de cuando se marcó como usado (opcional)
 * @property anuladoEn - Timestamp de cuando se anuló (opcional)
 */
export interface BoletoInfo {
  numeroTicket: string; // "TKT-20251209-0001"
  codigoQr: string; // Data URL del QR
  pdfUrl?: string; // URL del PDF en Storage
  pdfPath?: string; // Path del PDF en Storage
  estado: 'emitido' | 'usado' | 'anulado';
  emitidoEn: Timestamp;
  usadoEn?: Timestamp;
  anuladoEn?: Timestamp;
}

/**
 * Representa una reserva (booking) de un pasajero para un viaje específico
 * 
 * Una reserva vincula un pasajero con un asiento en un viaje, incluyendo
 * información de pago, boleto generado, y estado de la reserva.
 * 
 * @property id - Identificador único de la reserva
 * @property viajeId - ID del viaje reservado
 * @property asientoId - ID del asiento asignado
 * @property nombrePasajero - Nombre completo del pasajero
 * @property dniPasajero - DNI del pasajero (8 dígitos)
 * @property telefonoPasajero - Teléfono de contacto (9 dígitos, empieza con 9)
 * @property whatsappPasajero - Número de WhatsApp (opcional, para YAPE/PLIN)
 * @property origenIntermedio - Parada donde sube el pasajero (opcional)
 * @property destinoIntermedio - Parada donde se baja el pasajero (opcional)
 * @property pago - Información del pago asociado
 * @property boleto - Información del boleto digital generado (opcional)
 * @property estado - Estado actual: 'confirmado' | 'embarcado' | 'cancelado' | 'no_show'
 * @property createdAt - Fecha de creación de la reserva
 * @property updatedAt - Fecha de última actualización
 * 
 * @example
 * ```ts
 * const booking: Booking = {
 *   id: "booking123",
 *   viajeId: "viaje456",
 *   asientoId: "asiento789",
 *   nombrePasajero: "Juan Pérez",
 *   dniPasajero: "12345678",
 *   telefonoPasajero: "987654321",
 *   origenIntermedio: "Tahuania",
 *   destinoIntermedio: "Sepahua",
 *   pago: { ... },
 *   estado: "confirmado",
 *   createdAt: Timestamp.now(),
 *   updatedAt: Timestamp.now()
 * };
 * ```
 */
export interface Booking {
  id: string;
  viajeId: string;
  asientoId: string;
  nombrePasajero: string;
  dniPasajero: string;
  telefonoPasajero: string;
  whatsappPasajero?: string;
  origenIntermedio?: string; // Parada donde sube (ej: "Tahuania")
  destinoIntermedio?: string; // Parada donde se baja (ej: "Sepahua")
  pago: PagoInfo;
  boleto?: BoletoInfo;
  estado: 'confirmado' | 'embarcado' | 'cancelado' | 'no_show';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
