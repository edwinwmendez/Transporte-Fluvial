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
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../services/firebase.service';
import type { Trip, Vessel } from '../types';
import { logError } from '../utils/logger';

/**
 * Obtener todos los viajes
 */
export async function getAllTrips(): Promise<Trip[]> {
  try {
    const viajesRef = collection(db, 'viajes');
    const q = query(viajesRef, orderBy('fechaSalida', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Trip[];
  } catch (error) {
    logError('Error al obtener viajes', error);
    throw new Error('No se pudieron obtener los viajes');
  }
}

/**
 * Obtener un viaje por ID
 */
export async function getTrip(viajeId: string): Promise<Trip | null> {
  const viajeRef = doc(db, 'viajes', viajeId);
  const viajeSnap = await getDoc(viajeRef);

  if (!viajeSnap.exists()) {
    return null;
  }

  return {
    id: viajeSnap.id,
    ...viajeSnap.data(),
  } as Trip;
}

/**
 * Obtener viajes de hoy y mañana
 */
export async function getTripsForTodayAndTomorrow(): Promise<Trip[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  return getTripsByDateRange(today, tomorrow, ['programado']);
}

/**
 * Obtiene viajes en un rango de fechas con filtros opcionales de estado
 */
export async function getTripsByDateRange(
  fechaInicio: Date,
  fechaFin: Date,
  estados?: Trip['estado'][]
): Promise<Trip[]> {
  try {
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    const viajesRef = collection(db, 'viajes');
    let q = query(
      viajesRef,
      where('fechaSalida', '>=', Timestamp.fromDate(inicio)),
      where('fechaSalida', '<=', Timestamp.fromDate(fin))
    );

    if (estados && estados.length > 0) {
      if (estados.length === 1) {
        q = query(q, where('estado', '==', estados[0]));
      } else {
        if (estados.length <= 10) {
          q = query(q, where('estado', 'in', estados));
        } else {
          const resultados: Trip[] = [];
          for (let i = 0; i < estados.length; i += 10) {
            const estadosLote = estados.slice(i, i + 10);
            const qLote = query(
              viajesRef,
              where('fechaSalida', '>=', Timestamp.fromDate(inicio)),
              where('fechaSalida', '<=', Timestamp.fromDate(fin)),
              where('estado', 'in', estadosLote)
            );
            const snapshotLote = await getDocs(qLote);
            const viajesLote = snapshotLote.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Trip[];
            resultados.push(...viajesLote);
          }
          const unicos = new Map<string, Trip>();
          resultados.forEach((viaje) => {
            unicos.set(viaje.id, viaje);
          });
          return Array.from(unicos.values()).sort((a, b) => {
            const fechaA = a.fechaSalida?.toDate
              ? a.fechaSalida.toDate()
              : a.fechaSalida instanceof Timestamp
                ? a.fechaSalida.toDate()
                : new Date(String(a.fechaSalida));
            const fechaB = b.fechaSalida?.toDate
              ? b.fechaSalida.toDate()
              : b.fechaSalida instanceof Timestamp
                ? b.fechaSalida.toDate()
                : new Date(String(b.fechaSalida));
            return fechaA.getTime() - fechaB.getTime();
          });
        }
      }
    }

    const snapshot = await getDocs(q);
    const viajes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Trip[];

    return viajes.sort((a, b) => {
      const fechaA = a.fechaSalida?.toDate
        ? a.fechaSalida.toDate()
        : a.fechaSalida instanceof Timestamp
          ? a.fechaSalida.toDate()
          : new Date(String(a.fechaSalida));
      const fechaB = b.fechaSalida?.toDate
        ? b.fechaSalida.toDate()
        : b.fechaSalida instanceof Timestamp
          ? b.fechaSalida.toDate()
          : new Date(String(b.fechaSalida));
      return fechaA.getTime() - fechaB.getTime();
    });
  } catch (error) {
    logError('Error al obtener viajes por rango de fechas', error);
    throw error;
  }
}

/**
 * Generar asientos para un viaje según la configuración de la embarcación
 */
async function generateSeatsForTrip(viajeId: string, embarcacion: Vessel): Promise<void> {
  try {
    const asientosRef = collection(db, `viajes/${viajeId}/asientos`);

    const asientos: Array<{
      numeroAsiento: string;
      fila: number;
      columna: string;
      posicion: 'ventana' | 'pasillo';
    }> = [];

    const asientosPorLado = embarcacion.columnas / 2;

    if (embarcacion.columnas % 2 !== 0) {
      throw new Error(
        `El número de columnas (${embarcacion.columnas}) debe ser par para el layout 2-2`
      );
    }

    for (let fila = 1; fila <= embarcacion.filas; fila++) {
      const inicioFila = (fila - 1) * asientosPorLado + 1;

      for (let posA = 1; posA <= asientosPorLado; posA++) {
        const esVentanaA = posA === 1;
        const numeroAsientoA = `A${inicioFila + posA - 1}`;

        asientos.push({
          numeroAsiento: numeroAsientoA,
          fila,
          columna: 'A',
          posicion: esVentanaA ? 'ventana' : 'pasillo',
        });
      }

      for (let posB = 1; posB <= asientosPorLado; posB++) {
        const esVentanaB = posB === asientosPorLado;
        const numeroAsientoB = `B${inicioFila + posB - 1}`;

        asientos.push({
          numeroAsiento: numeroAsientoB,
          fila,
          columna: 'B',
          posicion: esVentanaB ? 'ventana' : 'pasillo',
        });
      }
    }

    const batchSize = 500;
    for (let i = 0; i < asientos.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = asientos.slice(i, i + batchSize);

      chunk.forEach((asiento) => {
        const asientoRef = doc(asientosRef);
        batch.set(asientoRef, {
          id: asientoRef.id,
          viajeId,
          numeroAsiento: asiento.numeroAsiento,
          fila: asiento.fila,
          columna: asiento.columna,
          posicion: asiento.posicion,
          estado: 'disponible',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
    }
  } catch (error) {
    logError('Error al generar asientos', error, { viajeId });
    throw new Error('No se pudieron generar los asientos');
  }
}

/**
 * Crear nuevo viaje y generar asientos automáticamente
 */
export async function createTrip(
  tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>,
  embarcacion: Vessel
): Promise<string> {
  try {
    const viajesRef = collection(db, 'viajes');
    const nuevoViaje = {
      ...tripData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const viajeDocRef = await addDoc(viajesRef, nuevoViaje);
    const viajeId = viajeDocRef.id;

    await generateSeatsForTrip(viajeId, embarcacion);

    return viajeId;
  } catch (error) {
    logError('Error al crear viaje', error);
    throw new Error('No se pudo crear el viaje');
  }
}

/**
 * Actualizar viaje (solo si no tiene reservas)
 */
export async function updateTrip(
  tripId: string,
  updates: Partial<Omit<Trip, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const reservasRef = collection(db, 'reservas');
    const q = query(reservasRef, where('viajeId', '==', tripId), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('No se puede editar el viaje porque ya tiene reservas');
    }

    const viajeRef = doc(db, 'viajes', tripId);
    await updateDoc(viajeRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logError('Error al actualizar viaje', error, { tripId, updates });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo actualizar el viaje');
  }
}

/**
 * Eliminar viaje (cancelar)
 */
export async function deleteTrip(tripId: string): Promise<void> {
  try {
    const viajeRef = doc(db, 'viajes', tripId);
    await updateDoc(viajeRef, {
      estado: 'cancelado',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logError('Error al eliminar viaje', error, { tripId });
    throw new Error('No se pudo eliminar el viaje');
  }
}
