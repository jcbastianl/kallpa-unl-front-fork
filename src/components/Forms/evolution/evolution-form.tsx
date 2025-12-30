"use client";
import { FiActivity } from "react-icons/fi";
import { TestData } from "@/types/test";
import DatePickerTwo from "@/components/FormElements/DatePicker/DatePickerTwo";
interface EvolutionTestFormProps {
  test: TestData | null;
  participantExternalId: string;
  values: { [key: string]: number };
  setValues: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  observations: string;
  setObservations: React.Dispatch<React.SetStateAction<string>>;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
}
export function EvolutionTestForm({
  test,
  values,
  setValues,
  observations,
  setObservations,
  date,
  setDate,
}: EvolutionTestFormProps) {
  if (!test) return <p>No hay test seleccionado</p>;
  const handleChange = (externalId: string, value: number) => {
    setValues((prev) => ({ ...prev, [externalId]: value }));
  };

  return (
    <div className="rounded-[10px] bg-white p-4 shadow-1 transition-colors duration-300 dark:bg-[#1a222c] dark:shadow-none sm:p-6">
      <div className="dark:border-gray-600 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FiActivity size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              {test.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {test.description}
            </p>
          </div>
        </div>
        <span className="rounded border border-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          En Progreso
        </span>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
        {test.exercises.map((ex, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {idx + 1}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {ex.name}
                </span>
              </div>
            </div>
            <div className="relative flex items-center overflow-hidden rounded-lg border border-stroke bg-slate-50 focus-within:border-primary dark:border-slate-700 dark:bg-[#24303f]">
              <input
                type="number"
                placeholder="0"
                value={values[ex.external_id!] || ""}
                onChange={(e) =>
                  handleChange(ex.external_id!, Number(e.target.value))
                }
                className="h-12 w-full bg-transparent px-4 text-xl font-bold text-black outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600"
              />
              <div className="flex h-12 min-w-[110px] items-center justify-center border-l border-stroke bg-slate-100 px-3 text-[10px] font-extrabold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-[#2d3a4b] dark:text-slate-400">
                {ex.unit}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dark:border-strokedark mt-8 space-y-3 border-t border-stroke dark:border-gray-600 pt-6">
        <DatePickerTwo value={date} onChange={(newDate: string) => setDate(newDate)} />
        <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
          Observaciones Generales
        </label>
        <textarea
          rows={3}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Ingrese notas sobre el test..."
          className="w-full rounded-lg border border-stroke bg-slate-50 p-4 text-sm text-black outline-none transition-all focus:border-primary dark:border-slate-700 dark:bg-[#24303f] dark:text-white"
        />
      </div>
    </div>
  );
}