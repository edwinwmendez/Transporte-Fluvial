import { collection, query, where, getDocs, orderBy, limit, doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { logError } from './utils/logger';

/**
 * Genera un número de boleto único con formato: TKT-YYYYMMDD-NNNN
 * Ejemplo: TKT-20251209-0001
 *
 * Usa un contador atómico en Firestore para garantizar unicidad incluso con
 * múltiples ventas concurrentes en el mismo milisegundo.
 *
 * @returns Número de boleto único
 */
import { formatLocalDate } from './utils/formatters';

export async function generateTicketNumber(): Promise<string> {
  const hoy = new Date();
  const fechaStr = formatLocalDate(hoy).replace(/-/g, ''); // YYYYMMDD usando hora local
  const prefijo = `TKT-${fechaStr}-`;

  try {
    // MÉTODO 1 (Principal): Contador atómico con transacción
    // Esto garantiza unicidad incluso con ventas concurrentes
    const counterRef = doc(db, '_counters', `tickets_${fechaStr}`);

    const numeroSecuencial = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      let currentCount = 0;
      if (counterDoc.exists()) {
        currentCount = counterDoc.data()?.count || 0;
      }

      const newCount = currentCount + 1;

      // Actualizar contador atómicamente
      transaction.set(counterRef, {
        count: newCount,
        lastUpdated: new Date().toISOString()
      });

      return newCount;
    });

    const numeroFormateado = numeroSecuencial.toString().padStart(4, '0');
    return `${prefijo}${numeroFormateado}`;

  } catch (transactionError) {
    logError('Error en contador atómico, usando método de respaldo', transactionError);

    // MÉTODO 2 (Fallback): Query del último boleto (menos robusto pero funcional)
    try {
      const reservasRef = collection(db, 'reservas');
      const q = query(
        reservasRef,
        where('boleto.numeroTicket', '>=', prefijo),
        where('boleto.numeroTicket', '<', `${prefijo}9999`),
        orderBy('boleto.numeroTicket', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return `${prefijo}0001`;
      }

      const ultimoBoleto = snapshot.docs[0].data()?.boleto?.numeroTicket as string;
      if (!ultimoBoleto || !ultimoBoleto.startsWith(prefijo)) {
        return `${prefijo}0001`;
      }

      const numeroStr = ultimoBoleto.replace(prefijo, '');
      const numero = parseInt(numeroStr, 10);

      if (isNaN(numero)) {
        return `${prefijo}0001`;
      }

      const siguienteNumero = numero + 1;
      const numeroFormateado = siguienteNumero.toString().padStart(4, '0');

      return `${prefijo}${numeroFormateado}`;
    } catch (queryError) {
      logError('Error en método de respaldo', queryError);
      // MÉTODO 3 (Último recurso): Usar UUID parcial aleatorio
      // Esto es mejor que timestamp porque reduce probabilidad de colisión
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `${prefijo}${random}`;
    }
  }
}

/**
 * Verifica que un número de boleto sea único en la base de datos
 * 
 * @param numeroTicket Número de boleto a verificar
 * @returns true si es único, false si ya existe
 */
export async function verificarNumeroTicketUnico(numeroTicket: string): Promise<boolean> {
  try {
    const reservasRef = collection(db, 'reservas');
    const q = query(
      reservasRef,
      where('boleto.numeroTicket', '==', numeroTicket)
    );

    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    logError('Error al verificar unicidad del boleto', error);
    // En caso de error, asumir que es único para no bloquear el flujo
    return true;
  }
}
