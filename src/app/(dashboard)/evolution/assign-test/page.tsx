import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { AssignTest } from "@/components/Forms/evolution/assign-test";
export const metadata: Metadata = {
  title: "Assessment Test Page",
};

export default async function AssignTestPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Aplicar Test" />
      <div className="grid grid-cols-1 gap-9">
        <div className="flex flex-col gap-9">
          <AssignTest />
        </div>
      </div>
    </div>
  );
}