"use client";

import { useEffect, useState } from "react";
import { getAllRoutes, createRoute, updateRoute, deleteRoute } from "@/lib/firestore-helpers";
import type { Route, ParadaIntermedia } from "@/lib/firestore-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Timestamp } from "firebase/firestore";
// Sistema de notificaciones simple (reemplazar con toast cuando esté disponible)
const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`),
};

export default function RutasPage() {
  const [rutas, setRutas] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    origen: "",
    destino: "",
    distancia: "",
    horasEstimadas: "",
    precio: "",
    activa: true,
    paradasIntermedias: [] as ParadaIntermedia[],
  });
  const [paradaForm, setParadaForm] = useState({
    nombre: "",
    distanciaDesdeOrigen: "",
    precio: "",
    orden: 1,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRutas();
  }, []);

  async function loadRutas() {
    try {
      setLoading(true);
      const data = await getAllRoutes();
      setRutas(data);
    } catch (error) {
      console.error("Error al cargar rutas:", error);
      toast.error("Error al cargar las rutas");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(route?: Route) {
    if (route) {
      setEditingRoute(route);
      setFormData({
        origen: route.origen,
        destino: route.destino,
        distancia: route.distancia.toString(),
        horasEstimadas: route.horasEstimadas.toString(),
        precio: route.precio.toString(),
        activa: route.activa,
        paradasIntermedias: route.paradasIntermedias || [],
      });
    } else {
      setEditingRoute(null);
      setFormData({
        origen: "",
        destino: "",
        distancia: "",
        horasEstimadas: "",
        precio: "",
        activa: true,
        paradasIntermedias: [],
      });
    }
    setShowDialog(true);
  }

  function handleCloseDialog() {
    setShowDialog(false);
    setEditingRoute(null);
    setParadaForm({
      nombre: "",
      distanciaDesdeOrigen: "",
      precio: "",
      orden: 1,
    });
  }

  function handleAddParada() {
    if (!paradaForm.nombre || !paradaForm.distanciaDesdeOrigen || !paradaForm.precio) {
      toast.error("Completa todos los campos de la parada");
      return;
    }

    const nuevaParada: ParadaIntermedia = {
      nombre: paradaForm.nombre,
      distanciaDesdeOrigen: parseFloat(paradaForm.distanciaDesdeOrigen),
      precio: parseFloat(paradaForm.precio),
      orden: formData.paradasIntermedias.length + 1,
    };

    setFormData({
      ...formData,
      paradasIntermedias: [...formData.paradasIntermedias, nuevaParada],
    });

    setParadaForm({
      nombre: "",
      distanciaDesdeOrigen: "",
      precio: "",
      orden: formData.paradasIntermedias.length + 2,
    });
  }

  function handleRemoveParada(index: number) {
    const nuevasParadas = formData.paradasIntermedias.filter((_, i) => i !== index);
    // Reordenar
    nuevasParadas.forEach((p, i) => {
      p.orden = i + 1;
    });
    setFormData({
      ...formData,
      paradasIntermedias: nuevasParadas,
    });
  }

  async function handleSubmit() {
    if (!formData.origen || !formData.destino || !formData.distancia || !formData.horasEstimadas || !formData.precio) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    try {
      setSaving(true);
      const routeData = {
        origen: formData.origen,
        destino: formData.destino,
        distancia: parseFloat(formData.distancia),
        horasEstimadas: parseFloat(formData.horasEstimadas),
        precio: parseFloat(formData.precio),
        activa: formData.activa,
        paradasIntermedias: formData.paradasIntermedias.length > 0 ? formData.paradasIntermedias : undefined,
      };

      if (editingRoute) {
        await updateRoute(editingRoute.id, routeData);
        toast.success("Ruta actualizada exitosamente");
      } else {
        await createRoute(routeData);
        toast.success("Ruta creada exitosamente");
      }

      handleCloseDialog();
      loadRutas();
    } catch (error) {
      console.error("Error al guardar ruta:", error);
      toast.error(error instanceof Error ? error.message : "Error al guardar la ruta");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(route: Route) {
    if (!confirm(`¿Estás seguro de eliminar la ruta ${route.origen} → ${route.destino}?`)) {
      return;
    }

    try {
      await deleteRoute(route.id);
      toast.success("Ruta eliminada exitosamente");
      loadRutas();
    } catch (error) {
      console.error("Error al eliminar ruta:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar la ruta");
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando rutas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Rutas</h1>
          <p className="text-muted-foreground mt-2">
            Administra las rutas completas y parciales con sus precios
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Ruta
        </Button>
      </div>

      {rutas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay rutas registradas</p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Ruta
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rutas.map((route) => (
            <Card key={route.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {route.origen} → {route.destino}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {route.distancia} km • {route.horasEstimadas} horas
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(route)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(route)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Precio completo:</span>
                    <span className="font-semibold">S/. {route.precio.toFixed(2)}</span>
                  </div>
                  {route.paradasIntermedias && route.paradasIntermedias.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Paradas intermedias:</p>
                      <div className="space-y-1">
                        {route.paradasIntermedias
                          .sort((a, b) => a.orden - b.orden)
                          .map((parada) => (
                            <div key={parada.orden} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{parada.nombre}:</span>
                              <span>S/. {parada.precio.toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        route.activa
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {route.activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Crear/Editar */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoute ? "Editar Ruta" : "Nueva Ruta"}
            </DialogTitle>
            <DialogDescription>
              {editingRoute
                ? "Modifica los datos de la ruta"
                : "Completa los datos para crear una nueva ruta"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origen">Origen *</Label>
                <Input
                  id="origen"
                  value={formData.origen}
                  onChange={(e) =>
                    setFormData({ ...formData, origen: e.target.value })
                  }
                  placeholder="Ej: Atalaya"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destino">Destino *</Label>
                <Input
                  id="destino"
                  value={formData.destino}
                  onChange={(e) =>
                    setFormData({ ...formData, destino: e.target.value })
                  }
                  placeholder="Ej: Pucallpa"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distancia">Distancia (km) *</Label>
                <Input
                  id="distancia"
                  type="number"
                  step="0.01"
                  value={formData.distancia}
                  onChange={(e) =>
                    setFormData({ ...formData, distancia: e.target.value })
                  }
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horasEstimadas">Horas estimadas *</Label>
                <Input
                  id="horasEstimadas"
                  type="number"
                  step="0.5"
                  value={formData.horasEstimadas}
                  onChange={(e) =>
                    setFormData({ ...formData, horasEstimadas: e.target.value })
                  }
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio completo (S/.) *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData({ ...formData, precio: e.target.value })
                  }
                  placeholder="100.00"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activa"
                checked={formData.activa}
                onChange={(e) =>
                  setFormData({ ...formData, activa: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="activa">Ruta activa</Label>
            </div>

            {/* Paradas Intermedias */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Paradas Intermedias</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddParada}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Parada
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Nombre parada"
                  value={paradaForm.nombre}
                  onChange={(e) =>
                    setParadaForm({ ...paradaForm, nombre: e.target.value })
                  }
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Distancia (km)"
                  value={paradaForm.distanciaDesdeOrigen}
                  onChange={(e) =>
                    setParadaForm({
                      ...paradaForm,
                      distanciaDesdeOrigen: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Precio (S/.)"
                  value={paradaForm.precio}
                  onChange={(e) =>
                    setParadaForm({ ...paradaForm, precio: e.target.value })
                  }
                />
                <Button
                  type="button"
                  onClick={handleAddParada}
                  className="w-full"
                >
                  Agregar
                </Button>
              </div>

              {formData.paradasIntermedias.length > 0 && (
                <div className="space-y-2 mt-4">
                  {formData.paradasIntermedias
                    .sort((a, b) => a.orden - b.orden)
                    .map((parada, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{parada.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {parada.distanciaDesdeOrigen} km • S/. {parada.precio.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveParada(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRoute ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
