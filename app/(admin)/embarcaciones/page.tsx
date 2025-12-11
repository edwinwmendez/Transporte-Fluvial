'use client';

import { useState } from 'react';
import { useVessels, useCreateVessel, useUpdateVessel, useDeleteVessel } from '@/lib/hooks/useVessels';
import type { Vessel } from '@/lib/types';
import { VesselsList } from './components/VesselsList';
import { VesselsToolbar } from './components/VesselsToolbar';
import { VesselFormDialog } from './components/VesselFormDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Ship, Loader2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { handleError } from '@/lib/utils/error-handler';
import { Button } from '@/components/ui/button';

/**
 * Página de administración de embarcaciones
 * 
 * Permite crear, editar y eliminar embarcaciones.
 * Define la capacidad y configuración de asientos (filas × columnas).
 */
export default function EmbarcacionesPage() {
  const toast = useToast();
  const { data: embarcaciones = [], isLoading: loadingEmbarcaciones, refetch: refetchEmbarcaciones } = useVessels();
  // const createVessel = useCreateVessel();
  // const updateVessel = useUpdateVessel();
  const deleteVessel = useDeleteVessel();

  const [showDialog, setShowDialog] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  const handleOpenDialog = (vessel?: Vessel) => {
    setSelectedVessel(vessel || null);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedVessel(null);
  };

  const handleDelete = async (vesselId: string) => {
    const vessel = embarcaciones.find((v) => v.id === vesselId);
    if (!vessel) return;

    if (!confirm(`¿Estás seguro de eliminar la embarcación "${vessel.nombre}"?`)) {
      return;
    }

    try {
      await deleteVessel.mutateAsync(vesselId);
      toast.success('Embarcación eliminada exitosamente');
      refetchEmbarcaciones();
    } catch (error) {
      const message = handleError(error, { action: 'deleteVessel', vesselId });
      toast.error(message);
    }
  };

  const loading = loadingEmbarcaciones;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando embarcaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Embarcaciones</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Gestiona las embarcaciones disponibles para los viajes
        </p>
      </div>

      <VesselsToolbar onAdd={() => handleOpenDialog()} />

      {embarcaciones.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay embarcaciones registradas</p>
              <p className="text-sm text-muted-foreground mt-2">
                Crea una nueva embarcación para comenzar a programar viajes
              </p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Ship className="mr-2 h-4 w-4" />
                Crear Primera Embarcación
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <VesselsList
          vessels={embarcaciones}
          loading={loading}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
        />
      )}

      <VesselFormDialog
        open={showDialog}
        vessel={selectedVessel}
        onClose={handleCloseDialog}
        onSuccess={refetchEmbarcaciones}
      />
    </div>
  );
}
