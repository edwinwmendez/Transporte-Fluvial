'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGenerateTrips } from '@/lib/hooks/schedules/useGenerateTrips';
import { useCalcularViajesDesdeHorario } from '@/lib/hooks/useSchedules';
import { useToast } from '@/lib/hooks/useToast';
import type { HorarioRecurrente } from '@/lib/types';
import { parseLocalDate } from '@/lib/utils/date-helpers';
import { formatLocalDate } from '@/lib/utils/formatters';

interface GenerateTripsDialogProps {
  open: boolean;
  horario: HorarioRecurrente | null;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * Dialog para generar viajes desde un horario recurrente
 */
export function GenerateTripsDialog({
  open,
  horario,
  onClose,
  onComplete,
}: GenerateTripsDialogProps) {
  const toast = useToast();
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const fechaInicioDate = fechaInicio ? parseLocalDate(fechaInicio) : null;
  const fechaFinDate = fechaFin ? parseLocalDate(fechaFin) : null;

  const { data: viajesEstimados = 0, isLoading: calculando } = useCalcularViajesDesdeHorario(
    horario?.id || null,
    fechaInicioDate,
    fechaFinDate
  );

  const { generateTrips, progress, isGenerating } = useGenerateTrips({
    onComplete,
  });

  // Calcular fechas del próximo mes cuando se abre el dialog
  // Usamos useMemo para calcular las fechas iniciales basadas en horario
  const fechasIniciales = useMemo(() => {
    if (horario && open) {
      const hoy = new Date();
      const proximoMes = new Date(hoy);
      proximoMes.setMonth(proximoMes.getMonth() + 1);
      proximoMes.setDate(1);

      const finMes = new Date(proximoMes);
      finMes.setMonth(finMes.getMonth() + 1);
      finMes.setDate(0);

      return {
        inicio: formatLocalDate(proximoMes),
        fin: formatLocalDate(finMes),
      };
    }
    return { inicio: '', fin: '' };
  }, [horario, open]);

  // Sincronizar fechas cuando cambian las fechas iniciales calculadas
  useEffect(() => {
    setFechaInicio(fechasIniciales.inicio);
    setFechaFin(fechasIniciales.fin);
  }, [fechasIniciales]);

  const handleGenerate = async () => {
    if (!horario || !fechaInicio || !fechaFin) {
      toast.error('Completa las fechas de inicio y fin');
      return;
    }

    const inicio = parseLocalDate(fechaInicio);
    const fin = parseLocalDate(fechaFin);

    if (fin < inicio) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      await generateTrips(horario.id, inicio, fin);
      onClose();
    } catch {
      // Error ya manejado en el hook
    }
  };

  const getDiasSemanaTexto = (dias: number[]) => {
    const nombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias.map((dia) => nombres[dia]).join(', ');
  };

  const handleClose = () => {
    setFechaInicio('');
    setFechaFin('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generar Viajes desde Horario</DialogTitle>
          <DialogDescription>
            Genera viajes automáticamente para el horario: <strong>{horario?.nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha Fin *</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {horario && (
            <>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium mb-2">Resumen:</p>
                <p className="text-xs text-muted-foreground">
                  Se generarán viajes para los días:{' '}
                  <strong>{getDiasSemanaTexto(horario.diasSemana)}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Hora: <strong>{horario.horaSalida}</strong>
                </p>
              </div>

              {fechaInicio && fechaFin && (
                <div className="rounded-lg border bg-blue-50 p-3">
                  {calculando ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <p className="text-sm text-blue-800">Calculando cantidad de viajes...</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Viajes a generar:{' '}
                        <span className="text-lg font-bold">{viajesEstimados}</span>
                      </p>
                      <p className="text-xs text-blue-700">
                        Los viajes que ya existen serán omitidos automáticamente
                      </p>
                    </div>
                  )}
                </div>
              )}

              {progress && (
                <div className="rounded-lg border bg-green-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-green-900">
                      Generando viajes... ({progress.current}/{progress.total})
                    </p>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((progress.current / progress.total) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !horario || !fechaInicio || !fechaFin}
            className="w-full sm:w-auto"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generar Viajes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
