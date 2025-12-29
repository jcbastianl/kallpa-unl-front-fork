import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { getParticipants } from "@/hooks/api";
import { ParticipantsTable } from "@/components/Tables/participant-table";

export const metadata: Metadata = {
  title: "Participant Page",
};

export default async function SettingsPage() {
  const participants = await getParticipants();

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Participantes" />
      <div className="space-y-10">        
        <ParticipantsTable data={participants}/>
      </div>
    </div>
  );
};

