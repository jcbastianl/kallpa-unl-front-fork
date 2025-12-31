import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { RegisterParticipantForm } from "@/components/Forms/register-participant-form";

export default function RegisterParticipantPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Registrar Participante" />
      <RegisterParticipantForm />
    </div>
  );
}
