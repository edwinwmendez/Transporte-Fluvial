'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Ship, 
  LayoutDashboard, 
  Receipt, 
  CheckCircle2, 
  Ticket, 
  MapPin, 
  Calendar, 
  Clock,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/utils/responsive';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rutas', label: 'Rutas', icon: MapPin, section: 'Gestión' },
  { href: '/embarcaciones', label: 'Embarcaciones', icon: Ship, section: 'Gestión' },
  { href: '/horarios', label: 'Horarios', icon: Clock, section: 'Gestión' },
  { href: '/viajes', label: 'Viajes', icon: Calendar, section: 'Gestión' },
  { href: '/validar-pagos', label: 'Validar Pagos', icon: Receipt, section: 'Operaciones' },
  { href: '/validar-boletos', label: 'Validar Boletos', icon: Ticket, section: 'Operaciones' },
];

/**
 * Sidebar responsive para el panel de administración
 * - En móvil: Menú hamburguesa con overlay
 * - En desktop: Sidebar fijo siempre visible
 */
export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Marcar como montado después de la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar sidebar en móvil cuando cambia la ruta
  useEffect(() => {
    if (mounted && isOpen) {
      // Solo cerrar en móvil (verificamos con window.innerWidth)
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted]); // Solo cerrar cuando cambia la ruta, no cuando cambia isOpen

  // Prevenir scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (mounted && isOpen) {
      // Solo prevenir scroll en móvil
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mounted, isOpen]);

  const toggleSidebar = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(prev => !prev);
  };
  
  const closeSidebar = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setIsOpen(false);
  };

  // Agrupar items por sección
  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || 'General';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <>
      {/* Botón hamburguesa - Solo visible en móvil cuando el sidebar está cerrado */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg touch-target",
          "md:hidden", // Oculto en desktop con CSS
          (!mounted || isOpen) && "hidden" // Oculto si no está montado o si el sidebar está abierto
        )}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay - Solo en móvil cuando está abierto (usando CSS para evitar hydration mismatch) */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity animate-in fade-in duration-200",
          "md:hidden", // Oculto en desktop con CSS
          (!mounted || !isOpen) && "hidden" // Oculto si no está montado o no está abierto
        )}
        onClick={closeSidebar}
        onTouchStart={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40',
          'w-64 border-r bg-card shadow-lg md:shadow-none',
          'transform transition-transform duration-300 ease-in-out',
          // En móvil: se desliza desde la izquierda cuando está cerrado
          // Usamos una clase condicional solo después de montar para evitar hydration mismatch
          mounted && !isOpen && '-translate-x-full md:translate-x-0',
          // En desktop: siempre visible (md:translate-x-0 se aplica siempre)
          'md:translate-x-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          {/* Header con logo */}
          <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
            <div className="flex items-center gap-2">
              <Ship className="h-6 w-6 text-primary" />
              <span className="text-base md:text-lg font-semibold">
                <span className="hidden sm:inline">Transporte Fluvial</span>
                <span className="sm:hidden">TF</span>
              </span>
            </div>
            {/* Botón cerrar solo en móvil (usando CSS para evitar hydration mismatch) */}
            <button
              onClick={closeSidebar}
              className={cn(
                "p-1 rounded-lg hover:bg-muted touch-target",
                "md:hidden", // Oculto en desktop con CSS
                !mounted && "invisible" // Invisible hasta que se monte
              )}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto space-y-1 p-3 md:p-4">
            {Object.entries(groupedItems).map(([section, items]) => (
              <div key={section}>
                {/* Separador y título de sección - Oculto en móvil pequeño */}
                {section !== 'General' && (
                  <>
                    <div className="my-2 border-t" />
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase hidden sm:block">
                      {section}
                    </div>
                  </>
                )}

                {/* Items de navegación */}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-2',
                        'text-sm md:text-base',
                        'h-10 md:h-11',
                        'touch-target',
                        isActive && 'bg-primary/10 text-primary font-medium'
                      )}
                      asChild
                    >
                      <Link href={item.href} onClick={closeSidebar}>
                        <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t p-3 md:p-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              Prototipo Ventanilla Digital
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
