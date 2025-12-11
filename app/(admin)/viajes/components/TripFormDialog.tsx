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
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/lib/hooks/useToast';
import { formatLocalDate } from '@/lib/utils/formatters';
import { parseLocalDate } from '@/lib/utils/date-helpers';
import type { Trip, Route, Vessel } from '@/lib/types';
import { useCreateTrip, useUpdateTrip } from '@/lib/hooks/useTrips';
import { handleError } from '@/lib/utils/error-handler';

interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTrip: Trip | null;
  rutas: Route[];
  embarcaciones: Vessel[];
  onSuccess: () => void;
}

/**
 * Diálogo para crear o editar un viaje
 */
export function TripFormDialog({
  open,
  onOpenChange,
  editingTrip,
  rutas,
  embarcaciones,
  onSuccess,
}: TripFormDialogProps) {
  const toast = useToast();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();

  const [formData, setFormData] = useState({
    rutaId: '',
    embarcacionId: '',
    fechaSalida: '',
    horaSalida: '',
    estado: 'programado' as Trip['estado'],
  });

  useEffect(() => {
    if (editingTrip && open) {
      const fecha = editingTrip.fechaSalida?.toDate
        ? editingTrip.fechaSalida.toDate()
        : editingTrip.fechaSalida instanceof Date
          ? editingTrip.fechaSalida
          : new Date();
      setFormData({
        rutaId: editingTrip.rutaId,
        embarcacionId: editingTrip.embarcacionId,
        fechaSalida: formatLocalDate(fecha),
        horaSalida: editingTrip.horaSalida || '',
        estado: editingTrip.estado,
      });
    } else if (open) {
      setFormData({
        rutaId: '',
        embarcacionId: '',
        fechaSalida: '',
        horaSalida: '',
        estado: 'programado',
      });
    }
  }, [editingTrip, open]);

  const rutasActivas = rutas.filter((r) => r.activa);
  const embarcacionesActivas = embarcaciones.filter((v) => v.activa);

  const handleSubmit = async () => {
    if (!formData.rutaId || !formData.embarcacionId || !formData.fechaSalida || !formData.horaSalida) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      const embarcacion = embarcacionesActivas.find((v) => v.id === formData.embarcacionId);
      if (!embarcacion) {
        toast.error('Embarcación no encontrada');
        return;
      }

      const fechaSalida = parseLocalDate(formData.fechaSalida);
      const [hours, minutes] = formData.horaSalida.split(':');
      fechaSalida.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const tripData = {
        rutaId: formData.rutaId,
        embarcacionId: formData.embarcacionId,
        fechaSalida: Timestamp.fromDate(fechaSalida),
        horaSalida: formData.horaSalida,
        estado: editingTrip ? formData.estado : ('programado' as Trip['estado']),
      };

      if (editingTrip) {
        await updateTrip.mutateAsync({
          tripId: editingTrip.id,
          updates: tripData,
        });
        toast.success('Viaje actualizado exitosamente');
      } else {
        await createTrip.mutateAsync({
          tripData,
          embarcacion,
        });
        toast.success('Viaje creado exitosamente. Los asientos se generaron automáticamente.');
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const message = handleError(error, { action: editingTrip ? 'updateTrip' : 'createTrip' });
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingTrip ? 'Editar Viaje' : 'Nuevo Viaje'}</DialogTitle>
          <DialogDescription>
            {editingTrip
              ? 'Modifica los datos del viaje (solo si no tiene reservas)'
              : 'Completa los datos para crear un nuevo viaje. Los asientos se generarán automáticamente.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rutaId">Ruta *</Label>
            <select
              id="rutaId"
              value={formData.rutaId}
              onChange={(e) => setFormData({ ...formData, rutaId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={editingTrip !== null}
            >
              <option value="">Selecciona una ruta</option>
              {rutasActivas.map((ruta) => (
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
              onChange={(e) => setFormData({ ...formData, embarcacionId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={editingTrip !== null}
            >
              <option value="">Selecciona una embarcación</option>
              {embarcacionesActivas.map((embarcacion) => (
                <option key={embarcacion.id} value={embarcacion.id}>
                  {embarcacion.nombre} ({embarcacion.capacidad} asientos)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaSalida">Fecha de Salida *</Label>
              <Input
                id="fechaSalida"
                type="date"
                value={formData.fechaSalida}
                onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaSalida">Hora de Salida *</Label>
              <Input
                id="horaSalida"
                type="time"
                value={formData.horaSalida}
                onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estado: e.target.value as Trip['estado'],
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:bg-muted disabled:cursor-not-allowed"
              disabled={!editingTrip}
            >
              <option value="programado">Programado</option>
              <option value="en_curso">En Curso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createTrip.isPending || updateTrip.isPending}>
            {(createTrip.isPending || updateTrip.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editingTrip ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
