import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { AssessmentForm } from "@/components/Forms/assessment-form";
export const metadata: Metadata = {
  title: "Assessment Test Page",
};

export default async function FormAssessmentPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Furmulario Test" />
      <div className="grid grid-cols-1 gap-9">
        <div className="flex flex-col gap-9">
          <AssessmentForm />
        </div>
      </div>
    </div>
  );
}