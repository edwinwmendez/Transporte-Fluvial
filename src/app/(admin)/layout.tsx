"use client"

import * as React from "react"
import { Navbar } from "@/components/shared/Navbar"
import { Sidebar, SidebarItem } from "@/components/shared/Sidebar"
import { Home, Ship, Calendar, DollarSign, FileText } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        title="Ventanilla Digital"
      />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
          <nav className="space-y-1 px-2 py-4">
            <SidebarItem
              href="/dashboard"
              icon={<Home className="h-5 w-5" />}
              active
            >
              Dashboard
            </SidebarItem>
            <SidebarItem
              href="/ventas"
              icon={<DollarSign className="h-5 w-5" />}
            >
              Ventas
            </SidebarItem>
            <SidebarItem
              href="/viajes"
              icon={<Ship className="h-5 w-5" />}
            >
              Viajes
            </SidebarItem>
            <SidebarItem
              href="/calendario"
              icon={<Calendar className="h-5 w-5" />}
            >
              Calendario
            </SidebarItem>
            <SidebarItem
              href="/reportes"
              icon={<FileText className="h-5 w-5" />}
            >
              Reportes
            </SidebarItem>
          </nav>
        </Sidebar>

        {/* Contenido principal - Responsive padding para sidebar */}
        <main className="flex-1 lg:pl-64">
          <div className="container-responsive py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
