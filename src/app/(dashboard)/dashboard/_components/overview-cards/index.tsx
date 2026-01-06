"use client";
import { compactFormat } from "@/lib/format-number";
import { OverviewCard } from "./card";
import { FiBox, FiCalendar, FiClock, FiSmile, FiUserCheck, FiUsers } from "react-icons/fi";
import { participantService } from "@/services/participant.service";
import { useEffect, useState } from "react";

export function OverviewCardsGroup() {
  const [overviewData, setOverviewData] = useState({
    views: { value: 0, growthRate: 0 },
    profit: { value: 0, growthRate: 0 },
    products: { value: 0, growthRate: 0 },
    users: { value: 0, growthRate: 0 },
  });
  const [adultCount, setAdultCount] = useState(0);
  const [minorCount, setMinorCount] = useState(0);

  useEffect(() => {
    participantService
      .getActiveParticipantsCounts()
      .then((data) => {
        setAdultCount(data.adult);
        setMinorCount(data.minor);
      })
      .catch(console.error);
  }, []);

  const { products, users } = overviewData;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-7.5">
        <OverviewCard
          label="Participantes (>18)"
          data={{ value: adultCount, growthRate: 0 }}
          Icon={FiUserCheck}
          variant="green"
        />
        <OverviewCard
          label="Participantes (<18)"
          data={{ value: minorCount, growthRate: 0 }}
          Icon={FiSmile}
          variant="orange"
        />
        <OverviewCard
          label="Asistencia"
          data={{ ...products, value: compactFormat(products.value) }}
          Icon={FiCalendar}
          variant="purple"
        />
        <OverviewCard
          label="Pruebas Pendientes"
          data={{ ...users, value: compactFormat(users.value) }}
          Icon={FiClock}
          variant="blue"
        />
      </div>
    </div>
  );
}
