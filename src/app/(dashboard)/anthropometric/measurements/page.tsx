'use client'
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { getRecords } from "@/hooks/api";

// export const metadata: Metadata = {
//   title: "Anthropometric Measurements Page",
// };
import { useRouter } from "next/navigation";
export default function MainPage() {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Progreso y Estadística" />
      <div className="space-y-10">
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-stroke bg-white p-8 text-center shadow-default dark:border-white/10 dark:bg-[#0B1120] md:p-16">
          <div className="absolute top-0 h-40 w-40 rounded-full bg-primary/5 blur-[100px] dark:bg-primary/20" />
          <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 dark:bg-white/[0.03] dark:shadow-inner">
            <svg
              className="h-10 w-10 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
              <circle
                cx="18"
                cy="18"
                r="3"
                stroke="currentColor"
                strokeWidth={1.5}
                className="fill-white dark:fill-[#0B1120]"
              />
              <path
                d="M16.5 16.5l1.5 1.5"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="relative mb-4 text-2xl font-bold tracking-tight text-black dark:text-white md:text-3xl">
            Selecciona un participante
          </h2>
          <p className="relative mx-auto mb-10 max-w-lg leading-relaxed text-gray-500 dark:text-gray-400">
            Para visualizar el historial de mediciones, gráficos de tendencia y
            el progreso del IMC, primero debes seleccionar un paciente de tu
            base de datos.
          </p>
          <button className="relative mb-14 flex items-center gap-2 rounded-xl bg-primary px-10 py-3.5 font-semibold text-white hover:bg-opacity-90" onClick={() => router.push("/anthropometric/record")}>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Buscar Participante
          </button>
          <div className="relative grid w-full max-w-md grid-cols-3 gap-8 border-t border-gray-100 pt-10 dark:border-white/5">
            <div className="group flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-colors group-hover:text-primary dark:bg-white/5">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                Tendencias
              </span>
            </div>

            <div className="group flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-colors group-hover:text-primary dark:bg-white/5">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                Historial
              </span>
            </div>

            <div className="group flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-colors group-hover:text-primary dark:bg-white/5">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                Cálculo IMC
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
