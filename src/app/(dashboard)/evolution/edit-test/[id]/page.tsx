'use client'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTestById } from "@/hooks/api";
import { AssessmentForm } from "@/components/Forms/assessment-form";
import Loader from "@/components/Loader/loader";

export default function EditTestPage() {
  const { id } = useParams();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getTestById(id as string)
        .then((data) => setTestData(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <Loader size={60} color="text-blue-500" className="py-20" />;
  }

  if (!testData) return <p>No se encontró la evaluación.</p>;

  return (
    <div className="mx-auto max-w-7xl p-4">
      <AssessmentForm initialData={testData} />
    </div>
  );
}