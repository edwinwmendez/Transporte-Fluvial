'use client';

import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookingFormErrors } from '@/lib/hooks/useBookingForm';

interface Destination {
  nombre: string;
  precio: number;
  esDestinoFinal: boolean;
}

interface DestinationSelectorProps {
  destinos: Destination[];
  destinoSeleccionado: string;
  onDestinoChange: (destino: string) => void;
  monto: string;
  onMontoChange: (monto: string) => void;
  errors?: BookingFormErrors;
}

/**
 * Componente para seleccionar destino y mostrar monto
 */
export function DestinationSelector({
  destinos,
  destinoSeleccionado,
  onDestinoChange,
  monto,
  onMontoChange,
  errors,
}: DestinationSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Destino */}
      <div className="space-y-2">
        <Label htmlFor="destinoIntermedio" className="text-sm font-medium">
          Destino <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Select
            id="destinoIntermedio"
            name="destinoIntermedio"
            value={destinoSeleccionado}
            onChange={(e) => onDestinoChange(e.target.value)}
            className={cn(
              errors?.destinoIntermedio ? 'border-destructive' : '',
              'pl-10'
            )}
          >
            <option value="">Selecciona un destino</option>
            {destinos.map((destino) => (
              <option key={destino.nombre} value={destino.nombre}>
                {destino.nombre} {destino.esDestinoFinal ? '(Final)' : ''}
              </option>
            ))}
          </Select>
        </div>
        {errors?.destinoIntermedio && (
          <p className="text-sm text-destructive">{errors.destinoIntermedio}</p>
        )}
      </div>

      {/* Monto */}
      <div className="space-y-2">
        <Label htmlFor="monto" className="text-sm font-medium">
          Monto (S/) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="monto"
          name="monto"
          type="number"
          step="0.01"
          min="0"
          value={monto}
          onChange={(e) => onMontoChange(e.target.value)}
          placeholder="0.00"
          className={cn(errors?.monto && 'border-destructive')}
        />
        {errors?.monto && <p className="text-sm text-destructive">{errors.monto}</p>}
      </div>
    </div>
  );
}
