'use client';

import { Button } from '@/components/ui/button';

interface PaymentFiltersProps {
  filter: 'todos' | 'yape' | 'plin';
  onFilterChange: (filter: 'todos' | 'yape' | 'plin') => void;
  counts: {
    todos: number;
    yape: number;
    plin: number;
  };
}

/**
 * Componente de filtros para pagos pendientes
 */
export function PaymentFilters({ filter, onFilterChange, counts }: PaymentFiltersProps) {
  return (
    <div className="flex gap-2" role="group" aria-label="Filtros de método de pago">
      <Button
        variant={filter === 'todos' ? 'default' : 'outline'}
        onClick={() => onFilterChange('todos')}
        size="sm"
        aria-pressed={filter === 'todos'}
        aria-label="Mostrar todos los pagos"
      >
        Todos ({counts.todos})
      </Button>
      <Button
        variant={filter === 'yape' ? 'default' : 'outline'}
        onClick={() => onFilterChange('yape')}
        size="sm"
        aria-pressed={filter === 'yape'}
        aria-label="Filtrar pagos YAPE"
      >
        YAPE ({counts.yape})
      </Button>
      <Button
        variant={filter === 'plin' ? 'default' : 'outline'}
        onClick={() => onFilterChange('plin')}
        size="sm"
        aria-pressed={filter === 'plin'}
        aria-label="Filtrar pagos PLIN"
      >
        PLIN ({counts.plin})
      </Button>
    </div>
  );
}
