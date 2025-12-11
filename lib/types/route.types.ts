import { Timestamp } from 'firebase/firestore';

/**
 * Representa una parada intermedia en una ruta de transporte fluvial
 * 
 * Las paradas intermedias permiten que los pasajeros suban o bajen en puntos
 * intermedios del trayecto, no solo en origen y destino.
 * 
 * @property nombre - Nombre de la parada (ej: "Sepahua", "Puerto Ocopa")
 * @property distanciaDesdeOrigen - Distancia en kilómetros desde el punto de origen
 * @property precio - Precio del pasaje desde el origen hasta esta parada
 * @property orden - Orden de la parada en la ruta (1 = primera parada, 2 = segunda, etc.)
 * 
 * @example
 * ```ts
 * const parada: ParadaIntermedia = {
 *   nombre: "Sepahua",
 *   distanciaDesdeOrigen: 98,
 *   precio: 80,
 *   orden: 1
 * };
 * ```
 */
export interface ParadaIntermedia {
  nombre: string; // Ej: "Sepahua", "Puerto Ocopa"
  distanciaDesdeOrigen: number; // km desde el origen
  precio: number; // Precio del pasaje hasta esta parada
  orden: number; // Orden en la ruta (1, 2, 3...)
}

/**
 * Representa una ruta de transporte fluvial entre dos puntos
 * 
 * Una ruta define el trayecto completo entre origen y destino, incluyendo
 * paradas intermedias opcionales. Las rutas pueden estar activas o inactivas.
 * 
 * @property id - Identificador único de la ruta
 * @property origen - Punto de origen (ej: "Atalaya")
 * @property destino - Punto de destino (ej: "Pucallpa")
 * @property distancia - Distancia total en kilómetros
 * @property horasEstimadas - Tiempo estimado de viaje en horas
 * @property precio - Precio del pasaje completo (origen → destino)
 * @property paradasIntermedias - Array opcional de paradas intermedias
 * @property activa - Si true, la ruta está disponible para crear viajes
 * @property createdAt - Fecha de creación del registro
 * @property updatedAt - Fecha de última actualización
 * 
 * @example
 * ```ts
 * const ruta: Route = {
 *   id: "ruta1",
 *   origen: "Atalaya",
 *   destino: "Pucallpa",
 *   distancia: 500,
 *   horasEstimadas: 12,
 *   precio: 150,
 *   paradasIntermedias: [
 *     { nombre: "Sepahua", distanciaDesdeOrigen: 98, precio: 80, orden: 1 }
 *   ],
 *   activa: true,
 *   createdAt: Timestamp.now(),
 *   updatedAt: Timestamp.now()
 * };
 * ```
 */
export interface Route {
  id: string;
  origen: string;
  destino: string;
  distancia: number; // km total
  horasEstimadas: number;
  precio: number; // Precio del viaje completo (origen → destino)
  paradasIntermedias?: ParadaIntermedia[];
  activa: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
