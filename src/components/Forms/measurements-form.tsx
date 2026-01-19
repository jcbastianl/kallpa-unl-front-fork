"use client";
import { Participant } from "@/types/participant";
import { AssessmentResponseData } from "@/types/assessment";
import { StatCard } from "../Card/stat-card";
import { CalculatorIcon, Ruler, ScaleIcon } from "lucide-react";
import { RecordTable } from "../Tables/record-table";
import PerformanceDashboard from "./history/history";
import { useState } from "react";
import { FiArrowDown, FiArrowUp, FiDownload } from "react-icons/fi";
import { Button } from "../ui-elements/button";

interface Props {
  participant: Participant;
  measurements: AssessmentResponseData[];
}
export function MeasurementsForm({ participant, measurements }: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const hasMeasurements = measurements.length > 0;
  const lastMeasurement = hasMeasurements
    ? measurements[measurements.length - 1]
    : {
      height: 0,
      weight: 0,
      bmi: 0,
      waistPerimeter: 0,
      status: "",
      date: "",
    };
  return (
    <>
      {participant && participant.external_id && (
        <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-[#1a222c] mb-2 transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-xl font-bold text-white shadow-inner">
                {participant.firstName.charAt(0)}
                {participant.lastName?.charAt(0) || ""}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    {participant.firstName} {participant.lastName}
                  </h1>
                  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                    Activo
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base opacity-70">🎂</span> {participant.age} Años
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-400 opacity-50"></span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-base opacity-70">⚖️</span> {lastMeasurement.weight || 0} kg
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-400 opacity-50"></span>
                  <span className="flex items-center gap-1.5 font-medium text-blue-500">
                    <span className="text-base opacity-70">🧍</span> {lastMeasurement.height || 0} m
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                label="Descargar"
                icon={<FiDownload size={16} />}
                variant="outlinePrimary"
                size="small"
                shape="rounded"
                className="w-fit"
              />
            </div>
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-[#1a222c] mb-3 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-500">
              <div className="flex flex-col items-center">
                <FiArrowUp size={14} />
                <FiArrowDown size={14} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Medidas Antropométricas
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
            Última actualización: {lastMeasurement.date || "Sin registros"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Peso Actual"
            value={lastMeasurement.weight.toString()}
            unit="kg"
            trend="down"
            trendValue="1.2%"
            trendText="vs mes anterior"
            icon={<ScaleIcon className="h-5 w-5 opacity-40" />}
          />
          <StatCard
            title="IMC Calculado"
            value={lastMeasurement.bmi.toString()}
            unit=""
            badge={lastMeasurement.status}
            trendText=""
            icon={<CalculatorIcon className="h-5 w-5 opacity-40" />}
          />
          <StatCard
            title="Cintura"
            value={lastMeasurement.waistPerimeter.toString()}
            unit="cm"
            trend="up"
            trendValue="-"
            trendText="Sin cambios"
            icon={<Ruler className="h-5 w-5 opacity-40" />}
          />
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-500 hover:underline"
        >
          {showHistory ? "Ocultar historial detallado" : "Ver historial detallado de medidas"}
          <svg
            className={`h-3 w-3 transition-transform duration-300 ${showHistory ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showHistory ? "mt-4 max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
          {hasMeasurements && <RecordTable data={measurements} />}
        </div>

        <PerformanceDashboard participantId={participant?.external_id} />
      </div>
    </>
  );
}
