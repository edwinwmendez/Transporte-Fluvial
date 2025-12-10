'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * Button component responsive
 * Asegura touch targets adecuados en móvil y tamaños apropiados
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 touch-target';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark disabled:opacity-50',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark active:bg-secondary-dark disabled:opacity-50',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10 active:bg-primary/20 disabled:opacity-50',
    ghost: 'text-primary hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50',
    danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700 disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-base min-h-[44px] md:px-6 md:py-3',
    lg: 'px-6 py-3 text-lg min-h-[48px] md:px-8 md:py-4',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        loading && 'opacity-75 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          <span>Cargando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
