"use client";

import { useMemo, useState } from "react";
import { TableBase } from "@/components/Tables/tablebase";
import { AssessmentResponseData} from "@/types/assessment";
import { useRouter } from "next/navigation";
import { recordColumns } from "./columns/record-columns";

export function RecordTable({ data }: { data: AssessmentResponseData[] }) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const itemDate = new Date(item.date).getTime();

      const fromOk = fromDate
        ? itemDate >= new Date(fromDate).getTime()
        : true;

      const toOk = toDate
        ? itemDate <= new Date(toDate).getTime()
        : true;

      return fromOk && toOk;
    });
  }, [data, fromDate, toDate]);
  return (
    <div className="flex flex-col gap-5">
      <TableBase
        columns={recordColumns((path) => router.push(path))} 
        data={filteredData}
        rowKey={(a) => a.external_id}
      />
    </div>
  );
}
