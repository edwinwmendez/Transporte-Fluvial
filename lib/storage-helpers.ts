import { ref, uploadBytes, getDownloadURL, getBlob, UploadResult } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Sube un screenshot de comprobante de pago a Firebase Storage
 * 
 * @param file Archivo de imagen (JPG/PNG)
 * @param viajeId ID del viaje
 * @param bookingId ID de la reserva
 * @returns URL y path del archivo subido
 */
export async function uploadPaymentScreenshot(
  file: File,
  viajeId: string,
  bookingId: string
): Promise<{ url: string; path: string }> {
  // Validar tipo de archivo
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!tiposPermitidos.includes(file.type)) {
    throw new Error('El archivo debe ser una imagen JPG o PNG');
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('El archivo no puede ser mayor a 5MB');
  }

  try {
    // Generar nombre único con timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${bookingId}_${timestamp}.${extension}`;
    const storagePath = `screenshots/${viajeId}/${fileName}`;

    // Crear referencia en Storage
    const storageRef = ref(storage, storagePath);

    // Subir archivo
    const snapshot: UploadResult = await uploadBytes(storageRef, file);

    // Obtener URL de descarga
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      path: storagePath,
    };
  } catch (error) {
    console.error('Error al subir screenshot:', error);
    throw new Error('No se pudo subir el comprobante de pago');
  }
}

/**
 * Sube un PDF de boleto a Firebase Storage
 * 
 * @param blob Blob del PDF generado
 * @param viajeId ID del viaje
 * @param numeroTicket Número único del boleto (ej: TKT-20251209-0001)
 * @returns URL y path del archivo subido
 */
export async function uploadTicketPDF(
  blob: Blob,
  viajeId: string,
  numeroTicket: string
): Promise<{ url: string; path: string }> {
  try {
    // Generar nombre del archivo
    const fileName = `boleto_${numeroTicket}.pdf`;
    const storagePath = `boletos/${viajeId}/${fileName}`;

    // Crear referencia en Storage
    const storageRef = ref(storage, storagePath);

    // Subir archivo
    const snapshot: UploadResult = await uploadBytes(storageRef, blob, {
      contentType: 'application/pdf',
    });

    // Obtener URL de descarga
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      path: storagePath,
    };
  } catch (error) {
    console.error('Error al subir PDF del boleto:', error);
    throw new Error('No se pudo subir el PDF del boleto');
  }
}

/**
 * Descarga un archivo automáticamente en el navegador
 * 
 * @param blob Blob del archivo a descargar
 * @param fileName Nombre del archivo
 */
export function downloadFile(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Obtiene un archivo desde Firebase Storage usando su path
 * 
 * @param storagePath Path del archivo en Storage (ej: "boletos/viajeId/boleto_TKT-20251209-0001.pdf")
 * @returns Blob del archivo
 */
export async function getFileFromStorage(storagePath: string): Promise<Blob> {
  try {
    const storageRef = ref(storage, storagePath);
    const blob = await getBlob(storageRef);
    return blob;
  } catch (error) {
    console.error('Error al obtener archivo desde Storage:', error);
    throw new Error('No se pudo obtener el archivo desde Storage');
  }
}

/**
 * Obtiene un archivo desde Firebase Storage usando su URL de descarga
 * Intenta primero usar el SDK de Firebase, si falla usa fetch como fallback
 * 
 * @param downloadUrl URL de descarga del archivo
 * @param storagePath Path del archivo en Storage (opcional, para usar SDK)
 * @returns Blob del archivo
 */
export async function getFileFromUrl(
  downloadUrl: string,
  storagePath?: string
): Promise<Blob> {
  // Si tenemos el path, intentar usar el SDK de Firebase primero (más confiable)
  if (storagePath) {
    try {
      return await getFileFromStorage(storagePath);
    } catch (error) {
      console.warn('Error al obtener archivo usando SDK, intentando con fetch:', error);
      // Continuar con fetch como fallback
    }
  }

  // Fallback: usar fetch con la URL
  try {
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf, image/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error al obtener archivo usando fetch:', error);
    throw new Error('No se pudo obtener el archivo. Verifica que el archivo exista y sea accesible.');
  }
}
