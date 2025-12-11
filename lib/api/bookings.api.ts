import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../services/firebase.service';
import type { Booking, Route, PagoInfo } from '../types';
import { formatLocalDate } from '../utils/formatters';
import { logError } from '../utils/logger';

/**
 * Obtener orden de paradas en una ruta
 */
export function obtenerOrdenParadas(ruta: Route): Map<string, number> {
  const orden = new Map<string, number>();
  orden.set(ruta.origen, 0);

  if (ruta.paradasIntermedias && ruta.paradasIntermedias.length > 0) {
    const paradasOrdenadas = [...ruta.paradasIntermedias].sort((a, b) => a.orden - b.orden);
    paradasOrdenadas.forEach((parada) => {
      orden.set(parada.nombre, parada.orden);
    });

    const maxOrdenParada = Math.max(...paradasOrdenadas.map((p) => p.orden));
    orden.set(ruta.destino, maxOrdenParada + 1);
  } else {
    orden.set(ruta.destino, 1);
  }

  return orden;
}

/**
 * Verificar si dos tramos se solapan
 */
function verificarConflictoTramos(
  ruta: Route,
  tramo1Origen: string,
  tramo1Destino: string,
  tramo2Origen: string,
  tramo2Destino: string
): boolean {
  const orden = obtenerOrdenParadas(ruta);

  const orden1Inicio = orden.get(tramo1Origen) ?? -1;
  const orden1Fin = orden.get(tramo1Destino) ?? -1;
  const orden2Inicio = orden.get(tramo2Origen) ?? -1;
  const orden2Fin = orden.get(tramo2Destino) ?? -1;

  if (orden1Inicio === -1 || orden1Fin === -1 || orden2Inicio === -1 || orden2Fin === -1) {
    return true;
  }

  const tramo1Inicio = Math.min(orden1Inicio, orden1Fin);
  const tramo1Fin = Math.max(orden1Inicio, orden1Fin);
  const tramo2Inicio = Math.min(orden2Inicio, orden2Fin);
  const tramo2Fin = Math.max(orden2Inicio, orden2Fin);

  return tramo2Inicio < tramo1Fin && tramo2Fin > tramo1Inicio;
}

/**
 * Obtener todas las reservas de un asiento específico
 */
