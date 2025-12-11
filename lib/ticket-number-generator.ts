import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { db } from './firebase';
import { formatLocalDate } from './utils/formatters';
import { logError } from './utils/logger';

/**
 * Genera un número de boleto único con formato: TKT-YYYYMMDD-NNNN
 * Ejemplo: TKT-20251209-0001
 *
 * Usa método de query + incrementar + verificación de unicidad con retry.
 * Apropiado para sistemas de baja-media concurrencia como este.
 *
 * @param maxRetries Número máximo de intentos en caso de colisión (default: 3)
 * @returns Número de boleto único
 */
export async function generateTicketNumber(maxRetries = 3): Promise<string> {
  const hoy = new Date();
  const fechaStr = formatLocalDate(hoy).replace(/-/g, ''); // YYYYMMDD usando hora local
  const prefijo = `TKT-${fechaStr}-`;

  // Método principal: Query último boleto + incrementar + verificar unicidad
  for (let intento = 0; intento < maxRetries; intento++) {
    try {
      // 1. Buscar último boleto del día
      const reservasRef = collection(db, 'reservas');
      const q = query(
        reservasRef,
        where('boleto.numeroTicket', '>=', prefijo),
        where('boleto.numeroTicket', '<', `${prefijo}9999`),
        orderBy('boleto.numeroTicket', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      // 2. Calcular siguiente número
      let siguienteNumero = 1;
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const ultimoBoleto = data?.boleto?.numeroTicket as string | undefined;
        if (ultimoBoleto && ultimoBoleto.startsWith(prefijo)) {
          const numeroStr = ultimoBoleto.replace(prefijo, '');
          const numero = parseInt(numeroStr, 10);
          siguienteNumero = isNaN(numero) ? 1 : numero + 1;
        }
      }

      const numeroFormateado = siguienteNumero.toString().padStart(4, '0');
      const numeroTicket = `${prefijo}${numeroFormateado}`;

      // 3. Verificar unicidad antes de retornar
      const esUnico = await verificarNumeroTicketUnico(numeroTicket);
      if (esUnico) {
        return numeroTicket;
      }

      // Si no es único, hacer retry (muy raro pero posible en concurrencia)
      console.warn(
        `[Ticket] Colisión detectada para ${numeroTicket}, reintentando (${intento + 1}/${maxRetries})...`
      );
    } catch (error) {
      logError('Error al generar número de ticket', error, { intento: intento + 1, maxRetries });

      // Si es el último intento, lanzar el error
      if (intento === maxRetries - 1) {
        throw error;
      }
    }
  }

  // Fallback final: timestamp + random (prácticamente imposible llegar aquí)
  // Solo ocurriría si hay múltiples colisiones consecutivas o errores persistentes
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');
  const fallbackTicket = `${prefijo}${timestamp}${random}`;

  console.warn(`[Ticket] Usando fallback después de ${maxRetries} intentos: ${fallbackTicket}`);
  return fallbackTicket;
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
    const q = query(reservasRef, where('boleto.numeroTicket', '==', numeroTicket));

    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    logError('Error al verificar unicidad del boleto', error);
    // En caso de error, asumir que es único para no bloquear el flujo
    return true;
  }
}
