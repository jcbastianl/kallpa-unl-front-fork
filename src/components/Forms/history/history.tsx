import { getParticipantProgress } from "@/hooks/api";
import { ParticipantProgressResponse } from "@/types/test";
import Chart from "react-apexcharts";
import React, { useEffect, useMemo, useState } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiActivity,
} from "react-icons/fi";
import { Select } from "@/components/FormElements/select";

interface PerformanceDashboardProps {
  participantId?: string;
}

export default function PerformanceDashboard({
  participantId,
}: PerformanceDashboardProps) {
  const [progress, setProgress] =
    useState<ParticipantProgressResponse | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const isEmpty = !participantId || !progress;
  const canShowChart = !!selectedTest && !!selectedExercise && !isEmpty;
  const safeExercise = selectedExercise ?? "";
  const safeSeriesName = selectedExercise ?? "Sin datos";
  const hasParticipant = !!participantId;

  useEffect(() => {
    if (!participantId) {
      setProgress(null);
      return;
    }
    getParticipantProgress(participantId)
      .then(setProgress)
      .catch(console.error)
  }, [participantId]);

  const tests = useMemo(() => {
    if (!progress) return [];
    return Array.from(
      new Set(progress.progress.map((p) => p.test_name))
    );
  }, [progress]);

  useEffect(() => {
    if (!selectedTest && tests.length > 0) {
      setSelectedTest(tests[0]);
    }
  }, [tests, selectedTest]);

  useEffect(() => {
    setSelectedExercise(null);
  }, [selectedTest]);

  const exercises = useMemo(() => {
    if (!progress || !selectedTest) return [];
    return Array.from(
      new Set(
        progress.progress
          .filter((p) => p.test_name === selectedTest)
          .flatMap((p) => Object.keys(p.results))
      )
    );
  }, [progress, selectedTest]);

  useEffect(() => {
    if (!selectedExercise && exercises.length > 0) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise]);

  const filteredProgress = useMemo(() => {
    if (!progress || !selectedTest || !selectedExercise) return [];

    return progress.progress.filter(
      (p) =>
        p.test_name === selectedTest &&
        p.results[selectedExercise] !== undefined
    );
  }, [progress, selectedTest, selectedExercise]);

  const values = isEmpty || !safeExercise
  ? [0]
  : filteredProgress.map(
      (p) => p.results[safeExercise] ?? 0
    );

  const categories = isEmpty ? ["Eval 1"] : filteredProgress.map(
    (_, index) => `Eval ${index + 1}`
  );

  const lastValue = values.at(-1) ?? 0;
  const prevValue = values.at(-2) ?? lastValue;
  const maxValue = Math.max(...values);
  const avgValue =
    values.reduce((a, b) => a + b, 0) / values.length;

  const delta = lastValue - prevValue;
  const percentChange =
    prevValue !== 0 ? (delta / prevValue) * 100 : 0;

  const trend =
    delta > 0 ? "up" : delta < 0 ? "down" : "same";

  const series = [
    {
      name: safeSeriesName,
      data: values,
    },
  ];

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-500">
          <FiActivity size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Progreso físico
          </h2>
          <p className="text-xs text-slate-500">
            Evolución por ejercicio y total del test
          </p>
        </div>
      </div>
      {!hasParticipant && (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-400">
        Selecciona un participante para ver el progreso físico
      </div>
    )}
    {hasParticipant && (
      <>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Test"
          placeholder=""
          items={tests.map((t) => ({ value: t, label: t }))}
          value={selectedTest ?? undefined}
          onChange={(e) => setSelectedTest(e.target.value)}
        />

        <Select
          label="Ejercicio"
          placeholder=""
          items={exercises.map((e) => ({
            value: e,
            label: e,
          }))}
          value={selectedExercise ?? undefined}
          onChange={(e) => setSelectedExercise(e.target.value)}
        />
      </div>
      {canShowChart ? (
        <>
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI label="Último" value={lastValue} />
            <KPI label="Mejor" value={maxValue} />
            <KPI label="Promedio" value={avgValue.toFixed(1)} />
            <KPI
              label="Cambio"
              value={`${percentChange.toFixed(1)}%`}
              trend={trend}
            />
          </div>
          <Chart
            type="line"
            height={320}
            series={series}
            options={{
              xaxis: { categories },
              stroke: { curve: "smooth", width: 3 },
              markers: { size: 5 },
              colors: ["#3b82f6"],
              tooltip: {
                custom: ({ dataPointIndex }) => {
                  const item = filteredProgress[dataPointIndex];
                  return `
          <div style="padding:8px;font-size:12px; border-radius: 4px;">
            <strong>${categories[dataPointIndex]}</strong><br/>
            ${selectedExercise}: <strong>${item.results[selectedExercise]}</strong><br/>
            ${item.general_observations ? `<hr/>${item.general_observations}` : ""}
          </div>
        `;
                },
              },
            }}
          />
        </>
        ) : (
          <div className="h-[320px] flex items-center justify-center text-sm text-gray-400 border rounded-lg">
            Seleccione un test y ejercicio
          </div>
        )}
      </>
    )}
    </div>
  );
}

function KPI({
  label,
  value,
  trend,
}: {
  label: string;
  value: React.ReactNode;
  trend?: "up" | "down" | "same";
}) {
  return (
    <div className="rounded-lg border p-3 dark:bg-dark-2 dark:border-slate-700 border-slate-200 bg-white">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold text-black dark:text-white">
        {value}
        {trend === "up" && (
          <FiTrendingUp className="text-green-500" />
        )}
        {trend === "down" && (
          <FiTrendingDown className="text-red-500" />
        )}
      </p>
    </div>
  );
}
