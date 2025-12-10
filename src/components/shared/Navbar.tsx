"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

interface NavbarProps {
  onMenuClick?: () => void
  isMenuOpen?: boolean
  title?: string
}

export function Navbar({ onMenuClick, isMenuOpen = false, title = "Transporte Fluvial" }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container-responsive">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo/Título - Responsive */}
          <div className="flex items-center gap-2 sm:gap-4">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden touch-target"
                onClick={onMenuClick}
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </Button>
            )}
            <h1 className="text-lg sm:text-xl font-bold text-primary">
              {title}
            </h1>
          </div>

          {/* Acciones - Ocultas en móvil, visibles en desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Perfil
            </Button>
            <Button variant="outline" size="sm">
              Salir
            </Button>
          </div>

          {/* Menú móvil - Botón de acciones */}
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" className="touch-target">
              <span className="sr-only">Menú</span>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
