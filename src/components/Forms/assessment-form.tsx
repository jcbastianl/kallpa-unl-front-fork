"use client";
import { useEffect, useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { FiCalendar, FiClipboard, FiEdit, FiSave } from "react-icons/fi";
import ErrorMessage from "../FormElements/errormessage";
import { TextAreaGroup } from "../FormElements/InputGroup/text-area";
import { saveTest, updateTest } from "@/hooks/api";
import { Select } from "../FormElements/select";
import { Alert } from "@/components/ui-elements/alert";
import { useRouter } from "next/navigation";
import { Button } from "../ui-elements/button";
import { RefreshCw } from "lucide-react";

interface AssessmentInitialData {
  external_id?: string;
  name: string;
  description: string;
  frequency_months: number | string;
  exercises: { name: string; unit: string }[];
}

export function AssessmentForm({ initialData }: { initialData?: AssessmentInitialData }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyMonths, setFrequencyMonths] = useState("");
  const [exercises, setExercises] = useState<{ name: string; unit: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? "");
      setFrequencyMonths(initialData.frequency_months?.toString() ?? "");
      setExercises(initialData.exercises ?? []);
    }
  }, [initialData]);

  const isEditing = !!initialData?.external_id;
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<
    "success" | "warning" | "error"
  >("success");
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    description: "",
  });

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    setShowAlert(false);

    const payload: any = {
      name: name.trim(),
      description: description.trim(),
      exercises: exercises.map(e => ({
        name: e.name.trim(),
        unit: e.unit.trim(),
      })),
      external_id: initialData?.external_id
    };

    if (frequencyMonths !== "") {
      payload.frequency_months = Number(frequencyMonths);
    }

    try {
      const res = isEditing
        ? await updateTest(payload)
        : await saveTest(payload);

      if (res && res.status === "ok") {
        setAlertVariant("success");
        setAlertMessage({
          title: isEditing ? "Evaluación actualizada correctamente" : "Evaluación creado correctamente",
          description: "Los cambios se guardaron con exitó",
        });
        setShowAlert(true);
        setTimeout(() => router.push("/evolution/list-test"), 1500);
      } else if (res && res.status === "error") {
        throw { response: { data: res } };
      }
    } catch (err: any) {
      const response = err.response?.data;
      if (response && response.status === "error") {
        const errorSource = response.data?.validation_errors || response.data;
        if (errorSource && typeof errorSource === "object") {
          const fieldErrors: Record<string, string> = {};
          Object.entries(errorSource).forEach(([key, value]) => {
            if (typeof value === "string") fieldErrors[key] = value;
          });
          setErrors(fieldErrors);
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <ShowcaseSection
      icon={<FiEdit size={24} />}
      title={isEditing ? "Editar Evaluación" : "Registro Nueva Evaluación"}
      description={
        isEditing
          ? `Modificando los datos de: ${initialData?.name}`
          : "Ingresa los datos para crear una nueva evaluación"
      }
      badgeText={isEditing ? "Modo Edición" : "Nuevo Ingreso"}
    >
      {showAlert && (
        <Alert
          variant={alertVariant}
          title={alertMessage.title}
          description={alertMessage.description}
          className="mb-6"
        />
      )}

      <form
        action="#"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 lg:flex-row lg:gap-6"
      >
        <div className="flex w-full flex-col gap-4 lg:w-1/3 lg:gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-dark dark:text-white">
              Información General
            </h2>
          </div>

          <div className="space-y-1">
            <div className="flex flex-col gap-1">
              <InputGroup
                label="Nombre de la Evaluación"
                type="text"
                placeholder="Ej. Test de Fuerza Máxima"
                className="flex-grow"
                value={name}
                handleChange={(e) => {
                  setName(e.target.value);
                  clearFieldError("name");
                }}
                iconPosition="left"
                icon={<FiClipboard className="text-gray-400" size={18} />}
              />
              <ErrorMessage message={errors.name} />
            </div>
            <div className="flex flex-col gap-1">
              <InputGroup
                label="Frecuencia (en meses)"
                type="text"
                placeholder="1–12"
                className="flex-grow"
                value={frequencyMonths}
                handleChange={(e) => {
                  const v = e.target.value;

                  if (v === "" || (/^\d+$/.test(v) && +v >= 1 && +v <= 12)) {
                    setFrequencyMonths(v);
                    clearFieldError("frequency_months");
                  }
                }}
                iconPosition="left"
                icon={<FiCalendar className="text-gray-400" size={18} />}
              />
              <ErrorMessage message={errors.frequency_months} />
            </div>
            <div className="flex flex-col gap-1">
              <TextAreaGroup
                label="Descripción"
                placeholder="Describa el objetivo de la evaluación..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearFieldError("description");
                }}
              />
              <ErrorMessage message={errors.description} />
            </div>
          </div>
        </div>
        <div className="flex-grow lg:w-2/3">
          <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-[#1e293b]/50 dark:shadow-none">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 12H3" />
                    <path d="M16 6H3" />
                    <path d="M16 18H3" />
                    <path d="M18 9v6" />
                    <path d="M21 12h-6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    Configuración de Ejercicios
                  </h2>
                  <p className="text-sm text-slate-500">
                    Añada los ejercicios que componen esta evaluación.
                  </p>
                </div>
              </div>
              <span className="self-start text-sm font-medium text-slate-600 dark:text-slate-400 sm:self-auto">
                <b className="text-blue-600 dark:text-blue-400">
                  {exercises.length}
                </b>{" "}
                Ejercicios añadidos
              </span>
            </div>

            <div className="space-y-3">
              {errors.exercises && <ErrorMessage message={errors.exercises} />}

              {exercises.map((exercise, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-[#0f172a] lg:grid-cols-[30px_1fr_150px_40px] lg:items-end"
                >
                  <div className="hidden cursor-grab justify-center pb-3 text-slate-400 dark:text-slate-600 lg:flex">
                    ⠿
                  </div>
                  <div className="flex flex-col gap-1">
                    <InputGroup
                      label="Campo"
                      type="text"
                      placeholder="Ingresar nombre del ejercicio"
                      value={exercise.name}
                      handleChange={(e) => {
                        const v = e.target.value;
                        const onlyLetters = v.replace(
                          /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                          ""
                        );

                        const copy = [...exercises];
                        copy[idx].name = onlyLetters;
                        setExercises(copy);

                        clearFieldError("exercises");
                        clearFieldError(`exercises[${idx}].name`);
                      }}
                    />
                    <ErrorMessage message={errors[`exercises[${idx}].name`]} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Select
                      label="Unidad"
                      items={[
                        { value: "repeticiones", label: "Repeticiones" },
                        { value: "segundos", label: "Segundos" },
                      ]}
                      value={exercise.unit}
                      onChange={(e) => {
                        const copy = [...exercises];
                        copy[idx].unit = e.target.value;
                        setExercises(copy);

                        clearFieldError("exercises");
                        clearFieldError(`exercises[${idx}].unit`);
                      }}
                      placeholder="Seleccionar"
                    />
                    <ErrorMessage message={errors[`exercises[${idx}].unit`]} />
                  </div>
                  <div className="flex justify-end lg:justify-center lg:pb-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExercises(exercises.filter((_, i) => i !== idx))
                      }
                      className="flex justify-center text-slate-400 transition-colors hover:text-red-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setExercises([...exercises, { name: "", unit: "" }]);
                  clearFieldError("exercises");
                }}
                className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-8 transition-all hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/30"
              >
                <div className="rounded-full bg-slate-200 p-2 text-slate-500 dark:bg-slate-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Añadir Nuevo Ejercicio
                </span>
              </button>
            </div>
          </div>
          <Button
            label={loading ? "Guardando..." : isEditing ? "Actualizar Evaluación" : "Guardar Evaluación"}
            type="submit"
            disabled={loading}
            shape="rounded"
            icon={loading ? <RefreshCw className="animate-spin" size={20} /> : <FiSave size={24} />}
            className="mt-5 w-full"
          />
        </div>
      </form>
    </ShowcaseSection>
  );
}