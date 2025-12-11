'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CashIcon, YapeIcon, PlinIcon } from '@/components/ui/payment-icons';

import type { BookingFormErrors } from '@/lib/hooks/useBookingForm';

interface PaymentMethodSelectorProps {
  metodoPago: 'efectivo' | 'yape' | 'plin';
  onSelect: (method: 'efectivo' | 'yape' | 'plin') => void;
  errors?: BookingFormErrors;
}

/**
 * Componente profesional para seleccionar método de pago
 * Con iconos personalizados y diseño visual mejorado
 */
export function PaymentMethodSelector({
  metodoPago,
  onSelect,
  errors,
}: PaymentMethodSelectorProps) {
  const methods = [
    {
      value: 'efectivo' as const,
      label: 'Efectivo',
      icon: CashIcon,
      bgColor: 'bg-[hsl(var(--payment-cash))]',
      borderColor: 'border-[hsl(var(--payment-cash))]',
      hoverColor: 'hover:bg-[hsl(var(--payment-cash))]/10 hover:border-[hsl(var(--payment-cash))]',
      selectedBg: 'bg-[hsl(var(--payment-cash))]',
      selectedText: 'text-white',
    },
    {
      value: 'yape' as const,
      label: 'YAPE',
      icon: YapeIcon,
      bgColor: 'bg-[hsl(var(--payment-yape))]',
      borderColor: 'border-[hsl(var(--payment-yape))]',
      hoverColor: 'hover:bg-[hsl(var(--payment-yape))]/10 hover:border-[hsl(var(--payment-yape))]',
      selectedBg: 'bg-[hsl(var(--payment-yape))]',
      selectedText: 'text-white',
    },
    {
      value: 'plin' as const,
      label: 'PLIN',
      icon: PlinIcon,
      bgColor: 'bg-[hsl(var(--payment-plin))]',
      borderColor: 'border-[hsl(var(--payment-plin))]',
      hoverColor: 'hover:bg-[hsl(var(--payment-plin))]/10 hover:border-[hsl(var(--payment-plin))]',
      selectedBg: 'bg-[hsl(var(--payment-plin))]',
      selectedText: 'text-white',
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Método de Pago <span className="text-destructive">*</span>
      </label>
      <div className="grid grid-cols-3 gap-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = metodoPago === method.value;

          return (
            <button
              key={method.value}
              type="button"
              onClick={() => onSelect(method.value)}
              className={cn(
                'relative group flex flex-col items-center justify-center gap-2.5',
                'px-3 py-4 rounded-lg border-2 transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'touch-target',
                // Estados
                isSelected
                  ? cn(
                      method.selectedBg,
                      method.selectedText,
                      'border-transparent shadow-lg',
                      method.value === 'efectivo' && 'shadow-[hsl(var(--payment-cash))]/30',
                      method.value === 'yape' && 'shadow-[hsl(var(--payment-yape))]/30',
                      method.value === 'plin' && 'shadow-[hsl(var(--payment-plin))]/30',
                      'scale-105'
                    )
                  : cn(
                      'bg-background border-border text-foreground',
                      method.hoverColor,
                      'hover:shadow-md'
                    )
              )}
              aria-label={`Seleccionar método de pago: ${method.label}`}
              aria-pressed={isSelected}
            >
              {/* Icono */}
              <div
                className={cn(
                  'w-12 h-12 flex items-center justify-center transition-transform duration-200',
                  isSelected ? 'scale-110' : 'group-hover:scale-105'
                )}
              >
                <Icon className="w-full h-full" />
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-semibold transition-colors',
                  isSelected ? 'text-white' : 'text-foreground'
                )}
              >
                {method.label}
              </span>

              {/* Indicador de selección */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" fill="currentColor" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {errors?.metodoPago && (
        <p className="text-sm text-destructive mt-1">{errors.metodoPago}</p>
      )}
    </div>
  );
}
