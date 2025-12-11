import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('debe renderizar spinner', () => {
    render(<LoadingSpinner />);
    // Verificar que el componente se renderiza (Loader2 es un componente de lucide-react)
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('debe mostrar texto opcional', () => {
    render(<LoadingSpinner text="Cargando..." />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('debe aplicar diferentes tamaños', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('generic')).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });
});
