"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ParticipantsTable } from "@/components/Tables/participant-table";
import { participantService } from "@/services/participant.service";
import type { Participant } from "@/types/participant";
import Loader from "@/components/Loader/loader";

export default function ParticipantPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await participantService.getAll();
      setParticipants(data);
    } catch (err) {
      setError("Ocurrió un problema con el servidor, espere un momento");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <Breadcrumb pageName="Lista Participantes" />
      <div className="mb-4 flex justify-end">
        <Link
          href="/pages/participant/register"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-center font-medium text-white transition hover:bg-opacity-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Registrar Nuevo
        </Link>
      </div>
      <div className="space-y-10">
        <ParticipantsTable data={participants} onStatusChange={fetchData} />
      </div>
    </div>
  );
}

