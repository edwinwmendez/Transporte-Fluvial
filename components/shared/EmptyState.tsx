'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Componente reutilizable para mostrar estados vacíos en listas o secciones
 * 
 * Útil para cuando no hay datos que mostrar, proporcionando:
 * - Icono visual representativo
 * - Título y descripción opcional
 * - Botón de acción opcional para guiar al usuario
 * 
 * @param icon - Componente de icono de lucide-react a mostrar
 * @param title - Título principal del estado vacío
 * @param description - Descripción opcional adicional
 * @param action - Acción opcional con label y onClick handler
 * @param className - Clases CSS adicionales
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Calendar}
 *   title="No hay viajes programados"
 *   description="Crea un nuevo viaje para comenzar"
 *   action={{
 *     label: "Crear Viaje",
 *     onClick: () => handleCreate()
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('', className)} role="status" aria-live="polite">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <Icon 
            className="h-12 w-12 text-muted-foreground mx-auto mb-4" 
            aria-hidden="true"
          />
          <h3 className="text-muted-foreground font-medium" id="empty-state-title">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-2" aria-describedby="empty-state-title">
              {description}
            </p>
          )}
          {action && (
            <Button 
              onClick={action.onClick} 
              className="mt-4"
              aria-label={action.label}
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
