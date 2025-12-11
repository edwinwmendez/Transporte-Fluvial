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
    <Card className={cn('border-dashed', className)} role="status" aria-live="polite">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-6">
            <Icon 
              className="h-8 w-8 text-muted-foreground" 
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2" id="empty-state-title">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2" aria-describedby="empty-state-title">
              {description}
            </p>
          )}
          {action && (
            <Button 
              onClick={action.onClick} 
              className="mt-6"
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
