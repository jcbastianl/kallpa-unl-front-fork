'use client'
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { getBmiDistribution } from "@/hooks/api";
interface BmiDistributionItem {
  label: string;
  value: number;
}
export default function MeasurementStats() {
  const [data, setData] = useState<BmiDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  useEffect(() => {
    getBmiDistribution()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando distribución IMC...</p>;

  const categories = data.map(item => item.label);
  const values = data.map(item => item.value);

  const series = [
    {
      name: "Cantidad de evaluaciones",
      data: values,
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "45%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "14px",
        fontWeight: 600,
      },
    },
    legend: { show: false },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "13px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Número de evaluaciones",
      },
    },
    colors: [
      "#03A9F4",
      "#4CAF50", 
      "#FF9800", 
      "#F44336", 
    ],
    tooltip: {
      y: {
        formatter: (val: number) => `${val} evaluaciones`,
      },
    },
    title: {
      text: "Distribución por estado nutricional",
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
        color: isDark ? "#111827" : "white",
      },
    },
  };

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      height={350}
    />
  );
}