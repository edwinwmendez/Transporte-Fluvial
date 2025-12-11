'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { HorarioRecurrente, Route, Vessel } from '@/lib/types';
import { useCreateHorario, useUpdateHorario } from '@/lib/hooks/useSchedules';
import { useToast } from '@/lib/hooks/useToast';
import { logError } from '@/lib/utils/logger';

const DIAS_SEMANA = [
  { valor: 0, nombre: 'Domingo', abrev: 'Dom' },
  { valor: 1, nombre: 'Lunes', abrev: 'Lun' },
  { valor: 2, nombre: 'Martes', abrev: 'Mar' },
  { valor: 3, nombre: 'Miércoles', abrev: 'Mié' },
  { valor: 4, nombre: 'Jueves', abrev: 'Jue' },
  { valor: 5, nombre: 'Viernes', abrev: 'Vie' },
  { valor: 6, nombre: 'Sábado', abrev: 'Sáb' },
];

interface HorarioFormDialogProps {
  open: boolean;
  horario: HorarioRecurrente | null;
  rutas: Route[];
  embarcaciones: Vessel[];
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Dialog para crear/editar horarios recurrentes
 */
export function HorarioFormDialog({
  open,
  horario,
  rutas,
  embarcaciones,
  onClose,
  onSuccess,
}: HorarioFormDialogProps) {
  const toast = useToast();
  const createHorario = useCreateHorario();
  const updateHorario = useUpdateHorario();

  const [formData, setFormData] = useState({
    nombre: '',
    rutaId: '',
    embarcacionId: '',
    horaSalida: '',
    diasSemana: [] as number[],
    activo: true,
  });

  useEffect(() => {
    if (horario) {
      setFormData({
        nombre: horario.nombre,
        rutaId: horario.rutaId,
        embarcacionId: horario.embarcacionId,
        horaSalida: horario.horaSalida,
        diasSemana: horario.diasSemana,
        activo: horario.activo,
      });
    } else {
      setFormData({
        nombre: '',
        rutaId: '',
        embarcacionId: '',
        horaSalida: '',
        diasSemana: [],
        activo: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horario, open]);

  const toggleDiaSemana = (dia: number) => {
    setFormData((prev) => {
      if (prev.diasSemana.includes(dia)) {
        return {
          ...prev,
          diasSemana: prev.diasSemana.filter((d) => d !== dia),
        };
      } else {
        return {
          ...prev,
          diasSemana: [...prev.diasSemana, dia].sort(),
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.nombre ||
      !formData.rutaId ||
      !formData.embarcacionId ||
      !formData.horaSalida ||
      formData.diasSemana.length === 0
    ) {
      toast.error('Completa todos los campos obligatorios y selecciona al menos un día');
      return;
    }

    try {
      const horarioData = {
        nombre: formData.nombre,
        rutaId: formData.rutaId,
        embarcacionId: formData.embarcacionId,
        horaSalida: formData.horaSalida,
        diasSemana: formData.diasSemana,
        activo: formData.activo,
      };

      if (horario) {
        await updateHorario.mutateAsync({
          horarioId: horario.id,
          updates: horarioData,
        });
        toast.success('Horario actualizado exitosamente');
      } else {
        await createHorario.mutateAsync(horarioData);
        toast.success('Horario creado exitosamente');
      }

      onClose();
      onSuccess();
    } catch (error) {
      logError('Error al guardar horario', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar el horario'
      );
    }
  };

  const saving = createHorario.isPending || updateHorario.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {horario ? 'Editar Horario Recurrente' : 'Nuevo Horario Recurrente'}
          </DialogTitle>
          <DialogDescription>
            {horario
              ? 'Modifica los datos del horario recurrente'
              : 'Define un horario recurrente para generar viajes automáticamente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Horario *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Atalaya-Pucallpa Lunes/Miércoles/Viernes 6AM"
            />
          </div>

          <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rutaId">Ruta *</Label>
              <select
                id="rutaId"
                value={formData.rutaId}
                onChange={(e) => setFormData({ ...formData, rutaId: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecciona una ruta</option>
                {rutas.map((ruta) => (
                  <option key={ruta.id} value={ruta.id}>
                    {ruta.origen} → {ruta.destino}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="embarcacionId">Embarcación *</Label>
              <select
                id="embarcacionId"
                value={formData.embarcacionId}
                onChange={(e) =>
                  setFormData({ ...formData, embarcacionId: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecciona una embarcación</option>
                {embarcaciones.map((embarcacion) => (
                  <option key={embarcacion.id} value={embarcacion.id}>
                    {embarcacion.nombre} ({embarcacion.capacidad} asientos)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horaSalida">Hora de Salida *</Label>
            <Input
              id="horaSalida"
              type="time"
              value={formData.horaSalida}
              onChange={(e) =>
                setFormData({ ...formData, horaSalida: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Días de la Semana *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.valor}
                  type="button"
                  onClick={() => toggleDiaSemana(dia.valor)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    formData.diasSemana.includes(dia.valor)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-muted'
                  }`}
                >
                  {dia.abrev}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Seleccionados: {formData.diasSemana.length} día
              {formData.diasSemana.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="activo">Horario activo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {horario ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
