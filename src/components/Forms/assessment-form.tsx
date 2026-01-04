"use client";
import { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { FiCalendar, FiClipboard, FiEdit, FiSave } from "react-icons/fi";
import ErrorMessage from "../FormElements/errormessage";
import { TextAreaGroup } from "../FormElements/InputGroup/text-area";
import { saveTest } from "@/hooks/api";
import { TestData } from "@/types/test";
import { Select } from "../FormElements/select";
import { Alert } from "@/components/ui-elements/alert";

export function AssessmentForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyMonths, setFrequencyMonths] = useState<number>(3);
  const [exercises, setExercises] = useState<{ name: string; unit: string }[]>([
    { name: "", unit: "" },
  ]);

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

    const payload: TestData = {
      name: name.trim(),
      description: description.trim(),
      frequency_months: frequencyMonths,
      exercises: exercises.map(e => ({
        name: e.name.trim(),
        unit: e.unit.trim(),
      })),
    };
    
    setErrors({});

    try {
      setLoading(true);
      const res = await saveTest(payload);

      if (res.status === "ok") {
        setAlertVariant("success");
        setAlertMessage({
          title: "Test creado correctamente",
          description: "El test se guardó exitosamente",
        });
        setShowAlert(true);
        setName("");
        setDescription("");
        setFrequencyMonths(3);
        setExercises([{ name: "", unit: "" }]);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        if (res.msg && typeof res.msg === "object") {
          // Mapear errores de backend al estado de errors
          const fieldErrors: Record<string, string> = {};
          Object.entries(res.msg).forEach(([key, value]) => {
            // Si es un string directo, lo asignamos
            if (typeof value === "string") {
              fieldErrors[key] = value;
            } else if (Array.isArray(value)) {
              // Si quieres manejar errores por índice de ejercicio, podrías mapearlos aquí
              fieldErrors[key] = "Algunos ejercicios son inválidos";
            }
          });
          setErrors(fieldErrors);
        } else {
          setAlertVariant("error");
          setAlertMessage({
            title: "Error",
            description:
              typeof res.msg === "string"
                ? res.msg
                : "Error al guardar el test",
          });
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      }
    } catch (err) {
      setAlertVariant("error");
      setAlertMessage({
        title: "Error",
        description: "Error al guardar el test",
      });
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setLoading(false);
    }
  };
  return (
    <ShowcaseSection
      icon={<FiEdit size={24} />}
      title="Registro Nuevo Test"
      description="Ingresa los datos para crear un nuevo test"
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
        className="flex flex-col gap-6 lg:flex-row"
      >
        <div className="flex w-full flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-[#1e293b]/50 dark:shadow-none lg:w-1/3">
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

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
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
            <InputGroup
              label="Frecuencia (en meses)"
              type="number"
              placeholder="3"
              className="flex-grow"
              value={frequencyMonths.toString()}
              handleChange={(e) => setFrequencyMonths(Number(e.target.value))}
              iconPosition="left"
              icon={<FiCalendar className="text-gray-400" size={18} />}
            />
            <TextAreaGroup
              label="Descripción"
              placeholder="Describa el objetivo del test..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearFieldError("description");
              }}
            />
            <ErrorMessage message={errors.description} />
          </div>
        </div>

        <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-[#1e293b]/50 dark:shadow-none lg:w-2/3">
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
                  Añada los ejercicios que componen este test.
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
                className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-[#0f172a] lg:grid-cols-[30px_1fr_150px_40px] lg:items-end"
              >
                <div className="hidden cursor-grab justify-center pb-3 text-slate-400 dark:text-slate-600 lg:flex">
                  ⠿
                </div>
                <InputGroup
                  label="Campo"
                  type="text"
                  placeholder="Ingresar nombre del ejercicio"
                  value={exercise.name}
                  handleChange={(e) => {
                    const copy = [...exercises];
                    copy[idx].name = e.target.value;
                    setExercises(copy);

                    clearFieldError("exercises");
                  }}
                />
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
                  }}
                  placeholder="Seleccionar"
                />
                <div className="flex justify-end lg:justify-center lg:pb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExercises(exercises.filter((_, i) => i !== idx))
                    }
                    className="flex justify-center pb-3 text-slate-400 transition-colors hover:text-red-500"
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
              onClick={() =>
                setExercises([...exercises, { name: "", unit: "" }])
              }
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
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
          >
            <div className="rounded-lg bg-white/10 p-1.5 group-hover:bg-white/20">
              <FiSave size={18} />
            </div>
            <span className="text-lg">
              {loading ? "Guardando..." : "Guardar Test"}
            </span>
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
