"use client";

import { Column } from "@/components/Tables/tablebase";
import { AssessmentTableData } from "@/types/assessment";
import { cn } from "@/lib/utils";

export const recordColumns = (
  navigate: (path: string) => void,
): Column<AssessmentTableData>[] => [
  {
    header: "Fecha",
    accessor: (a) => (
      <span className="text-base font-medium text-dark dark:text-white">
        {new Date(a.date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    header: "Peso",
    accessor: (a) => <span className="text-gray-400">{a.weight} kg</span>,
  },
  {
    header: "Altura",
    accessor: (a) => <span className="text-gray-400">{a.height} m</span>,
  },
  {
    header: "Cintura",
    accessor: (a) => <span className="text-gray-400">{a.waistPerimeter} cm</span>,
  },
  {
    header: "Brazo",
    accessor: (a) => <span className="text-gray-400">{a.armPerimeter} cm</span>,
  },
  {
    header: "Pierna",
    accessor: (a) => <span className="text-gray-400">{a.legPerimeter} cm</span>,
  },
  {
    header: "Pantorrilla",
    accessor: (a) => <span className="text-gray-400">{a.calfPerimeter} cm</span>,
  },
  {
    header: "IMC (BMI)",
    accessor: (a) => <span className="text-gray-400">{a.bmi}</span>,
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
];
