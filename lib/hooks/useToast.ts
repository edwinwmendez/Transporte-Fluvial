import { toast as sonnerToast } from 'sonner';

/**
 * Hook personalizado para mostrar notificaciones toast usando sonner
 * 
 * Proporciona métodos simplificados para diferentes tipos de notificaciones:
 * - success: Notificaciones de éxito (verde)
 * - error: Notificaciones de error (rojo)
 * - info: Notificaciones informativas (azul)
 * - warning: Notificaciones de advertencia (amarillo)
 * - loading: Notificación de carga (retorna función para actualizar)
 * - promise: Notificación para promesas con estados automáticos
 * 
 * @returns Objeto con métodos para mostrar diferentes tipos de toasts
 * 
 * @example
 * ```tsx
 * const toast = useToast();
 * 
 * // Toast simple
 * toast.success('Reserva creada exitosamente');
 * 
 * // Toast con descripción
 * toast.error('Error al guardar', 'Por favor intenta nuevamente');
 * 
 * // Toast para promesas
 * toast.promise(createBooking(), {
 *   loading: 'Creando reserva...',
 *   success: 'Reserva creada',
 *   error: 'Error al crear reserva'
 * });
 * ```
 */
export function useToast() {
  return {
    success: (message: string, description?: string) => {
      sonnerToast.success(message, {
        description,
      });
    },
    error: (message: string, description?: string) => {
      sonnerToast.error(message, {
        description,
      });
    },
    info: (message: string, description?: string) => {
      sonnerToast.info(message, {
        description,
      });
    },
    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, {
        description,
      });
    },
    loading: (message: string) => {
      return sonnerToast.loading(message);
    },
    promise: <T,>(
      promise: Promise<T>,
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ) => {
      return sonnerToast.promise(promise, {
        loading,
        success,
        error,
      });
    },
  };
}
