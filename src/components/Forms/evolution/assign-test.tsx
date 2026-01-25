"use client";
import { useEffect, useState } from "react";
import { getParticipants, getTests, registerForm } from "@/hooks/api";
import TestCard from "@/components/Card/test-card";
import { mapTestFromApi } from "@/utils/map";
import { Stepper } from "@/components/Stepper/stepper";
import { EvolutionTable } from "@/components/Tables/evolution-table";
import { EvolutionTestForm } from "./evolution-form";
import { Test, TestData } from "@/types/test";
import { SelectedParticipant } from "@/types/participant";
import Loader from "@/components/Loader/loader";
import { Alert } from "@/components/ui-elements/alert";
type AlertState = {
  type: "success" | "error" | null;
  message: string;
};
export function AssignTest() {
  const [values, setValues] = useState<{ [key: string]: number }>({});
  const [observations, setObservations] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tests, setTests] = useState<Test[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTestId, setSelectedTestId] = useState<string | number | null>(
    null,
  );
  const [alert, setAlert] = useState<AlertState>({ type: null, message: "" });
  const [assessments, setAssessments] = useState<SelectedParticipant[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<SelectedParticipant | null>(null);
  const selectedTest = tests.find((t) => t.id === selectedTestId);
  const selectedTestData: TestData | null = selectedTest
    ? {
      external_id: selectedTest.id,
      name: selectedTest.name,
      description: selectedTest.description,
      frequency_months: selectedTest.frequencyMonths,
      exercises: selectedTest.exercises,
    }
    : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const apiTests = await getTests();
        const apiParticipants = await getParticipants();

        const activeTests = apiTests
          .filter((t: any) => t.status === "Activo")
          .map((t: any) => mapTestFromApi(t));
        setTests(activeTests);
        const tableData: SelectedParticipant[] = apiParticipants.map((p) => ({
          participant_external_id: p.external_id || "",
          participant_name: `${p.firstName} ${p.lastName || ""}`.trim(),
          dni: p.dni,
          age: p.age,
        }));

        setAssessments(tableData);
      } catch (error) {
        setError("Ocurrió un problema con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);
  const canContinue = () => {
    if (currentStep === 1) return !!selectedTestId;
    if (currentStep === 2) return !!selectedParticipant;
    return true;
  };
  const handleBack = () => {
    setCurrentStep((prev) => {
      if (prev === 3) {
        setSelectedParticipant(null);
        setValues({});
        setObservations("");
        setDate(new Date().toISOString().split("T")[0]);
        return 2;
      }

      if (prev === 2) {
        // Vuelvo de participante → test
        setSelectedTestId(null);
        return 1;
      }

      return prev;
    });
  };

  return (
    <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      {" "}
      <div className="dark:border-strokedark border-b border-stroke px-4">
        <Stepper currentStep={currentStep} />
      </div>
      {alert.type && (
        <div className="mt-4 px-8">
          <Alert
            variant={alert.type}
            title={alert.type === "success" ? "¡Éxito!" : "Error"}
            description={alert.message}
          />
        </div>
      )}
      <div className="p-6 lg:p-8">
        {currentStep === 1 && (
          <>
            {loading ? (
              <div className="flex h-64 w-full items-center justify-center">
                <Loader size={60} color="text-blue-500" />
              </div>
            ) : error ? (
              <div className="text-center font-semibold text-red-500">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    isSelected={selectedTestId === test.id}
                    onSelect={(id) => setSelectedTestId(id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        {currentStep === 2 && (
          <div>
            {" "}
            <EvolutionTable
              data={assessments}
              onSelectParticipant={setSelectedParticipant}
              selectedParticipant={selectedParticipant}
            />
          </div>
        )}
        {currentStep === 3 && selectedTestData && selectedParticipant && (
          <EvolutionTestForm
            test={selectedTestData}
            participantExternalId={selectedParticipant.participant_external_id}
            values={values}
            setValues={setValues}
            observations={observations}
            setObservations={setObservations}
            date={date}
            setDate={setDate}
          />
        )}
      </div>
      <div className="sticky bottom-0 z-30 w-full border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {selectedTestId || selectedParticipant ? (
              <>
                {selectedTestId && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                    {tests.find((t) => t.id === selectedTestId)?.icon}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {selectedTestId && "Test"}
                    {selectedTestId && selectedParticipant && " | "}
                    {selectedParticipant && "Participante"}
                  </p>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedTestId &&
                      tests.find((t) => t.id === selectedTestId)?.name}
                    {selectedTestId && selectedParticipant && " | "}
                    {selectedParticipant &&
                      selectedParticipant.participant_name}
                  </h4>
                </div>
              </>
            ) : (
              <p className="text-sm italic text-slate-500 dark:text-slate-400">
                Ningún test o participante seleccionado
              </p>
            )}
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Atrás
            </button>

            <button
              type="button"
              disabled={!canContinue()}
              onClick={async () => {
                if (currentStep < 3) {
                  setCurrentStep((prev) => prev + 1);
                } else if (
                  currentStep === 3 &&
                  selectedTestData &&
                  selectedParticipant
                ) {
                  const results = selectedTestData.exercises.map((ex) => ({
                    test_exercise_external_id: ex.external_id!,
                    value: values[ex.external_id!] || 0,
                  }));

                  try {
                    await registerForm({
                      participant_external_id:
                        selectedParticipant.participant_external_id,
                      test_external_id: selectedTestData.external_id!,
                      general_observations: observations,
                      date,
                      results,
                    });

                    setAlert({
                      type: "success",
                      message: "El test se guardó correctamente.",
                    });
                    setCurrentStep(1);
                    setSelectedTestId(null);
                    setSelectedParticipant(null);
                    setValues({});
                    setObservations("");
                    setDate(new Date().toISOString().split("T")[0]);

                    setTimeout(
                      () => setAlert({ type: null, message: "" }),
                      3000,
                    );
                  } catch (error) {
                    setAlert({
                      type: "error",
                      message: "Error al registrar el test.",
                    });

                    setTimeout(
                      () => setAlert({ type: null, message: "" }),
                      3000,
                    );
                  }
                }
              }}
              className={`flex items-center gap-2 rounded-lg px-8 py-2.5 text-sm font-semibold transition ${canContinue()
                ? "bg-primary text-white hover:bg-opacity-90"
                : "cursor-not-allowed bg-primary/40 text-white/70"
                }`}
            >
              {currentStep < 3 ? "Continuar" : "Registrar Test"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}