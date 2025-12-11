import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase.service';
import { logError } from '../utils/logger';

/**
 * Validar o rechazar un pago
 */
export async function validatePayment(
  bookingId: string,
  estado: 'validado' | 'rechazado',
  validadoPor: string,
  razonRechazo?: string
): Promise<void> {
  try {
    const bookingRef = doc(db, 'reservas', bookingId);
    const updateData: Record<string, unknown> = {
      'pago.estado': estado,
      'pago.validadoPor': validadoPor,
      'pago.validadoEn': Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (estado === 'rechazado' && razonRechazo) {
      updateData['pago.razonRechazo'] = razonRechazo;
      updateData['boleto.estado'] = 'anulado';
      updateData['boleto.anuladoEn'] = Timestamp.now();
    }

    await updateDoc(bookingRef, updateData);
  } catch (error) {
    logError('Error al validar pago', error);
    throw new Error('No se pudo actualizar el estado del pago');
  }
}
