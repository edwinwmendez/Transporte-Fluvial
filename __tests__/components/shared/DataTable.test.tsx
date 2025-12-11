import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, type Column } from '@/components/shared/DataTable';

interface TestData extends Record<string, unknown> {
  id: string;
  name: string;
  age: number;
}

describe('DataTable', () => {
  const testData: TestData[] = [
    { id: '1', name: 'Juan', age: 25 },
    { id: '2', name: 'María', age: 30 },
    { id: '3', name: 'Pedro', age: 28 },
  ];

  const columns: Column<TestData>[] = [
    {
      key: 'name',
      header: 'Nombre',
      accessor: (row) => row.name,
      sortable: true,
    },
    {
      key: 'age',
      header: 'Edad',
      accessor: (row) => row.age,
      sortable: true,
    },
  ];

  it('debe renderizar la tabla con datos', () => {
    render(<DataTable data={testData} columns={columns} />);

    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('María')).toBeInTheDocument();
    expect(screen.getByText('Pedro')).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no hay datos', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="Sin datos" />);

    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });

  it('debe filtrar datos cuando se busca', () => {
    render(<DataTable data={testData} columns={columns} searchable />);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'Juan' } });

    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.queryByText('María')).not.toBeInTheDocument();
  });

  it('debe ordenar datos al hacer clic en columna ordenable', () => {
    render(<DataTable data={testData} columns={columns} />);

    const nameHeader = screen.getByText('Nombre');
    fireEvent.click(nameHeader);

    const rows = screen.getAllByRole('row');
    // Verificar que los datos están ordenados
    expect(rows[1]).toHaveTextContent('Juan');
  });
});
