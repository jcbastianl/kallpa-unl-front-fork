import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { ListTest } from "@/components/Forms/evolution/list-test";
export const metadata: Metadata = {
  title: "Assessment Test Page",
};

export default async function EvaluationPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Evaluaciones Registradas" />
      <div className="grid grid-cols-1 gap-9">
        <div className="flex flex-col gap-9">
          <ListTest/>
        </div>
      </div>
    </div>
  );
}