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
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================================================
// TIPOS EN ESPAÑOL
// ============================================================================

// Parada intermedia en una ruta
export interface ParadaIntermedia {
  nombre: string; // Ej: "Sepahua", "Puerto Ocopa"
  distanciaDesdeOrigen: number; // km desde el origen
  precio: number; // Precio del pasaje hasta esta parada
  orden: number; // Orden en la ruta (1, 2, 3...)
}

export interface Route {
  id: string;
  origen: string; // Renombrado de 'origin'
  destino: string; // Renombrado de 'destination'
  distancia: number; // km total
  horasEstimadas: number; // Renombrado de 'estimatedHours'
  precio: number; // Precio del viaje completo (origen → destino)
  paradasIntermedias?: ParadaIntermedia[]; // NUEVO: Escalas
  activa: boolean; // Renombrado de 'isActive'
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Vessel {
  id: string;
  nombre: string; // Renombrado de 'name'
  capacidad: number; // Renombrado de 'capacity'
  filas: number; // Renombrado de 'rows'
  columnas: number; // Renombrado de 'columns'
  activa: boolean; // Renombrado de 'isActive'
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Trip {
  id: string;
  rutaId: string; // Renombrado de 'routeId'
  embarcacionId: string; // Renombrado de 'vesselId'
  fechaSalida: Timestamp; // Renombrado de 'departureDate'
  horaSalida: string; // Renombrado de 'departureTime'
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado'; // Traducido
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Seat {
  id: string;
  viajeId: string; // Renombrado de 'tripId'
  numeroAsiento: string; // Renombrado de 'seatNumber'
  fila: number; // Renombrado de 'row'
  columna: string; // Renombrado de 'column'
  posicion: 'ventana' | 'pasillo'; // Traducido
  estado: 'disponible' | 'bloqueado' | 'vendido'; // Traducido
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Booking {
  id: string;
  viajeId: string; // Renombrado de 'tripId'
  asientoId: string; // Renombrado de 'seatId'
  nombrePasajero: string; // Renombrado de 'passengerName'
  dniPasajero: string; // Renombrado de 'passengerDni'
  telefonoPasajero: string; // Renombrado de 'passengerPhone'
  destinoIntermedio?: string; // NUEVO: Parada donde se baja (ej: "Sepahua")
  monto: number; // Renombrado de 'amount'
  metodoPago: 'efectivo' | 'yape' | 'plin'; // Renombrado de 'paymentMethod'
  estado: 'confirmado' | 'cancelado'; // Traducido
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// HELPERS PRINCIPALES
// ============================================================================

// Helper: Obtener viajes de hoy y mañana
export async function getTripsForTodayAndTomorrow(): Promise<Trip[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const viajesRef = collection(db, 'viajes');
  const q = query(
    viajesRef,
    where('fechaSalida', '>=', Timestamp.fromDate(today)),
    where('fechaSalida', '<=', Timestamp.fromDate(tomorrow)),
    where('estado', '==', 'programado')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Trip[];
}

// Helper: Obtener asientos de un viaje
export async function getSeatsForTrip(viajeId: string): Promise<Seat[]> {
  const asientosRef = collection(db, `viajes/${viajeId}/asientos`);
  const snapshot = await getDocs(asientosRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Seat[];
}

// Helper: Suscribirse a cambios de asientos en tiempo real
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

// Helper: Obtener información del viaje
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

// Helper: Obtener información de la ruta
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

// Helper: Obtener información de la embarcación
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

// Helper: Buscar pasajero por DNI (para autocompletar)
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
    console.error('Error al buscar pasajero:', error);
    return null;
  }
}

// Helper: Obtener todas las reservas de un asiento específico
export async function getBookingsForSeat(viajeId: string, asientoId: string): Promise<Booking[]> {
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

// Helper: Obtener orden de paradas en una ruta
export function obtenerOrdenParadas(ruta: Route): Map<string, number> {
  const orden = new Map<string, number>();
  orden.set(ruta.origen, 0);
  
  if (ruta.paradasIntermedias && ruta.paradasIntermedias.length > 0) {
    // Ordenar paradas por su campo 'orden' para asegurar correcto mapeo
    const paradasOrdenadas = [...ruta.paradasIntermedias].sort((a, b) => a.orden - b.orden);
    paradasOrdenadas.forEach((parada) => {
      orden.set(parada.nombre, parada.orden);
    });
    
    // El destino final tiene el orden máximo de las paradas intermedias + 1
    const maxOrdenParada = Math.max(...paradasOrdenadas.map(p => p.orden));
    orden.set(ruta.destino, maxOrdenParada + 1);
  } else {
    // Si no hay paradas intermedias, el destino final es orden 1
    orden.set(ruta.destino, 1);
  }
  
  return orden;
}

// Helper: Determinar el punto de origen más avanzado para un asiento basado en reservas existentes
export async function obtenerPuntoOrigenMasAvanzado(
  viajeId: string,
  asientoId: string,
  ruta: Route
): Promise<string> {
  try {
    const reservasExistentes = await getBookingsForSeat(viajeId, asientoId);
    
    if (reservasExistentes.length === 0) {
      // Si no hay reservas, el punto de origen es el origen de la ruta
      return ruta.origen;
    }
    
    const orden = obtenerOrdenParadas(ruta);
    let maxOrden = -1;
    let puntoMasAvanzado = ruta.origen;
    
    // Para cada reserva, determinar hasta dónde llega
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
    console.error('Error al obtener punto de origen más avanzado:', error);
    return ruta.origen;
  }
}

// Helper: Verificar si un asiento está completamente ocupado (desde origen hasta destino final)
export function estaAsientoCompletamenteOcupado(
  reservas: Booking[],
  ruta: Route
): boolean {
  if (reservas.length === 0) {
    return false;
  }
  
  const orden = obtenerOrdenParadas(ruta);
  const ordenDestinoFinal = orden.get(ruta.destino) ?? -1;
  
  // Verificar si alguna reserva llega hasta el destino final
  for (const reserva of reservas) {
    const destinoReserva = reserva.destinoIntermedio || ruta.destino;
    
    // Si la reserva no tiene destinoIntermedio, va hasta el destino final
    if (!reserva.destinoIntermedio || reserva.destinoIntermedio === ruta.destino) {
      return true; // Está completamente ocupado
    }
    
    // Si el destino de la reserva es el destino final, está completamente ocupado
    const ordenDestinoReserva = orden.get(destinoReserva) ?? -1;
    if (ordenDestinoReserva === ordenDestinoFinal) {
      return true;
    }
  }
  
  // Verificar si las reservas cubren todo el trayecto (desde origen hasta destino final)
  // Esto requiere verificar que no haya espacios sin cubrir
  // Por simplicidad, si hay una reserva hasta el destino final, está completamente ocupado
  // O si hay múltiples reservas que juntas cubren todo el trayecto
  
  // Verificar si hay una combinación de reservas que cubra desde origen hasta destino final
  const ordenOrigen = orden.get(ruta.origen) ?? 0;
  
  // Si el punto más avanzado es el destino final, está completamente ocupado
  let maxOrdenAlcanzado = ordenOrigen;
  for (const reserva of reservas) {
    const destinoReserva = reserva.destinoIntermedio || ruta.destino;
    const ordenDestinoReserva = orden.get(destinoReserva) ?? -1;
    if (ordenDestinoReserva > maxOrdenAlcanzado) {
      maxOrdenAlcanzado = ordenDestinoReserva;
    }
  }
  
  // Si el punto más avanzado alcanzado es el destino final, está completamente ocupado
  return maxOrdenAlcanzado >= ordenDestinoFinal;
}

// Helper: Obtener destinos disponibles desde un punto de origen específico
export function obtenerDestinosDisponiblesDesde(
  ruta: Route,
  puntoOrigen: string
): Array<{ nombre: string; precio: number; esDestinoFinal: boolean }> {
  const orden = obtenerOrdenParadas(ruta);
  const ordenOrigen = orden.get(puntoOrigen) ?? -1;
  
  const destinos: Array<{ nombre: string; precio: number; esDestinoFinal: boolean }> = [];
  
  // Si el punto de origen es el destino final, no hay destinos disponibles
  if (puntoOrigen === ruta.destino) {
    return [];
  }
  
  // Si no se pudo determinar el orden del punto de origen, retornar vacío para ser conservador
  if (ordenOrigen === -1) {
    return [];
  }
  
  // Agregar paradas intermedias que vienen DESPUÉS del punto de origen
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
  
  // Siempre agregar el destino final si el punto de origen no es el destino final
  const ordenDestinoFinal = orden.get(ruta.destino) ?? -1;
  if (puntoOrigen !== ruta.destino && ordenDestinoFinal > ordenOrigen) {
    destinos.push({
      nombre: ruta.destino,
      precio: ruta.precio || 0, // Usar el precio de la ruta completa
      esDestinoFinal: true,
    });
  }
  
  return destinos;
}

// Helper: Verificar si dos tramos se solapan
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
  
  // Si algún orden no existe, no podemos verificar (retornar true para ser conservador)
  if (orden1Inicio === -1 || orden1Fin === -1 || orden2Inicio === -1 || orden2Fin === -1) {
    return true;
  }
  
  // Verificar solapamiento: los tramos se solapan si:
  // - El inicio del tramo2 está dentro del tramo1, O
  // - El fin del tramo2 está dentro del tramo1, O
  // - El tramo2 contiene completamente al tramo1
  const tramo1Inicio = Math.min(orden1Inicio, orden1Fin);
  const tramo1Fin = Math.max(orden1Inicio, orden1Fin);
  const tramo2Inicio = Math.min(orden2Inicio, orden2Fin);
  const tramo2Fin = Math.max(orden2Inicio, orden2Fin);
  
  // Los tramos se solapan si hay intersección (pero no si uno termina exactamente donde empieza el otro)
  // Ejemplo: Atalaya->Tahuania (0-1) y Tahuania->Pucallpa (1-2) NO se solapan
  // Pero: Atalaya->Pucallpa (0-2) y Tahuania->Pucallpa (1-2) SÍ se solapan
  return (tramo2Inicio < tramo1Fin && tramo2Fin > tramo1Inicio);
}

// Helper: Verificar disponibilidad de asiento para un tramo específico
export async function verificarDisponibilidadTramo(
  viajeId: string,
  asientoId: string,
  ruta: Route,
  destinoSeleccionado: string
): Promise<{ disponible: boolean; motivo?: string }> {
  try {
    // Obtener todas las reservas confirmadas del asiento
    const reservasExistentes = await getBookingsForSeat(viajeId, asientoId);
    
    if (reservasExistentes.length === 0) {
      return { disponible: true };
    }
    
    // Determinar el tramo de la nueva reserva
    const origenNuevo = ruta.origen;
    const destinoNuevo = destinoSeleccionado;
    
    // Verificar conflictos con cada reserva existente
    for (const reserva of reservasExistentes) {
      const origenExistente = ruta.origen;
      const destinoExistente = reserva.destinoIntermedio || ruta.destino;
      
      if (verificarConflictoTramos(ruta, origenNuevo, destinoNuevo, origenExistente, destinoExistente)) {
        return {
          disponible: false,
          motivo: `El asiento está ocupado desde ${origenExistente} hasta ${destinoExistente}`,
        };
      }
    }
    
    return { disponible: true };
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    return { disponible: false, motivo: 'Error al verificar disponibilidad' };
  }
}

// Helper: Crear reserva con transacción (previene doble venta y conflictos de tramos)
export async function createBooking(
  viajeId: string,
  asientoId: string,
  datosPasajero: {
    nombre: string;
    dni: string;
    telefono: string;
    destinoIntermedio?: string; // Parada donde se baja
    monto: number;
    metodoPago: 'efectivo' | 'yape' | 'plin';
  },
  ruta: Route // NUEVO: Ruta necesaria para verificar conflictos de tramos
): Promise<string> {
  try {
    // Verificar disponibilidad del tramo ANTES de la transacción
    const destinoSeleccionado = datosPasajero.destinoIntermedio || ruta.destino;
    const disponibilidad = await verificarDisponibilidadTramo(
      viajeId,
      asientoId,
      ruta,
      destinoSeleccionado
    );
    
    if (!disponibilidad.disponible) {
      throw new Error(disponibilidad.motivo || 'El asiento no está disponible para este tramo');
    }
    
    // Obtener reservas existentes ANTES de la transacción para verificación
    const reservasExistentes = await getBookingsForSeat(viajeId, asientoId);
    
    // Verificar conflictos con cada reserva existente
    const origenNuevo = ruta.origen;
    const destinoNuevo = destinoSeleccionado;
    
    for (const reserva of reservasExistentes) {
      const origenExistente = ruta.origen;
      const destinoExistente = reserva.destinoIntermedio || ruta.destino;
      
      if (verificarConflictoTramos(ruta, origenNuevo, destinoNuevo, origenExistente, destinoExistente)) {
        throw new Error(`El asiento está ocupado desde ${origenExistente} hasta ${destinoExistente}`);
      }
    }
    
    const reservaId = await runTransaction(db, async (transaction) => {
      // Verificar que el asiento existe
      const asientoRef = doc(db, `viajes/${viajeId}/asientos`, asientoId);
      const asientoSnap = await transaction.get(asientoRef);
      
      if (!asientoSnap.exists()) {
        throw new Error('El asiento no existe');
      }
      
      // Verificar dentro de la transacción que las reservas no hayan cambiado
      // (doble verificación para evitar condiciones de carrera)
      for (const reservaExistente of reservasExistentes) {
        const reservaRef = doc(db, 'reservas', reservaExistente.id);
        const reservaSnap = await transaction.get(reservaRef);
        
        if (!reservaSnap.exists() || reservaSnap.data()?.estado !== 'confirmado') {
          // La reserva fue cancelada, continuar
          continue;
        }
        
        const reservaData = reservaSnap.data() as Booking;
        const origenExistente = ruta.origen;
        const destinoExistente = reservaData.destinoIntermedio || ruta.destino;
        
        if (verificarConflictoTramos(ruta, origenNuevo, destinoNuevo, origenExistente, destinoExistente)) {
          throw new Error(`El asiento está ocupado desde ${origenExistente} hasta ${destinoExistente}`);
        }
      }
      
      // Crear reserva
      const reservasRef = collection(db, 'reservas');
      const nuevaReservaRef = doc(reservasRef);
      
      // Construir objeto de reserva sin campos undefined
      const reservaBase: Omit<Booking, 'id'> = {
        viajeId,
        asientoId,
        nombrePasajero: datosPasajero.nombre,
        dniPasajero: datosPasajero.dni,
        telefonoPasajero: datosPasajero.telefono,
        monto: datosPasajero.monto,
        metodoPago: datosPasajero.metodoPago,
        estado: 'confirmado',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      // Solo agregar destinoIntermedio si tiene un valor válido
      const reserva: Omit<Booking, 'id'> = datosPasajero.destinoIntermedio && datosPasajero.destinoIntermedio.trim() !== ''
        ? { ...reservaBase, destinoIntermedio: datosPasajero.destinoIntermedio }
        : reservaBase;
      
      transaction.set(nuevaReservaRef, reserva);
      
      // NO actualizar el estado del asiento a "vendido" si hay paradas intermedias
      // El asiento puede tener múltiples reservas para diferentes tramos
      // Solo actualizar updatedAt para mantener consistencia
      transaction.update(asientoRef, {
        updatedAt: Timestamp.now(),
      });
      
      return nuevaReservaRef.id;
    });
    
    return reservaId;
  } catch (error) {
    console.error('Error al crear reserva:', error);
    throw error;
  }
}

// Helper: Obtener reservas de un viaje
export async function getBookingsForTrip(viajeId: string): Promise<Booking[]> {
  const reservasRef = collection(db, 'reservas');
  const q = query(reservasRef, where('viajeId', '==', viajeId));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
}

// Helper: Calcular cuadre de caja para un viaje
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
    resumen.total += reserva.monto;
    resumen.porMetodo[reserva.metodoPago] += reserva.monto;
  });
  
  return resumen;
}

// Helper: Suscribirse a cambios de reservas en tiempo real
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
