"use client";

import { Column } from "@/components/Tables/tablebase";
import { AssessmentTableData } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { DownloadIcon, PreviewIcon } from "../icons";

export const assessmentColumns = (
  navigate: (path: string) => void,
): Column<AssessmentTableData>[] => [
  {
    header: "Participante",
    accessor: (a) => {
      const name = a.participant_name || "Sin nombre";
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-dark dark:text-white">
              {name}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    header: "Edad",
    accessor: "age",
    className: "dark:text-white text-dark font-medium",
  },
  {
    header: "Fecha",
    accessor: (a) => (
      <span className="text-gray-400">
        {new Date(a.date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    header: "IMC (BMI)",
    accessor: (a) => (
      <span className="text-base font-medium text-dark dark:text-white">
        {a.bmi}
      </span>
    ),
  },
  {
    header: "Estado",
    accessor: (a) => (
      <span
        className={cn(
          "rounded border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
          {
            "border-green-500/20 bg-green-500/10 text-green-500":
              a.status === "Peso adecuado",
            "border-yellow-500/20 bg-yellow-500/10 text-yellow-500":
              a.status === "Sobrepeso",
            "border-red-500/20 bg-red-500/10 text-red-500":
              a.status === "Obesidad" || a.status === "Bajo peso",
          },
        )}
      >
        {a.status}
      </span>
    ),
  },
  {
    header: "Acciones",
    headerClassName: "text-right",
    accessor: (a) => (
      <div className="flex items-center justify-end gap-x-4 text-gray-400">
        <button
          className="transition-colors hover:text-dark dark:hover:text-white"
          onClick={() => navigate("/pages/anthropometric/measurements")}
        >
          <PreviewIcon />
        </button>

        <button
          className="transition-colors hover:text-dark dark:hover:text-white"
          onClick={() => console.log("Descargar", a.external_id)}
        >
          <DownloadIcon />
        </button>
      </div>
    ),
  },
];
