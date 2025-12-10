"use client";

import { useEffect, useState } from "react";
import { getTripsByDateRange, formatLocalDate } from "@/lib/firestore-helpers";
import type { Trip } from "@/lib/firestore-helpers";
import { TripCard } from "@/components/admin/TripCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Filter, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FiltroRapido = "hoy" | "mañana" | "estaSemana" | "esteMes" | "proximoMes" | "personalizado";

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>("hoy");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [estados, setEstados] = useState<Trip["estado"][]>(["programado"]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    loadTrips();
  }, [filtroRapido, fechaInicio, fechaFin, estados]);

  function calcularFechas(filtro: FiltroRapido): { inicio: Date; fin: Date } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    switch (filtro) {
      case "hoy": {
        const fin = new Date(hoy);
        fin.setHours(23, 59, 59, 999);
        return { inicio: hoy, fin };
      }
      case "mañana": {
        const inicio = new Date(hoy);
        inicio.setDate(inicio.getDate() + 1);
        const fin = new Date(inicio);
        fin.setHours(23, 59, 59, 999);
        return { inicio, fin };
      }
      case "estaSemana": {
        const inicio = new Date(hoy);
        const diaSemana = inicio.getDay();
        const diff = inicio.getDate() - diaSemana; // Domingo = 0
        inicio.setDate(diff);
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 6);
        fin.setHours(23, 59, 59, 999);
        return { inicio, fin };
      }
      case "esteMes": {
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        fin.setHours(23, 59, 59, 999);
        return { inicio, fin };
      }
      case "proximoMes": {
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
        const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
        fin.setHours(23, 59, 59, 999);
        return { inicio, fin };
      }
      case "personalizado": {
        if (fechaInicio && fechaFin) {
          return {
            inicio: new Date(fechaInicio),
            fin: new Date(fechaFin),
          };
        }
        return { inicio: hoy, fin: hoy };
      }
      default:
        return { inicio: hoy, fin: hoy };
    }
  }

  async function loadTrips() {
    try {
      setLoading(true);
      setError(null);

      let inicio: Date;
      let fin: Date;

      if (filtroRapido === "personalizado") {
        if (!fechaInicio || !fechaFin) {
          setTrips([]);
          setLoading(false);
          return;
        }
        inicio = new Date(fechaInicio);
        fin = new Date(fechaFin);
      } else {
        const fechas = calcularFechas(filtroRapido);
        inicio = fechas.inicio;
        fin = fechas.fin;
      }

      const tripsData = await getTripsByDateRange(inicio, fin, estados.length > 0 ? estados : undefined);
      setTrips(tripsData);
    } catch (err) {
      console.error("Error al cargar viajes:", err);
      setError("Error al cargar los viajes. Verifica tu conexión a Firebase.");
    } finally {
      setLoading(false);
    }
  }

  function toggleEstado(estado: Trip["estado"]) {
    setEstados((prev) => {
      if (prev.includes(estado)) {
        return prev.filter((e) => e !== estado);
      } else {
        return [...prev, estado];
      }
    });
  }

  function seleccionarTodosEstados() {
    setEstados(["programado", "en_curso", "completado", "cancelado"]);
  }

  function deseleccionarTodosEstados() {
    setEstados([]);
  }

  function getTextoFiltro(filtro: FiltroRapido): string {
    switch (filtro) {
      case "hoy":
        return "Hoy";
      case "mañana":
        return "Mañana";
      case "estaSemana":
        return "Esta Semana";
      case "esteMes":
        return "Este Mes";
      case "proximoMes":
        return "Próximo Mes";
      case "personalizado":
        return "Rango Personalizado";
      default:
        return "Hoy";
    }
  }

  const estadosLabels: Record<Trip["estado"], string> = {
    programado: "Programado",
    en_curso: "En Curso",
    completado: "Completado",
    cancelado: "Cancelado",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visualiza y filtra viajes por fecha y estado
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <Filter className="mr-2 h-4 w-4" />
          {mostrarFiltros ? "Ocultar" : "Mostrar"} Filtros
        </Button>
      </div>

      {/* Panel de Filtros */}
      {mostrarFiltros && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
            <CardDescription>
              Selecciona el rango de fechas y estados para filtrar los viajes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros Rápidos */}
            <div className="space-y-2">
              <Label>Filtro Rápido</Label>
              <div className="flex flex-wrap gap-2">
                {(["hoy", "mañana", "estaSemana", "esteMes", "proximoMes", "personalizado"] as FiltroRapido[]).map(
                  (filtro) => (
                    <Button
                      key={filtro}
                      variant={filtroRapido === filtro ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFiltroRapido(filtro);
                        if (filtro === "personalizado") {
                          const hoy = new Date();
                          const proximoMes = new Date(hoy);
                          proximoMes.setMonth(proximoMes.getMonth() + 1);
                          setFechaInicio(formatLocalDate(hoy));
                          setFechaFin(formatLocalDate(proximoMes));
                        }
                      }}
                    >
                      {getTextoFiltro(filtro)}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Rango Personalizado */}
            {filtroRapido === "personalizado" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    min={fechaInicio || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            )}

            {/* Filtro de Estados */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Estados ({estados.length} seleccionados)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={seleccionarTodosEstados}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={deseleccionarTodosEstados}
                  >
                    Ninguno
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["programado", "en_curso", "completado", "cancelado"] as Trip["estado"][]).map(
                  (estado) => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => toggleEstado(estado)}
                      className={`rounded-md border px-3 py-2 text-xs sm:text-sm font-medium transition-colors touch-target ${
                        estados.includes(estado)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-muted"
                      }`}
                    >
                      {estadosLabels[estado]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Resumen del Filtro Actual */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm font-medium mb-1">Resumen del Filtro:</p>
              <p className="text-xs text-muted-foreground">
                Período: <strong>{getTextoFiltro(filtroRapido)}</strong>
                {filtroRapido === "personalizado" && fechaInicio && fechaFin && (
                  <> ({fechaInicio} a {fechaFin})</>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Estados:{" "}
                <strong>
                  {estados.length === 0
                    ? "Todos"
                    : estados.map((e) => estadosLabels[e]).join(", ")}
                </strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Resultados: <strong>{trips.length} viaje{trips.length !== 1 ? "s" : ""}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido Principal */}
      {loading ? (
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cargando viajes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadTrips}>
              Reintentar
            </Button>
          </div>
        </div>
      ) : trips.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay viajes para el período seleccionado
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Intenta cambiar los filtros de fecha o estado
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando <strong>{trips.length}</strong> viaje{trips.length !== 1 ? "s" : ""} para{" "}
              <strong>{getTextoFiltro(filtroRapido)}</strong>
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
