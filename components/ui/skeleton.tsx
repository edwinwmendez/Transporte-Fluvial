import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Componente Skeleton para loading states consistentes
 * 
 * Muestra un placeholder animado mientras se carga el contenido.
 * Respeta prefers-reduced-motion automáticamente.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
