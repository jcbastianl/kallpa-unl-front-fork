"use client";

import { useMemo, useState } from "react";
import { TableBase } from "@/components/Tables/tablebase";
import { assessmentColumns } from "@/components/Tables/columns/assessment-columns";
import { AssessmentTableData } from "@/types/assessment";
import { FiSearch, FiFilter, FiChevronDown } from "react-icons/fi";
import { useRouter } from "next/navigation";

export function AssessmentsTable({ data }: { data: AssessmentTableData[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const statusOptions = [
    "Todos",
    "Peso adecuado",
    "Sobrepeso",
    "Obesidad",
    "Bajo peso",
  ];
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesName = item.participant_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "Todos" || item.status === statusFilter;

      return matchesName && matchesStatus;
    });
  }, [searchTerm, statusFilter, data]);
  return (
    <div className="flex flex-col gap-5">
      <div className="dark:border-strokedark dark:bg-meta-4 flex items-center gap-4 rounded-xl border border-stroke bg-gray-2 p-2 dark:border-dark-3 dark:bg-gray-dark bg-white">
        <div className="relative flex flex-grow items-center">
          <span className="text-body absolute left-4">
            <FiSearch size={20} />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre"
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
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-white/10 dark:bg-[#1a2233] bg-white p-1 shadow-2xl">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setStatusFilter(option);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    statusFilter === option
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
      <TableBase
        columns={assessmentColumns((path) => router.push(path))} 
        data={filteredData}
        rowKey={(a) => a.external_id}
      />
    </div>
  );
}
