import Link from "next/link";
import { Ship, LayoutDashboard, Receipt, CheckCircle2, Ticket, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center border-b px-6">
            <div className="flex items-center gap-2">
              <Ship className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Transporte Fluvial</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            
            <div className="my-2 border-t" />
            
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
              Gestión
            </div>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/rutas">
                <MapPin className="h-4 w-4" />
                Rutas
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/embarcaciones">
                <Ship className="h-4 w-4" />
                Embarcaciones
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/horarios">
                <Clock className="h-4 w-4" />
                Horarios
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/viajes">
                <Calendar className="h-4 w-4" />
                Viajes
              </Link>
            </Button>
            
            <div className="my-2 border-t" />
            
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
              Operaciones
            </div>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/validar-pagos">
                <Receipt className="h-4 w-4" />
                Validar Pagos
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/validar-boletos">
                <Ticket className="h-4 w-4" />
                Validar Boletos
              </Link>
            </Button>
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              Prototipo Ventanilla Digital
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
