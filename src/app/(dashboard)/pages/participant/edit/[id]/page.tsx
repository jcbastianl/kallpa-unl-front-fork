"use client";
import { RegisterParticipantForm } from "@/components/Forms/register-participant-form";
import { use } from "react";

interface EditParticipantPageProps {
  params: Promise<{ id: string }>;
}

export default function EditParticipantPage({ params }: EditParticipantPageProps) {
  const { id } = use(params);

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <RegisterParticipantForm participantId={id} />
    </div>
  );
}
