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
import type { Route } from '../types';
import { logError } from '../utils/logger';

/**
 * Obtener todas las rutas
 */
export async function getAllRoutes(): Promise<Route[]> {
  try {
    const rutasRef = collection(db, 'rutas');
    const q = query(rutasRef, orderBy('origen', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Route[];
  } catch (error) {
    logError('Error al obtener rutas', error);
    throw new Error('No se pudieron obtener las rutas');
  }
}

/**
 * Obtener una ruta por ID
 */
export async function getRoute(rutaId: string): Promise<Route | null> {
  const rutaRef = doc(db, 'rutas', rutaId);
  const rutaSnap = await getDoc(rutaRef);

  if (!rutaSnap.exists()) {
    return null;
  }

  return {
    id: rutaSnap.id,
    ...rutaSnap.data(),
  } as Route;
}

/**
 * Crear nueva ruta
 */
export async function createRoute(
  rutaData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const rutasRef = collection(db, 'rutas');
    const nuevaRuta = {
      ...rutaData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(rutasRef, nuevaRuta);
    return docRef.id;
  } catch (error) {
    logError('Error al crear ruta', error);
    throw new Error('No se pudo crear la ruta');
  }
}

/**
 * Actualizar ruta
 */
export async function updateRoute(
  rutaId: string,
  updates: Partial<Omit<Route, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const rutaRef = doc(db, 'rutas', rutaId);
    await updateDoc(rutaRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logError('Error al actualizar ruta', error, { rutaId, updates });
    throw new Error('No se pudo actualizar la ruta');
  }
}

/**
 * Eliminar ruta (marcar como inactiva)
 */
export async function deleteRoute(rutaId: string): Promise<void> {
  try {
    // Verificar si tiene viajes asociados
    const viajesRef = collection(db, 'viajes');
    const q = query(viajesRef, where('rutaId', '==', rutaId), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('No se puede eliminar la ruta porque tiene viajes asociados');
    }

    const rutaRef = doc(db, 'rutas', rutaId);
    await updateDoc(rutaRef, {
      activa: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logError('Error al eliminar ruta', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo eliminar la ruta');
  }
}
