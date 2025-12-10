import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-primary to-secondary text-white py-12 md:py-20 lg:py-24">
        <Container>
          <div className="text-center space-y-6 md:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              Viaja por los Ríos de la Amazonía
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto opacity-90">
              Reserva tu asiento de forma rápida y segura. Conectamos Atalaya con Pucallpa, Sepahua y más destinos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/buscar">
                <Button size="lg" className="w-full sm:w-auto">
                  Buscar Viajes
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Conocer Más
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-background-alternate">
        <Container>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card hover>
              <CardHeader>
                <div className="text-4xl mb-4">🎫</div>
                <CardTitle>Reserva Online</CardTitle>
              </CardHeader>
              <CardContent>
                Reserva tus asientos desde cualquier lugar, en cualquier momento. Proceso rápido y sencillo.
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="text-4xl mb-4">💳</div>
                <CardTitle>Pago Digital</CardTitle>
              </CardHeader>
              <CardContent>
                Paga de forma segura con YAPE o PLIN. Sube tu comprobante y listo.
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="text-4xl mb-4">📍</div>
                <CardTitle>Selección de Asientos</CardTitle>
              </CardHeader>
              <CardContent>
                Elige tu asiento preferido con nuestro mapa interactivo. Vista previa en tiempo real.
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <Container>
          <Card className="bg-gradient-to-r from-primary to-secondary text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-center text-white">
                ¿Listo para tu próximo viaje?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg md:text-xl mb-6 opacity-90">
                Busca disponibilidad y reserva ahora mismo
              </p>
              <Link href="/buscar">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Buscar Viajes Disponibles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Container>
      </section>
    </div>
  );
}
