'use client';

import { useState } from 'react';
import { useDashboardTrips } from '@/lib/hooks/useDashboardTrips';
import type { Trip } from '@/lib/types';
import { DashboardFilters } from './components/DashboardFilters';
import { TripsGrid } from './components/TripsGrid';
import { Card, CardContent } from '@/components/ui/card';

type FiltroRapido = 'hoy' | 'mañana' | 'estaSemana' | 'esteMes' | 'proximoMes' | 'personalizado';

/**
 * Página principal del dashboard administrativo
 * 
 * Muestra un resumen de viajes con filtros por fecha y estado.
 * Permite filtrar por períodos rápidos (hoy, mañana, esta semana, etc.)
 * o por un rango personalizado de fechas.
 */
export default function DashboardPage() {
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>('hoy');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [estados] = useState<Trip['estado'][]>(['programado']);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { data: trips = [], isLoading, error } = useDashboardTrips(
    filtroRapido,
    filtroRapido === 'personalizado' ? fechaInicio : undefined,
    filtroRapido === 'personalizado' ? fechaFin : undefined,
    estados
  );

  const handleFiltroRapidoChange = (filtro: FiltroRapido) => {
    setFiltroRapido(filtro);
    if (filtro !== 'personalizado') {
      setMostrarFiltros(false);
    } else {
      setMostrarFiltros(true);
    }
  };

  const handleToggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
    if (!mostrarFiltros && filtroRapido !== 'personalizado') {
      setFiltroRapido('personalizado');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Resumen de viajes y operaciones del sistema
        </p>
      </div>

      <DashboardFilters
        filtroRapido={filtroRapido}
        onFiltroRapidoChange={handleFiltroRapidoChange}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onFechaInicioChange={setFechaInicio}
        onFechaFinChange={setFechaFin}
        mostrarFiltros={mostrarFiltros}
        onToggleFiltros={handleToggleFiltros}
      />

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive font-medium">Error al cargar los viajes</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TripsGrid trips={trips} loading={isLoading} />
      )}
    </div>
  );
}
