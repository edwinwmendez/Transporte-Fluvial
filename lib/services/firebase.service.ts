/**
 * Servicio de inicialización de Firebase
 * Re-exporta las instancias de Firestore, Auth y Storage
 */
export { db, auth, storage, default as app } from '../firebase';
