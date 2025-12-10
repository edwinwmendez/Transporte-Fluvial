'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useIsMobile } from '@/lib/utils/responsive';

interface NavbarProps {
  className?: string;
}

/**
 * Navbar responsive
 * Se adapta a móvil (menú hamburguesa) y desktop (menú horizontal)
 */
export function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav
      className={cn(
        'w-full bg-white border-b border-gray-200 sticky top-0 z-50',
        'safe-area-top',
        className
      )}
    >
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl md:text-2xl font-bold text-primary"
          >
            <span>🚢</span>
            <span className="hidden sm:inline">Transporte Fluvial</span>
            <span className="sm:hidden">TF</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              href="/buscar"
              className="text-text-primary hover:text-primary transition-colors text-sm lg:text-base"
            >
              Buscar Viajes
            </Link>
            <Link
              href="/reservas"
              className="text-text-primary hover:text-primary transition-colors text-sm lg:text-base"
            >
              Mis Reservas
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm lg:text-base touch-target"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobile && isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <Link
              href="/buscar"
              onClick={() => setIsOpen(false)}
              className="block text-text-primary hover:text-primary transition-colors py-2 touch-target"
            >
              Buscar Viajes
            </Link>
            <Link
              href="/reservas"
              onClick={() => setIsOpen(false)}
              className="block text-text-primary hover:text-primary transition-colors py-2 touch-target"
            >
              Mis Reservas
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors touch-target"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
