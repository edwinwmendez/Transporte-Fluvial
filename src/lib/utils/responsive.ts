/**
 * Utilidades para diseño responsivo
 * Breakpoints según PRD:
 * - Mobile: 320px - 767px
 * - Tablet: 768px - 1023px
 * - Desktop: 1024px+
 */

export const breakpoints = {
  xs: '320px',   // Móvil pequeño
  sm: '640px',   // Móvil grande
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Desktop grande
  '2xl': '1536px', // Desktop extra grande
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook para detectar el tamaño de pantalla (usar en client components)
 * Retorna el breakpoint actual
 */
export function useBreakpoint() {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'xs';
}

/**
 * Verifica si la pantalla es móvil (< 768px)
 */
export function isMobile(width?: number): boolean {
  const screenWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1024);
  return screenWidth < 768;
}

/**
 * Verifica si la pantalla es tablet (768px - 1023px)
 */
export function isTablet(width?: number): boolean {
  const screenWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1024);
  return screenWidth >= 768 && screenWidth < 1024;
}

/**
 * Verifica si la pantalla es desktop (>= 1024px)
 */
export function isDesktop(width?: number): boolean {
  const screenWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1024);
  return screenWidth >= 1024;
}

/**
 * Clases de Tailwind para espaciado responsivo
 */
export const responsiveSpacing = {
  container: 'px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12 lg:py-16',
  gap: 'gap-4 sm:gap-6 lg:gap-8',
  padding: 'p-4 sm:p-6 lg:p-8',
} as const;

/**
 * Clases para grid responsivo
 */
export const responsiveGrid = {
  '1-col': 'grid-cols-1',
  '2-col': 'grid-cols-1 sm:grid-cols-2',
  '3-col': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4-col': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;
