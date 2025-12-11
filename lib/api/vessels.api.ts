import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  limit,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase.service';
import type { Vessel } from '../types';
import { logError } from '../utils/logger';

/**
 * Obtener todas las embarcaciones
 */
export async function getAllVessels(): Promise<Vessel[]> {
  try {
    const embarcacionesRef = collection(db, 'embarcaciones');
    const q = query(embarcacionesRef, orderBy('nombre', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vessel[];
  } catch (error) {
    logError('Error al obtener embarcaciones', error);
    throw new Error('No se pudieron obtener las embarcaciones');
  }
}

/**
 * Obtener una embarcación por ID
 */
export async function getVessel(embarcacionId: string): Promise<Vessel | null> {
  const embarcacionRef = doc(db, 'embarcaciones', embarcacionId);
  const embarcacionSnap = await getDoc(embarcacionRef);

  if (!embarcacionSnap.exists()) {
    return null;
  }

  return {
    id: embarcacionSnap.id,
    ...embarcacionSnap.data(),
  } as Vessel;
}

/**
 * Crear nueva embarcación
 */
export async function createVessel(
  embarcacionData: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    // Validar que capacidad = filas * columnas
    const capacidadCalculada = embarcacionData.filas * embarcacionData.columnas;
    if (embarcacionData.capacidad !== capacidadCalculada) {
      throw new Error(
        `La capacidad (${embarcacionData.capacidad}) debe ser igual a filas × columnas (${capacidadCalculada})`
      );
    }

    const embarcacionesRef = collection(db, 'embarcaciones');
    const nuevaEmbarcacion = {
      ...embarcacionData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(embarcacionesRef, nuevaEmbarcacion);
    return docRef.id;
  } catch (error) {
    logError('Error al crear embarcación', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo crear la embarcación');
  }
}

/**
 * Actualizar embarcación
 */
export async function updateVessel(
  embarcacionId: string,
  updates: Partial<Omit<Vessel, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    // Si se actualizan filas o columnas, validar capacidad
    if (
      updates.filas !== undefined ||
      updates.columnas !== undefined ||
      updates.capacidad !== undefined
    ) {
      const embarcacionActual = await getVessel(embarcacionId);
      if (!embarcacionActual) {
        throw new Error('Embarcación no encontrada');
      }

      const filas = updates.filas ?? embarcacionActual.filas;
      const columnas = updates.columnas ?? embarcacionActual.columnas;
      const capacidad = updates.capacidad ?? embarcacionActual.capacidad;
      const capacidadCalculada = filas * columnas;

      if (capacidad !== capacidadCalculada) {
        throw new Error(
          `La capacidad (${capacidad}) debe ser igual a filas × columnas (${capacidadCalculada})`
        );
      }
    }

    const embarcacionRef = doc(db, 'embarcaciones', embarcacionId);
    await updateDoc(embarcacionRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logError('Error al actualizar embarcación', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo actualizar la embarcación');
  }
}

/**
 * Eliminar embarcación (marcar como inactiva)
 */
export async function deleteVessel(embarcacionId: string): Promise<void> {
  try {
    // Verificar si tiene viajes asociados
    const viajesRef = collection(db, 'viajes');
    const q = query(viajesRef, where('embarcacionId', '==', embarcacionId), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('No se puede eliminar la embarcación porque tiene viajes asociados');
    }

    const embarcacionRef = doc(db, 'embarcaciones', embarcacionId);
    await updateDoc(embarcacionRef, {
      activa: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logError('Error al eliminar embarcación', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo eliminar la embarcación');
  }
}
