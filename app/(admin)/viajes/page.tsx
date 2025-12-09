"use client";

import { useEffect, useState } from "react";
import {
  getAllTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  getAllRoutes,
  getAllVessels,
  getRoute,
  getVessel,
  getHorariosActivos,
  generarViajesDesdeHorario,
} from "@/lib/firestore-helpers";
import type { HorarioRecurrente } from "@/lib/firestore-helpers";
import type { Trip, Route, Vessel } from "@/lib/firestore-helpers";
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
import { Loader2, Plus, Pencil, Trash2, Calendar, Clock, MapPin, Ship, Play } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

// Sistema de notificaciones simple
const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`),
};

export default function ViajesPage() {
  const router = useRouter();
  const [viajes, setViajes] = useState<Trip[]>([]);
  const [viajesFiltrados, setViajesFiltrados] = useState<Trip[]>([]);
  const [rutas, setRutas] = useState<Route[]>([]);
  const [embarcaciones, setEmbarcaciones] = useState<Vessel[]>([]);
  const [horarios, setHorarios] = useState<HorarioRecurrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<HorarioRecurrente | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [generating, setGenerating] = useState(false);
  const [generateData, setGenerateData] = useState({
    fechaInicio: "",
    fechaFin: "",
  });
  const [formData, setFormData] = useState({
    rutaId: "",
    embarcacionId: "",
    fechaSalida: "",
    horaSalida: "",
    estado: "programado" as Trip["estado"],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [tripsData, routesData, vesselsData, horariosData] = await Promise.all([
        getAllTrips(),
        getAllRoutes(),
        getAllVessels(),
        getHorariosActivos(),
      ]);
      setViajes(tripsData);
      setRutas(routesData.filter((r) => r.activa));
      setEmbarcaciones(vesselsData.filter((v) => v.activa));
      setHorarios(horariosData);
      // Aplicar filtro inicial
      aplicarFiltro(tripsData, filtroEstado);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltro(viajesData: Trip[], estado: string) {
    if (estado === "todos") {
      setViajesFiltrados(viajesData);
    } else {
      setViajesFiltrados(viajesData.filter((v) => v.estado === estado));
    }
  }

  useEffect(() => {
    if (viajes.length > 0) {
      aplicarFiltro(viajes, filtroEstado);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, viajes]);

  function handleOpenDialog(trip?: Trip) {
    if (trip) {
      setEditingTrip(trip);
      const fecha = trip.fechaSalida?.toDate ? trip.fechaSalida.toDate() : new Date(trip.fechaSalida);
      const fechaStr = fecha.toISOString().split("T")[0];
      setFormData({
        rutaId: trip.rutaId,
        embarcacionId: trip.embarcacionId,
        fechaSalida: fechaStr,
        horaSalida: trip.horaSalida || "",
        estado: trip.estado,
      });
    } else {
      setEditingTrip(null);
      setFormData({
        rutaId: "",
        embarcacionId: "",
        fechaSalida: "",
        horaSalida: "",
        estado: "programado",
      });
    }
    setShowDialog(true);
  }

  function handleCloseDialog() {
    setShowDialog(false);
    setEditingTrip(null);
  }

  async function handleGenerateFromHorarios() {
    if (!generateData.fechaInicio || !generateData.fechaFin) {
      toast.error("Completa las fechas de inicio y fin");
      return;
    }

    const fechaInicio = new Date(generateData.fechaInicio);
    const fechaFin = new Date(generateData.fechaFin);

    if (fechaFin < fechaInicio) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    if (horarios.length === 0) {
      toast.error("No hay horarios activos disponibles");
      return;
    }

    try {
      setGenerating(true);
      let totalGenerados = 0;
      const resultados: string[] = [];

      for (const horario of horarios) {
        try {
          const viajesCreados = await generarViajesDesdeHorario(
            horario.id,
            fechaInicio,
            fechaFin
          );
          totalGenerados += viajesCreados.length;
          if (viajesCreados.length > 0) {
            resultados.push(`${horario.nombre}: ${viajesCreados.length} viajes`);
          }
        } catch (error) {
          console.error(`Error al generar viajes para ${horario.nombre}:`, error);
        }
      }

      if (totalGenerados === 0) {
        toast.info("Todos los viajes para este rango ya existen");
      } else {
        toast.success(
          `Se generaron ${totalGenerados} viaje${totalGenerados !== 1 ? "s" : ""} exitosamente. ` +
          (resultados.length > 0 ? `Detalles: ${resultados.join(", ")}` : "")
        );
      }

      setShowGenerateDialog(false);
      loadData();
    } catch (error) {
      console.error("Error al generar viajes:", error);
      toast.error(error instanceof Error ? error.message : "Error al generar los viajes");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit() {
    if (!formData.rutaId || !formData.embarcacionId || !formData.fechaSalida || !formData.horaSalida) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    try {
      setSaving(true);

      // Obtener embarcación para generar asientos
      const embarcacion = await getVessel(formData.embarcacionId);
      if (!embarcacion) {
        toast.error("Embarcación no encontrada");
        return;
      }

      // Construir fecha completa
      const [year, month, day] = formData.fechaSalida.split("-");
      const [hours, minutes] = formData.horaSalida.split(":");
      const fechaSalida = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      const tripData = {
        rutaId: formData.rutaId,
        embarcacionId: formData.embarcacionId,
        fechaSalida: Timestamp.fromDate(fechaSalida),
        horaSalida: formData.horaSalida,
        estado: formData.estado,
      };

      if (editingTrip) {
        await updateTrip(editingTrip.id, tripData);
        toast.success("Viaje actualizado exitosamente");
      } else {
        // Al crear, siempre usar estado "programado" (ignorar cualquier valor del formulario)
        const tripDataConEstado = {
          ...tripData,
          estado: "programado" as Trip["estado"],
        };
        await createTrip(tripDataConEstado, embarcacion);
        toast.success("Viaje creado exitosamente. Los asientos se generaron automáticamente.");
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Error al guardar viaje:", error);
      toast.error(error instanceof Error ? error.message : "Error al guardar el viaje");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(trip: Trip) {
    if (!confirm(`¿Estás seguro de cancelar el viaje del ${formatDate(trip.fechaSalida)}?`)) {
      return;
    }

    try {
      await deleteTrip(trip.id);
      toast.success("Viaje cancelado exitosamente");
      loadData();
    } catch (error) {
      console.error("Error al eliminar viaje:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar el viaje");
    }
  }

  function formatDate(timestamp: any) {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(time: string) {
    if (!time) return "N/A";
    return time;
  }

  async function loadRouteAndVessel(trip: Trip) {
    const [ruta, embarcacion] = await Promise.all([
      getRoute(trip.rutaId),
      getVessel(trip.embarcacionId),
    ]);
    return { ruta, embarcacion };
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando viajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Viajes</h1>
          <p className="text-muted-foreground mt-2">
            Administra los viajes programados. Los asientos se generan automáticamente.
          </p>
        </div>
        <div className="flex gap-2">
          {horarios.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
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
              }}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Generar desde Horarios
            </Button>
          )}
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Viaje
          </Button>
        </div>
      </div>

      {/* Filtro de Estado */}
      {viajes.length > 0 && (
        <div className="flex items-center gap-4">
          <Label htmlFor="filtroEstado" className="text-sm font-medium">
            Filtrar por estado:
          </Label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="todos">Todos</option>
            <option value="programado">Programado</option>
            <option value="en_curso">En Curso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <span className="text-sm text-muted-foreground">
            ({viajesFiltrados.length} viaje{viajesFiltrados.length !== 1 ? "s" : ""})
          </span>
        </div>
      )}

      {viajes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay viajes programados</p>
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Viaje
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viajesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay viajes con el estado seleccionado
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {viajesFiltrados.map((trip) => (
            <TripCardWithData key={trip.id} trip={trip} onEdit={handleOpenDialog} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Dialog de Crear/Editar */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTrip ? "Editar Viaje" : "Nuevo Viaje"}
            </DialogTitle>
            <DialogDescription>
              {editingTrip
                ? "Modifica los datos del viaje (solo si no tiene reservas)"
                : "Completa los datos para crear un nuevo viaje. Los asientos se generarán automáticamente."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rutaId">Ruta *</Label>
              <select
                id="rutaId"
                value={formData.rutaId}
                onChange={(e) =>
                  setFormData({ ...formData, rutaId: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={editingTrip !== null}
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
                disabled={editingTrip !== null}
              >
                <option value="">Selecciona una embarcación</option>
                {embarcaciones.map((embarcacion) => (
                  <option key={embarcacion.id} value={embarcacion.id}>
                    {embarcacion.nombre} ({embarcacion.capacidad} asientos)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaSalida">Fecha de Salida *</Label>
                <Input
                  id="fechaSalida"
                  type="date"
                  value={formData.fechaSalida}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaSalida: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">
                Estado
                {!editingTrip && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Los nuevos viajes siempre se crean como "Programado")
                  </span>
                )}
              </Label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estado: e.target.value as Trip["estado"],
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
                disabled={!editingTrip}
              >
                <option value="programado">Programado</option>
                <option value="en_curso">En Curso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              {!editingTrip && (
                <p className="text-xs text-muted-foreground">
                  El estado se puede cambiar después de crear el viaje
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTrip ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Generación Masiva desde Horarios */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generar Viajes desde Horarios Recurrentes</DialogTitle>
            <DialogDescription>
              Genera viajes automáticamente para todos los horarios activos en el rango de fechas
              especificado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicioGen">Fecha Inicio *</Label>
                <Input
                  id="fechaInicioGen"
                  type="date"
                  value={generateData.fechaInicio}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, fechaInicio: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFinGen">Fecha Fin *</Label>
                <Input
                  id="fechaFinGen"
                  type="date"
                  value={generateData.fechaFin}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, fechaFin: e.target.value })
                  }
                  min={generateData.fechaInicio || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {horarios.length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium mb-2">Horarios activos ({horarios.length}):</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {horarios.map((h) => (
                    <li key={h.id}>• {h.nombre}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Los viajes que ya existen serán omitidos automáticamente
                </p>
              </div>
            )}

            {horarios.length === 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm text-yellow-800">
                  No hay horarios activos. Crea horarios recurrentes primero en la página de
                  Horarios.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateFromHorarios} disabled={generating || horarios.length === 0}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generar Viajes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente auxiliar para mostrar tarjeta de viaje con datos cargados
function TripCardWithData({
  trip,
  onEdit,
  onDelete,
}: {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}) {
  const router = useRouter();
  const [ruta, setRuta] = useState<Route | null>(null);
  const [embarcacion, setEmbarcacion] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rutaData, embarcacionData] = await Promise.all([
          getRoute(trip.rutaId),
          getVessel(trip.embarcacionId),
        ]);
        setRuta(rutaData);
        setEmbarcacion(embarcacionData);
      } catch (error) {
        console.error("Error al cargar datos del viaje:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [trip]);

  function formatDate(timestamp: any) {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const estadoColors = {
    programado: "bg-blue-100 text-blue-800",
    en_curso: "bg-yellow-100 text-yellow-800",
    completado: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };

  const estadoLabels = {
    programado: "Programado",
    en_curso: "En Curso",
    completado: "Completado",
    cancelado: "Cancelado",
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">
              {ruta ? `${ruta.origen} → ${ruta.destino}` : "Cargando..."}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(trip.fechaSalida)} • <Clock className="h-4 w-4 ml-2" />
              {trip.horaSalida}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(trip)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(trip)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Ship className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Embarcación:</span>
            <span className="font-medium">{embarcacion?.nombre || "N/A"}</span>
          </div>
          {embarcacion && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Capacidad:</span>
              <span className="font-medium">{embarcacion.capacidad} asientos</span>
            </div>
          )}
          <div className="mt-3 pt-3 border-t">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                estadoColors[trip.estado] || "bg-gray-100 text-gray-800"
              }`}
            >
              {estadoLabels[trip.estado] || trip.estado}
            </span>
          </div>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/ventas/${trip.id}`)}
            >
              Ver Ventas
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
