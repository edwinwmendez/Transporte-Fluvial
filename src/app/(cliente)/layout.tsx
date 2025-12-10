import { ReactNode } from 'react';

/**
 * Layout para sección de cliente
 * Mantiene el layout principal pero puede añadir navegación específica
 */
export default function ClienteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
