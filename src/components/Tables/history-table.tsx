"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { Participant } from "@/types/participant";
import { AssessmentResponseData } from "@/types/assessment";
import { MeasurementsForm } from "../Forms/measurements-form";
import { getAssessmentsByParticipant } from "@/hooks/api";
import { Button } from "../ui-elements/button";

export function HistoryTable({ data }: { data: Participant[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [measurements, setMeasurements] = useState<AssessmentResponseData[]>([]);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const emptyParticipant: Participant = {
    id: "",
    firstName: "",
    lastName: "",
    dni: "",
    type: "PARTICIPANTE",
  };
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];

    return data.filter((item) => {
      const fullName = `${item.firstName} ${item.lastName ?? ""}`.toLowerCase();
      const dni = item.dni?.toLowerCase() ?? "";

      const matchesSearch =
        !term || fullName.includes(term) || dni.includes(term);

      return matchesSearch;
    });
  }, [searchTerm, data]);
  const handleSelectParticipant = async (participant: Participant) => {
    setSelectedParticipant(participant);
    setSearchTerm("");
    setLoadingMeasurements(true);
    try {
      const res = await getAssessmentsByParticipant(participant.external_id ?? participant.id);
      setMeasurements(res.assessments);
    } catch (err) {
      console.error("Error al cargar mediciones", err);
      setMeasurements([]);
    } finally {
      setLoadingMeasurements(false);
    }
  };
  const handleResetSearch = () => {
    setSelectedParticipant(null);
    setMeasurements([]);
    setSearchTerm("");
  };
  return (
    <div className="flex flex-col gap-3">
      {selectedParticipant && (
        <Button
        label="Volver a buscar"
        icon={<span>←</span>}
        variant="outlineDark"
        size="small"
        shape="rounded"
        onClick={handleResetSearch}
        className="w-fit" 
      />
      )}
      {!selectedParticipant && (
        <>
          <div className="dark:bg-gray-dark flex items-center gap-4 rounded-xl border border-stroke bg-white p-2 dark:border-dark-3 dark:bg-gray-dark">
            <div className="relative flex flex-grow items-center">
              <span className="text-body absolute left-4">
                <FiSearch size={20} />
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre o DNI"
                className="text-slate-500 w-full bg-transparent py-3 pl-12 pr-4 text-sm outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {searchTerm && (
            <div className="flex flex-col gap-3">
              {filteredData.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm pl-2">
                  No se encontraron participantes.
                </p>
              ) : (
                filteredData.map((participant, index) => {
                  const initials = `${participant.firstName.charAt(0)}${participant.lastName?.charAt(0) || ""}`.toUpperCase();

                  return (
                    <div
                      key={`${participant.id}-${index}`}
                      onClick={() => handleSelectParticipant(participant)}
                      className="group flex items-center justify-between cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm dark:bg-blue-900/30 dark:text-blue-400">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {participant.firstName} {participant.lastName}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                            {participant.dni}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
      <MeasurementsForm
        participant={selectedParticipant ?? emptyParticipant}
        measurements={measurements}
      />
      {loadingMeasurements && <p className="text-sm text-gray-500 mt-2">Cargando mediciones...</p>}
    </div>
  );
}
