import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Componente Container con padding adaptativo según PRD
 * 
 * Proporciona un contenedor con padding responsive y ancho máximo
 * para mantener el contenido centrado y legible en todos los tamaños de pantalla
 */
export function Container({ 
  className, 
  children,
  ...props
}: ContainerProps) {
  return (
    <div 
      className={cn("w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}
