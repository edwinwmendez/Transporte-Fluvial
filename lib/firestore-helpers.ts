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
  writeBatch,
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

// ============================================================================
// HORARIOS RECURRENTES (Programación de Viajes)
// ============================================================================

export interface HorarioRecurrente {
  id: string;
  nombre: string; // Ej: "Atalaya-Pucallpa Lunes/Miércoles/Viernes 6AM"
  rutaId: string;
  embarcacionId: string;
  diasSemana: number[]; // [1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 0=Domingo]
  horaSalida: string; // "06:00"
  activo: boolean;
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

// Información de pago con validación
export interface PagoInfo {
  metodoPago: 'efectivo' | 'yape' | 'plin';
  monto: number;
  estado: 'pendiente' | 'validado' | 'rechazado';
  screenshotUrl?: string; // URL del screenshot en Storage
  screenshotPath?: string; // Path del screenshot en Storage
  validadoPor?: string; // userId del admin que validó
  validadoEn?: Timestamp;
  razonRechazo?: string;
}

// Información del boleto digital
export interface BoletoInfo {
  numeroTicket: string; // "TKT-20251209-0001"
  codigoQr: string; // Data URL del QR
  pdfUrl?: string; // URL del PDF en Storage
  pdfPath?: string; // Path del PDF en Storage
  estado: 'emitido' | 'usado' | 'anulado';
  emitidoEn: Timestamp;
  usadoEn?: Timestamp;
  anuladoEn?: Timestamp;
}

export interface Booking {
  id: string;
  viajeId: string; // Renombrado de 'tripId'
  asientoId: string; // Renombrado de 'seatId'
  nombrePasajero: string; // Renombrado de 'passengerName'
  dniPasajero: string; // Renombrado de 'passengerDni'
  telefonoPasajero: string; // Renombrado de 'passengerPhone'
  whatsappPasajero?: string; // NUEVO: Número de WhatsApp para envío de boleto
  origenIntermedio?: string; // ✅ CRÍTICO: Parada donde sube (ej: "Tahuania")
  destinoIntermedio?: string; // Parada donde se baja (ej: "Sepahua")
  pago: PagoInfo; // NUEVO: Objeto completo de pago
  boleto?: BoletoInfo; // NUEVO: Objeto completo de boleto
  estado: 'confirmado' | 'embarcado' | 'cancelado' | 'no_show'; // Actualizado
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
  const ordenOrigen = orden.get(ruta.origen) ?? 0;

