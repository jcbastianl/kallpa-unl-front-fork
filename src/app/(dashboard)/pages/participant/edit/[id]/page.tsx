import EditParticipantClient from "./client";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export default function EditParticipantPage() {
  return <EditParticipantClient />;
}
