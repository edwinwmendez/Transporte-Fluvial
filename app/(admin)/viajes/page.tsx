'use client';

import { useState, useMemo } from 'react';
import { useTrips } from '@/lib/hooks/useTrips';
import { useRoutes } from '@/lib/hooks/useRoutes';
import { useVessels } from '@/lib/hooks/useVessels';
import { useHorariosActivos } from '@/lib/hooks/useSchedules';
import { useDeleteTrip } from '@/lib/hooks/useTrips';
import { TripsList } from './components/TripsList';
import { TripsToolbar } from './components/TripsToolbar';
import { TripFormDialog } from './components/TripFormDialog';
import { GenerateTripsDialog } from './components/GenerateTripsDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { formatLocalDate } from '@/lib/utils/formatters';
import type { Trip } from '@/lib/types';
import { handleError } from '@/lib/utils/error-handler';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

/**
 * Página principal para gestionar viajes
 * 
 * Permite:
 * - Ver lista de viajes con filtros por estado
 * - Crear nuevos viajes manualmente
 * - Editar viajes existentes
 * - Eliminar/cancelar viajes
 * - Generar viajes masivamente desde horarios recurrentes
 */
export default function ViajesPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: viajes = [], isLoading: loadingViajes, refetch: refetchViajes } = useTrips();
  const { data: rutas = [], isLoading: loadingRutas } = useRoutes();
  const { data: embarcaciones = [], isLoading: loadingEmbarcaciones } = useVessels();
  const { data: horarios = [] } = useHorariosActivos();
  const deleteTrip = useDeleteTrip();

  const [showDialog, setShowDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const loading = loadingViajes || loadingRutas || loadingEmbarcaciones;

  const viajesFiltrados = useMemo(() => {
    if (filtroEstado === 'todos') return viajes;
    return viajes.filter((v) => v.estado === filtroEstado);
  }, [viajes, filtroEstado]);

  const handleOpenDialog = (trip?: Trip) => {
    setEditingTrip(trip || null);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingTrip(null);
  };

  const handleDelete = async (tripId: string) => {
    const trip = viajes.find((t) => t.id === tripId);
    if (!trip) return;

    const fecha = trip.fechaSalida?.toDate
      ? trip.fechaSalida.toDate()
      : trip.fechaSalida instanceof Date
        ? trip.fechaSalida
        : new Date();

    if (!confirm(`¿Estás seguro de cancelar el viaje del ${formatLocalDate(fecha)}?`)) {
      return;
    }

    try {
      await deleteTrip.mutateAsync(tripId);
      toast.success('Viaje cancelado exitosamente');
      refetchViajes();
    } catch (error) {
      const message = handleError(error, { action: 'deleteTrip', tripId });
      toast.error(message);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Cargando viajes..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Viajes</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Gestiona los viajes programados y genera nuevos desde horarios recurrentes
        </p>
      </div>

      <TripsToolbar
        filtroEstado={filtroEstado}
        onFiltroChange={setFiltroEstado}
        totalViajes={viajesFiltrados.length}
        onAdd={() => handleOpenDialog()}
        onGenerateFromHorarios={() => setShowGenerateDialog(true)}
      />

      {viajes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Calendar}
              title="No hay viajes programados"
              description="Crea tu primer viaje o genera viajes desde horarios recurrentes"
              action={{
                label: 'Crear Primer Viaje',
                onClick: () => handleOpenDialog(),
              }}
            />
          </CardContent>
        </Card>
      ) : viajesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Calendar}
              title="No hay viajes con el estado seleccionado"
              description="Intenta cambiar el filtro de estado"
            />
          </CardContent>
        </Card>
      ) : (
        <TripsList
          trips={viajesFiltrados}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
          onView={(tripId) => router.push(`/ventas/${tripId}`)}
        />
      )}

      <TripFormDialog
        open={showDialog}
        onOpenChange={handleCloseDialog}
        editingTrip={editingTrip}
        rutas={rutas}
        embarcaciones={embarcaciones}
        onSuccess={refetchViajes}
      />

      <GenerateTripsDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        horarios={horarios}
        onSuccess={refetchViajes}
      />
    </div>
  );
}
