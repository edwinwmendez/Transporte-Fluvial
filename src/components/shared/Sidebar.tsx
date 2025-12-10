"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Sidebar({ isOpen, onClose, children }: SidebarProps) {
  // Overlay para móviles
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar móvil - Slide in desde la izquierda */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-64 sm:w-80 bg-background border-r transform transition-transform duration-300 ease-in-out lg:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-14 sm:h-16 items-center justify-between border-b px-4 sm:px-6">
            <h2 className="text-lg font-semibold">Menú</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="touch-target"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-3.5rem)] safe-bottom">
            {children}
          </div>
        </aside>
      </>
    )
  }

  // Sidebar desktop - Siempre visible
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 lg:border-r lg:bg-background">
      <div className="flex flex-col flex-1 pt-16">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {children}
        </div>
      </div>
    </aside>
  )
}

interface SidebarItemProps {
  href?: string
  icon?: React.ReactNode
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export function SidebarItem({ href, icon, children, active, onClick }: SidebarItemProps) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors touch-target",
        "hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground"
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  )

  if (href) {
    return <a href={href}>{content}</a>
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  )
}
