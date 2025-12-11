'use client';

import { useState } from 'react';
import { useHorarios } from '@/lib/hooks/useSchedules';
import { useRoutes } from '@/lib/hooks/useRoutes';
import { useVessels } from '@/lib/hooks/useVessels';
import { useDeleteHorario, useGenerateTripsNextMonth } from '@/lib/hooks/useSchedules';
import { HorariosList } from './components/HorariosList';
import { HorariosToolbar } from './components/HorariosToolbar';
import { HorarioFormDialog } from './components/HorarioFormDialog';
import { GenerateTripsDialog } from './components/GenerateTripsDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import type { HorarioRecurrente } from '@/lib/types';
import { logError } from '@/lib/utils/logger';

export default function HorariosPage() {
  const toast = useToast();
  const { data: horarios = [], isLoading: loadingHorarios, refetch: refetchHorarios } = useHorarios();
  const { data: rutas = [], isLoading: loadingRutas } = useRoutes();
  const { data: embarcaciones = [], isLoading: loadingEmbarcaciones } = useVessels();
  const deleteHorario = useDeleteHorario();
  const generateNextMonth = useGenerateTripsNextMonth();

  const [showDialog, setShowDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showGenerateNextMonthDialog, setShowGenerateNextMonthDialog] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<HorarioRecurrente | null>(null);

  const loading = loadingHorarios || loadingRutas || loadingEmbarcaciones;
  const rutasActivas = rutas.filter((r) => r.activa);
  const embarcacionesActivas = embarcaciones.filter((v) => v.activa);

  const handleOpenDialog = (horario?: HorarioRecurrente) => {
    setSelectedHorario(horario || null);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedHorario(null);
  };

  const handleDelete = async (horarioId: string) => {
    const horario = horarios.find((h) => h.id === horarioId);
    if (!horario) return;
    
    if (!confirm(`¿Estás seguro de eliminar el horario "${horario.nombre}"?`)) {
      return;
    }

    try {
      await deleteHorario.mutateAsync(horarioId);
      toast.success('Horario eliminado exitosamente');
      refetchHorarios();
    } catch (err) {
      logError('Error al eliminar horario', err);
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar el horario'
      );
    }
  };

  const handleGenerate = (horario: HorarioRecurrente) => {
    setSelectedHorario(horario);
    setShowGenerateDialog(true);
  };

  const handleGenerateNextMonth = async () => {
    try {
      await generateNextMonth.mutateAsync();
      toast.success('Viajes del próximo mes generados exitosamente');
      setShowGenerateNextMonthDialog(false);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Horarios Recurrentes</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Define horarios recurrentes para generar viajes automáticamente
        </p>
      </div>

      <HorariosToolbar
        onAdd={() => handleOpenDialog()}
        onGenerateNextMonth={() => setShowGenerateNextMonthDialog(true)}
      />

      {horarios.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay horarios recurrentes registrados
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Crea horarios recurrentes para automatizar la generación de viajes
              </p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Horario
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <HorariosList
          horarios={horarios}
          rutas={rutasActivas}
          embarcaciones={embarcacionesActivas}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
          onGenerate={handleGenerate}
        />
      )}

      <HorarioFormDialog
        open={showDialog}
        horario={selectedHorario}
        rutas={rutasActivas}
        embarcaciones={embarcacionesActivas}
        onClose={handleCloseDialog}
        onSuccess={refetchHorarios}
      />

      <GenerateTripsDialog
        open={showGenerateDialog}
        horario={selectedHorario}
        onClose={() => {
          setShowGenerateDialog(false);
          setSelectedHorario(null);
        }}
        onComplete={refetchHorarios}
      />

      {/* Dialog simplificado para generar próximo mes */}
      {showGenerateNextMonthDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Generar Viajes del Próximo Mes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Se generarán viajes para todos los horarios activos del próximo mes.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowGenerateNextMonthDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGenerateNextMonth}
                  disabled={generateNextMonth.isPending}
                  className="flex-1"
                >
                  {generateNextMonth.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
