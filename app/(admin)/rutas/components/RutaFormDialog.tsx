'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';

import { FormDialog } from '@/components/shared/FormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateRoute, useUpdateRoute } from '@/lib/hooks/useRoutes';
import { useToast } from '@/lib/hooks/useToast';
import type { ParadaIntermedia, Route } from '@/lib/types';
import { handleError } from '@/lib/utils/error-handler';

interface RutaFormDialogProps {
  open: boolean;
  ruta: Route | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Dialog para crear o editar una ruta
 */
export function RutaFormDialog({ open, ruta, onClose, onSuccess }: RutaFormDialogProps) {
  const toast = useToast();
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();

  // Inicializar formData basado en ruta usando función inicializadora
  // El key prop en FormDialog fuerza remount cuando cambia ruta, así que esto solo se ejecuta una vez
  const [formData, setFormData] = useState(() => {
    if (ruta) {
      return {
        origen: ruta.origen,
        destino: ruta.destino,
        distancia: ruta.distancia.toString(),
        horasEstimadas: ruta.horasEstimadas.toString(),
        precio: ruta.precio.toString(),
        activa: ruta.activa,
        paradasIntermedias: ruta.paradasIntermedias || [],
      };
    }
    return {
      origen: '',
      destino: '',
      distancia: '',
      horasEstimadas: '',
      precio: '',
      activa: true,
      paradasIntermedias: [],
    };
  });

  const [paradaForm, setParadaForm] = useState({
    nombre: '',
    distanciaDesdeOrigen: '',
    precio: '',
    orden: 1,
  });

  const handleSubmit = async () => {
    if (
      !formData.origen ||
      !formData.destino ||
      !formData.distancia ||
      !formData.horasEstimadas ||
      !formData.precio
    ) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      const routeData = {
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        distancia: parseFloat(formData.distancia),
        horasEstimadas: parseFloat(formData.horasEstimadas),
        precio: parseFloat(formData.precio),
        activa: formData.activa,
        paradasIntermedias: formData.paradasIntermedias,
      };

      if (ruta) {
        await updateRoute.mutateAsync({ rutaId: ruta.id, updates: routeData });
        toast.success('Ruta actualizada exitosamente');
      } else {
        await createRoute.mutateAsync(routeData);
        toast.success('Ruta creada exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = handleError(error, { action: ruta ? 'updateRoute' : 'createRoute' });
      toast.error(message);
    }
  };

  const addParada = () => {
    if (!paradaForm.nombre || !paradaForm.distanciaDesdeOrigen || !paradaForm.precio) {
      toast.error('Completa todos los campos de la parada');
      return;
    }

    const nuevaParada: ParadaIntermedia = {
      nombre: paradaForm.nombre.trim(),
      distanciaDesdeOrigen: parseFloat(paradaForm.distanciaDesdeOrigen),
      precio: parseFloat(paradaForm.precio),
      orden: formData.paradasIntermedias.length + 1,
    };

    setFormData({
      ...formData,
      paradasIntermedias: [...formData.paradasIntermedias, nuevaParada],
    });

    setParadaForm({
      nombre: '',
      distanciaDesdeOrigen: '',
      precio: '',
      orden: formData.paradasIntermedias.length + 2,
    });
  };

  const removeParada = (index: number) => {
    setFormData({
      ...formData,
      paradasIntermedias: formData.paradasIntermedias.filter((_, i) => i !== index),
    });
  };

  const loading = createRoute.isPending || updateRoute.isPending;

  return (
    <FormDialog
      key={ruta?.id || 'new'}
      open={open}
      onOpenChange={onClose}
      title={ruta ? 'Editar Ruta' : 'Nueva Ruta'}
      description={ruta ? 'Modifica los datos de la ruta' : 'Completa los datos de la nueva ruta'}
      onSubmit={handleSubmit}
      loading={loading}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="origen">Origen *</Label>
            <Input
              id="origen"
              value={formData.origen}
              onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
              placeholder="Ej: Atalaya"
              required
            />
          </div>
          <div>
            <Label htmlFor="destino">Destino *</Label>
            <Input
              id="destino"
              value={formData.destino}
              onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
              placeholder="Ej: Pucallpa"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="distancia">Distancia (km) *</Label>
            <Input
              id="distancia"
              type="number"
              value={formData.distancia}
              onChange={(e) => setFormData({ ...formData, distancia: e.target.value })}
              placeholder="500"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="horasEstimadas">Horas Estimadas *</Label>
            <Input
              id="horasEstimadas"
              type="number"
              value={formData.horasEstimadas}
              onChange={(e) => setFormData({ ...formData, horasEstimadas: e.target.value })}
              placeholder="12"
              min="0"
              step="0.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="precio">Precio (S/) *</Label>
            <Input
              id="precio"
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              placeholder="150"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Paradas intermedias */}
        <div className="space-y-2">
          <Label>Paradas Intermedias (Opcional)</Label>
          <div className="space-y-2 border rounded-md p-3">
            <div className="grid grid-cols-4 gap-2">
              <Input
                placeholder="Nombre"
                value={paradaForm.nombre}
                onChange={(e) => setParadaForm({ ...paradaForm, nombre: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Distancia (km)"
                value={paradaForm.distanciaDesdeOrigen}
                onChange={(e) =>
                  setParadaForm({ ...paradaForm, distanciaDesdeOrigen: e.target.value })
                }
                min="0"
              />
              <Input
                type="number"
                placeholder="Precio (S/)"
                value={paradaForm.precio}
                onChange={(e) => setParadaForm({ ...paradaForm, precio: e.target.value })}
                min="0"
                step="0.01"
              />
              <Button type="button" onClick={addParada} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>

            {formData.paradasIntermedias.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.paradasIntermedias.map((parada, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{parada.orden}</Badge>
                      <span className="text-sm font-medium">{parada.nombre}</span>
                      <span className="text-xs text-muted-foreground">
                        {parada.distanciaDesdeOrigen} km • S/ {parada.precio.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParada(index)}
                      aria-label={`Eliminar parada ${parada.nombre}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FormDialog>
  );
}