  // Si el punto más avanzado alcanzado es el destino final, está completamente ocupado
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
  destinoSeleccionado: string,
  origenPersonalizado?: string // NUEVO: Permite verificar desde un punto intermedio
): Promise<{ disponible: boolean; motivo?: string }> {
  try {
    // Obtener todas las reservas confirmadas del asiento
    const reservasExistentes = await getBookingsForSeat(viajeId, asientoId);

    if (reservasExistentes.length === 0) {
      return { disponible: true };
    }

    // Determinar el tramo de la nueva reserva
    const origenNuevo = origenPersonalizado || ruta.origen;
    const destinoNuevo = destinoSeleccionado;

    // Verificar conflictos con cada reserva existente
    for (const reserva of reservasExistentes) {
      // Usar origenIntermedio si existe, sino asumir que empieza en ruta.origen (backward compatibility)
      const origenExistente = reserva.origenIntermedio || ruta.origen;
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
    whatsapp?: string; // NUEVO: Número de WhatsApp
    destinoIntermedio?: string; // Parada donde se baja
    monto: number;
    metodoPago: 'efectivo' | 'yape' | 'plin';
    origenIntermedio?: string; // NUEVO: Parada donde sube
    screenshotUrl?: string; // NUEVO: URL del screenshot de pago
    screenshotPath?: string; // NUEVO: Path del screenshot en Storage
  },
  ruta: Route
): Promise<string> {
  try {
    // Verificar disponibilidad del tramo ANTES de la transacción
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

    // Obtener reservas existentes ANTES de la transacción
    const reservasExistentes = await getBookingsForSeat(viajeId, asientoId);

    const origenNuevo = origenSeleccionado;
    const destinoNuevo = destinoSeleccionado;

    for (const reserva of reservasExistentes) {
      // Usar origenIntermedio si existe, sino asumir que empieza en ruta.origen (backward compatibility)
      const origenExistente = reserva.origenIntermedio || ruta.origen;
      const destinoExistente = reserva.destinoIntermedio || ruta.destino;

      if (verificarConflictoTramos(ruta, origenNuevo, destinoNuevo, origenExistente, destinoExistente)) {
        throw new Error(`El asiento está ocupado desde ${origenExistente} hasta ${destinoExistente}`);
      }
    }

    const reservaId = await runTransaction(db, async (transaction) => {
      const asientoRef = doc(db, `viajes/${viajeId}/asientos`, asientoId);
      const asientoSnap = await transaction.get(asientoRef);

      if (!asientoSnap.exists()) {
        throw new Error('El asiento no existe');
      }

      // Re-verificación dentro de transacción
      for (const reservaExistente of reservasExistentes) {
        const reservaRef = doc(db, 'reservas', reservaExistente.id);
        const reservaSnap = await transaction.get(reservaRef);

        if (!reservaSnap.exists() || reservaSnap.data()?.estado !== 'confirmado') {
          continue;
        }

        const reservaData = reservaSnap.data() as Booking;
        // Usar origenIntermedio si existe, sino asumir que empieza en ruta.origen (backward compatibility)
        const origenExistente = reservaData.origenIntermedio || ruta.origen;
        const destinoExistente = reservaData.destinoIntermedio || ruta.destino;

        if (verificarConflictoTramos(ruta, origenNuevo, destinoNuevo, origenExistente, destinoExistente)) {
          throw new Error(`El asiento está ocupado desde ${origenExistente} hasta ${destinoExistente}`);
        }
      }

      // Crear reserva
      const reservasRef = collection(db, 'reservas');
      const nuevaReservaRef = doc(reservasRef);

      // Determinar estado del pago: efectivo es validado automáticamente, YAPE/PLIN pendiente
      const estadoPago: 'pendiente' | 'validado' | 'rechazado' = 
        datosPasajero.metodoPago === 'efectivo' ? 'validado' : 'pendiente';

      // Crear objeto de pago
      const pago: PagoInfo = {
        metodoPago: datosPasajero.metodoPago,
        monto: datosPasajero.monto,
        estado: estadoPago,
        ...(datosPasajero.screenshotUrl && { screenshotUrl: datosPasajero.screenshotUrl }),
        ...(datosPasajero.screenshotPath && { screenshotPath: datosPasajero.screenshotPath }),
      };

      // Construir objeto de reserva
      const reserva: Omit<Booking, 'id'> = {
        viajeId,
        asientoId,
        nombrePasajero: datosPasajero.nombre,
        dniPasajero: datosPasajero.dni,
        telefonoPasajero: datosPasajero.telefono,
        ...(datosPasajero.whatsapp && { whatsappPasajero: datosPasajero.whatsapp }),
        ...(datosPasajero.origenIntermedio && datosPasajero.origenIntermedio.trim() !== '' && { 
          origenIntermedio: datosPasajero.origenIntermedio 
        }),
        ...(datosPasajero.destinoIntermedio && datosPasajero.destinoIntermedio.trim() !== '' && { 
          destinoIntermedio: datosPasajero.destinoIntermedio 
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
    // console.error('Error al crear reserva:', error); // Redondante si ya se maneja fuera
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
    const monto = reserva.pago?.monto || 0;
    const metodoPago = reserva.pago?.metodoPago || 'efectivo';
    resumen.total += monto;
    resumen.porMetodo[metodoPago] += monto;
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

// Helper: Obtener reservas con pagos pendientes de validación
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
    console.error('Error al obtener reservas con pagos pendientes:', error);
    // Si falla por falta de índice, retornar todas y filtrar en memoria
    const allReservas = await getDocs(reservasRef);
    return allReservas.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Booking))
      .filter((booking) => booking.pago?.estado === 'pendiente');
  }
}

// Helper: Validar o rechazar un pago
export async function validatePayment(
  bookingId: string,
  estado: 'validado' | 'rechazado',
  validadoPor: string,
  razonRechazo?: string
): Promise<void> {
  try {
    const bookingRef = doc(db, 'reservas', bookingId);
    const updateData: any = {
      'pago.estado': estado,
      'pago.validadoPor': validadoPor,
      'pago.validadoEn': Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (estado === 'rechazado' && razonRechazo) {
      updateData['pago.razonRechazo'] = razonRechazo;
      
      // Anular boleto si existe
      updateData['boleto.estado'] = 'anulado';
      updateData['boleto.anuladoEn'] = Timestamp.now();
    }

    await updateDoc(bookingRef, updateData);
  } catch (error) {
    console.error('Error al validar pago:', error);
    throw new Error('No se pudo actualizar el estado del pago');
  }
}

// Helper: Buscar boleto por número de ticket
export async function getBookingByTicketNumber(numeroTicket: string): Promise<Booking | null> {
  try {
    const reservasRef = collection(db, 'reservas');
    const q = query(
      reservasRef,
      where('boleto.numeroTicket', '==', numeroTicket),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as Booking;
  } catch (error) {
    console.error('Error al buscar boleto:', error);
    return null;
  }
}

// Helper: Buscar boletos por DNI del pasajero
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
    console.error('Error al buscar boletos por DNI:', error);
    return [];
  }
}

// Helper: Marcar boleto como usado (embarcado)
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
    console.error('Error al marcar boleto como usado:', error);
    throw new Error('No se pudo actualizar el estado del boleto');
  }
}

// ============================================================================
// CRUD RUTAS
// ============================================================================

// Obtener todas las rutas
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
    console.error('Error al obtener rutas:', error);
    throw new Error('No se pudieron obtener las rutas');
  }
}

// Crear nueva ruta
export async function createRoute(rutaData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
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
    console.error('Error al crear ruta:', error);
    throw new Error('No se pudo crear la ruta');
  }
}