export async function getBookingsForSeat(
  viajeId: string,
  asientoId: string
): Promise<Booking[]> {
  const reservasRef = collection(db, 'reservas');
  const q = query(
    reservasRef,
    where('viajeId', '==', viajeId),
    where('asientoId', '==', asientoId),
    where('estado', '==', 'confirmado')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
}

/**
 * Verificar disponibilidad de asiento para un tramo específico
 */
export async function verificarDisponibilidadTramo(
  viajeId: string,
  asientoId: string,
  ruta: Route,
  destinoSeleccionado: string,
  origenPersonalizado?: string
): Promise<{ disponible: boolean; motivo?: string }> {
  try {
    const reservasExistentes = await getBookingsForSeat(viajeId, asientoId);

    if (reservasExistentes.length === 0) {
      return { disponible: true };
    }

    const origenNuevo = origenPersonalizado || ruta.origen;
    const destinoNuevo = destinoSeleccionado;

    for (const reserva of reservasExistentes) {
      const origenExistente = reserva.origenIntermedio || ruta.origen;
      const destinoExistente = reserva.destinoIntermedio || ruta.destino;

      if (
        verificarConflictoTramos(ruta, origenNuevo, destinoNuevo, origenExistente, destinoExistente)
      ) {
        return {
          disponible: false,
          motivo: `El asiento está ocupado desde ${origenExistente} hasta ${destinoExistente}`,
        };
      }
    }

    return { disponible: true };
  } catch (error) {
    logError('Error al verificar disponibilidad', error);
    return { disponible: false, motivo: 'Error al verificar disponibilidad' };
  }
}

/**
 * Obtener destinos disponibles desde un punto de origen específico
 */
export function obtenerDestinosDisponiblesDesde(
  ruta: Route,
  puntoOrigen: string
): Array<{ nombre: string; precio: number; esDestinoFinal: boolean }> {
  const orden = obtenerOrdenParadas(ruta);
  const ordenOrigen = orden.get(puntoOrigen) ?? -1;

  const destinos: Array<{ nombre: string; precio: number; esDestinoFinal: boolean }> = [];

  if (puntoOrigen === ruta.destino) {
    return [];
  }

  if (ordenOrigen === -1) {
    return [];
  }

  if (ruta.paradasIntermedias && ruta.paradasIntermedias.length > 0) {
    const paradasOrdenadas = [...ruta.paradasIntermedias].sort((a, b) => a.orden - b.orden);
    for (const parada of paradasOrdenadas) {
      const ordenParada = orden.get(parada.nombre) ?? -1;
      if (ordenParada > ordenOrigen) {
        destinos.push({
          nombre: parada.nombre,
          precio: parada.precio,
          esDestinoFinal: false,
        });
      }
    }
  }

  const ordenDestinoFinal = orden.get(ruta.destino) ?? -1;
  if (puntoOrigen !== ruta.destino && ordenDestinoFinal > ordenOrigen) {
    destinos.push({
      nombre: ruta.destino,
      precio: ruta.precio || 0,
      esDestinoFinal: true,
    });
  }

  return destinos;
}

/**
 * Determinar el punto de origen más avanzado para un asiento basado en reservas existentes
 */
export async function obtenerPuntoOrigenMasAvanzado(
  viajeId: string,
  asientoId: string,
  ruta: Route
): Promise<string> {
  try {
    const reservasExistentes = await getBookingsForSeat(viajeId, asientoId);

    if (reservasExistentes.length === 0) {
      return ruta.origen;
    }

    const orden = obtenerOrdenParadas(ruta);
    let maxOrden = -1;
    let puntoMasAvanzado = ruta.origen;

    for (const reserva of reservasExistentes) {
      const destinoReserva = reserva.destinoIntermedio || ruta.destino;
      const ordenDestino = orden.get(destinoReserva) ?? -1;

      if (ordenDestino > maxOrden) {
        maxOrden = ordenDestino;
        puntoMasAvanzado = destinoReserva;
      }
    }

    return puntoMasAvanzado;
  } catch (error) {
    logError('Error al obtener punto de origen más avanzado', error);
    return ruta.origen;
  }
}

/**
 * Verificar si un asiento está completamente ocupado
 */
export function estaAsientoCompletamenteOcupado(reservas: Booking[], ruta: Route): boolean {
  if (reservas.length === 0) {
    return false;
  }

  const orden = obtenerOrdenParadas(ruta);
  const ordenDestinoFinal = orden.get(ruta.destino) ?? -1;

  for (const reserva of reservas) {
    const destinoReserva = reserva.destinoIntermedio || ruta.destino;

    if (!reserva.destinoIntermedio || reserva.destinoIntermedio === ruta.destino) {
      return true;
    }

    const ordenDestinoReserva = orden.get(destinoReserva) ?? -1;
    if (ordenDestinoReserva === ordenDestinoFinal) {
      return true;
    }
  }

  const ordenOrigen = orden.get(ruta.origen) ?? 0;
  let maxOrdenAlcanzado = ordenOrigen;
  for (const reserva of reservas) {
    const destinoReserva = reserva.destinoIntermedio || ruta.destino;
    const ordenDestinoReserva = orden.get(destinoReserva) ?? -1;
    if (ordenDestinoReserva > maxOrdenAlcanzado) {
      maxOrdenAlcanzado = ordenDestinoReserva;
    }
  }

  return maxOrdenAlcanzado >= ordenDestinoFinal;
}

/**
 * Crear reserva con transacción (previene doble venta y conflictos de tramos)
 */
export async function createBooking(
  viajeId: string,
  asientoId: string,
  datosPasajero: {
    nombre: string;
    dni: string;
    telefono: string;
    whatsapp?: string;
    destinoIntermedio?: string;
    monto: number;
    metodoPago: 'efectivo' | 'yape' | 'plin';
    origenIntermedio?: string;
    screenshotUrl?: string;
    screenshotPath?: string;
  },
  ruta: Route
): Promise<string> {
  try {
    const destinoSeleccionado = datosPasajero.destinoIntermedio || ruta.destino;
    const origenSeleccionado = datosPasajero.origenIntermedio || ruta.origen;

    const disponibilidad = await verificarDisponibilidadTramo(
      viajeId,
      asientoId,
      ruta,
      destinoSeleccionado,
      origenSeleccionado
    );

    if (!disponibilidad.disponible) {
      throw new Error(disponibilidad.motivo || 'El asiento no está disponible para este tramo');
    }

    const reservasExistentes = await getBookingsForSeat(viajeId, asientoId);

    const origenNuevo = origenSeleccionado;
    const destinoNuevo = destinoSeleccionado;

    for (const reserva of reservasExistentes) {
      const origenExistente = reserva.origenIntermedio || ruta.origen;
      const destinoExistente = reserva.destinoIntermedio || ruta.destino;

      if (
        verificarConflictoTramos(ruta, origenNuevo, destinoNuevo, origenExistente, destinoExistente)
      ) {
        throw new Error(
          `El asiento está ocupado desde ${origenExistente} hasta ${destinoExistente}`
        );
      }
    }

    const reservaId = await runTransaction(db, async (transaction) => {
      const asientoRef = doc(db, `viajes/${viajeId}/asientos`, asientoId);
      const asientoSnap = await transaction.get(asientoRef);

      if (!asientoSnap.exists()) {
        throw new Error('El asiento no existe');
      }

      for (const reservaExistente of reservasExistentes) {
        const reservaRef = doc(db, 'reservas', reservaExistente.id);
        const reservaSnap = await transaction.get(reservaRef);

        if (!reservaSnap.exists() || reservaSnap.data()?.estado !== 'confirmado') {
          continue;
        }

        const reservaData = reservaSnap.data() as Booking;
        const origenExistente = reservaData.origenIntermedio || ruta.origen;
        const destinoExistente = reservaData.destinoIntermedio || ruta.destino;

        if (
          verificarConflictoTramos(
            ruta,
            origenNuevo,
            destinoNuevo,
            origenExistente,
            destinoExistente
          )
        ) {
          throw new Error(
            `El asiento está ocupado desde ${origenExistente} hasta ${destinoExistente}`
          );
        }
      }

      const reservasRef = collection(db, 'reservas');
      const nuevaReservaRef = doc(reservasRef);

      const estadoPago: 'pendiente' | 'validado' | 'rechazado' =
        datosPasajero.metodoPago === 'efectivo' ? 'validado' : 'pendiente';

      const pago: PagoInfo = {
        metodoPago: datosPasajero.metodoPago,
        monto: datosPasajero.monto,
        estado: estadoPago,
        ...(datosPasajero.screenshotUrl && { screenshotUrl: datosPasajero.screenshotUrl }),
        ...(datosPasajero.screenshotPath && { screenshotPath: datosPasajero.screenshotPath }),
      };

      const reserva: Omit<Booking, 'id'> = {
        viajeId,
        asientoId,
        nombrePasajero: datosPasajero.nombre,
        dniPasajero: datosPasajero.dni,
        telefonoPasajero: datosPasajero.telefono,
        ...(datosPasajero.whatsapp && { whatsappPasajero: datosPasajero.whatsapp }),
        ...(datosPasajero.origenIntermedio &&
          datosPasajero.origenIntermedio.trim() !== '' && {
            origenIntermedio: datosPasajero.origenIntermedio,
          }),
        ...(datosPasajero.destinoIntermedio &&
          datosPasajero.destinoIntermedio.trim() !== '' && {
            destinoIntermedio: datosPasajero.destinoIntermedio,
          }),
        pago,
        estado: 'confirmado',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      transaction.set(nuevaReservaRef, reserva);

      transaction.update(asientoRef, {
        updatedAt: Timestamp.now(),
      });

      return nuevaReservaRef.id;
    });

    return reservaId;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener reservas de un viaje
 */
export async function getBookingsForTrip(viajeId: string): Promise<Booking[]> {
  const reservasRef = collection(db, 'reservas');
  const q = query(reservasRef, where('viajeId', '==', viajeId));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
}

/**
 * Calcular cuadre de caja para un viaje
 */
export async function getCashSummaryForTrip(viajeId: string): Promise<{
  total: number;
  porMetodo: {
    efectivo: number;
    yape: number;
    plin: number;
  };
  cantidadReservas: number;
}> {
  const reservas = await getBookingsForTrip(viajeId);

  const resumen = {
    total: 0,
    porMetodo: {
      efectivo: 0,
      yape: 0,
      plin: 0,
    },
    cantidadReservas: reservas.length,
  };

  reservas.forEach((reserva) => {
    const monto = reserva.pago?.monto || 0;
    const metodoPago = reserva.pago?.metodoPago || 'efectivo';
    resumen.total += monto;
    resumen.porMetodo[metodoPago] += monto;
  });

  return resumen;
}

/**
 * Suscribirse a cambios de reservas en tiempo real
 */
export function subscribeToBookings(
  viajeId: string,
  callback: (reservas: Booking[]) => void
): () => void {
  const reservasRef = collection(db, 'reservas');
  const q = query(reservasRef, where('viajeId', '==', viajeId));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const reservas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
    callback(reservas);
  });
}

/**
 * Buscar pasajero por DNI (para autocompletar)
 */
export async function buscarPasajeroPorDni(dni: string): Promise<{
  nombre?: string;
  telefono?: string;
  ultimaReserva?: Date;
} | null> {
  if (!dni || dni.length !== 8) {
    return null;
  }

  try {
    const reservasRef = collection(db, 'reservas');
    const q = query(
      reservasRef,
      where('dniPasajero', '==', dni),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const ultimaReserva = snapshot.docs[0].data() as Booking;
    return {
      nombre: ultimaReserva.nombrePasajero,
      telefono: ultimaReserva.telefonoPasajero,
      ultimaReserva: ultimaReserva.createdAt?.toDate(),
    };
  } catch (error) {
    logError('Error al buscar pasajero', error);
    return null;
  }
}

/**
 * Obtener reservas con pagos pendientes de validación
 */
export async function getBookingsWithPendingPayments(): Promise<Booking[]> {
  const reservasRef = collection(db, 'reservas');
  const q = query(
    reservasRef,
    where('pago.estado', '==', 'pendiente'),
    orderBy('createdAt', 'desc')
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    logError('Error al obtener reservas con pagos pendientes', error);
    const allReservas = await getDocs(reservasRef);
    return allReservas.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Booking))
      .filter((booking) => booking.pago?.estado === 'pendiente');
  }
}

/**
 * Buscar boleto por número de ticket
 */
export async function getBookingByTicketNumber(numeroTicket: string): Promise<Booking | null> {
  try {
    const reservasRef = collection(db, 'reservas');
    const q = query(reservasRef, where('boleto.numeroTicket', '==', numeroTicket), limit(1));

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as Booking;
  } catch (error) {
    logError('Error al buscar boleto', error);
    return null;
  }
}

/**
 * Buscar boletos por DNI del pasajero
 */
export async function getBookingsByDni(dni: string): Promise<Booking[]> {
  try {
    const reservasRef = collection(db, 'reservas');
    const q = query(
      reservasRef,
      where('dniPasajero', '==', dni),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    logError('Error al buscar boletos por DNI', error);
    return [];
  }
}

/**
 * Actualizar boleto de una reserva
 */
export async function updateBookingTicket(
  bookingId: string,
  boleto: {
    numeroTicket: string;
    codigoQr: string;
    estado: 'emitido' | 'usado';
    emitidoEn?: Timestamp;
    usadoEn?: Timestamp;
  }
): Promise<void> {
  try {
    const bookingRef = doc(db, 'reservas', bookingId);
    await updateDoc(bookingRef, {
      boleto,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logError('Error al actualizar boleto', error, { bookingId });
    throw new Error('No se pudo actualizar el boleto');
  }
}

/**
 * Marcar boleto como usado (embarcado)
 */
export async function markTicketAsUsed(bookingId: string): Promise<void> {
  try {
    const bookingRef = doc(db, 'reservas', bookingId);
    await updateDoc(bookingRef, {
      estado: 'embarcado',
      'boleto.estado': 'usado',
      'boleto.usadoEn': Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logError('Error al marcar boleto como usado', error);
    throw new Error('No se pudo actualizar el estado del boleto');
  }
}
