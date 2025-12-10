"use client";

import { useEffect, useState } from "react";
import { getAllVessels, createVessel, updateVessel, deleteVessel } from "@/lib/firestore-helpers";
import type { Vessel } from "@/lib/firestore-helpers";
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
import { Loader2, Plus, Pencil, Trash2, Ship } from "lucide-react";

// Sistema de notificaciones simple
const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`),
};

export default function EmbarcacionesPage() {
  const [embarcaciones, setEmbarcaciones] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    capacidad: "",
    filas: "",
    columnas: "",
    activa: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEmbarcaciones();
  }, []);

  async function loadEmbarcaciones() {
    try {
      setLoading(true);
      const data = await getAllVessels();
      setEmbarcaciones(data);
    } catch (error) {
      console.error("Error al cargar embarcaciones:", error);
      toast.error("Error al cargar las embarcaciones");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(vessel?: Vessel) {
    if (vessel) {
      setEditingVessel(vessel);
      setFormData({
        nombre: vessel.nombre,
        capacidad: vessel.capacidad.toString(),
        filas: vessel.filas.toString(),
        columnas: vessel.columnas.toString(),
        activa: vessel.activa,
      });
    } else {
      setEditingVessel(null);
      setFormData({
        nombre: "",
        capacidad: "",
        filas: "",
        columnas: "",
        activa: true,
      });
    }
    setShowDialog(true);
  }

  function handleCloseDialog() {
    setShowDialog(false);
    setEditingVessel(null);
  }

  function handleCalculateCapacity() {
    const filas = parseInt(formData.filas) || 0;
    const columnas = parseInt(formData.columnas) || 0;
    if (filas > 0 && columnas > 0) {
      setFormData({
        ...formData,
        capacidad: (filas * columnas).toString(),
      });
    }
  }

  async function handleSubmit() {
    if (!formData.nombre || !formData.capacidad || !formData.filas || !formData.columnas) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    const capacidad = parseInt(formData.capacidad);
    const filas = parseInt(formData.filas);
    const columnas = parseInt(formData.columnas);
    const capacidadCalculada = filas * columnas;

    if (capacidad !== capacidadCalculada) {
      toast.error(`La capacidad (${capacidad}) debe ser igual a filas × columnas (${capacidadCalculada})`);
      return;
    }

    try {
      setSaving(true);
      const vesselData = {
        nombre: formData.nombre,
        capacidad,
        filas,
        columnas,
        activa: formData.activa,
      };

      if (editingVessel) {
        await updateVessel(editingVessel.id, vesselData);
        toast.success("Embarcación actualizada exitosamente");
      } else {
        await createVessel(vesselData);
        toast.success("Embarcación creada exitosamente");
      }

      handleCloseDialog();
      loadEmbarcaciones();
    } catch (error) {
      console.error("Error al guardar embarcación:", error);
      toast.error(error instanceof Error ? error.message : "Error al guardar la embarcación");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(vessel: Vessel) {
    if (!confirm(`¿Estás seguro de eliminar la embarcación ${vessel.nombre}?`)) {
      return;
    }

    try {
      await deleteVessel(vessel.id);
      toast.success("Embarcación eliminada exitosamente");
      loadEmbarcaciones();
    } catch (error) {
      console.error("Error al eliminar embarcación:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar la embarcación");
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando embarcaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Embarcaciones</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Administra las embarcaciones y su configuración de asientos
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="touch-target">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nueva Embarcación</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      {embarcaciones.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay embarcaciones registradas</p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Embarcación
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {embarcaciones.map((vessel) => (
            <Card key={vessel.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{vessel.nombre}</CardTitle>
                    <CardDescription className="mt-1">
                      {vessel.capacidad} asientos • {vessel.filas} filas × {vessel.columnas} columnas
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(vessel)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(vessel)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Capacidad:</span>
                    <span className="font-semibold">{vessel.capacidad} asientos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Configuración:</span>
                    <span className="font-semibold">
                      {vessel.filas} filas × {vessel.columnas} columnas
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        vessel.activa
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {vessel.activa ? "Activa" : "Inactiva"}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVessel ? "Editar Embarcación" : "Nueva Embarcación"}
            </DialogTitle>
            <DialogDescription>
              {editingVessel
                ? "Modifica los datos de la embarcación"
                : "Completa los datos para crear una nueva embarcación"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej: Rápido Ucayali"
              />
            </div>

            {/* Filas, Columnas, Capacidad: 2 columnas en móvil normal, 3 en tablet+ */}
            <div className="grid grid-cols-1 min-[375px]:grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filas">Filas *</Label>
                <Input
                  id="filas"
                  type="number"
                  min="1"
                  value={formData.filas}
                  onChange={(e) => {
                    setFormData({ ...formData, filas: e.target.value });
                    // Auto-calcular capacidad si hay columnas
                    if (formData.columnas) {
                      const filas = parseInt(e.target.value) || 0;
                      const columnas = parseInt(formData.columnas) || 0;
                      if (filas > 0 && columnas > 0) {
                        setFormData((prev) => ({
                          ...prev,
                          filas: e.target.value,
                          capacidad: (filas * columnas).toString(),
                        }));
                      }
                    }
                  }}
                  placeholder="20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="columnas">Columnas *</Label>
                <Input
                  id="columnas"
                  type="number"
                  min="1"
                  value={formData.columnas}
                  onChange={(e) => {
                    setFormData({ ...formData, columnas: e.target.value });
                    // Auto-calcular capacidad si hay filas
                    if (formData.filas) {
                      const filas = parseInt(formData.filas) || 0;
                      const columnas = parseInt(e.target.value) || 0;
                      if (filas > 0 && columnas > 0) {
                        setFormData((prev) => ({
                          ...prev,
                          columnas: e.target.value,
                          capacidad: (filas * columnas).toString(),
                        }));
                      }
                    }
                  }}
                  placeholder="4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidad">Capacidad *</Label>
                <Input
                  id="capacidad"
                  type="number"
                  min="1"
                  value={formData.capacidad}
                  onChange={(e) =>
                    setFormData({ ...formData, capacidad: e.target.value })
                  }
                  placeholder="80"
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Se calcula automáticamente
                </p>
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
              <Label htmlFor="activa">Embarcación activa</Label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto touch-target">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto touch-target">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingVessel ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
