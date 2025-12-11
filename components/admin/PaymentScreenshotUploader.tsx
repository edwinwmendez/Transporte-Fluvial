"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { uploadPaymentScreenshot } from "@/lib/storage-helpers";
import { cn } from "@/lib/utils";

interface PaymentScreenshotUploaderProps {
  viajeId: string;
  bookingId?: string; // Opcional porque puede no existir aún
  onUploadSuccess?: (url: string, path: string) => void; // Opcional: si no se proporciona, solo selecciona archivo
  onFileSelect?: (file: File) => void; // Callback cuando se selecciona un archivo
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

export function PaymentScreenshotUploader({
  viajeId,
  bookingId,
  onUploadSuccess,
  onFileSelect,
  onUploadError,
  disabled = false,
}: PaymentScreenshotUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Validar tipo
    if (!selectedFile.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }

    // Validar tamaño (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('El archivo no puede ser mayor a 5MB');
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Notificar al padre que se seleccionó un archivo
    onFileSelect?.(selectedFile);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecciona un archivo primero');
      return;
    }

    // Si no hay bookingId y no hay onUploadSuccess, solo seleccionar archivo
    if (!bookingId && !onUploadSuccess) {
      // El archivo ya fue notificado al padre via onFileSelect
      return;
    }

    if (!bookingId) {
      setError('Esperando ID de reserva...');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { url, path } = await uploadPaymentScreenshot(file, viajeId, bookingId);
      onUploadSuccess?.(url, path);
      // No limpiar preview aquí, se mantiene para confirmación visual
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir el comprobante';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-muted-foreground uppercase">
        Comprobante de Pago
      </label>

      {/* Botones de carga */}
      {!preview && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCameraClick}
            disabled={disabled || uploading}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Tomar Foto
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={disabled || uploading}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir Archivo
          </Button>
        </div>
      )}

      {/* Inputs ocultos */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Preview de imagen */}
      {preview && (
        <div className="relative rounded-lg border-2 border-border overflow-hidden bg-muted/20">
          <img
            src={preview}
            alt="Preview del comprobante"
            className="w-full h-48 object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background border border-border hover:bg-error/10 hover:border-error transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}

      {/* Botón de confirmar upload (solo si hay bookingId y onUploadSuccess) */}
      {preview && file && bookingId && onUploadSuccess && (
        <Button
          type="button"
          onClick={handleUpload}
          disabled={uploading || disabled}
          className="w-full"
          size="sm"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmar y Subir
            </>
          )}
        </Button>
      )}

      {/* Mensaje informativo */}
      {preview && file && (!bookingId || !onUploadSuccess) && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5 space-y-1">
          <p className="text-xs font-semibold text-blue-900">
            ✓ Comprobante listo para subir
          </p>
          <p className="text-xs text-blue-700 leading-relaxed">
            El comprobante y la boleta se guardarán al confirmar la venta. 
            El pago quedará <span className="font-semibold">pendiente</span> hasta que el administrador lo valide.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 p-2 text-xs text-error">
          {error}
        </div>
      )}
    </div>
  );
}
