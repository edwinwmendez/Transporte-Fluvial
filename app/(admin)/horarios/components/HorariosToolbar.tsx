'use client';

import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';

interface HorariosToolbarProps {
  onAdd: () => void;
  onGenerateNextMonth: () => void;
}

/**
 * Toolbar con acciones principales para horarios
 */
export function HorariosToolbar({ onAdd, onGenerateNextMonth }: HorariosToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
      <Button onClick={onAdd} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Horario
      </Button>
      <Button onClick={onGenerateNextMonth} variant="outline" className="w-full sm:w-auto">
        <Calendar className="mr-2 h-4 w-4" />
        Generar Próximo Mes
      </Button>
    </div>
  );
}
