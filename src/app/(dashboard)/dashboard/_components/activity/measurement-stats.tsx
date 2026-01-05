'use client'
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import type { AssessmentResponseData } from "@/types/assessment";
import { getAnthropometricHistory } from "@/hooks/api";

export function MeasurementStats({ dateFrom, dateTo }: { dateFrom?: string, dateTo?: string }) {
  const [data, setData] = useState<{ date: string; avg_bmi: number; avg_weight: number; avg_height: number }[]>([]);

  useEffect(() => {
    getAnthropometricHistory() // llamada general, sin participante
      .then((res) => {
        // Agrupar por fecha
        const grouped: Record<string, { bmi: number[]; weight: number[]; height: number[] }> = {};

        res.forEach(a => {
          if (!grouped[a.date]) {
            grouped[a.date] = { bmi: [], weight: [], height: [] };
          }
          grouped[a.date].bmi.push(a.bmi);
          grouped[a.date].weight.push(a.weight);
          grouped[a.date].height.push(a.height);
        });

        // Calcular promedios
        const averaged = Object.entries(grouped).map(([date, values]) => ({
          date,
          avg_bmi: values.bmi.reduce((a, b) => a + b, 0) / values.bmi.length,
          avg_weight: values.weight.reduce((a, b) => a + b, 0) / values.weight.length,
          avg_height: values.height.reduce((a, b) => a + b, 0) / values.height.length,
        }));

        setData(averaged);
      })
      .catch(console.error);
  }, []);

  const series = [
    { name: "IMC", data: data.map(d => d.avg_bmi) },
    { name: "Peso", data: data.map(d => d.avg_weight) },
    { name: "Altura", data: data.map(d => d.avg_height) },
  ];

  const options: any = {
    chart: { type: "line", height: 350 },
    xaxis: { categories: data.map(d => d.date) },
    stroke: { curve: "smooth" },
    markers: { size: 4 },
  };

  return <Chart options={options} series={series} type="line" height={350} />;
}
