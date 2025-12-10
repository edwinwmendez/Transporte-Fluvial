import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función helper para combinar clases de Tailwind
 * Útil para clases condicionales y responsive
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
