"use client";

import Loader from "@/components/Loader/loader";
import { getTests } from "@/hooks/api";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export function ListTest() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const data = await getTests();
        setEvaluations(data);
      } catch (error) {
        console.error("Error al cargar evaluaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) {
    return <Loader size={60} color="text-blue-500" className="py-20" />;
  }

  return (
    <div className="overflow-hidden rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card transition-colors duration-300">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {evaluations.map((evalu) => (
          <div
            key={evalu.external_id}
            className="relative rounded-xl border border-stroke p-4 transition-all duration-300 hover:shadow-2 dark:border-dark-3 hover:border-primary dark:hover:border-primary bg-white dark:bg-dark-2 flex flex-col justify-between"
          >
            <div>
              <div className="mb-3 flex items-center justify-end">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${evalu.status === 'Activo'
                  ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                  : 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                  }`}>
                  {evalu.status.toUpperCase()}
                </span>
              </div>

              <h3 className="mb-1 font-bold text-dark dark:text-white capitalize text-base leading-tight">
                {evalu.name}
              </h3>

              <div className="space-y-1 mb-3 text-body-color dark:text-body-color-dark">
                <p className="text-[11px] flex items-center gap-1.5">
                  <span className="opacity-70">📅</span> Cada {evalu.frequency_months} mes(es)
                </p>
                <p className="text-[11px] flex items-center gap-1.5">
                  <span className="opacity-70">🏋️</span> {evalu.exercises.length} ejercicios
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stroke dark:border-dark-3">
                {evalu.exercises.slice(0, 2).map((ex: any) => (
                  <span
                    key={ex.external_id}
                    className="text-[9px] bg-gray-2 dark:bg-dark-3 px-2 py-0.5 rounded-md text-body-color dark:text-gray-400 font-medium"
                  >
                    {ex.name}
                  </span>
                ))}
                {evalu.exercises.length > 2 && (
                  <span className="text-[9px] text-body-color font-bold self-center">
                    +{evalu.exercises.length - 2}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => router.push(`/evolution/edit-test/${evalu.external_id}`)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200"
                title="Editar"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => console.log("Eliminar", evalu.external_id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all duration-200"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <Link
          href="/evolution/form-test"
          className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-stroke p-4 transition-all duration-300 hover:bg-gray-2 hover:border-primary dark:border-dark-3 dark:hover:bg-dark-3 group"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-xl group-hover:scale-110 transition-transform">
            +
          </div>
          <span className="font-bold text-dark dark:text-white text-sm">Nueva Evaluación</span>
          <span className="text-[10px] text-body-color text-center mt-0.5">Crea un nuevo protocolo</span>
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-stroke pt-4 dark:border-dark-3">
        <p className="text-xs text-body-color">
          Mostrando <span className="font-bold text-dark dark:text-white">{evaluations.length}</span> evaluaciones
        </p>
      </div>
    </div>
  );
}