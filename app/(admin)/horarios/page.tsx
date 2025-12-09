"use client";

import { useEffect, useState } from "react";
import {
  getAllHorariosRecurrentes,
  createHorarioRecurrente,
  updateHorarioRecurrente,
  deleteHorarioRecurrente,
  generarViajesDesdeHorario,
  generarViajesProximoMes,
  getAllRoutes,
  getAllVessels,
} from "@/lib/firestore-helpers";
import type { HorarioRecurrente, Route, Vessel } from "@/lib/firestore-helpers";
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
import { Loader2, Plus, Pencil, Trash2, Calendar, Play, Clock } from "lucide-react";

// Sistema de notificaciones simple
const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`),
  info: (message: string) => alert(`ℹ️ ${message}`),
};

const DIAS_SEMANA = [
  { valor: 0, nombre: "Domingo", abrev: "Dom" },
  { valor: 1, nombre: "Lunes", abrev: "Lun" },
  { valor: 2, nombre: "Martes", abrev: "Mar" },
  { valor: 3, nombre: "Miércoles", abrev: "Mié" },
  { valor: 4, nombre: "Jueves", abrev: "Jue" },
  { valor: 5, nombre: "Viernes", abrev: "Vie" },
  { valor: 6, nombre: "Sábado", abrev: "Sáb" },
];

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<HorarioRecurrente[]>([]);
  const [rutas, setRutas] = useState<Route[]>([]);
  const [embarcaciones, setEmbarcaciones] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<HorarioRecurrente | null>(null);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    rutaId: "",
    embarcacionId: "",
    horaSalida: "",
    diasSemana: [] as number[],
    activo: true,
  });
  const [generateData, setGenerateData] = useState({
    fechaInicio: "",
    fechaFin: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [horariosData, routesData, vesselsData] = await Promise.all([
        getAllHorariosRecurrentes(),
        getAllRoutes(),
        getAllVessels(),
      ]);
      setHorarios(horariosData);
      setRutas(routesData.filter((r) => r.activa));
      setEmbarcaciones(vesselsData.filter((v) => v.activa));
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(horario?: HorarioRecurrente) {
    if (horario) {
      setSelectedHorario(horario);
      setFormData({
        nombre: horario.nombre,
        rutaId: horario.rutaId,
        embarcacionId: horario.embarcacionId,
        horaSalida: horario.horaSalida,
        diasSemana: horario.diasSemana,
        activo: horario.activo,
      });
    } else {
      setSelectedHorario(null);
      setFormData({
        nombre: "",
        rutaId: "",
        embarcacionId: "",
        horaSalida: "",
        diasSemana: [],
        activo: true,
      });
    }
    setShowDialog(true);
  }

  function handleCloseDialog() {
    setShowDialog(false);
    setSelectedHorario(null);
  }

  function toggleDiaSemana(dia: number) {
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
  }

  async function handleSubmit() {
    if (
      !formData.nombre ||
      !formData.rutaId ||
      !formData.embarcacionId ||
      !formData.horaSalida ||
      formData.diasSemana.length === 0
    ) {
      toast.error("Completa todos los campos obligatorios y selecciona al menos un día");
      return;
    }

    try {
      setSaving(true);
      const horarioData = {
        nombre: formData.nombre,
        rutaId: formData.rutaId,
        embarcacionId: formData.embarcacionId,
        horaSalida: formData.horaSalida,
        diasSemana: formData.diasSemana,
        activo: formData.activo,
      };

      if (selectedHorario) {
        await updateHorarioRecurrente(selectedHorario.id, horarioData);
        toast.success("Horario actualizado exitosamente");
      } else {
        await createHorarioRecurrente(horarioData);
        toast.success("Horario creado exitosamente");
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Error al guardar horario:", error);
      toast.error(error instanceof Error ? error.message : "Error al guardar el horario");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(horario: HorarioRecurrente) {
    if (!confirm(`¿Estás seguro de eliminar el horario "${horario.nombre}"?`)) {
      return;
    }

    try {
      await deleteHorarioRecurrente(horario.id);
      toast.success("Horario eliminado exitosamente");
      loadData();
    } catch (error) {
      console.error("Error al eliminar horario:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar el horario");
    }
  }

  function handleOpenGenerateDialog(horario: HorarioRecurrente) {
    setSelectedHorario(horario);
    const hoy = new Date();
    const proximoMes = new Date(hoy);
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    proximoMes.setDate(1);

    const finMes = new Date(proximoMes);
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);

    setGenerateData({
      fechaInicio: proximoMes.toISOString().split("T")[0],
      fechaFin: finMes.toISOString().split("T")[0],
    });
    setShowGenerateDialog(true);
  }

  async function handleGenerateTrips() {
    if (!selectedHorario || !generateData.fechaInicio || !generateData.fechaFin) {
      toast.error("Completa las fechas de inicio y fin");
      return;
    }

    const fechaInicio = new Date(generateData.fechaInicio);
    const fechaFin = new Date(generateData.fechaFin);

    if (fechaFin < fechaInicio) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    try {
      setGenerating(true);
      const viajesCreados = await generarViajesDesdeHorario(
        selectedHorario.id,
        fechaInicio,
        fechaFin
      );

      if (viajesCreados.length === 0) {
        toast.info("Todos los viajes para este rango ya existen");
      } else {
        toast.success(
          `Se generaron ${viajesCreados.length} viaje${viajesCreados.length !== 1 ? "s" : ""} exitosamente`
        );
      }

      setShowGenerateDialog(false);
      setSelectedHorario(null);
    } catch (error) {
      console.error("Error al generar viajes:", error);
      toast.error(error instanceof Error ? error.message : "Error al generar los viajes");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateNextMonth() {
    if (!confirm("¿Generar viajes del próximo mes para todos los horarios activos?")) {
      return;
    }

    try {
      setGenerating(true);
      const resultado = await generarViajesProximoMes();
      toast.success(
        `Se generaron ${resultado.totalGenerados} viajes en total. ` +
        `Detalles: ${resultado.porHorario.map((h) => `${h.nombre}: ${h.cantidad}`).join(", ")}`
      );
    } catch (error) {
      console.error("Error al generar viajes del próximo mes:", error);
      toast.error(error instanceof Error ? error.message : "Error al generar los viajes");
    } finally {
      setGenerating(false);
    }
  }

  function getDiasSemanaTexto(dias: number[]): string {
    if (dias.length === 0) return "Sin días";
    const nombres = dias
      .map((d) => DIAS_SEMANA.find((ds) => ds.valor === d)?.abrev)
      .filter(Boolean);
    return nombres.join(", ");
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Horarios Recurrentes</h1>
          <p className="text-muted-foreground mt-2">
            Define horarios recurrentes para generar viajes automáticamente
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateNextMonth}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            Generar Próximo Mes
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Horario
          </Button>
        </div>
      </div>

      {horarios.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay horarios recurrentes registrados</p>
              <p className="text-sm text-muted-foreground mt-2">
                Crea horarios recurrentes para automatizar la generación de viajes
              </p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Horario
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {horarios.map((horario) => {
            const ruta = rutas.find((r) => r.id === horario.rutaId);
            const embarcacion = embarcaciones.find((v) => v.id === horario.embarcacionId);

            return (
              <Card key={horario.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{horario.nombre}</CardTitle>
                      <CardDescription className="mt-1">
                        {ruta ? `${ruta.origen} → ${ruta.destino}` : "Ruta no encontrada"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(horario)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(horario)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Hora:</span>
                      <span className="font-medium">{horario.horaSalida}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Días:</span>
                      <span className="font-medium">
                        {getDiasSemanaTexto(horario.diasSemana)}
                      </span>
                    </div>
                    {embarcacion && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Embarcación:</span>
                        <span className="font-medium">{embarcacion.nombre}</span>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          horario.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {horario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenGenerateDialog(horario)}
                        disabled={!horario.activo}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Generar Viajes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de Crear/Editar Horario */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedHorario ? "Editar Horario Recurrente" : "Nuevo Horario Recurrente"}
            </DialogTitle>
            <DialogDescription>
              {selectedHorario
                ? "Modifica los datos del horario recurrente"
                : "Define un horario recurrente para generar viajes automáticamente"}
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
              <p className="text-xs text-muted-foreground">
                Nombre descriptivo para identificar este horario
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rutaId">Ruta *</Label>
                <select
                  id="rutaId"
                  value={formData.rutaId}
                  onChange={(e) => setFormData({ ...formData, rutaId: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Días de la Semana *</Label>
              <div className="grid grid-cols-4 gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <button
                    key={dia.valor}
                    type="button"
                    onClick={() => toggleDiaSemana(dia.valor)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      formData.diasSemana.includes(dia.valor)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-muted"
                    }`}
                  >
                    {dia.abrev}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Seleccionados: {formData.diasSemana.length} día{formData.diasSemana.length !== 1 ? "s" : ""}
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
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedHorario ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Generación de Viajes */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generar Viajes desde Horario</DialogTitle>
            <DialogDescription>
              Genera viajes automáticamente para el horario:{" "}
              <strong>{selectedHorario?.nombre}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={generateData.fechaInicio}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, fechaInicio: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha Fin *</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={generateData.fechaFin}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, fechaFin: e.target.value })
                  }
                  min={generateData.fechaInicio || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {selectedHorario && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium mb-2">Resumen:</p>
                <p className="text-xs text-muted-foreground">
                  Se generarán viajes para los días:{" "}
                  <strong>{getDiasSemanaTexto(selectedHorario.diasSemana)}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Hora: <strong>{selectedHorario.horaSalida}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Los viajes que ya existen serán omitidos automáticamente
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateTrips} disabled={generating}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generar Viajes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
