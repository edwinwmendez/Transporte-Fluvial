import { Sidebar } from "@/components/shared/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar responsive */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="container mx-auto p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
