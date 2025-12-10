/**
 * Utilidades para manejo responsive
 * Proporciona funciones y hooks para detectar breakpoints y ajustar UI
 */

import { useState, useEffect } from 'react';

/**
 * Breakpoints según el PRD
 */
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook para detectar si es móvil
 * Inicializa correctamente en el cliente para evitar hidratación incorrecta
 */
export function useIsMobile(): boolean {
  // Inicializar con el valor del servidor (siempre false en SSR)
  const [isMobile, setIsMobile] = useState(() => {
    // Solo en el cliente
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoints.md;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoints.md);
    };

    // Verificar inmediatamente
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
