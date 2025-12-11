import {
  collection,
  getDocs,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../services/firebase.service';
import type { Seat } from '../types';

/**
 * Obtener asientos de un viaje
 */
export async function getSeatsForTrip(viajeId: string): Promise<Seat[]> {
  const asientosRef = collection(db, `viajes/${viajeId}/asientos`);
  const snapshot = await getDocs(asientosRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Seat[];
}

/**
 * Suscribirse a cambios de asientos en tiempo real
 */
export function subscribeToSeats(
  viajeId: string,
  callback: (asientos: Seat[]) => void
): () => void {
  const asientosRef = collection(db, `viajes/${viajeId}/asientos`);

  return onSnapshot(asientosRef, (snapshot: QuerySnapshot<DocumentData>) => {
    const asientos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Seat[];
    callback(asientos);
  });
}
