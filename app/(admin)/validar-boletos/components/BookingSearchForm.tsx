'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2 } from 'lucide-react';
import { useBookingByTicketNumber, useBookingsByDni } from '@/lib/hooks/useBookings';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface BookingSearchFormProps {
  searchMode: 'ticket' | 'dni';
  onSearchModeChange: (mode: 'ticket' | 'dni') => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSearch: () => void;
  searching: boolean;
}

/**
 * Formulario de búsqueda de boletos por número de ticket o DNI
 */
export function BookingSearchForm({
  searchMode,
  onSearchModeChange,
  searchValue,
  onSearchValueChange,
  onSearch,
  searching,
}: BookingSearchFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscar Boleto</CardTitle>
        <CardDescription>Busca un boleto por número de ticket o DNI del pasajero</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={searchMode} onValueChange={(v) => onSearchModeChange(v as 'ticket' | 'dni')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ticket">Por Número de Ticket</TabsTrigger>
            <TabsTrigger value="dni">Por DNI</TabsTrigger>
          </TabsList>
          <TabsContent value="ticket" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-search">Número de Ticket</Label>
              <div className="flex gap-2">
                <Input
                  id="ticket-search"
                  placeholder="Ej: TKT-2025-001234"
                  value={searchValue}
                  onChange={(e) => onSearchValueChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onSearch();
                    }
                  }}
                  aria-label="Número de ticket a buscar"
                />
                <Button onClick={onSearch} disabled={searching || !searchValue.trim()}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Search className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">Buscar</span>
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="dni" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dni-search">DNI del Pasajero</Label>
              <div className="flex gap-2">
                <Input
                  id="dni-search"
                  placeholder="Ej: 12345678"
                  value={searchValue}
                  onChange={(e) => onSearchValueChange(e.target.value.replace(/\D/g, ''))}
                  maxLength={8}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onSearch();
                    }
                  }}
                  aria-label="DNI del pasajero a buscar"
                />
                <Button onClick={onSearch} disabled={searching || searchValue.length !== 8}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Search className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">Buscar</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
