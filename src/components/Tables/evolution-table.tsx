"use client";

import { useMemo, useState } from "react";
import { AssessmentTableData } from "@/types/assessment";
import { FiSearch, FiFilter, FiChevronDown } from "react-icons/fi";
import { useRouter } from "next/navigation";
interface EvolutionTableProps {
    data: AssessmentTableData[];
    selectedParticipant: AssessmentTableData | null;
    onSelectParticipant: (participant: AssessmentTableData) => void;
}
export function EvolutionTable({
    data,
    selectedParticipant,
    onSelectParticipant,
}: EvolutionTableProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const term = searchTerm.toLowerCase();
            const matchesName = item.participant_name.toLowerCase().includes(term);
            const matchesDNI = item.dni ? item.dni.toString().includes(term) : false;

            return matchesName || matchesDNI;
        });
    }, [searchTerm, data]);
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
            </div>
            <div className="overflow-hidden rounded-xl border border-stroke">
                {filteredData.map((row) => {
                    const isSelected =
                        selectedParticipant?.external_id === row.external_id;
                    return (
                        <div
                            key={row.external_id}
                            onClick={() => onSelectParticipant(row)}
                            className={`flex cursor-pointer items-center justify-between p-3 transition ${isSelected
                                    ? "bg-primary/10"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                                    {row.participant_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold leading-tight text-dark dark:text-white">
                                        {row.participant_name}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {row.dni}
                                    </span>
                                </div>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {row.age} años
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}