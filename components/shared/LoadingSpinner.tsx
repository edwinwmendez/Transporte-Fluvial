'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

/**
 * Componente de spinner de carga reutilizable y consistente
 * 
 * Muestra un indicador de carga animado con opción de texto descriptivo.
 * Usa el icono Loader2 de lucide-react con animación de rotación.
 * 
 * @param size - Tamaño del spinner: 'sm' (16px), 'md' (32px), 'lg' (48px)
 * @param className - Clases CSS adicionales para personalización
 * @param text - Texto opcional a mostrar debajo del spinner
 * 
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" text="Cargando viajes..." />
 * ```
 */
export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div 
      className={cn('flex flex-col items-center justify-center gap-2', className)}
      role="status"
      aria-live="polite"
      aria-label={text || 'Cargando'}
    >
      <Loader2 
        className={cn('animate-spin text-muted-foreground', sizeClasses[size])} 
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );
}
