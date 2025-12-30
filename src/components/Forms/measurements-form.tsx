"use client";
import { Participant } from "@/types/participant";
import { AssessmentResponseData } from "@/types/assessment";
import { StatCard } from "../Card/stat-card";
import { CalculatorIcon, MoveHorizontal, Ruler, ScaleIcon } from "lucide-react";
import { RecordTable } from "../Tables/record-table";
import { FiActivity, FiArrowDown, FiArrowUp, FiDownload } from "react-icons/fi";
import dynamic from "next/dynamic";

interface Props {
  participant: Participant;
  measurements: AssessmentResponseData[];
}
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
export function MeasurementsForm({ participant, measurements }: Props) {
  if (!measurements.length) {
    return (
      <div className="text-gray-400">Este participante no tiene registros</div>
    );
  }
  const lastMeasurement = measurements[measurements.length - 1];
  return (
    <div className="rounded-[10px] bg-white !p-6.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-blue-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
              Panel de mediciones
            </span>
          </div>

          <h1 className="mb-3 text-2xl font-bold text-black dark:text-white md:text-3xl">
            Resumen: {participant.firstName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="opacity-70">🎂 {participant.age}</span>
            </span>
            <span className="hidden opacity-30 md:block">|</span>
            <span className="flex items-center gap-1">
              <span className="opacity-70">📏</span> {lastMeasurement.height}
            </span>
            <span className="hidden opacity-30 md:block">|</span>
            <span className="flex items-center gap-1 font-medium text-blue-500">
              <span className="opacity-70">🪪</span> DNI: {participant.dni}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <button className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-opacity-90">
            <span>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </span>
            Nueva Medición
          </button>
        </div>
      </div>
      <hr className="mt-6 border-gray-100 dark:border-gray-800" />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Peso Actual"
          value={lastMeasurement.weight.toString()}
          unit="kg"
          trend="down"
          trendValue="-1.2 kg"
          trendText="vs mes anterior"
          icon={<ScaleIcon className="h-6 w-6" />}
        />
        <StatCard
          title="IMC Calculado"
          value={lastMeasurement.bmi.toString()}
          unit=""
          badge={lastMeasurement.status}
          trendText=""
          icon={<CalculatorIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Perímetro de cintura"
          value={lastMeasurement.waistPerimeter.toString()}
          unit="cm"
          trend="down"
          trendValue="-0.5%"
          trendText="progreso excelente"
          icon={<Ruler className="h-6 w-6" />}
        />
        <StatCard
          title="Envergadura"
          value={lastMeasurement.wingspan.toString()}
          unit="cm"
          trend="up"
          trendValue="+0.8%"
          trendText="ganancia neta"
          icon={<MoveHorizontal className="h-6 w-6" />}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-default dark:border-gray-600 dark:bg-gray-dark lg:col-span-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                Evolución Antropométrica
              </h3>
              <p className="text-sm text-gray-500">
                Visualización de tendencias a lo largo del tiempo
              </p>
            </div>
          </div>

          <div className="mb-4 flex justify-end gap-2">
            <div className="inline-flex rounded-md bg-gray-100 p-1 dark:bg-white/5">
              {["3M", "6M", "1A", "Todo"].map((t) => (
                <button
                  key={t}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-black dark:hover:text-white"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ReactApexChart
              options={{
                chart: {
                  type: "area",
                  toolbar: { show: false },
                  fontFamily: "Satoshi, sans-serif",
                  dropShadow: {
                    enabled: true,
                    top: 10,
                    left: 0,
                    blur: 4,
                    color: "#3C50E0",
                    opacity: 0.1,
                  },
                },
                colors: ["#3C50E0"],
                stroke: {
                  curve: "smooth",
                  width: 3,
                },
                fill: {
                  type: "gradient",
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [20, 100],
                  },
                },
                markers: {
                  size: 4,
                  colors: ["#fff"],
                  strokeColors: "#3C50E0",
                  strokeWidth: 3,
                  hover: { size: 7 },
                },
                grid: {
                  show: true,
                  borderColor: "#e2e8f0",
                  xaxis: { lines: { show: false } },
                  yaxis: { lines: { show: true } },
                },
                xaxis: {
                  categories: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN"],
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: {
                    style: { colors: "#64748b", fontSize: "12px" },
                  },
                },
                yaxis: {
                  labels: {
                    style: { colors: "#64748b", fontSize: "12px" },
                    formatter: (val) => `${val}kg`,
                  },
                },
                tooltip: {
                  theme: "dark", 
                  x: { show: false },
                  y: { formatter: (val) => `${val} kg` },
                },
              }}
              series={[
                {
                  name: "Peso",
                  data: [82.5, 81.2, 80.1, 78.5, 77.2, 75.4],
                },
              ]}
              type="area"
              height={300}
            />
          </div>
        </div>

        <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-default dark:border-gray-600 dark:bg-gray-dark lg:col-span-4">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/10">
              <FiActivity size={20} />
            </div>
            <h3 className="text-lg font-bold text-black dark:text-white">
              Estadísticas de Peso
            </h3>
          </div>

          <hr className="mb-6 border-gray-100 dark:border-gray-800" />

          <div className="mb-6">
            <p className="mb-1 text-sm text-gray-500">Cambio Total (6 Meses)</p>
            <div className="flex items-end gap-3">
              <h4 className="text-4xl font-bold text-black dark:text-white">
                -6.6{" "}
                <span className="text-xl font-medium text-gray-400">kg</span>
              </h4>
              <span className="mb-1.5 rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-500 dark:bg-green-500/10">
                ↓ 8.04%
              </span>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="dark:border-strokedark rounded-lg border border-stroke p-3 dark:border-gray-600">
              <p className="mb-1 flex items-center gap-1 text-[10px] uppercase text-gray-500">
                <FiArrowUp /> Máximo
              </p>
              <p className="font-bold text-black dark:text-white">
                82.0 <span className="text-xs text-gray-400">kg</span>
              </p>
              <p className="text-[10px] text-gray-400">01 Ene 2023</p>
            </div>
            <div className="dark:border-strokedark rounded-lg border border-stroke bg-blue-50/50 p-3 dark:border-gray-400 dark:bg-white/5">
              <p className="mb-1 flex items-center gap-1 text-[10px] uppercase text-gray-500">
                <FiArrowDown /> Mínimo
              </p>
              <p className="font-bold text-blue-600">
                75.4 <span className="text-xs text-gray-400">kg</span>
              </p>
              <p className="text-[10px] text-gray-400">Actual</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Tasa de Progreso</span>
              <span className="font-bold text-green-500">
                -0.27 kg / semana
              </span>
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <div className="absolute left-0 top-0 h-full w-[70%] bg-green-500"></div>
            </div>
            <p className="text-center text-xs text-gray-400">
              Proyección: 72kg en 12 semanas
            </p>
          </div>

          <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-white hover:bg-opacity-90">
            <FiDownload /> Descargar Reporte
          </button>
        </div>
      </div>
      <div className="mt-5"></div>
      <RecordTable data={measurements} />
    </div>
  );
}
