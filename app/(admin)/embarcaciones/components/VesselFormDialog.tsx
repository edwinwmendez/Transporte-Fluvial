'use client';

import { Calculator } from 'lucide-react';
import { useState } from 'react';

import { FormDialog } from '@/components/shared/FormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/useToast';
import { useCreateVessel, useUpdateVessel } from '@/lib/hooks/useVessels';
import type { Vessel } from '@/lib/types';
import { handleError } from '@/lib/utils/error-handler';

interface VesselFormDialogProps {
  open: boolean;
  vessel: Vessel | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Dialog para crear o editar una embarcación
 */
export function VesselFormDialog({ open, vessel, onClose, onSuccess }: VesselFormDialogProps) {
  const toast = useToast();
  const createVessel = useCreateVessel();
  const updateVessel = useUpdateVessel();

  // Inicializar formData basado en vessel usando función inicializadora
  // El key prop en FormDialog fuerza remount cuando cambia vessel, así que esto solo se ejecuta una vez
  const [formData, setFormData] = useState(() => {
    if (vessel) {
      return {
        nombre: vessel.nombre,
        capacidad: vessel.capacidad.toString(),
        filas: vessel.filas.toString(),
        columnas: vessel.columnas.toString(),
        activa: vessel.activa,
      };
    }
    return {
      nombre: '',
      capacidad: '',
      filas: '',
      columnas: '',
      activa: true,
    };
  });

  const handleCalculateCapacity = () => {
    const filas = parseInt(formData.filas) || 0;
    const columnas = parseInt(formData.columnas) || 0;
    if (filas > 0 && columnas > 0) {
      setFormData({
        ...formData,
        capacidad: (filas * columnas).toString(),
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.capacidad || !formData.filas || !formData.columnas) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const capacidad = parseInt(formData.capacidad);
    const filas = parseInt(formData.filas);
    const columnas = parseInt(formData.columnas);

    if (capacidad !== filas * columnas) {
      toast.error('La capacidad debe ser igual a filas × columnas');
      return;
    }

    if (columnas % 2 !== 0) {
      toast.error('Las columnas deben ser un número par para el layout 2-2');
      return;
    }

    try {
      const vesselData = {
        nombre: formData.nombre.trim(),
        capacidad,
        filas,
        columnas,
        activa: formData.activa,
      };

      if (vessel) {
        await updateVessel.mutateAsync({ embarcacionId: vessel.id, updates: vesselData });
        toast.success('Embarcación actualizada exitosamente');
      } else {
        await createVessel.mutateAsync(vesselData);
        toast.success('Embarcación creada exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = handleError(error, { action: vessel ? 'updateVessel' : 'createVessel' });
      toast.error(message);
    }
  };

  const loading = createVessel.isPending || updateVessel.isPending;

  return (
    <FormDialog
      key={vessel?.id || 'new'}
      open={open}
      onOpenChange={onClose}
      title={vessel ? 'Editar Embarcación' : 'Nueva Embarcación'}
      description={
        vessel
          ? 'Modifica los datos de la embarcación'
          : 'Completa los datos de la nueva embarcación'
      }
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: M/V Amazonas"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="filas">Filas *</Label>
            <Input
              id="filas"
              type="number"
              value={formData.filas}
              onChange={(e) => setFormData({ ...formData, filas: e.target.value })}
              placeholder="20"
              min="1"
              required
            />
          </div>
          <div>
            <Label htmlFor="columnas">Columnas *</Label>
            <Input
              id="columnas"
              type="number"
              value={formData.columnas}
              onChange={(e) => setFormData({ ...formData, columnas: e.target.value })}
              placeholder="4"
              min="2"
              step="2"
              required
            />
          </div>
          <div>
            <Label htmlFor="capacidad">Capacidad *</Label>
            <div className="flex gap-2">
              <Input
                id="capacidad"
                type="number"
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                placeholder="80"
                min="1"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCalculateCapacity}
                aria-label="Calcular capacidad automáticamente"
                title="Calcular capacidad (filas × columnas)"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          * Las columnas deben ser un número par para el layout 2-2 (pasillo en el medio)
        </p>
      </div>
    </FormDialog>
  );
}
