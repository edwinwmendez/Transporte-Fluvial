'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RutasToolbarProps {
  onAdd: () => void;
}

/**
 * Barra de herramientas para la página de rutas
 */
export function RutasToolbar({ onAdd }: RutasToolbarProps) {
  return (
    <div className="flex justify-end">
      <Button onClick={onAdd} aria-label="Crear nueva ruta">
        <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
        Nueva Ruta
      </Button>
    </div>
  );
}
