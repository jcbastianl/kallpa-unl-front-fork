"use client";
import { RegisterParticipantForm } from "@/components/Forms/register-participant-form";
import { useParams } from "next/navigation";

export default function EditParticipantClient() {
  const { id } = useParams();

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <RegisterParticipantForm participantId={id as string} />
    </div>
  );
}
