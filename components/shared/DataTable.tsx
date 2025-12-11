'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * Componente de tabla genérica y reutilizable con funcionalidades avanzadas
 * 
 * Características:
 * - Paginación automática con controles
 * - Ordenamiento por columnas (ascendente/descendente)
 * - Búsqueda en tiempo real sobre todos los campos
 * - Personalizable mediante props de columnas
 * - Manejo de estados vacíos
 * 
 * @template T - Tipo de los datos de la tabla (debe extender Record<string, unknown>)
 * 
 * @param data - Array de objetos a mostrar en la tabla
 * @param columns - Array de definiciones de columnas con accessor, header, sortable
 * @param searchable - Si true, muestra campo de búsqueda
 * @param searchPlaceholder - Placeholder del campo de búsqueda
 * @param pagination - Si true, habilita paginación
 * @param pageSize - Número de elementos por página (default: 10)
 * @param onRowClick - Callback opcional cuando se hace clic en una fila
 * @param emptyMessage - Mensaje a mostrar cuando no hay datos
 * @param className - Clases CSS adicionales
 * 
 * @example
 * ```tsx
 * const columns: Column<User>[] = [
 *   { key: 'name', header: 'Nombre', accessor: (row) => row.name, sortable: true },
 *   { key: 'email', header: 'Email', accessor: (row) => row.email, sortable: true }
 * ];
 * 
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   searchable
 *   pagination
 *   pageSize={20}
 *   onRowClick={(user) => handleRowClick(user)}
 * />
 * ```
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  pagination = true,
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchable && searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortColumn) {
      const column = columns.find((col) => col.key === sortColumn);
      if (column?.sortable) {
        result.sort((a, b) => {
          const aValue = String(column.accessor(a));
          const bValue = String(column.accessor(b));
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, columns, searchable]);

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
            aria-label="Buscar en la tabla"
            role="searchbox"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table role="table" aria-label="Tabla de datos">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(column.sortable && 'cursor-pointer hover:bg-muted/50')}
                  onClick={() => column.sortable && handleSort(column.key)}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                  tabIndex={column.sortable ? 0 : undefined}
                  role={column.sortable ? 'button' : undefined}
                  aria-sort={
                    column.sortable && sortColumn === column.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : column.sortable
                        ? 'none'
                        : undefined
                  }
                  aria-label={
                    column.sortable
                      ? `Ordenar por ${column.header}. ${sortColumn === column.key && sortDirection === 'asc' ? 'Orden ascendente' : sortColumn === column.key && sortDirection === 'desc' ? 'Orden descendente' : 'Sin ordenar'}`
                      : column.header
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-xs" aria-hidden="true">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8" role="status" aria-live="polite">
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : 'row'}
                  aria-label={onRowClick ? `Fila ${index + 1}, presiona Enter para seleccionar` : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} role="cell">
                      {column.accessor(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <nav className="flex items-center justify-between" aria-label="Paginación de la tabla">
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, filteredData.length)}</span> de{' '}
            <span className="font-medium">{filteredData.length}</span>
          </p>
          <div className="flex gap-2" role="group" aria-label="Controles de paginación">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Página anterior</span>
            </Button>
            <span className="flex items-center px-3 text-sm" aria-current="page">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Página siguiente</span>
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
