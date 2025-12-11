'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface VesselsToolbarProps {
  onAdd: () => void;
}

/**
 * Barra de herramientas para la página de embarcaciones
 */
export function VesselsToolbar({ onAdd }: VesselsToolbarProps) {
  return (
    <div className="flex justify-end">
      <Button onClick={onAdd} aria-label="Crear nueva embarcación">
        <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
        Nueva Embarcación
      </Button>
    </div>
  );
}
