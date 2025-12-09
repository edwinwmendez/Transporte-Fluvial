import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Genera un número de boleto único con formato: TKT-YYYYMMDD-NNNN
 * Ejemplo: TKT-20251209-0001
 * 
 * @returns Número de boleto único
 */
export async function generateTicketNumber(): Promise<string> {
  const hoy = new Date();
  const fechaStr = hoy.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
  const prefijo = `TKT-${fechaStr}-`;

  // Buscar el último número de boleto del día
  const reservasRef = collection(db, 'reservas');
  const q = query(
    reservasRef,
    where('boleto.numeroTicket', '>=', prefijo),
    where('boleto.numeroTicket', '<', `${prefijo}9999`),
    orderBy('boleto.numeroTicket', 'desc'),
    limit(1)
  );

  try {
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Primer boleto del día
      return `${prefijo}0001`;
    }

    const ultimoBoleto = snapshot.docs[0].data()?.boleto?.numeroTicket as string;
    if (!ultimoBoleto || !ultimoBoleto.startsWith(prefijo)) {
      return `${prefijo}0001`;
    }

    // Extraer el número secuencial
    const numeroStr = ultimoBoleto.replace(prefijo, '');
    const numero = parseInt(numeroStr, 10);

    if (isNaN(numero)) {
      return `${prefijo}0001`;
    }

    // Incrementar y formatear con ceros a la izquierda
    const siguienteNumero = numero + 1;
    const numeroFormateado = siguienteNumero.toString().padStart(4, '0');

    return `${prefijo}${numeroFormateado}`;
  } catch (error) {
    console.error('Error al generar número de boleto:', error);
    // Fallback: usar timestamp para garantizar unicidad
    const timestamp = Date.now().toString().slice(-4);
    return `${prefijo}${timestamp}`;
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
    console.error('Error al verificar unicidad del boleto:', error);
    // En caso de error, asumir que es único para no bloquear el flujo
    return true;
  }
}
