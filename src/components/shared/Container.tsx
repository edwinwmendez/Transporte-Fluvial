'use client';

import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

/**
 * Componente Container responsive
 * Asegura contenido centrado y padding adecuado en todos los dispositivos
 */
export function Container({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        padding && 'px-4 sm:px-6 md:px-8 lg:px-12',
        {
          'max-w-screen-sm': maxWidth === 'sm',
          'max-w-screen-md': maxWidth === 'md',
          'max-w-screen-lg': maxWidth === 'lg',
          'max-w-screen-xl': maxWidth === 'xl',
          'max-w-screen-2xl': maxWidth === '2xl',
          'max-w-full': maxWidth === 'full',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