// Actualizar ruta
export async function updateRoute(rutaId: string, updates: Partial<Omit<Route, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const rutaRef = doc(db, 'rutas', rutaId);
    await updateDoc(rutaRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar ruta:', error);
    throw new Error('No se pudo actualizar la ruta');
  }
}

// Eliminar ruta
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
    console.error('Error al eliminar ruta:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo eliminar la ruta');
  }
}

// ============================================================================
// CRUD EMBARCACIONES
// ============================================================================

// Obtener todas las embarcaciones
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
    console.error('Error al obtener embarcaciones:', error);
    throw new Error('No se pudieron obtener las embarcaciones');
  }
}

// Crear nueva embarcación
export async function createVessel(embarcacionData: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Validar que capacidad = filas * columnas
    const capacidadCalculada = embarcacionData.filas * embarcacionData.columnas;
    if (embarcacionData.capacidad !== capacidadCalculada) {
      throw new Error(`La capacidad (${embarcacionData.capacidad}) debe ser igual a filas × columnas (${capacidadCalculada})`);
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
    console.error('Error al crear embarcación:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo crear la embarcación');
  }
}

// Actualizar embarcación
export async function updateVessel(embarcacionId: string, updates: Partial<Omit<Vessel, 'id' | 'createdAt'>>): Promise<void> {
  try {
    // Si se actualizan filas o columnas, validar capacidad
    if (updates.filas !== undefined || updates.columnas !== undefined || updates.capacidad !== undefined) {
      const embarcacionActual = await getVessel(embarcacionId);
      if (!embarcacionActual) {
        throw new Error('Embarcación no encontrada');
      }

      const filas = updates.filas ?? embarcacionActual.filas;
      const columnas = updates.columnas ?? embarcacionActual.columnas;
      const capacidad = updates.capacidad ?? embarcacionActual.capacidad;
      const capacidadCalculada = filas * columnas;

      if (capacidad !== capacidadCalculada) {
        throw new Error(`La capacidad (${capacidad}) debe ser igual a filas × columnas (${capacidadCalculada})`);
      }
    }

    const embarcacionRef = doc(db, 'embarcaciones', embarcacionId);
    await updateDoc(embarcacionRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar embarcación:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo actualizar la embarcación');
  }
}

// Eliminar embarcación (marcar como inactiva)
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
    console.error('Error al eliminar embarcación:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo eliminar la embarcación');
  }
}

// ============================================================================
// CRUD VIAJES
// ============================================================================

// Obtener todos los viajes
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
    console.error('Error al obtener viajes:', error);
    throw new Error('No se pudieron obtener los viajes');
  }
}

