"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ParticipantsTable } from "@/components/Tables/participant-table";
import { participantService } from "@/services/participant.service";
import type { Participant } from "@/types/participant";
import Loader from "@/components/Loader/loader";
import { Button } from "@/components/ui-elements/button";
import { useSession } from "@/context/SessionContext";

export default function ParticipantPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { serverDown } = useSession();

  const fetchData = useCallback(async () => {
    try {
      const data = await participantService.getAll();
      setParticipants(data);
    } catch (error: any) {
      if (error?.message === "SESSION_EXPIRED" || error?.message === "SERVER_DOWN") return;
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (updatedParticipantId: string, newStatus: "ACTIVO" | "INACTIVO") => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === updatedParticipantId ? { ...p, status: newStatus } : p
      )
    );
  };


  if (serverDown) return null;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <div className="mb-4 flex justify-end">
        <Button
          label="Registrar Nuevo"
          shape="rounded"
          size="small"
          onClick={() => router.push("/pages/participant/register")}
          icon={
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
          }
        />
      </div>
      <div className="space-y-10">
        <ParticipantsTable data={participants} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}

