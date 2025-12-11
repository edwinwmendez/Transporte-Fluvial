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
import { useToast } from '@/lib/hooks/useToast';
import { parseLocalDate } from '@/lib/utils/date-helpers';
import type { HorarioRecurrente } from '@/lib/types';
import { useGenerateTripsFromSchedule } from '@/lib/hooks/useSchedules';
import { calcularViajesDesdeHorario } from '@/lib/api/schedules.api';
import { handleError } from '@/lib/utils/error-handler';
import { logError } from '@/lib/utils/logger';

interface GenerateTripsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horarios: HorarioRecurrente[];
  onSuccess: () => void;
}

/**
 * Diálogo para generar viajes masivamente desde horarios recurrentes
 */
export function GenerateTripsDialog({
  open,
  onOpenChange,
  horarios,
  onSuccess,
}: GenerateTripsDialogProps) {
  const toast = useToast();
  const generateTrips = useGenerateTripsFromSchedule();

  const [selectedHorarios, setSelectedHorarios] = useState<Set<string>>(new Set());
  const [viajesEstimados, setViajesEstimados] = useState<number>(0);
  const [calculandoEstimacion, setCalculandoEstimacion] = useState(false);
  const [progresoGeneracion, setProgresoGeneracion] = useState<{
    total: number;
    completados: number;
    actual: string;
  } | null>(null);
  const [generateData, setGenerateData] = useState({
    fechaInicio: '',
    fechaFin: '',
  });

  useEffect(() => {
    if (!open) {
      setSelectedHorarios(new Set());
      setViajesEstimados(0);
      setProgresoGeneracion(null);
      setGenerateData({ fechaInicio: '', fechaFin: '' });
    }
  }, [open]);

  useEffect(() => {
    if (generateData.fechaInicio && generateData.fechaFin && selectedHorarios.size > 0) {
      calcularEstimacionViajes();
    } else {
      setViajesEstimados(0);
    }
  }, [generateData.fechaInicio, generateData.fechaFin, selectedHorarios]);

  const toggleHorario = (horarioId: string) => {
    setSelectedHorarios((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(horarioId)) {
        nuevo.delete(horarioId);
      } else {
        nuevo.add(horarioId);
      }
      return nuevo;
    });
  };

  async function calcularEstimacionViajes() {
    if (!generateData.fechaInicio || !generateData.fechaFin || selectedHorarios.size === 0) {
      setViajesEstimados(0);
      return;
    }

    const fechaInicio = parseLocalDate(generateData.fechaInicio);
    const fechaFin = parseLocalDate(generateData.fechaFin);

    if (fechaFin < fechaInicio) {
      setViajesEstimados(0);
      return;
    }

    try {
      setCalculandoEstimacion(true);
      let total = 0;
      const horariosSeleccionados = horarios.filter((h) => selectedHorarios.has(h.id));

      for (const horario of horariosSeleccionados) {
        const cantidad = await calcularViajesDesdeHorario(horario.id, fechaInicio, fechaFin);
        total += cantidad;
      }

      setViajesEstimados(total);
    } catch (error) {
      logError('Error al calcular estimación', error);
      setViajesEstimados(0);
    } finally {
      setCalculandoEstimacion(false);
    }
  }

  async function handleGenerateFromHorarios() {
    if (!generateData.fechaInicio || !generateData.fechaFin) {
      toast.error('Completa las fechas de inicio y fin');
      return;
    }

    const fechaInicio = parseLocalDate(generateData.fechaInicio);
    const fechaFin = parseLocalDate(generateData.fechaFin);

    if (fechaFin < fechaInicio) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    if (selectedHorarios.size === 0) {
      toast.error('Selecciona al menos un horario');
      return;
    }

    try {
      const horariosSeleccionados = horarios.filter((h) => selectedHorarios.has(h.id));
      let totalGenerados = 0;

      setProgresoGeneracion({
        total: viajesEstimados,
        completados: 0,
        actual: 'Iniciando generación de viajes...',
      });

      for (let i = 0; i < horariosSeleccionados.length; i++) {
        const horario = horariosSeleccionados[i];
        try {
          setProgresoGeneracion((prev) =>
            prev
              ? {
                  ...prev,
                  actual: `Generando viajes para: ${horario.nombre}...`,
                }
              : null
          );

          const viajesCreados = await generateTrips.mutateAsync({
            horarioId: horario.id,
            fechaInicio,
            fechaFin,
            onProgress: (viajesCreadosHastaAhora, totalParaEsteHorario) => {
              setProgresoGeneracion((prev) =>
                prev
                  ? {
                      ...prev,
                      completados: totalGenerados + viajesCreadosHastaAhora,
                      actual: `Generando viajes para: ${horario.nombre}... (${viajesCreadosHastaAhora}/${totalParaEsteHorario})`,
                    }
                  : null
              );
            },
          });

          totalGenerados += viajesCreados.length;
        } catch (error) {
          logError(`Error al generar viajes para ${horario.nombre}`, error);
        }
      }

      setProgresoGeneracion(null);

      if (totalGenerados === 0) {
        toast.success('Todos los viajes para este rango ya existen');
      } else {
        toast.success(
          `Se generaron ${totalGenerados} viaje${totalGenerados !== 1 ? 's' : ''} exitosamente`
        );
      }

      onOpenChange(false);
      setSelectedHorarios(new Set());
      onSuccess();
    } catch (error) {
      const message = handleError(error, { action: 'generateTrips' });
      toast.error(message);
      setProgresoGeneracion(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generar Viajes desde Horarios Recurrentes</DialogTitle>
          <DialogDescription>
            Selecciona los horarios y el rango de fechas para generar viajes automáticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicioGen">Fecha Inicio *</Label>
              <Input
                id="fechaInicioGen"
                type="date"
                value={generateData.fechaInicio}
                onChange={(e) =>
                  setGenerateData({ ...generateData, fechaInicio: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFinGen">Fecha Fin *</Label>
              <Input
                id="fechaFinGen"
                type="date"
                value={generateData.fechaFin}
                onChange={(e) => setGenerateData({ ...generateData, fechaFin: e.target.value })}
                min={generateData.fechaInicio || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Seleccionar Horarios ({selectedHorarios.size} seleccionados)</Label>
            <div className="rounded-lg border bg-muted/30 p-3 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {horarios.map((h) => (
                  <label
                    key={h.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHorarios.has(h.id)}
                      onChange={() => toggleHorario(h.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{h.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {generateData.fechaInicio && generateData.fechaFin && selectedHorarios.size > 0 && (
            <div className="rounded-lg border bg-blue-50 p-3">
              {calculandoEstimacion ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-800">Calculando cantidad de viajes...</p>
                </div>
              ) : (
                <p className="text-sm font-medium text-blue-900">
                  Viajes a generar: <span className="text-lg font-bold">{viajesEstimados}</span>
                </p>
              )}
            </div>
          )}

          {progresoGeneracion && (
            <div className="rounded-lg border bg-green-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-green-900">{progresoGeneracion.actual}</p>
                <p className="text-sm text-green-700">
                  {progresoGeneracion.completados} / {progresoGeneracion.total} viajes
                </p>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((progresoGeneracion.completados / progresoGeneracion.total) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateFromHorarios}
            disabled={generateTrips.isPending || selectedHorarios.size === 0}
          >
            {generateTrips.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generar Viajes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
