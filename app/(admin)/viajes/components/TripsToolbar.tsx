'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Play } from 'lucide-react';
import type { Trip } from '@/lib/types';

interface TripsToolbarProps {
  filtroEstado: string;
  onFiltroChange: (estado: string) => void;
  totalViajes: number;
  onAdd: () => void;
  onGenerateFromHorarios: () => void;
}

/**
 * Toolbar con filtros y acciones principales para viajes
 */
export function TripsToolbar({
  filtroEstado,
  onFiltroChange,
  totalViajes,
  onAdd,
  onGenerateFromHorarios,
}: TripsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <Label htmlFor="filtroEstado" className="text-sm font-medium">
          Filtrar por estado:
        </Label>
        <select
          id="filtroEstado"
          value={filtroEstado}
          onChange={(e) => onFiltroChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="programado">Programado</option>
          <option value="en_curso">En Curso</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <span className="text-sm text-muted-foreground">
          ({totalViajes} viaje{totalViajes !== 1 ? 's' : ''})
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onGenerateFromHorarios}>
          <Play className="h-4 w-4 mr-2" />
          Generar desde Horarios
        </Button>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Viaje
        </Button>
      </div>
    </div>
  );
}
