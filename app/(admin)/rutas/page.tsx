'use client';

import { useState } from 'react';
import { useRoutes, useCreateRoute, useUpdateRoute, useDeleteRoute } from '@/lib/hooks/useRoutes';
import type { Route } from '@/lib/types';
import { RutasList } from './components/RutasList';
import { RutasToolbar } from './components/RutasToolbar';
import { RutaFormDialog } from './components/RutaFormDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Route as RouteIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { handleError } from '@/lib/utils/error-handler';
import { Button } from '@/components/ui/button';

/**
 * Página de administración de rutas
 * 
 * Permite crear, editar y eliminar rutas de transporte fluvial.
 * Incluye soporte para paradas intermedias.
 */
export default function RutasPage() {
  const toast = useToast();
  const { data: rutas = [], isLoading: loadingRutas, refetch: refetchRutas } = useRoutes();
  // const createRoute = useCreateRoute();
  // const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();

  const [showDialog, setShowDialog] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState<Route | null>(null);

  const handleOpenDialog = (ruta?: Route) => {
    setSelectedRuta(ruta || null);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedRuta(null);
  };

  const handleDelete = async (rutaId: string) => {
    const ruta = rutas.find((r) => r.id === rutaId);
    if (!ruta) return;

    if (!confirm(`¿Estás seguro de eliminar la ruta "${ruta.origen} → ${ruta.destino}"?`)) {
      return;
    }

    try {
      await deleteRoute.mutateAsync(rutaId);
      toast.success('Ruta eliminada exitosamente');
      refetchRutas();
    } catch (error) {
      const message = handleError(error, { action: 'deleteRoute', rutaId });
      toast.error(message);
    }
  };

  const loading = loadingRutas;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando rutas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Rutas de Transporte</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Gestiona las rutas disponibles para programar viajes
        </p>
      </div>

      <RutasToolbar onAdd={() => handleOpenDialog()} />

      {rutas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <RouteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay rutas registradas</p>
              <p className="text-sm text-muted-foreground mt-2">
                Crea una nueva ruta para comenzar a programar viajes
              </p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <RouteIcon className="mr-2 h-4 w-4" />
                Crear Primera Ruta
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <RutasList
          rutas={rutas}
          loading={loading}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
        />
      )}

      <RutaFormDialog
        open={showDialog}
        ruta={selectedRuta}
        onClose={handleCloseDialog}
        onSuccess={refetchRutas}
      />
    </div>
  );
}
