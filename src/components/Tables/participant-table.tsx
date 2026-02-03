"use client";

import { TableBase } from "@/components/Tables/tablebase";
import { getParticipantColumns } from "@/components/Tables/columns/participant-columns";
import { Participant } from "@/types/participant";
import { participantService } from "@/services/participant.service";
import { useMemo, useState, useCallback } from "react";
import { FiChevronDown, FiFilter, FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface ParticipantsTableProps {
  data: Participant[];
  onStatusChange?: (updatedParticipantId: string, newStatus: "ACTIVO" | "INACTIVO") => void | Promise<void>;
}

export function ParticipantsTable({ data, onStatusChange }: ParticipantsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const statusOptions = ["TODOS", "ACTIVO", "INACTIVO"];
  const [participantsState, setParticipantsState] = useState<Participant[]>(data);

  const handleToggleStatus = useCallback(
    async (participant: Participant) => {
      if (!participant.id) return;

      const newStatus = participant.status === "ACTIVO" ? "INACTIVO" : "ACTIVO";

      try {
        setLoadingId(participant.id);
        await participantService.changeStatus(participant.id, newStatus);

        setParticipantsState((prev) =>
          prev.map((p) =>
            p.id === participant.id ? { ...p, status: newStatus } : p
          )
        );

        if (onStatusChange) {
          await onStatusChange(participant.id, newStatus);
        }
      } catch (error: any) {
        if (error?.message === "SESSION_EXPIRED" || error?.message === "SERVER_DOWN") return;
        console.error("Error al cambiar estado:", error);
      } finally {
        setLoadingId(null);
      }
    },
    [onStatusChange]
  );


  const handleEdit = useCallback((participant: Participant) => {
    if (participant.id) {
      router.push(`/pages/participant/edit/${participant.id}`);
    }
  }, [router]);

  const columns = useMemo(
    () => getParticipantColumns({ onToggleStatus: handleToggleStatus, onEdit: handleEdit, loadingId }),
    [handleToggleStatus, handleEdit, loadingId]
  );

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return data.filter((item) => {
      const fullName = `${item.firstName} ${item.lastName ?? ""}`.toLowerCase();
      const dni = item.dni?.toLowerCase() ?? "";

      const matchesSearch =
        !term || fullName.includes(term) || dni.includes(term);

      const matchesStatus =
        statusFilter === "TODOS" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, data]);

  const isEmpty = filteredData.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="dark:border-strokedark dark:bg-meta-4 flex items-center gap-4 rounded-xl border border-stroke bg-gray-2 bg-white p-2 dark:border-dark-3 dark:bg-gray-dark">
        <div className="relative flex flex-grow items-center">
          <span className="text-body absolute left-4">
            <FiSearch size={20} />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o DNI"
            className="placeholder:text-body w-full bg-transparent py-3 pl-12 pr-4 text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="dark:bg-strokedark h-8 w-[1px] bg-stroke dark:bg-gray-500"></div>
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
          >
            Estado: {statusFilter}
            <FiChevronDown />
          </button>
          {isFilterOpen && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-white/10 bg-white p-1 shadow-2xl dark:bg-[#1a2233]">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setStatusFilter(option);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${statusFilter === option
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-dark dark:hover:text-white"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="text-body flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition-colors hover:bg-white/10">
          <FiFilter size={18} />
        </button>
      </div>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center dark:border-gray-600 dark:bg-gray-800">
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            No hay registros para mostrar
          </p>
        </div>
      ) : (
        <TableBase
          columns={columns}
          data={filteredData}
          rowKey={(p) => String(p.id)}
        />
      )}
    </div>
  );
}