// Crear nuevo viaje y generar asientos automáticamente
export async function createTrip(
  tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>,
  embarcacion: Vessel
): Promise<string> {
  try {
    // Crear el viaje
    const viajesRef = collection(db, 'viajes');
    const nuevoViaje = {
      ...tripData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const viajeDocRef = await addDoc(viajesRef, nuevoViaje);
    const viajeId = viajeDocRef.id;

    // Generar asientos automáticamente según la configuración de la embarcación
    await generateSeatsForTrip(viajeId, embarcacion);

    return viajeId;
  } catch (error) {
    console.error('Error al crear viaje:', error);
    throw new Error('No se pudo crear el viaje');
  }
}

// Generar asientos para un viaje según la configuración de la embarcación
async function generateSeatsForTrip(viajeId: string, embarcacion: Vessel): Promise<void> {
  try {
    const asientosRef = collection(db, `viajes/${viajeId}/asientos`);
    
    // Generar asientos según la configuración de la embarcación
    // Las columnas representan el total de asientos por fila (distribuidos en lado A y lado B)
    // Layout: lado A (izquierda) | pasillo | lado B (derecha)
    // Si columnas = 2: 1 asiento A + 1 asiento B = 2 asientos por fila
    // Si columnas = 4: 2 asientos A + 2 asientos B = 4 asientos por fila
    const asientos: Array<{
      numeroAsiento: string;
      fila: number;
      columna: string;
      posicion: 'ventana' | 'pasillo';
    }> = [];

    // Calcular asientos por lado (A y B)
    // Las columnas representan el total de asientos por fila
    // En layout 2-2: columnas se divide en lado A y lado B
    const asientosPorLado = embarcacion.columnas / 2;
    
    // Validar que columnas sea par
    if (embarcacion.columnas % 2 !== 0) {
      throw new Error(`El número de columnas (${embarcacion.columnas}) debe ser par para el layout 2-2`);
    }

    // Contador global para números de asiento únicos
    let contadorGlobal = 1;

    for (let fila = 1; fila <= embarcacion.filas; fila++) {
      // Para cada fila, generar asientos lado A y lado B
      // Los números de asiento deben ser consecutivos por fila
      const inicioFila = (fila - 1) * asientosPorLado + 1;
      
      // Lado A (izquierda): desde ventana hasta pasillo
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

      // Lado B (derecha): desde pasillo hasta ventana
      // Usar el mismo rango numérico que lado A para mantener consistencia
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

    // Usar batches para escribir (máximo 500 operaciones por batch)
    const batchSize = 500;
    for (let i = 0; i < asientos.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = asientos.slice(i, i + batchSize);
      
      chunk.forEach((asiento) => {
        // Crear referencia con ID automático
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
    console.error('Error al generar asientos:', error);
    throw new Error('No se pudieron generar los asientos');
  }
}

// Actualizar viaje (solo si no tiene reservas)
export async function updateTrip(tripId: string, updates: Partial<Omit<Trip, 'id' | 'createdAt'>>): Promise<void> {
  try {
    // Verificar si tiene reservas
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
    console.error('Error al actualizar viaje:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo actualizar el viaje');
  }
}

// Eliminar viaje (cancelar)
export async function deleteTrip(tripId: string): Promise<void> {
  try {
    const viajeRef = doc(db, 'viajes', tripId);
    await updateDoc(viajeRef, {
      estado: 'cancelado',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al eliminar viaje:', error);
    throw new Error('No se pudo eliminar el viaje');
  }
}

// ============================================================================
// CRUD HORARIOS RECURRENTES
// ============================================================================

// Obtener todos los horarios recurrentes
export async function getAllHorariosRecurrentes(): Promise<HorarioRecurrente[]> {
  try {
    const horariosRef = collection(db, 'horariosRecurrentes');
    const q = query(horariosRef, orderBy('nombre', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HorarioRecurrente[];
  } catch (error) {
    console.error('Error al obtener horarios recurrentes:', error);
    throw new Error('No se pudieron obtener los horarios recurrentes');
  }
}

// Obtener horarios activos
export async function getHorariosActivos(): Promise<HorarioRecurrente[]> {
  try {
    const horariosRef = collection(db, 'horariosRecurrentes');
    const q = query(
      horariosRef,
      where('activo', '==', true),
      orderBy('nombre', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HorarioRecurrente[];
  } catch (error) {
    console.error('Error al obtener horarios activos:', error);
    throw new Error('No se pudieron obtener los horarios activos');
  }
}

// Crear nuevo horario recurrente
export async function createHorarioRecurrente(
  horarioData: Omit<HorarioRecurrente, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const horariosRef = collection(db, 'horariosRecurrentes');
    const nuevoHorario = {
      ...horarioData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(horariosRef, nuevoHorario);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear horario recurrente:', error);
    throw new Error('No se pudo crear el horario recurrente');
  }
}

// Actualizar horario recurrente
export async function updateHorarioRecurrente(
  horarioId: string,
  updates: Partial<Omit<HorarioRecurrente, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const horarioRef = doc(db, 'horariosRecurrentes', horarioId);
    await updateDoc(horarioRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar horario recurrente:', error);
    throw new Error('No se pudo actualizar el horario recurrente');
  }
}

// Eliminar horario recurrente
export async function deleteHorarioRecurrente(horarioId: string): Promise<void> {
  try {
    const horarioRef = doc(db, 'horariosRecurrentes', horarioId);
    await updateDoc(horarioRef, {
      activo: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al eliminar horario recurrente:', error);
    throw new Error('No se pudo eliminar el horario recurrente');
  }
}

// ============================================================================
// GENERACIÓN MASIVA DE VIAJES DESDE HORARIOS RECURRENTES
// ============================================================================

/**
 * Genera viajes automáticamente desde un horario recurrente para un rango de fechas
 * @param horarioId ID del horario recurrente
 * @param fechaInicio Fecha de inicio del rango
 * @param fechaFin Fecha de fin del rango
 * @returns Array con los IDs de los viajes creados
 */
export async function generarViajesDesdeHorario(
  horarioId: string,
  fechaInicio: Date,
  fechaFin: Date
): Promise<string[]> {
  try {
    // Obtener el horario recurrente
    const horarioRef = doc(db, 'horariosRecurrentes', horarioId);
    const horarioSnap = await getDoc(horarioRef);

    if (!horarioSnap.exists()) {
      throw new Error('Horario recurrente no encontrado');
    }

    const horario = horarioSnap.data() as HorarioRecurrente;

    if (!horario.activo) {
      throw new Error('El horario recurrente no está activo');
    }

    // Obtener embarcación para generar asientos
    const embarcacion = await getVessel(horario.embarcacionId);
    if (!embarcacion) {
      throw new Error('Embarcación no encontrada');
    }

    // Calcular todas las fechas que coinciden con los días de la semana
    const fechas = obtenerFechasPorDiasSemana(
      fechaInicio,
      fechaFin,
      horario.diasSemana
    );

    // Verificar qué viajes ya existen para evitar duplicados
    const viajesExistentes = await verificarViajesExistentes(
      horario.rutaId,
      horario.embarcacionId,
      horario.horaSalida,
      fechas
    );

    // Filtrar fechas que no tienen viaje existente
    const fechasParaCrear = fechas.filter(
      (fecha) => !viajesExistentes.has(fecha.toISOString().split('T')[0])
    );

    if (fechasParaCrear.length === 0) {
      return []; // Todos los viajes ya existen
    }

    // Crear viajes en lotes
    const viajesCreados: string[] = [];
    const batchSize = 10; // Crear 10 viajes por vez para no sobrecargar

    for (let i = 0; i < fechasParaCrear.length; i += batchSize) {
      const lote = fechasParaCrear.slice(i, i + batchSize);
      const promesas = lote.map((fecha) =>
        crearViajeDesdeHorario(horario, embarcacion, fecha)
      );
      const resultados = await Promise.all(promesas);
      viajesCreados.push(...resultados);
    }

    return viajesCreados;
  } catch (error) {
    console.error('Error al generar viajes desde horario:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudieron generar los viajes');
  }
}

/**
 * Obtiene todas las fechas en un rango que coinciden con los días de la semana especificados
 */
function obtenerFechasPorDiasSemana(
  inicio: Date,
  fin: Date,
  diasSemana: number[]
): Date[] {
  const fechas: Date[] = [];
  const fechaActual = new Date(inicio);
  fechaActual.setHours(0, 0, 0, 0);

  const fechaFin = new Date(fin);
  fechaFin.setHours(23, 59, 59, 999);

  while (fechaActual <= fechaFin) {
    const diaSemana = fechaActual.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    if (diasSemana.includes(diaSemana)) {
      fechas.push(new Date(fechaActual));
    }
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return fechas;
}

/**
 * Verifica qué viajes ya existen para evitar duplicados
 * Optimizado: busca todos los viajes del rango y luego filtra en memoria
 */
async function verificarViajesExistentes(
  rutaId: string,
  embarcacionId: string,
  horaSalida: string,
  fechas: Date[]
): Promise<Set<string>> {
  try {
    if (fechas.length === 0) return new Set();

    const viajesExistentes = new Set<string>();
    const viajesRef = collection(db, 'viajes');

    // Obtener el rango completo de fechas
    const fechaMin = new Date(Math.min(...fechas.map(f => f.getTime())));
    fechaMin.setHours(0, 0, 0, 0);
    const fechaMax = new Date(Math.max(...fechas.map(f => f.getTime())));
    fechaMax.setHours(23, 59, 59, 999);

    // Buscar todos los viajes en el rango (más eficiente que buscar por fecha individual)
    const q = query(
      viajesRef,
      where('rutaId', '==', rutaId),
      where('embarcacionId', '==', embarcacionId),
      where('horaSalida', '==', horaSalida),
      where('fechaSalida', '>=', Timestamp.fromDate(fechaMin)),
      where('fechaSalida', '<=', Timestamp.fromDate(fechaMax))
    );

    const snapshot = await getDocs(q);
    
    // Crear un set de fechas que ya tienen viaje
    snapshot.docs.forEach((doc) => {
      const viaje = doc.data() as Trip;
      if (viaje.fechaSalida) {
        const fechaViaje = viaje.fechaSalida.toDate ? viaje.fechaSalida.toDate() : new Date(viaje.fechaSalida);
        const fechaStr = fechaViaje.toISOString().split('T')[0];
        viajesExistentes.add(fechaStr);
      }
    });

    return viajesExistentes;
  } catch (error) {
    console.error('Error al verificar viajes existentes:', error);
    // Si hay error (por ejemplo, falta índice), retornar set vacío para ser conservador
    // El sistema intentará crear los viajes y fallará si ya existen (mejor que no crear nada)
    return new Set();
  }
}

/**
 * Crea un viaje individual desde un horario recurrente
 */
async function crearViajeDesdeHorario(
  horario: HorarioRecurrente,
  embarcacion: Vessel,
  fecha: Date
): Promise<string> {
  const [hours, minutes] = horario.horaSalida.split(':').map(Number);
  const fechaSalida = new Date(fecha);
  fechaSalida.setHours(hours, minutes, 0, 0);

  const tripData = {
    rutaId: horario.rutaId,
    embarcacionId: horario.embarcacionId,
    fechaSalida: Timestamp.fromDate(fechaSalida),
    horaSalida: horario.horaSalida,
    estado: 'programado' as Trip['estado'],
  };

  return await createTrip(tripData, embarcacion);
}

/**
 * Genera viajes automáticamente para el próximo mes desde todos los horarios activos
 */
export async function generarViajesProximoMes(): Promise<{
  totalGenerados: number;
  porHorario: Array<{ horarioId: string; nombre: string; cantidad: number }>;
}> {
  try {
    const horariosActivos = await getHorariosActivos();
    const hoy = new Date();
    const proximoMes = new Date(hoy);
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    proximoMes.setDate(1); // Primer día del próximo mes
    proximoMes.setHours(0, 0, 0, 0);

    const finMes = new Date(proximoMes);
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0); // Último día del mes
    finMes.setHours(23, 59, 59, 999);

    const resultados: Array<{ horarioId: string; nombre: string; cantidad: number }> = [];
    let totalGenerados = 0;

    for (const horario of horariosActivos) {
      const viajesCreados = await generarViajesDesdeHorario(
        horario.id,
        proximoMes,
        finMes
      );
      resultados.push({
        horarioId: horario.id,
        nombre: horario.nombre,
        cantidad: viajesCreados.length,
      });
      totalGenerados += viajesCreados.length;
    }

    return {
      totalGenerados,
      porHorario: resultados,
    };
  } catch (error) {
    console.error('Error al generar viajes del próximo mes:', error);
    throw new Error('No se pudieron generar los viajes del próximo mes');
  }
}
