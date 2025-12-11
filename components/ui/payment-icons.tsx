import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Icono oficial de YAPE (BCP)
 * Usa el logo oficial desde /public/images/payment-methods/yape-logo.svg
 */
export function YapeIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      {...props}
    >
      <Image
        src="/images/payment-methods/yape-logo.svg"
        alt="YAPE"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        unoptimized
      />
    </div>
  );
}

/**
 * Icono oficial de PLIN (Interbank)
 * Usa el logo oficial desde /public/images/payment-methods/plin-logo.svg
 */
export function PlinIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      {...props}
    >
      <Image
        src="/images/payment-methods/plin-logo.svg"
        alt="PLIN"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        unoptimized
      />
    </div>
  );
}

/**
 * Icono para Efectivo
 * Usa el icono profesional desde /public/images/payment-methods/efectivo-icon.svg
 * Diseño con billete y símbolo S/ (Sol Peruano)
 */
export function CashIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      {...props}
    >
      <Image
        src="/images/payment-methods/efectivo-icon.svg"
        alt="Efectivo"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        unoptimized
      />
    </div>
  );
}
