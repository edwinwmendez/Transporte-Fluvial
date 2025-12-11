'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, MapPin, Route as RouteIcon } from 'lucide-react';
import type { Route } from '@/lib/types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

interface RutasListProps {
  rutas: Route[];
  loading?: boolean;
  onEdit: (ruta: Route) => void;
  onDelete: (rutaId: string) => void;
}

/**
 * Componente para mostrar la lista de rutas
 */
export function RutasList({
  rutas,
  loading = false,
  onEdit,
  onDelete,
}: RutasListProps) {
  if (loading) {
    return <LoadingSpinner size="lg" text="Cargando rutas..." />;
  }

  if (rutas.length === 0) {
    return (
      <EmptyState
        icon={RouteIcon}
        title="No hay rutas registradas"
        description="Crea una nueva ruta para comenzar a programar viajes"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rutas.map((ruta) => (
        <Card key={ruta.id} className={ruta.activa ? '' : 'opacity-60'}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {ruta.origen} → {ruta.destino}
                </CardTitle>
                <CardDescription className="mt-1">
                  {ruta.distancia} km • {ruta.horasEstimadas}h
                </CardDescription>
              </div>
              <Badge variant={ruta.activa ? 'default' : 'secondary'}>
                {ruta.activa ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio:</span>
                <span className="font-semibold">S/ {ruta.precio.toFixed(2)}</span>
              </div>
              {ruta.paradasIntermedias && ruta.paradasIntermedias.length > 0 && (
                <div className="text-muted-foreground">
                  {ruta.paradasIntermedias.length} parada{ruta.paradasIntermedias.length > 1 ? 's' : ''} intermedia{ruta.paradasIntermedias.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(ruta)}
                className="flex-1"
                aria-label={`Editar ruta ${ruta.origen} - ${ruta.destino}`}
              >
                <Pencil className="h-4 w-4 mr-1" aria-hidden="true" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(ruta.id)}
                className="text-destructive hover:text-destructive"
                aria-label={`Eliminar ruta ${ruta.origen} - ${ruta.destino}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
