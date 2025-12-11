/**
 * ARCHIVO DE COMPATIBILIDAD TEMPORAL
 * 
 * Este archivo re-exporta todas las funciones desde los nuevos módulos API
 * para mantener compatibilidad mientras se migran los imports.
 * 
 * TODO: Eliminar este archivo después de migrar todos los imports
 * a usar directamente los módulos de lib/api/
 */

// Re-exportar tipos
export * from './types';

// Re-exportar utils
export * from './utils';

// Re-exportar APIs
export * from './api';

// Re-exportar funciones específicas que pueden estar en uso
export { getRoute } from './api/routes.api';
export { getVessel } from './api/vessels.api';
export { getTrip } from './api/trips.api';
export { buscarPasajeroPorDni } from './api/bookings.api';
