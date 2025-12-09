"use client";

import { useState } from "react";
import { getBookingByTicketNumber, getBookingsByDni, markTicketAsUsed, getTrip, getVessel, getRoute } from "@/lib/firestore-helpers";
import type { Booking, Trip, Vessel, Route } from "@/lib/firestore-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Ticket, User, MapPin, Calendar, Clock, Ship, CheckCircle2, Download, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadFile } from "@/lib/storage-helpers";

export default function ValidarBoletosPage() {
  const [searchMode, setSearchMode] = useState<'ticket' | 'dni'>('ticket');
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [marking, setMarking] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      return;
    }

    setSearching(true);
    setSelectedBooking(null);
    setBookings([]);

    try {
      if (searchMode === 'ticket') {
        const booking = await getBookingByTicketNumber(searchValue.trim());
        if (booking) {
          setBookings([booking]);
          await loadBookingDetails(booking);
        } else {
          setBookings([]);
        }
      } else {
        // Buscar por DNI
        const foundBookings = await getBookingsByDni(searchValue.trim());
        setBookings(foundBookings);
        if (foundBookings.length > 0) {
          await loadBookingDetails(foundBookings[0]);
        }
      }
    } catch (error) {
      console.error("Error al buscar boleto:", error);
    } finally {
      setSearching(false);
    }
  };

  async function loadBookingDetails(booking: Booking) {
    setLoadingData(true);
    setSelectedBooking(booking);
    try {
      const [tripData, vesselData, routeData] = await Promise.all([
        getTrip(booking.viajeId),
        getTrip(booking.viajeId).then(t => t ? getVessel(t.embarcacionId) : null),
        getTrip(booking.viajeId).then(t => t ? getRoute(t.rutaId) : null),
      ]);
      setTrip(tripData);
      setVessel(vesselData);
      setRoute(routeData);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
    } finally {
      setLoadingData(false);
    }
  }

  const handleMarkAsUsed = async () => {
    if (!selectedBooking) return;

    try {
      setMarking(true);
      await markTicketAsUsed(selectedBooking.id);
      // Recargar datos
      await loadBookingDetails({ ...selectedBooking, estado: 'embarcado', boleto: selectedBooking.boleto ? { ...selectedBooking.boleto, estado: 'usado' } : undefined });
    } catch (error: any) {
      console.error("Error al marcar como usado:", error);
      alert(error.message || "Error al marcar el boleto como usado");
    } finally {
      setMarking(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedBooking?.boleto?.pdfUrl) {
      alert("No hay PDF disponible para descargar");
      return;
    }

    try {
      const response = await fetch(selectedBooking.boleto.pdfUrl);
      const blob = await response.blob();
      downloadFile(blob, `boleto_${selectedBooking.boleto.numeroTicket}.pdf`);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Error al descargar el PDF");
    }
  };

  const boletoEstado = selectedBooking?.boleto?.estado || 'emitido';
  const puedeMarcar = boletoEstado === 'emitido' && selectedBooking?.estado !== 'embarcado';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validar Boletos</h1>
        <p className="text-muted-foreground mt-2">
          Busca boletos por número de ticket o DNI del pasajero para validar el embarque
        </p>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Boleto</CardTitle>
          <CardDescription>
            Ingresa el número de boleto o DNI del pasajero
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'ticket' | 'dni')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="ticket">Por Número de Boleto</TabsTrigger>
              <TabsTrigger value="dni">Por DNI</TabsTrigger>
            </TabsList>
            <TabsContent value="ticket" className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="ticket-search">Número de Boleto</Label>
                  <Input
                    id="ticket-search"
                    placeholder="TKT-20251209-0001"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching || !searchValue.trim()}>
                  {searching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="dni" className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="dni-search">DNI del Pasajero</Label>
                  <Input
                    id="dni-search"
                    placeholder="12345678"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    maxLength={8}
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching || !searchValue.trim()}>
                  {searching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resultados */}
      {bookings.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Lista de boletos encontrados (si hay múltiples por DNI) */}
          {bookings.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Boletos Encontrados ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => loadBookingDetails(booking)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      selectedBooking?.id === booking.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{booking.nombrePasajero}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.boleto?.numeroTicket || 'Sin boleto'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.boleto?.estado === 'usado'
                            ? 'default'
                            : booking.boleto?.estado === 'anulado'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {booking.boleto?.estado || 'emitido'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Detalles del boleto seleccionado */}
          {selectedBooking && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-primary" />
                      Detalles del Boleto
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {selectedBooking.boleto?.numeroTicket || 'Sin número de boleto'}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      boletoEstado === 'usado'
                        ? 'default'
                        : boletoEstado === 'anulado'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {boletoEstado === 'usado' ? 'Embarcado' : boletoEstado === 'anulado' ? 'Anulado' : 'Emitido'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Datos del pasajero */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase">Pasajero</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedBooking.nombrePasajero}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>DNI: {selectedBooking.dniPasajero}</span>
                          <span>•</span>
                          <span>Tel: {selectedBooking.telefonoPasajero}</span>
                        </div>
                      </div>
                    </div>

                    {/* Datos del viaje */}
                    {trip && vessel && route && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Viaje</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Ship className="h-4 w-4 text-muted-foreground" />
                            <span>{vessel.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {selectedBooking.origenIntermedio || route.origen} → {selectedBooking.destinoIntermedio || route.destino}
                            </span>
                          </div>
                          {trip.fechaSalida && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {trip.fechaSalida.toDate ? trip.fechaSalida.toDate().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Hora de salida: {trip.horaSalida}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Código QR */}
                    {selectedBooking.boleto?.codigoQr && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Código QR</h3>
                        <div className="flex justify-center p-4 rounded-lg border border-border bg-muted/20">
                          <img
                            src={selectedBooking.boleto.codigoQr}
                            alt="Código QR del boleto"
                            className="w-48 h-48 object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      {selectedBooking.boleto?.pdfUrl && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleDownloadPDF}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar PDF
                        </Button>
                      )}
                      {puedeMarcar && (
                        <Button
                          className="flex-1"
                          onClick={handleMarkAsUsed}
                          disabled={marking}
                        >
                          {marking ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Marcando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Marcar como Embarcado
                            </>
                          )}
                        </Button>
                      )}
                      {!puedeMarcar && boletoEstado === 'usado' && (
                        <div className="flex-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span>Ya fue marcado como embarcado</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sin resultados */}
      {!searching && bookings.length === 0 && searchValue && (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              No se encontraron boletos
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Verifica que el número de boleto o DNI sean correctos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
