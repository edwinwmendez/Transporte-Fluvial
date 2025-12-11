'use client';

import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Componente de diálogo genérico para formularios con validación integrada
 *
 * Proporciona una estructura consistente para modales de formularios con:
 * - Header con título y descripción
 * - Área de contenido para el formulario
 * - Footer con botones de acción (cancelar y guardar)
 * - Estados de loading y disabled
 * - Manejo automático de submit del formulario
 *
 * @param open - Controla si el diálogo está abierto
 * @param onOpenChange - Callback cuando cambia el estado de apertura
 * @param title - Título del diálogo
 * @param description - Descripción opcional del diálogo
 * @param children - Contenido del formulario (inputs, campos, etc.)
 * @param onSubmit - Callback cuando se envía el formulario
 * @param submitLabel - Texto del botón de envío (default: "Guardar")
 * @param cancelLabel - Texto del botón de cancelar (default: "Cancelar")
 * @param loading - Si true, muestra spinner en el botón de envío
 * @param disabled - Si true, deshabilita el botón de envío
 * @param maxWidth - Ancho máximo del diálogo: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 *
 * @example
 * ```tsx
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Crear Ruta"
 *   description="Completa los datos de la nueva ruta"
 *   onSubmit={handleSubmit}
 *   loading={isSubmitting}
 * >
 *   <Input label="Origen" {...register('origen')} />
 *   <Input label="Destino" {...register('destino')} />
 * </FormDialog>
 * ```
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  loading = false,
  disabled = false,
  maxWidth = 'lg',
}: FormDialogProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={maxWidthClasses[maxWidth]}
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        <DialogTitle id="dialog-title">{title || 'Diálogo'}</DialogTitle>
        <DialogHeader>
          {description ? (
            <DialogDescription id="dialog-description">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
          aria-label={title}
        >
          <div className="space-y-4 py-4" role="group" aria-label="Campos del formulario">
            {children}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </Button>
            {onSubmit && (
              <Button
                type="submit"
                disabled={loading || disabled}
                aria-label={submitLabel}
                aria-busy={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {submitLabel}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
