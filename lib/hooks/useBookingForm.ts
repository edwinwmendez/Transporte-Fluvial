import { useState, useCallback } from 'react';
import { validarDNI, validarTelefono, sanitizarTexto } from '../utils/validators';

export interface BookingFormData {
  dni: string;
  nombre: string;
  telefono: string;
  whatsapp: string;
  destinoIntermedio: string;
  monto: string;
  metodoPago: 'efectivo' | 'yape' | 'plin';
}

export interface BookingFormErrors {
  dni?: string;
  nombre?: string;
  telefono?: string;
  whatsapp?: string;
  monto?: string;
  metodoPago?: string;
  destinoIntermedio?: string;
  general?: string;
  [key: string]: string | undefined;
}

/**
 * Hook personalizado para manejar el estado, validación y sanitización del formulario de reserva
 * 
 * Proporciona:
 * - Estado del formulario con campos validados
 * - Validación en tiempo real de DNI, teléfono, WhatsApp
 * - Sanitización de datos para prevenir XSS
 * - Manejo de errores por campo
 * 
 * @param initialData - Datos iniciales opcionales para prellenar el formulario
 * @returns Objeto con formData, errors, updateField, validate, reset, sanitizeData
 * 
 * @example
 * ```tsx
 * const { formData, errors, updateField, validate } = useBookingForm();
 * 
 * // Actualizar campo
 * updateField('dni', '12345678');
 * 
 * // Validar formulario
 * if (validate()) {
 *   const datosLimpios = sanitizeData();
 *   // Enviar datos
 * }
 * ```
 */
export function useBookingForm(initialData?: Partial<BookingFormData>) {
  const [formData, setFormData] = useState<BookingFormData>({
    dni: initialData?.dni || '',
    nombre: initialData?.nombre || '',
    telefono: initialData?.telefono || '',
    whatsapp: initialData?.whatsapp || '',
    destinoIntermedio: initialData?.destinoIntermedio || '',
    monto: initialData?.monto || '',
    metodoPago: initialData?.metodoPago || 'efectivo',
  });

  const [errors, setErrors] = useState<BookingFormErrors>({});

  const updateField = useCallback((field: keyof BookingFormData, value: string | 'efectivo' | 'yape' | 'plin') => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: BookingFormErrors = {};

    // Validar campos obligatorios
    if (!formData.dni || !formData.nombre || !formData.telefono || !formData.monto) {
      newErrors.general = 'Por favor completa todos los campos obligatorios';
      setErrors(newErrors);
      return false;
    }

    // Validar DNI
    if (!validarDNI(formData.dni)) {
      newErrors.dni = 'El DNI debe tener exactamente 8 dígitos numéricos';
    }

    // Validar teléfono
    if (!validarTelefono(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 9 dígitos y empezar con 9';
    }

    // Validar WhatsApp para YAPE/PLIN
    if ((formData.metodoPago === 'yape' || formData.metodoPago === 'plin') && !formData.whatsapp) {
      newErrors.whatsapp = 'El número de WhatsApp es obligatorio para pagos YAPE/PLIN';
    }

    // Validar formato de WhatsApp si se proporciona
    if (formData.whatsapp && !validarTelefono(formData.whatsapp)) {
      newErrors.whatsapp = 'El WhatsApp debe tener 9 dígitos y empezar con 9';
    }

    // Validar monto
    const monto = parseFloat(formData.monto);
    if (isNaN(monto) || monto <= 0) {
      newErrors.monto = 'El monto debe ser un número válido mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData({
      dni: '',
      nombre: '',
      telefono: '',
      whatsapp: '',
      destinoIntermedio: '',
      monto: '',
      metodoPago: 'efectivo',
    });
    setErrors({});
  }, []);

  const sanitizeData = useCallback((): BookingFormData => {
    return {
      ...formData,
      nombre: sanitizarTexto(formData.nombre, 200),
      dni: formData.dni.trim(),
      telefono: formData.telefono.replace(/\s/g, ''),
      whatsapp: formData.whatsapp.replace(/\s/g, ''),
    };
  }, [formData]);

  return {
    formData,
    errors,
    updateField,
    setFormData,
    validate,
    reset,
    sanitizeData,
  };
}
