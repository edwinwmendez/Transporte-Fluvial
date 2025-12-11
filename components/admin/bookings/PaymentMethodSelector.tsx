'use client';

import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { BookingFormErrors } from '@/lib/hooks/useBookingForm';

interface PaymentMethodSelectorProps {
  metodoPago: 'efectivo' | 'yape' | 'plin';
  onSelect: (method: 'efectivo' | 'yape' | 'plin') => void;
  errors?: BookingFormErrors;
}

/**
 * Componente para seleccionar método de pago
 */
export function PaymentMethodSelector({
  metodoPago,
  onSelect,
  errors,
}: PaymentMethodSelectorProps) {
  const methods = [
    { value: 'efectivo' as const, label: 'Efectivo', color: 'bg-green-500' },
    { value: 'yape' as const, label: 'YAPE', color: 'bg-purple-500' },
    { value: 'plin' as const, label: 'PLIN', color: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Método de Pago <span className="text-destructive">*</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {methods.map((method) => (
          <Button
            key={method.value}
            type="button"
            variant={metodoPago === method.value ? 'default' : 'outline'}
            onClick={() => onSelect(method.value)}
            className={cn(
              'relative h-auto py-3 px-4 flex flex-col items-center gap-2',
              metodoPago === method.value && 'ring-2 ring-primary'
            )}
          >
            <div className={cn('w-8 h-8 rounded-full', method.color)} />
            <span className="text-xs font-medium">{method.label}</span>
            {metodoPago === method.value && (
              <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-primary" />
            )}
          </Button>
        ))}
      </div>
      {errors?.metodoPago && (
        <p className="text-sm text-destructive">{errors.metodoPago}</p>
      )}
    </div>
  );
}
