import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold">FlashMind AI</div>
          <div className="space-x-4">
            <Link href="sign-in">
              <Button
                variant="ghost"
                className="text-white hover:text-gray-200"
              >
                Sign In
              </Button>
            </Link>
            <Link href="sign-up">
              <Button
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Aprende Más Rápido con Flashcards Inteligentes
            </h1>
            <p className="text-xl text-gray-300">
              Crea y comparte flashcards potenciadas por IA. Aprende cualquier
              tema de forma más efectiva con generación automática de tarjetas y
              estudio colaborativo.
            </p>
            <div className="space-x-4">
              <Button
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
              >
                Empezar Gratis
              </Button>
              <Button variant="outline" className="text-lg px-8 py-6">
                Ver Demo
              </Button>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75"></div>
              <div className="relative bg-gray-900 rounded-lg p-8">
                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Matemáticas • Compartido por Ana
                    </div>
                    <div className="text-blue-500">1/20</div>
                  </div>
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg flex items-center justify-center p-8 text-center">
                    <span className="text-2xl">
                      ¿Cuál es la derivada de f(x) = x²?
                    </span>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button variant="ghost" size="sm">
                      Voltear
                    </Button>
                    <Button variant="ghost" size="sm">
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Generación con IA",
              description:
                "Crea sets completos de flashcards automáticamente a partir de cualquier texto o tema",
              icon: "🤖",
            },
            {
              title: "Colaborativo",
              description:
                "Comparte y estudia con otros. Aprende de las colecciones de la comunidad",
              icon: "👥",
            },
            {
              title: "Aprendizaje Adaptativo",
              description:
                "Sistema inteligente que se adapta a tu ritmo de aprendizaje",
              icon: "📈",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-20 border-t border-gray-800">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { number: "10K+", label: "Estudiantes Activos" },
            { number: "50K+", label: "Flashcards Creadas" },
            { number: "100+", label: "Temas Disponibles" },
            { number: "95%", label: "Tasa de Aprobación" },
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold text-blue-500 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
