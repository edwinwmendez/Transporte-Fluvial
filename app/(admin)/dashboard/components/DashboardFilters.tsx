'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Calendar, Filter, X } from 'lucide-react';

type FiltroRapido = 'hoy' | 'mañana' | 'estaSemana' | 'esteMes' | 'proximoMes' | 'personalizado';

interface DashboardFiltersProps {
  filtroRapido: FiltroRapido;
  onFiltroRapidoChange: (filtro: FiltroRapido) => void;
  fechaInicio: string;
  fechaFin: string;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
  mostrarFiltros: boolean;
  onToggleFiltros: () => void;
}

/**
 * Componente de filtros para el dashboard
 */
export function DashboardFilters({
  filtroRapido,
  onFiltroRapidoChange,
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  mostrarFiltros,
  onToggleFiltros,
}: DashboardFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros rápidos de fecha">
        {(['hoy', 'mañana', 'estaSemana', 'esteMes', 'proximoMes'] as FiltroRapido[]).map((filtro) => (
          <Button
            key={filtro}
            variant={filtroRapido === filtro ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFiltroRapidoChange(filtro)}
            aria-pressed={filtroRapido === filtro}
            aria-label={`Filtrar por ${filtro}`}
          >
            {filtro === 'hoy' && 'Hoy'}
            {filtro === 'mañana' && 'Mañana'}
            {filtro === 'estaSemana' && 'Esta Semana'}
            {filtro === 'esteMes' && 'Este Mes'}
            {filtro === 'proximoMes' && 'Próximo Mes'}
          </Button>
        ))}
        <Button
          variant={filtroRapido === 'personalizado' ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFiltros}
          aria-pressed={filtroRapido === 'personalizado'}
          aria-label="Filtro personalizado"
        >
          <Calendar className="h-4 w-4 mr-1" aria-hidden="true" />
          Personalizado
        </Button>
      </div>

      {/* Filtros personalizados */}
      {mostrarFiltros && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filtros Personalizados
            </Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFiltros}
              aria-label="Cerrar filtros personalizados"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => onFechaInicioChange(e.target.value)}
                aria-label="Fecha de inicio del rango"
              />
            </div>
            <div>
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => onFechaFinChange(e.target.value)}
                aria-label="Fecha de fin del rango"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
