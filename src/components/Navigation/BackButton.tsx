"use client";

import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Rutas principales donde NO debe aparecer el botón de volver
  const mainRoutes = [
    '/', 
    '/dashboard',
    '/pages/attendance',  // Dashboard de Asistencia
    '/pages/participant', // Listado de Participantes
  ];

  // Si estamos en una ruta principal, no mostrar el botón
  if (mainRoutes.includes(pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
    >
      <span className="material-symbols-outlined text-xl">arrow_back</span>
      <span>Volver</span>
    </button>
  );
}
