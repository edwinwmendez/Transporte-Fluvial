'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logError } from '@/lib/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary global para capturar y manejar errores de React
 * 
 * Captura errores en el árbol de componentes hijos y muestra una UI de error
 * amigable en lugar de romper toda la aplicación. En desarrollo, muestra
 * detalles del error para debugging.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 * 
 * @example Con fallback personalizado
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('Error capturado por ErrorBoundary', error, { errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="flex items-center justify-center min-h-[400px] p-4"
          role="alert"
          aria-live="assertive"
          aria-labelledby="error-title"
        >
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle 
                id="error-title"
                className="flex items-center gap-2 text-destructive"
              >
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                Algo salió mal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground" id="error-description">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </p>
              {this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer mb-2" role="button" tabIndex={0}>
                    Detalles del error (solo en desarrollo)
                  </summary>
                  <pre 
                    className="bg-muted p-2 rounded overflow-auto"
                    aria-label="Detalles técnicos del error"
                  >
                    {this.state.error.message}
                    {'\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <div className="flex gap-2" role="group" aria-label="Acciones de recuperación">
                <Button 
                  onClick={this.handleReset} 
                  variant="outline" 
                  className="flex-1"
                  aria-label="Reintentar operación"
                >
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Reintentar
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                  aria-label="Recargar página completa"
                >
                  Recargar Página
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
