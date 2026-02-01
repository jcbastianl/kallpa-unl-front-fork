"use client";
import { RegisterParticipantForm } from "@/components/Forms/register-participant-form";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { use } from "react";

interface EditParticipantPageProps {
  params: Promise<{ id: string }>;
}

export default function EditParticipantPage({ params }: EditParticipantPageProps) {
  const { id } = use(params);

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Editar Participante" />
      <RegisterParticipantForm participantId={id} />
    </div>
  );
}
