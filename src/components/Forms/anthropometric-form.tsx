"use client";
import { useEffect, useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  FiActivity,
  FiEdit,
  FiInfo,
  FiRefreshCcw,
  FiSave,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import Modal from "../Modal/modal";
import { getParticipants, saveAssessment } from "@/hooks/api";
import { Participant } from "@/types/participant";
import { AssessmentData } from "@/types/assessment";
import ErrorMessage from "../FormElements/errormessage";
import { TbArrowsVertical, TbScale } from "react-icons/tb";
import { LuRuler } from "react-icons/lu";
import { Alert } from "@/components/ui-elements/alert";
import { Search, X } from "lucide-react";
import { Button } from "../ui-elements/button";

export function AnthropometricForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [waistPerimeter, setWaistPerimeter] = useState<string>("");
  const [armPerimeter, setArmPerimeter] = useState<string>("");
  const [legPerimeter, setLegPerimeter] = useState<string>("");
  const [calfPerimeter, setCalfPerimeter] = useState<string>("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setSelectedParticipant("");
    setWeight("");
    setHeight("");
    setWaistPerimeter("");
    setCalfPerimeter("");
    setLegPerimeter("");
    setArmPerimeter("");
    const today = new Date();
    setDate(today.toISOString().split("T")[0]);
    setBmi(null);
    setStatus("");
    setErrors({});
  };

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setDate(formattedDate);
  }, []);

  const filteredParticipants = participants.filter(
    (p) =>
      (p.firstName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (p.lastName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (p.dni?.includes(search) ?? false),
  );
  const selected = participants.find(
    (p) =>
      `${p.firstName}${p.lastName ? " " + p.lastName : ""}` ===
      selectedParticipant,
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    const data: AssessmentData = {
      participant_external_id: selected?.external_id ?? "",
      date,
      weight: Number(weight),
      height: Number(height),
      waistPerimeter: waistPerimeter === "" ? 0 : Number(waistPerimeter),
      armPerimeter: armPerimeter === "" ? 0 : Number(armPerimeter),
      legPerimeter: legPerimeter === "" ? 0 : Number(legPerimeter),
      calfPerimeter: calfPerimeter === "" ? 0 : Number(calfPerimeter),
    };

    try {
      const response = await saveAssessment(data);

      // Si la respuesta es undefined, fue un error manejado globalmente (SERVER_DOWN)
      if (!response) {
        setIsSaving(false);
        return;
      }

      if (response.code === 200) {
        setBmi(response.data.bmi);
        setStatus(response.data.status);
        setAlertType("success");
        setAlertTitle("Medidas guardadas");
        setAlertDescription(
          "Las medidas antropométricas se guardaron correctamente.",
        );
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }

      if (response.code === 400 && response.errors) {
        setErrors(response.errors);
      }
    } catch (error: any) {
      // Si no hay respuesta del servidor, usamos el manejador global (SERVER_DOWN)
      if (!error.response) {
        console.error("No se pudo conectar al servidor", error);
        return;
      }

      const { data } = error.response;
      if (data && data.errors) {
        setErrors(data.errors);
        return;
      }

      // Otros errores respondidos por el servidor
      setAlertType("error");
      setAlertTitle("Error");
      setAlertDescription(data?.msg || "No se pudo guardar la evaluación.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };
  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };
  const getBmiColors = () => {
    switch (status) {
      case "Bajo peso":
        return {
          text: "text-yellow-400",
          icon: "text-yellow-500",
          bar: "bg-yellow-400",
          glow: "bg-yellow-500/20", // Color amarillito para el sombreado
        };
      case "Peso adecuado":
        return {
          text: "text-green-400",
          icon: "text-green-500",
          bar: "bg-green-500",
          glow: "bg-green-500/20", // Color verde
        };
      case "Sobrepeso":
      case "Obesidad":
        return {
          text: "text-red-500",
          icon: "text-red-500",
          bar: "bg-red-500",
          glow: "bg-red-500/20", // Color rojo
        };
      default:
        return {
          text: "text-gray-400",
          icon: "text-gray-400",
          bar: "bg-gray-400",
          glow: "bg-blue-500/10", // Color por defecto (azul suave)
        };
    }
  };

  return (
    <ShowcaseSection
      icon={<FiEdit size={24} />}
      title="Registro Medidas Antropométricas"
      description="Ingresa los datos para calcular tu IMC"
    >
      {showAlert && (
        <div className="mb-6">
          <Alert
            variant={alertType}
            title={alertTitle}
            description={alertDescription}
          />
        </div>
      )}

      <form
        action="#"
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 lg:flex-row"
      >
        <div className="flex-grow lg:w-2/3">
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <div className="flex-grow">
            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <InputGroup
                    label="Participante"
                    type="text"
                    placeholder="Ingresar nombre"
                    className="flex-grow"
                    value={selectedParticipant}
                    disabled
                    iconPosition="left"
                    icon={
                      <>
                        <FiUser className="text-gray-400" size={18} />
                        <button
                          type="button"
                          className="absolute right-0 top-0 flex h-full w-[50px] items-center justify-center rounded-r-lg bg-primary text-white hover:bg-opacity-90"
                          onClick={async () => {
                            setIsModalOpen(true);
                            const data = await getParticipants();
                            if (data) {
                              setParticipants(data);
                            }
                          }}
                        >
                          <FiSearch size={20} />
                        </button>
                      </>
                    }
                  />
                </div>
              </div>
              <ErrorMessage message={errors.participant_external_id} />
              </div>
            </div>
          </div>
          <div className="relative mb-6 overflow-hidden rounded-xl border border-blue/20 bg-white/10 p-6 shadow-lg dark:border-white/10 dark:bg-[#1a2233]">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-600"></div>
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-500">
                  <span className="text-xl font-bold">!</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark dark:text-white">
                    Cálculo de IMC
                  </h3>
                  <p className="text-sm text-gray-400">Campos obligatorios</p>
                </div>
              </div>

              <span className="rounded-md border border-blue-600/30 bg-blue-600/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
                Requerido
              </span>
            </div>
            <div className="mb-6 h-[1px] w-full bg-blue/20 dark:bg-white/10"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <InputGroup
                  label="Peso"
                  type="text"
                  placeholder="0.5-500"
                  value={weight}
                  handleChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    if (/^\d*\.?\d*$/.test(value)) {
                      setWeight(value);
                      clearFieldError("weight");
                    }
                  }}
                  iconPosition="left"
                  icon={
                    <>
                      <TbScale size={20} className="text-gray-400" />
                      <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                        kg
                      </span>
                    </>
                  }
                />
                <ErrorMessage message={errors.weight} />
              </div>
              <div className="flex flex-col gap-2">
                <InputGroup
                  label="Altura"
                  type="text"
                  placeholder="0.3-2.5"
                  value={height}
                  handleChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    if (/^\d*\.?\d*$/.test(value)) {
                      setHeight(value);
                      clearFieldError("height");
                    }
                  }}
                  iconPosition="left"
                  icon={
                    <>
                      <TbArrowsVertical size={20} className="text-gray-400" />
                      <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                        m
                      </span>
                    </>
                  }
                />
                <ErrorMessage message={errors.height} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-blue/30 p-6 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue/5 text-gray-400 dark:bg-white/5">
                <span className="text-xl font-light">+</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark dark:text-white">
                  Medidas Adicionales
                </h3>
                <p className="text-sm text-gray-500">
                  Opcional para análisis detallado
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <InputGroup
                    label="Perímetro de cintura"
                    placeholder="0-200"
                    type="text"
                    value={waistPerimeter}
                    handleChange={(e) => {
                      const value = e.target.value.replace(",", ".");
                      if (/^\d*\.?\d*$/.test(value)) {
                        setWaistPerimeter(value);
                        clearFieldError("waistPerimeter");
                      }
                    }}
                    iconPosition="left"
                    icon={
                      <>
                        <LuRuler size={20} className="text-gray-400" />
                        <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                          cm
                        </span>
                      </>
                    }
                  />
                  <ErrorMessage message={errors.waistPerimeter} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <InputGroup
                    label="Perímetro de brazo"
                    placeholder="0-80"
                    type="text"
                    value={armPerimeter}
                    handleChange={(e) => {
                      const value = e.target.value.replace(",", ".");
                      if (/^\d*\.?\d*$/.test(value)) {
                        setArmPerimeter(value);
                        clearFieldError("armPerimeter");
                      }
                    }}
                    iconPosition="left"
                    icon={
                      <>
                        <LuRuler size={20} className="text-gray-400" />
                        <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                          cm
                        </span>
                      </>
                    }
                  />
                  <ErrorMessage message={errors.armPerimeter} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <InputGroup
                    label="Perímetro de pierna"
                    placeholder="0-120"
                    type="text"
                    value={legPerimeter}
                    handleChange={(e) => {
                      const value = e.target.value.replace(",", ".");
                      if (/^\d*\.?\d*$/.test(value)) {
                        setLegPerimeter(value);
                        clearFieldError("legPerimeter");
                      }
                    }}
                    iconPosition="left"
                    icon={
                      <>
                        <LuRuler size={20} className="text-gray-400" />
                        <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                          cm
                        </span>
                      </>
                    }
                  />
                  <ErrorMessage message={errors.legPerimeter} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <InputGroup
                    label="Perímetro de pantorrilla"
                    placeholder="0-70"
                    type="text"
                    value={calfPerimeter}
                    handleChange={(e) => {
                      const value = e.target.value.replace(",", ".");
                      if (/^\d*\.?\d*$/.test(value)) {
                        setCalfPerimeter(value);
                        clearFieldError("calfPerimeter");
                      }
                    }}
                    iconPosition="left"
                    icon={
                      <>
                        <LuRuler size={20} className="text-gray-400" />
                        <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                          cm
                        </span>
                      </>
                    }
                  />
                  <ErrorMessage message={errors.calfPerimeter} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-6 lg:w-1/3">
          <div className="relative overflow-hidden rounded-2xl border border-blue/20 bg-white/10 p-6 shadow-xl dark:border-white/5 dark:bg-[#1a2233]">
            <div
              className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-colors duration-500 ${getBmiColors().glow}`}
            ></div>

            <span className="text-dark-200 text-xs font-bold uppercase tracking-widest dark:text-gray-400">
              Resultado Previsto
            </span>

            <div className="mt-6 flex items-start justify-between">
              <div>
                <h4 className="text-5xl font-extrabold text-dark dark:text-white">
                  {bmi ? bmi.toFixed(2) : "0.00"}
                </h4>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  IMC (kg/m²)
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <FiActivity
                  size={18}
                  className={`${getBmiColors().icon} opacity-70`}
                />

                <span
                  className={`text-xs font-bold uppercase ${getBmiColors().text}`}
                >
                  {status || "---"}
                </span>
              </div>
            </div>
            <div className="mt-8">
              <div className="relative h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBmiColors().bar}`}
                  style={{
                    width: bmi ? `${Math.min((bmi / 40) * 100, 100)}%` : "0%",
                  }}
                ></div>
              </div>
              <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-tighter text-gray-500">
                <span>Bajo</span>
                <span>Normal</span>
                <span>Alto</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm leading-relaxed text-blue-400">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
              <FiInfo size={14} />
            </div>
            <p>
              El IMC se calcula automáticamente al ingresar los datos
              obligatorios.
              <span className="mt-1 block font-semibold">
                Verifique la precisión antes de guardar.
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {bmi === null && (
              <Button
                label={isSaving ? "Guardando..." : "Calcular y Guardar"}
                icon={
                  <div className="flex items-center justify-center">
                    <FiSave size={24} />
                  </div>
                }
                variant="primary"
                size="default"
                className={isSaving ? "cursor-not-allowed bg-primary/70" : ""}
                shape="rounded"
              />
            )}
            {bmi !== null && (
              <Button
                onClick={resetForm}
                label="Volver a Calcular"
                icon={<FiRefreshCcw size={18} />}
                variant="outlineDark"
                size="default"
                shape="rounded"
              />
            )}
          </div>
        </div>
      </form>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex h-[450px] max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl transition-all dark:border-gray-800 dark:bg-[#111827] dark:text-white">
          <div className="p-6 pb-2">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Añadir Participantes
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Busca y selecciona personas para tu equipo.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative mt-4">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#1f2937]/50 dark:focus:ring-blue-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-2">
            {filteredParticipants.length > 0 ? (
              <div className="space-y-1">
                {filteredParticipants.map((p) => (
                  <div
                    key={p.external_id}
                    onClick={() => {
                      const fullName = `${p.firstName}${p.lastName ? " " + p.lastName : ""}`;
                      setSelectedParticipant(fullName);
                      clearFieldError("participant_external_id");
                      setIsModalOpen(false);
                      setSearch("");
                    }}
                    className="flex cursor-pointer items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-[#1f2937]"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-xs font-bold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                      {p.firstName[0]}
                      {p.lastName?.[0] || ""}
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <span className="text-[15px] font-semibold">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="mt-1 w-fit truncate rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-[9px] text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        {p.dni}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                No se encontraron resultados
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-[#111827]">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {filteredParticipants.length} encontrados
            </span>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </ShowcaseSection>
  );
}
