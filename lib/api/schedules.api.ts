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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase.service';
import type { HorarioRecurrente, Trip, Vessel } from '../types';
import { formatLocalDate } from '../utils/formatters';
import { createTrip } from './trips.api';
import { getVessel } from './vessels.api';
import { logError } from '../utils/logger';

/**
 * Obtener todos los horarios recurrentes
 */
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
    logError('Error al obtener horarios recurrentes', error);
    throw new Error('No se pudieron obtener los horarios recurrentes');
  }
}

/**
 * Obtener horarios activos
 */
export async function getHorariosActivos(): Promise<HorarioRecurrente[]> {
  try {
    const horariosRef = collection(db, 'horariosRecurrentes');
    const q = query(horariosRef, where('activo', '==', true), orderBy('nombre', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HorarioRecurrente[];
  } catch (error) {
    logError('Error al obtener horarios activos', error);
    throw new Error('No se pudieron obtener los horarios activos');
  }
}

/**
 * Crear nuevo horario recurrente
 */
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
    logError('Error al crear horario recurrente', error);
    throw new Error('No se pudo crear el horario recurrente');
  }
}

/**
 * Actualizar horario recurrente
 */
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
    logError('Error al actualizar horario recurrente', error);
    throw new Error('No se pudo actualizar el horario recurrente');
  }
}

/**
 * Eliminar horario recurrente (marcar como inactivo)
 */
export async function deleteHorarioRecurrente(horarioId: string): Promise<void> {
  try {
    const horarioRef = doc(db, 'horariosRecurrentes', horarioId);
    await updateDoc(horarioRef, {
      activo: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    logError('Error al eliminar horario recurrente', error);
    throw new Error('No se pudo eliminar el horario recurrente');
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
    const diaSemana = fechaActual.getDay();

    if (diasSemana.includes(diaSemana)) {
      fechas.push(new Date(fechaActual));
    }

    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return fechas;
}

/**
 * Verifica qué viajes ya existen para evitar duplicados
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

    const fechaMin = new Date(Math.min(...fechas.map((f) => f.getTime())));
    fechaMin.setHours(0, 0, 0, 0);
    const fechaMax = new Date(Math.max(...fechas.map((f) => f.getTime())));
    fechaMax.setHours(23, 59, 59, 999);

    const q = query(
      viajesRef,
      where('rutaId', '==', rutaId),
      where('embarcacionId', '==', embarcacionId),
      where('horaSalida', '==', horaSalida),
      where('fechaSalida', '>=', Timestamp.fromDate(fechaMin)),
      where('fechaSalida', '<=', Timestamp.fromDate(fechaMax))
    );

    const snapshot = await getDocs(q);

    snapshot.docs.forEach((doc) => {
      const viaje = doc.data() as Trip;
      if (viaje.fechaSalida) {
        const fechaViaje = viaje.fechaSalida.toDate();
        const fechaStr = formatLocalDate(fechaViaje);
        viajesExistentes.add(fechaStr);
      }
    });

    return viajesExistentes;
  } catch (error) {
    logError('Error al verificar viajes existentes', error, { rutaId, embarcacionId, horaSalida });
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
 * Calcula cuántos viajes se generarían desde un horario recurrente sin generarlos
 */
export async function calcularViajesDesdeHorario(
  horarioId: string,
  fechaInicio: Date,
  fechaFin: Date
): Promise<number> {
  try {
    const horarioRef = doc(db, 'horariosRecurrentes', horarioId);
    const horarioSnap = await getDoc(horarioRef);

    if (!horarioSnap.exists()) {
      return 0;
    }

    const horario = horarioSnap.data() as HorarioRecurrente;

    if (!horario.activo) {
      return 0;
    }

    const fechas = obtenerFechasPorDiasSemana(fechaInicio, fechaFin, horario.diasSemana);

    const viajesExistentes = await verificarViajesExistentes(
      horario.rutaId,
      horario.embarcacionId,
      horario.horaSalida,
      fechas
    );

    const fechasParaCrear = fechas.filter(
      (fecha) => !viajesExistentes.has(formatLocalDate(fecha))
    );

    return fechasParaCrear.length;
  } catch (error) {
    logError('Error al calcular viajes desde horario', error);
    return 0;
  }
}

/**
 * Genera viajes automáticamente desde un horario recurrente para un rango de fechas
 */
export async function generarViajesDesdeHorario(
  horarioId: string,
  fechaInicio: Date,
  fechaFin: Date,
  onProgress?: (viajeCreado: number, total: number) => void
): Promise<string[]> {
  try {
    const horarioRef = doc(db, 'horariosRecurrentes', horarioId);
    const horarioSnap = await getDoc(horarioRef);

    if (!horarioSnap.exists()) {
      throw new Error('Horario recurrente no encontrado');
    }

    const horario = horarioSnap.data() as HorarioRecurrente;

    if (!horario.activo) {
      throw new Error('El horario recurrente no está activo');
    }

    const embarcacion = await getVessel(horario.embarcacionId);
    if (!embarcacion) {
      throw new Error('Embarcación no encontrada');
    }

    const fechas = obtenerFechasPorDiasSemana(fechaInicio, fechaFin, horario.diasSemana);

    const viajesExistentes = await verificarViajesExistentes(
      horario.rutaId,
      horario.embarcacionId,
      horario.horaSalida,
      fechas
    );

    const fechasParaCrear = fechas.filter(
      (fecha) => !viajesExistentes.has(formatLocalDate(fecha))
    );

    if (fechasParaCrear.length === 0) {
      return [];
    }

    const total = fechasParaCrear.length;
    const viajesCreados: string[] = [];

    for (let i = 0; i < fechasParaCrear.length; i++) {
      const fecha = fechasParaCrear[i];
      try {
        const viajeId = await crearViajeDesdeHorario(horario, embarcacion, fecha);
        viajesCreados.push(viajeId);

        if (onProgress) {
          onProgress(viajesCreados.length, total);
        }
      } catch (error) {
        logError(`Error al crear viaje para fecha ${fecha.toISOString()}`, error);
      }
    }

    return viajesCreados;
  } catch (error) {
    logError('Error al generar viajes desde horario', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudieron generar los viajes');
  }
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
    proximoMes.setDate(1);
    proximoMes.setHours(0, 0, 0, 0);

    const finMes = new Date(proximoMes);
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
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
    logError('Error al generar viajes del próximo mes', error);
    throw new Error('No se pudieron generar los viajes del próximo mes');
  }
}
