import Signin from "@/components/Auth/Signin";
import RedirectIfAuthenticated from "@/components/Auth/RedirectIfAuthenticated";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <div className="flex min-h-screen relative">
        {/* Fondo con imagen */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.8), rgba(0, 0, 0, 0.9)), url('/images/backgrounds/login/login-bg.jpg')`
          }}
        >
          {/* Overlay oscuro para mejor contraste */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/80"></div>
        </div>

        {/* Contenido izquierdo - Información */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 lg:px-20 xl:px-32">
          <div className="max-w-xl ml-8 lg:ml-16">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6.5 6.5 11 11" />
                    <path d="m10 10 5.5 5.5" />
                    <path d="m3 21 2.5-2.5" />
                    <path d="m3 14 7 7" />
                    <path d="m14 3 7 7" />
                    <path d="m18.5 5.5 2.5-2.5" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">
                    Kallpa UNL
                  </h1>
                  <p className="text-indigo-300 font-medium">Sistema de Gestión Deportiva</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-5xl font-bold text-white leading-tight">
                Transforma tu
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">
                  Potencial
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                Gestiona programas de entrenamiento, evalúa el progreso de participantes 
                y lleva el control de asistencias de forma profesional.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-gray-300">Control de asistencias en tiempo real</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-gray-300">Evaluaciones antropométricas completas</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-gray-300">Gestión de programas funcionales</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de login derecho */}
        <div className="relative z-10 flex items-center justify-center w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl px-10 py-12 shadow-2xl mx-6">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Bienvenido</h2>
              <p className="text-gray-300">
                Ingresa tus credenciales para continuar
              </p>
            </div>
            <div className="signin-wrapper">
              <Signin />
            </div>
          </div>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}
