"use client";

import { TableBase } from "@/components/Tables/tablebase";
import { participantColumns } from "@/components/Tables/columns/participant-columns";
import { Participant } from "@/types/participant";

export function ParticipantsTable({
  data,
}: {
  data: Participant[];
}) {
  return (
    <TableBase
      columns={participantColumns}
      data={data}
      rowKey={(p) => p.external_id}
    />
  );
}
