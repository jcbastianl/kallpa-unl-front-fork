"use client";
import { Column } from "@/components/Tables/tablebase";
import { Participant } from "@/types/participant";
import { cn } from "@/lib/utils";

export const participantColumns: Column<Participant>[] = [
  {
    header: "Nombre",
    accessor: (p) => `${p.firstName} ${p.lastName}`,
  },
  {
    header: "Email",
    accessor: "email",
  },
  {
    header: "Tipo",
    accessor: "type",
  },
  {
    header: "Estado",
    accessor: (p) => (
      <span
        className={cn(
          "rounded-full px-3 py-1 text-sm font-medium",
          {
            "bg-green-100 text-green-700": p.status === "ACTIVO",
            "bg-red-100 text-red-700": p.status === "INACTIVO",
          },
        )}
      >
        {p.status}
      </span>
    ),
  },
];
