import { useState, useCallback } from 'react';
import { uploadPaymentScreenshot } from '../storage-helpers';

/**
 * Hook para manejar la subida de screenshots de comprobantes de pago
 * 
 * Gestiona el estado de carga y proporciona una función para subir archivos
 * a Firebase Storage con la estructura de carpetas correcta.
 * 
 * @returns Objeto con uploadScreenshot (función async) y uploading (estado booleano)
 * 
 * @example
 * ```tsx
 * const { uploadScreenshot, uploading } = usePaymentUpload();
 * 
 * const handleUpload = async (file: File) => {
 *   try {
 *     const { url, path } = await uploadScreenshot(file, 'viaje123', 'booking456');
 *     // URL disponible en result.url
 *   } catch (error) {
 *     // Error manejado por el hook
 *   }
 * };
 * ```
 */
export function usePaymentUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadScreenshot = useCallback(
    async (file: File, viajeId: string, bookingId: string): Promise<{ url: string; path: string }> => {
      setUploading(true);
      try {
        const result = await uploadPaymentScreenshot(file, viajeId, bookingId);
        return result;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return {
    uploadScreenshot,
    uploading,
  };
}
