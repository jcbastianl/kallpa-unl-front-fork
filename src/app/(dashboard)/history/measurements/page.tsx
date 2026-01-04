"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { HistoryTable } from "@/components/Tables/history-table";
import { getParticipants } from "@/hooks/api";
import Loader from "@/components/Loader/loader";
import type { Participant } from "@/types/participant";

export default function HistoryPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getParticipants();
        setParticipants(data);
      } catch (err) {
        setError("Ocurrió un problema con el servidor, espere un momento");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold text-red-600">
          Ocurrió un problema con el servidor
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Espere un momento e intente nuevamente
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Historial - Participantes" />
      <div className="space-y-10">
        <HistoryTable data={participants} />
      </div>
    </div>
  );
}
