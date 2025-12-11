'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Ship } from 'lucide-react';
import type { Vessel } from '@/lib/types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

interface VesselsListProps {
  vessels: Vessel[];
  loading?: boolean;
  onEdit: (vessel: Vessel) => void;
  onDelete: (vesselId: string) => void;
}

/**
 * Componente para mostrar la lista de embarcaciones
 */
export function VesselsList({
  vessels,
  loading = false,
  onEdit,
  onDelete,
}: VesselsListProps) {
  if (loading) {
    return <LoadingSpinner size="lg" text="Cargando embarcaciones..." />;
  }

  if (vessels.length === 0) {
    return (
      <EmptyState
        icon={Ship}
        title="No hay embarcaciones registradas"
        description="Crea una nueva embarcación para comenzar a programar viajes"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vessels.map((vessel) => (
        <Card key={vessel.id} className={vessel.activa ? '' : 'opacity-60'}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  {vessel.nombre}
                </CardTitle>
                <CardDescription className="mt-1">
                  Capacidad: {vessel.capacidad} pasajeros
                </CardDescription>
              </div>
              <Badge variant={vessel.activa ? 'default' : 'secondary'}>
                {vessel.activa ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Configuración:</span>
                <span className="font-medium">
                  {vessel.filas} filas × {vessel.columnas} columnas
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vessel)}
                className="flex-1"
                aria-label={`Editar embarcación ${vessel.nombre}`}
              >
                <Pencil className="h-4 w-4 mr-1" aria-hidden="true" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(vessel.id)}
                className="text-destructive hover:text-destructive"
                aria-label={`Eliminar embarcación ${vessel.nombre}`}
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
