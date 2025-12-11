import { useMemo } from 'react';
import { useTripsByDateRange } from './useTrips';
import type { Trip } from '../types';

type FiltroRapido = 'hoy' | 'mañana' | 'estaSemana' | 'esteMes' | 'proximoMes' | 'personalizado';

/**
 * Calcula las fechas de inicio y fin basado en un filtro rápido
 */
function calcularFechas(filtro: FiltroRapido, fechaInicio?: string, fechaFin?: string): { inicio: Date; fin: Date } {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  switch (filtro) {
    case 'hoy': {
      const fin = new Date(hoy);
      fin.setHours(23, 59, 59, 999);
      return { inicio: hoy, fin };
    }
    case 'mañana': {
      const inicio = new Date(hoy);
      inicio.setDate(inicio.getDate() + 1);
      const fin = new Date(inicio);
      fin.setHours(23, 59, 59, 999);
      return { inicio, fin };
    }
    case 'estaSemana': {
      const inicio = new Date(hoy);
      const diaSemana = inicio.getDay();
      const diff = inicio.getDate() - diaSemana; // Domingo = 0
      inicio.setDate(diff);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      return { inicio, fin };
    }
    case 'esteMes': {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      fin.setHours(23, 59, 59, 999);
      return { inicio, fin };
    }
    case 'proximoMes': {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
      const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
      fin.setHours(23, 59, 59, 999);
      return { inicio, fin };
    }
    case 'personalizado': {
      if (fechaInicio && fechaFin) {
        return {
          inicio: new Date(fechaInicio),
          fin: new Date(fechaFin),
        };
      }
      return { inicio: hoy, fin: hoy };
    }
    default:
      return { inicio: hoy, fin: hoy };
  }
}

/**
 * Hook para obtener viajes del dashboard con filtros
 * 
 * @param filtroRapido - Filtro rápido seleccionado
 * @param fechaInicio - Fecha de inicio (solo para filtro personalizado)
 * @param fechaFin - Fecha de fin (solo para filtro personalizado)
 * @param estados - Estados de viaje a filtrar
 * @returns Query result con viajes filtrados
 */
export function useDashboardTrips(
  filtroRapido: FiltroRapido,
  fechaInicio?: string,
  fechaFin?: string,
  estados?: Trip['estado'][]
) {
  const fechas = useMemo(
    () => calcularFechas(filtroRapido, fechaInicio, fechaFin),
    [filtroRapido, fechaInicio, fechaFin]
  );

  const enabled = filtroRapido !== 'personalizado' || (!!fechaInicio && !!fechaFin);

  return useTripsByDateRange(fechas.inicio, fechas.fin, estados, enabled);
}
