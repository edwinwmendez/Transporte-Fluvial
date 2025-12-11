'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Play, Calendar, Clock, Ship } from 'lucide-react';
import type { HorarioRecurrente, Route, Vessel } from '@/lib/types';

interface HorariosListProps {
  horarios: HorarioRecurrente[];
  rutas: Route[];
  embarcaciones: Vessel[];
  loading?: boolean;
  onEdit: (horario: HorarioRecurrente) => void;
  onDelete: (horarioId: string) => void;
  onGenerate: (horario: HorarioRecurrente) => void;
}

/**
 * Componente para mostrar la lista de horarios recurrentes
 */
export function HorariosList({
  horarios,
  rutas,
  embarcaciones,
  loading = false,
  onEdit,
  onDelete,
  onGenerate,
}: HorariosListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cargando horarios...</p>
      </div>
    );
  }

  if (horarios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay horarios recurrentes registrados</p>
      </div>
    );
  }

  const getRouteName = (rutaId: string) => {
    const ruta = rutas.find((r) => r.id === rutaId);
    return ruta ? `${ruta.origen} → ${ruta.destino}` : 'Ruta no encontrada';
  };

  const getVesselName = (embarcacionId: string) => {
    const embarcacion = embarcaciones.find((v) => v.id === embarcacionId);
    return embarcacion?.nombre || 'Embarcación no encontrada';
  };

  const getDiasSemanaNames = (dias: number[]) => {
    const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias.map((dia) => nombres[dia]).join(', ');
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {horarios.map((horario) => (
        <Card key={horario.id} className={horario.activo ? '' : 'opacity-60'}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{horario.nombre}</CardTitle>
                <CardDescription className="mt-1">
                  {getRouteName(horario.rutaId)}
                </CardDescription>
              </div>
              <Badge variant={horario.activo ? 'default' : 'secondary'}>
                {horario.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-muted-foreground" />
                <span>{getVesselName(horario.embarcacionId)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{horario.horaSalida}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{getDiasSemanaNames(horario.diasSemana)}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(horario)}
                className="flex-1"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerate(horario)}
                disabled={!horario.activo}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-1" />
                Generar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(horario.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
