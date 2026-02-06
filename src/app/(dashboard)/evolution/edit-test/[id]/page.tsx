import EditTestClient from "./client";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export default function EditTestPage() {
  return <EditTestClient />;
}