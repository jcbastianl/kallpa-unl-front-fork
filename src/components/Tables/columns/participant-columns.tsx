"use client";
import { Column } from "@/components/Tables/tablebase";
import { Participant } from "@/types/participant";
import { cn } from "@/lib/utils";
import { FiEdit, FiToggleLeft, FiToggleRight } from "react-icons/fi";

interface ParticipantColumnsOptions {
  onToggleStatus?: (participant: Participant) => void;
  onEdit?: (participant: Participant) => void;
  loadingId?: string | null;
}

export const getParticipantColumns = (
  options: ParticipantColumnsOptions = {}
): Column<Participant>[] => {
  const { onToggleStatus, onEdit, loadingId } = options;

  return [
    {
      header: "Nombres",
      accessor: (p) => {
        const name = `${p.firstName} ${p.lastName ?? ""}`.trim();
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
                {name || "Sin nombre"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Dni",
      accessor: (p) => p.dni || "-",
      className: "font-medium text-dark dark:text-white",
    },
    {
      header: "Email",
      accessor: (p) => p.email || "-",
      className: "font-medium text-dark dark:text-white",
    },
    {
      header: "Tipo",
      accessor: (p) => p.type || p.role || "-",
      className: "font-medium text-dark dark:text-white",
    },
    {
      header: "Estado",
      accessor: (p) => (
        <span
          className={cn(
            "rounded border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
            {
              "border-green-500/20 bg-green-500/10 text-green-500":
                p.status === "ACTIVO",
              "border-red-500/20 bg-red-500/10 text-red-500":
                p.status === "INACTIVO",
              "bg-gray-100 text-gray-700": !p.status,
            }
          )}
        >
          {p.status || "-"}
        </span>
      ),
    },
    {
      header: "Acciones",
      headerClassName: "text-center",
      accessor: (p) => {
        const isLoading = loadingId === p.id;
        const isActive = p.status === "ACTIVO";

        return (
          <div className="flex items-center justify-center gap-1 text-gray-400">
            {onEdit && (
              <button
                onClick={() => onEdit(p)}
                title="Editar participante"
                className="rounded-md p-1.5 text-blue-500 transition-all duration-200 hover:bg-blue-500/10 hover:text-blue-600"
              >
                <FiEdit size={18} />
              </button>
            )}
            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(p)}
                disabled={isLoading}
                title={isActive ? "Desactivar participante" : "Activar participante"}
                className={cn(
                  "rounded-md p-1.5 transition-all duration-200",
                  isLoading && "cursor-not-allowed opacity-50",
                  isActive
                    ? "text-green-500 hover:bg-green-500/10 hover:text-green-600"
                    : "text-red-400 hover:bg-red-500/10 hover:text-red-500"
                )}
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isActive ? (
                  <FiToggleRight size={22} />
                ) : (
                  <FiToggleLeft size={22} />
                )}
              </button>
            )}
          </div>
        );
      },
    },
  ];
};

// Mantener compatibilidad con código existente
export const participantColumns = getParticipantColumns();

