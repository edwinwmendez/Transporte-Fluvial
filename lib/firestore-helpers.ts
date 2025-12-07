import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// Tipos
export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedHours: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Vessel {
  id: string;
  name: string;
  capacity: number;
  rows: number;
  columns: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Trip {
  id: string;
  routeId: string;
  vesselId: string;
  departureDate: Timestamp;
  departureTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Seat {
  id: string;
  tripId: string;
  seatNumber: string;
  row: number;
  column: string;
  position: 'window' | 'aisle';
  status: 'available' | 'blocked' | 'sold';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Booking {
  id: string;
  tripId: string;
  seatId: string;
  passengerName: string;
  passengerDni: string;
  passengerPhone: string;
  amount: number;
  paymentMethod: 'efectivo' | 'yape' | 'plin';
  status: 'confirmed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Helper: Obtener viajes de hoy y mañana
export async function getTripsForTodayAndTomorrow(): Promise<Trip[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const tripsRef = collection(db, 'trips');
  const q = query(
    tripsRef,
    where('departureDate', '>=', Timestamp.fromDate(today)),
    where('departureDate', '<=', Timestamp.fromDate(tomorrow)),
    where('status', '==', 'scheduled')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Trip[];
}

// Helper: Obtener asientos de un viaje
export async function getSeatsForTrip(tripId: string): Promise<Seat[]> {
  const seatsRef = collection(db, `trips/${tripId}/seats`);
  const snapshot = await getDocs(seatsRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Seat[];
}

// Helper: Suscribirse a cambios de asientos en tiempo real
export function subscribeToSeats(
  tripId: string,
  callback: (seats: Seat[]) => void
): () => void {
  const seatsRef = collection(db, `trips/${tripId}/seats`);
  
  return onSnapshot(seatsRef, (snapshot: QuerySnapshot<DocumentData>) => {
    const seats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Seat[];
    callback(seats);
  });
}

// Helper: Obtener información del viaje
export async function getTrip(tripId: string): Promise<Trip | null> {
  const tripRef = doc(db, 'trips', tripId);
  const tripSnap = await getDoc(tripRef);
  
  if (!tripSnap.exists()) {
    return null;
  }
  
  return {
    id: tripSnap.id,
    ...tripSnap.data(),
  } as Trip;
}

// Helper: Obtener información de la embarcación
export async function getVessel(vesselId: string): Promise<Vessel | null> {
  const vesselRef = doc(db, 'vessels', vesselId);
  const vesselSnap = await getDoc(vesselRef);
  
  if (!vesselSnap.exists()) {
    return null;
  }
  
  return {
    id: vesselSnap.id,
    ...vesselSnap.data(),
  } as Vessel;
}

// Helper: Crear booking con transacción (previene doble venta)
export async function createBooking(
  tripId: string,
  seatId: string,
  passengerData: {
    name: string;
    dni: string;
    phone: string;
    amount: number;
    paymentMethod: 'efectivo' | 'yape' | 'plin';
  }
): Promise<string> {
  try {
    const bookingId = await runTransaction(db, async (transaction) => {
      // Verificar que el asiento esté disponible
      const seatRef = doc(db, `trips/${tripId}/seats`, seatId);
      const seatSnap = await transaction.get(seatRef);
      
      if (!seatSnap.exists()) {
        throw new Error('El asiento no existe');
      }
      
      const seatData = seatSnap.data() as Seat;
      
      if (seatData.status !== 'available') {
        throw new Error('El asiento ya está ocupado');
      }
      
      // Crear booking
      const bookingsRef = collection(db, 'bookings');
      const newBookingRef = doc(bookingsRef);
      
      const booking: Omit<Booking, 'id'> = {
        tripId,
        seatId,
        passengerName: passengerData.name,
        passengerDni: passengerData.dni,
        passengerPhone: passengerData.phone,
        amount: passengerData.amount,
        paymentMethod: passengerData.paymentMethod,
        status: 'confirmed',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      transaction.set(newBookingRef, booking);
      
      // Actualizar estado del asiento
      transaction.update(seatRef, {
        status: 'sold',
        updatedAt: Timestamp.now(),
      });
      
      return newBookingRef.id;
    });
    
    return bookingId;
  } catch (error) {
    console.error('Error al crear booking:', error);
    throw error;
  }
}

// Helper: Obtener bookings de un viaje
export async function getBookingsForTrip(tripId: string): Promise<Booking[]> {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('tripId', '==', tripId));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
}

// Helper: Calcular cuadre de caja para un viaje
export async function getCashSummaryForTrip(tripId: string): Promise<{
  total: number;
  byMethod: {
    efectivo: number;
    yape: number;
    plin: number;
  };
  bookingCount: number;
}> {
  const bookings = await getBookingsForTrip(tripId);
  
  const summary = {
    total: 0,
    byMethod: {
      efectivo: 0,
      yape: 0,
      plin: 0,
    },
    bookingCount: bookings.length,
  };
  
  bookings.forEach((booking) => {
    summary.total += booking.amount;
    summary.byMethod[booking.paymentMethod] += booking.amount;
  });
  
  return summary;
}

// Helper: Suscribirse a cambios de bookings en tiempo real
export function subscribeToBookings(
  tripId: string,
  callback: (bookings: Booking[]) => void
): () => void {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('tripId', '==', tripId));
  
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
    callback(bookings);
  });
}
