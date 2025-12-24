import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { AnthropometricForm } from "@/components/Forms/anthropometric-form";
export const metadata: Metadata = {
  title: "Anthropometric Measurements Page",
};

export default async function MeasurementsPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Historial Medidas antropométricas" />
      <div className="grid grid-cols-1 gap-9">
        <div className="flex flex-col gap-9">
          <AnthropometricForm />
        </div>
      </div>
    </div>
  );
};

