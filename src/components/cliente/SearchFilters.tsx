'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersData) => void;
  className?: string;
}

export interface SearchFiltersData {
  origin: string;
  destination: string;
  date: string;
}

/**
 * SearchFilters component responsive
 * Layout adaptativo: vertical en móvil, horizontal en desktop
 */
export function SearchFilters({ onSearch, className }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFiltersData>({
    origin: '',
    destination: '',
    date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Buscar Viajes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Grid responsive: 1 columna en móvil, 2 en tablet, 3 en desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Input
              label="Origen"
              placeholder="Ej: Atalaya"
              value={filters.origin}
              onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
              required
            />
            <Input
              label="Destino"
              placeholder="Ej: Pucallpa"
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              required
            />
            <div className="relative">
              <Input
                label="Fecha"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-9 md:top-10 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Botón: full width en móvil, auto en desktop */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="submit"
              className="w-full sm:w-auto sm:ml-auto"
              size="lg"
            >
              Buscar Viajes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setFilters({ origin: '', destination: '', date: '' });
                onSearch({ origin: '', destination: '', date: '' });
              }}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
