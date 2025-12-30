"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { MeasurementsForm } from "@/components/Forms/measurements-form";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAssessmentsByParticipant } from "@/hooks/api";
import { Participant } from "@/types/participant";
import { AssessmentResponseData } from "@/types/assessment";
// export const metadata: Metadata = {
//   title: "Anthropometric Measurements Page",
// };

export default function MeasurementPage() {
  const params = useParams<{ participantId: string }>();
  const participantId = params.participantId;

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [assessments, setAssessments] = useState<AssessmentResponseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!participantId) return;

    const load = async () => {
      try {
        const res = await getAssessmentsByParticipant(participantId);
        console.log("API:--", res)
        setParticipant(res.participant);
        setAssessments(res.assessments);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [participantId]);

  if (loading) return <p>Cargando historial...</p>;

if (!participant) {
  return <p>No se encontró el participante</p>;
}
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Medidas antropométricas" />
      <div className="grid grid-cols-1 gap-9">
        <div className="flex flex-col gap-9">
          <MeasurementsForm
            participant={participant}
            measurements={assessments}
          />
        </div>
      </div>
    </div>
  );
}
