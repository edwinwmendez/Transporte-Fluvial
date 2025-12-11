'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, MessageCircle, Loader2 } from 'lucide-react';
import type { BookingFormData, BookingFormErrors } from '@/lib/hooks/useBookingForm';

interface PassengerFormProps {
  formData: BookingFormData;
  errors: BookingFormErrors;
  onFieldChange: (field: keyof BookingFormData, value: string) => void;
  onDniBlur?: () => void;
  buscandoPasajero?: boolean;
}

/**
 * Componente para el formulario de datos del pasajero
 */
export function PassengerForm({
  formData,
  errors,
  onFieldChange,
  onDniBlur,
  buscandoPasajero = false,
}: PassengerFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* DNI */}
        <div className="space-y-2">
          <Label htmlFor="dni" className="text-sm font-medium">
            DNI <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="dni"
              name="dni"
              type="text"
              maxLength={8}
              value={formData.dni}
              onChange={(e) => onFieldChange('dni', e.target.value)}
              onBlur={onDniBlur}
              placeholder="12345678"
              className={errors.dni ? 'border-destructive' : ''}
              disabled={buscandoPasajero}
            />
            {buscandoPasajero && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {errors.dni && <p className="text-sm text-destructive">{errors.dni}</p>}
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-sm font-medium">
            Nombre Completo <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => onFieldChange('nombre', e.target.value)}
              placeholder="Juan Pérez"
              className={errors.nombre ? 'border-destructive' : ''}
            />
          </div>
          {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-sm font-medium">
            Teléfono <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              maxLength={9}
              value={formData.telefono}
              onChange={(e) => onFieldChange('telefono', e.target.value)}
              placeholder="987654321"
              className={errors.telefono ? 'border-destructive' : ''}
            />
          </div>
          {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
        </div>

        {/* WhatsApp (opcional) */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-sm font-medium">
            WhatsApp
          </Label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              maxLength={9}
              value={formData.whatsapp}
              onChange={(e) => onFieldChange('whatsapp', e.target.value)}
              placeholder="987654321"
              className={errors.whatsapp ? 'border-destructive' : ''}
            />
          </div>
          {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
        </div>
      </div>
    </div>
  );
}
