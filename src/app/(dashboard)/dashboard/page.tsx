import { Suspense } from "react";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { RecentActivity } from "./_components/activity/recent-activity";
import { PendingPhysicalTests } from "./_components/activity/pending-test";
import MeasurementStats from "./_components/activity/measurement-stats";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Suspense fallback={null}>
          <div className="xl:col-span-1">
            <RecentActivity />
          </div>

          <div className="flex flex-col gap-6 xl:col-span-2">
            <MeasurementStats/>
            {/* <PendingPhysicalTests /> */}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
