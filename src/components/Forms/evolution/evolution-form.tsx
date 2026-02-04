"use client";
import { FiMessageSquare, FiMinus, FiPause, FiPlay, FiPlus, FiRotateCcw } from "react-icons/fi";
import { TestData } from "@/types/test";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { useEffect, useState } from "react";

interface EvolutionTestFormProps {
  test: TestData | null;
  participantExternalId: string;
  values: { [key: string]: number };
  setValues: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  observations: string;
  setObservations: React.Dispatch<React.SetStateAction<string>>;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
}
export function EvolutionTestForm({
  test,
  values,
  setValues,
  observations,
  setObservations,
  date,
  setDate,
}: EvolutionTestFormProps) {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | number | undefined = undefined;

    if (activeExercise) {
      interval = setInterval(() => {
        setValues((prev) => ({
          ...prev,
          [activeExercise]: (prev[activeExercise] || 0) + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeExercise]);

  if (!test) return <p className="text-center py-10 text-slate-500">No hay evaluación seleccionado</p>;

  const secondsToTime = (total: number) => ({
    minutes: Math.floor(total / 60),
    seconds: total % 60,
  });

  const updateValue = (externalId: string, delta: number) => {
    setValues((prev) => ({
      ...prev,
      [externalId]: Math.max(0, (prev[externalId] || 0) + delta),
    }));
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col gap-3">
        {test.exercises.map((ex, idx) => {
          const isTime = ex.unit.toLowerCase() === "segundos";
          const currentValue = values[ex.external_id!] || 0;
          const { minutes, seconds } = secondsToTime(currentValue);
          const isActive = activeExercise === ex.external_id;

          return (
            <div
              key={idx}
              className={`flex flex-row items-center justify-between gap-2 p-2 md:p-3 rounded-xl border transition-all duration-300 ${isActive
                ? 'bg-blue-50 border-blue-500 shadow-md dark:bg-blue-500/10 dark:border-blue-400'
                : 'bg-white border-slate-200 shadow-sm dark:bg-slate-800/40 dark:border-slate-700/50'
                }`}
            >
              {/* Contenedor Izquierdo: Número y Nombre */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded font-bold text-[10px] ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                  {idx + 1}
                </span>
                <span className="text-xs font-bold uppercase truncate text-slate-700 dark:text-slate-100 min-w-0">
                  {ex.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isTime ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 dark:bg-black">
                      <span className="text-base md:text-xl font-black text-blue-500 tabular-nums">
                        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => ex.external_id && setActiveExercise(isActive ? null : ex.external_id)}
                        className={`flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg transition-all active:scale-95 ${isActive
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-blue-600 text-white'
                          }`}
                      >
                        {isActive ? <FiPause size={14} /> : <FiPlay size={14} className="ml-0.5" />}
                      </button>

                      <button
                        onClick={() => {
                          if (ex.external_id) {
                            if (isActive) setActiveExercise(null);
                            setValues(prev => ({ ...prev, [ex.external_id!]: 0 }));
                          }
                        }}
                        className="h-8 w-8 flex items-center justify-center text-slate-400"
                      >
                        <FiRotateCcw size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateValue(ex.external_id!, -1)}
                      className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                    >
                      <FiMinus size={14} />
                    </button>

                    <div className="w-12 md:w-16">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={currentValue}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          const numVal = val === "" ? 0 : parseInt(val, 10);

                          setValues((prev) => ({
                            ...prev,
                            [ex.external_id!]: numVal,
                          }));
                        }}
                        className="w-full bg-transparent text-center text-lg md:text-xl font-black text-slate-800 dark:text-white tabular-nums border-none focus:ring-0 focus:outline-none p-0"
                      />
                    </div>

                    <button
                      onClick={() => updateValue(ex.external_id!, 1)}
                      className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-md active:scale-95"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <FiMessageSquare className="text-blue-500" /> Notas de Rendimiento
          </label>
          <TextAreaGroup
            label=""
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ingrese notas sobre el test..."
          />
        </div>
      </div>
    </div>
  );
}