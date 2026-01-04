"use client";
import { compactFormat } from "@/lib/format-number";
import { OverviewCard } from "./card";
import { FiActivity, FiBox, FiUsers } from "react-icons/fi";
import { participantService } from "@/services/participant.service";
import { useEffect, useState } from "react";
import { getAverageBMI } from "@/hooks/api";

export function OverviewCardsGroup() {
  const [overviewData, setOverviewData] = useState({
    views: { value: 0, growthRate: 0 },
    profit: { value: 0, growthRate: 0 },
    products: { value: 0, growthRate: 0 },
    users: { value: 0, growthRate: 0 },
  });
  const [activeParticipants, setActiveParticipants] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [averageBMI, setAverageBMI] = useState<number | null>(null);

  useEffect(() => {
    // Traer participantes y calcular activos
    participantService.getAll().then((participants) => {
      const active = participants.filter((p) => p.status === "ACTIVO").length;
      setActiveParticipants(active);
      setTotalParticipants(participants.length);
    });

    // Traer promedio de IMC
    getAverageBMI().then((data) => {
      setAverageBMI(data.average_bmi);
    });
  }, []);

  const activeRate = totalParticipants
    ? (activeParticipants / totalParticipants) * 100
    : 0;

  const { products, users } = overviewData;

  return (
    <div className="flex flex-col gap-6"> 
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-7.5">
        <OverviewCard
          label="Participantes"
          data={{ value: activeParticipants, growthRate: activeRate }}
          Icon={FiUsers}
          variant="green"
        />
        <OverviewCard
          label="Promedio de IMC"
          data={{
            value: averageBMI !== null ? averageBMI.toFixed(2) : "-",
            growthRate: 0,
          }}
          Icon={FiActivity}
          variant="orange"
        />
        <OverviewCard
          label="Asistencia del día"
          data={{ ...products, value: compactFormat(products.value) }}
          Icon={FiBox}
          variant="purple"
        />
        <OverviewCard
          label="Pruebas Pendientes"
          data={{ ...users, value: compactFormat(users.value) }}
          Icon={FiUsers}
          variant="blue"
        />
      </div>
    </div>
  );
}
