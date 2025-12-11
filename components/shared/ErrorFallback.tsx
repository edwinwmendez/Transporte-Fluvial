'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Componente de fallback para mostrar errores capturados por ErrorBoundary
 * 
 * Muestra una UI amigable cuando ocurre un error en el árbol de componentes,
 * permitiendo al usuario reintentar o recargar la página. En desarrollo,
 * muestra detalles técnicos del error para debugging.
 * 
 * @param error - Error capturado por el ErrorBoundary
 * @param resetErrorBoundary - Función para resetear el estado del error y reintentar
 * 
 * @example
 * ```tsx
 * <ErrorBoundary FallbackComponent={ErrorFallback}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Algo salió mal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer mb-2">Detalles del error (solo en desarrollo)</summary>
              <pre className="bg-muted p-2 rounded overflow-auto">
                {error.message}
                {'\n'}
                {error.stack}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            <Button onClick={() => window.location.reload()} className="flex-1">
              Recargar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
