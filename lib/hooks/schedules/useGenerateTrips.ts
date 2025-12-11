import { useState } from 'react';
import { useGenerateTripsFromSchedule } from '../useSchedules';
import { useToast } from '../useToast';

interface UseGenerateTripsOptions {
  onComplete?: () => void;
}

/**
 * Hook para generar viajes desde un horario con progress tracking
 */
export function useGenerateTrips(options?: UseGenerateTripsOptions) {
  const toast = useToast();
  const generateTripsMutation = useGenerateTripsFromSchedule();
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTrips = async (
    horarioId: string,
    fechaInicio: Date,
    fechaFin: Date
  ) => {
    setIsGenerating(true);
    setProgress({ current: 0, total: 0 });

    try {
      await generateTripsMutation.mutateAsync({
        horarioId,
        fechaInicio,
        fechaFin,
        onProgress: (viajeCreado, total) => {
          setProgress({ current: viajeCreado, total });
        },
      });

      toast.success(`Se generaron ${progress?.total || 0} viajes correctamente`);
      options?.onComplete?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al generar viajes';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  return {
    generateTrips,
    progress,
    isGenerating,
  };
}
