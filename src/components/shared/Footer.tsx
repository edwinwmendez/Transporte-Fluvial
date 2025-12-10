'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface FooterProps {
  className?: string;
}

/**
 * Footer responsive
 * Se adapta a diferentes tamaños de pantalla con grid flexible
 */
export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        'w-full bg-gray-900 text-white mt-auto',
        'safe-area-bottom',
        className
      )}
    >
      <div className="container-responsive py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Logo y descripción */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">Transporte Fluvial</h3>
            <p className="text-gray-400 text-sm md:text-base">
              Tu conexión segura por los ríos de la Amazonía peruana
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="font-semibold mb-4 text-base md:text-lg">Enlaces</h4>
            <ul className="space-y-2 text-sm md:text-base">
              <li>
                <Link
                  href="/buscar"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Buscar Viajes
                </Link>
              </li>
              <li>
                <Link
                  href="/reservas"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Mis Reservas
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 className="font-semibold mb-4 text-base md:text-lg">Soporte</h4>
            <ul className="space-y-2 text-sm md:text-base">
              <li>
                <Link
                  href="/contacto"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link
                  href="/ayuda"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Ayuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold mb-4 text-base md:text-lg">Contacto</h4>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li>📞 +51 999 999 999</li>
              <li>✉️ info@transporte.com</li>
              <li>📍 Atalaya, Ucayali, Perú</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm md:text-base text-gray-400">
          <p>© {new Date().getFullYear()} Transporte Fluvial. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
