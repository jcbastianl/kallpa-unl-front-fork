import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { getRecords } from "@/hooks/api";
import { AssessmentsTable } from "@/components/Tables/assessments-table";

export const metadata: Metadata = {
  title: "Anthropometric Measurements Page",
};

export default async function AnthropometricPage() {
  const assessments = await getRecords();
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Historial Medidas Antropométricas" />
      <div className="space-y-10">
        <AssessmentsTable data={assessments} />
      </div>
    </div>
  );
}
