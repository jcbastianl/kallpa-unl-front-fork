"use client";
import { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  FiActivity,
  FiClipboard,
  FiInfo,
  FiSave,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import Modal from "../Modal/modal";
import { getParticipants, saveAssessment } from "@/hooks/api";
import { Participant } from "@/types/participant";
import DatePickerTwo from "../FormElements/DatePicker/DatePickerTwo";
import { AssessmentData } from "@/types/assessment";
import ErrorMessage from "../FormElements/errormessage";
import { TbArrowsVertical, TbScale } from "react-icons/tb";
import { LuHistory, LuRuler } from "react-icons/lu";

export function AnthropometricForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [weight, setWeight] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [waistPerimeter, setWaistPerimeter] = useState<number>(0);
  const [wingspan, setWingspan] = useState<number>(0);
  const [bmi, setBmi] = useState<number | null>(null);
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredParticipants = participants.filter(
    (p) =>
      p.firstName.toLowerCase().includes(search.toLowerCase()) ||
      p.lastName.toLowerCase().includes(search.toLowerCase()) ||
      p.dni.includes(search),
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data: AssessmentData = {
      participant_external_id: participants.find(
        (p) => `${p.firstName} ${p.lastName}` === selectedParticipant,
      )?.external_id!,
      date,
      weight,
      height,
      waistPerimeter,
      wingspan,
    };

    try {
      const response = await saveAssessment(data);

      if (response.code === 200) {
        setBmi(response.data.bmi);
        setStatus(response.data.status);
      }

      if (response.code === 400 && response.errors) {
        setErrors(response.errors);
      }
    } catch (error) {
      console.error("Error guardando evaluación:", error);
    }
  };
  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };
  const resetForm = () => {
    setSelectedParticipant("");
    setWeight(0);
    setHeight(0);
    setWaistPerimeter(0);
    setWingspan(0);
    setDate("");
    setBmi(null);
    setStatus("");
    setErrors({});
  };

  return (
    <ShowcaseSection
      title={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <FiClipboard className="text-primary" size={20} />
            <span className="font-semibold">Formulario Antropométrico</span>
          </div>

          <button
            type="button"
            className="dark:border-strokedark flex items-center gap-2 rounded-lg border border-gray-400 bg-transparent px-4 py-1.5 text-sm font-medium dark:text-white text-dark transition hover:bg-white/5"
            onClick={() => {
              console.log("Abrir historial");
            }}
          >
            <LuHistory size={16} />
            <span>Historial</span>
          </button>
        </div>
      }
      className="!p-6.5"
    >
      <form
        action="#"
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 lg:flex-row"
      >
        <div className="flex-grow lg:w-2/3">
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <div className="flex-grow">
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
                            try {
                              const data = await getParticipants();
                              setParticipants(data);
                            } catch (error) {
                              console.error(
                                "Error cargando participantes:",
                                error,
                              );
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
            <div className="w-full xl:w-1/2">
              <DatePickerTwo
                value={date}
                onChange={(newDate: string) => {
                  setDate(newDate);
                  clearFieldError("date");
                }}
              />
              <ErrorMessage message={errors.date} />
            </div>
          </div>
          <div className="relative mb-6 overflow-hidden rounded-xl border border-blue/20 dark:border-white/10 bg-white/10 dark:bg-[#1a2233] p-6 shadow-lg">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-600"></div>
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-500">
                  <span className="text-xl font-bold">!</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold dark:text-white text-dark">
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
                  type="number"
                  placeholder="45"
                  value={weight.toString()}
                  handleChange={(e) => {
                    setWeight(Number(e.target.value));
                    clearFieldError("weight");
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
                  type="number"
                  placeholder="120"
                  value={height.toString()}
                  handleChange={(e) => {
                    setHeight(Number(e.target.value));
                    clearFieldError("height");
                  }}
                  iconPosition="left"
                  icon={
                    <>
                      <TbArrowsVertical size={20} className="text-gray-400" />
                      <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                        cm
                      </span>
                    </>
                  }
                />
                <ErrorMessage message={errors.height} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-blue/30 dark:border-white/10 dark:bg-white/[0.02] p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue/5 dark:bg-white/5 text-gray-400">
                <span className="text-xl font-light">+</span>
              </div>
              <div>
                <h3 className="text-lg font-bold dark:text-white text-dark">
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
                    placeholder="30"
                    type="number"
                    value={waistPerimeter.toString()}
                    handleChange={(e) => {
                      setWaistPerimeter(Number(e.target.value));
                      clearFieldError("waistPerimeter");
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
                    label="Envergadura"
                    placeholder="45"
                    type="number"
                    value={wingspan.toString()}
                    handleChange={(e) => {
                      setWingspan(Number(e.target.value));
                      clearFieldError("wingspan");
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
                  <ErrorMessage message={errors.wingspan} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-6 lg:w-1/3">
          <div className="relative overflow-hidden rounded-2xl border border-blue/20 dark:border-white/5 bg-white/10 dark:bg-[#1a2233] p-6 shadow-xl">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/10 blur-3xl"></div>

            <span className="text-xs font-bold uppercase tracking-widest text-dark-200 dark:text-gray-400">
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
                <div
                  className={`rounded-xl p-3 shadow-lg ${bmi ? "bg-red-500/20 text-red-500" : "bg-gray-800 text-gray-600"}`}
                >
                  <FiActivity size={24} />
                </div>
                <span
                  className={`text-xs font-bold uppercase ${bmi ? "text-red-400" : "text-gray-600"}`}
                >
                  {status || "---"}
                </span>
              </div>
            </div>
            <div className="mt-8">
              <div className="relative h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    status === "Bajo peso"
                      ? "bg-red-500"
                      : status === "Normal"
                        ? "bg-green-500"
                        : "bg-orange-500"
                  }`}
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

          <button
            type={bmi !== null ? "button" : "submit"}
            onClick={bmi !== null ? resetForm : undefined}
            className="mt-2 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
          >
            <div className="rounded-lg bg-white/10 p-1.5 group-hover:bg-white/20">
              <FiSave size={18} />
            </div>
            <span className="text-lg">
              {bmi !== null ? "Volver a Calcular" : "Calcular y Guardar"}
            </span>
          </button>
        </div>
      </form>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <input
          type="text"
          placeholder="Buscar participante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 bg-white px-3 py-2 text-dark focus:outline-none dark:border-gray-600 dark:bg-gray-dark dark:text-white"
        />

        <ul className="max-h-64 overflow-y-auto">
          {filteredParticipants.length > 0 ? (
            filteredParticipants.map((p) => (
              <li
                key={p.external_id}
                className="cursor-pointer border-b border-gray-300 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                onClick={() => {
                  setSelectedParticipant(`${p.firstName} ${p.lastName}`);
                  clearFieldError("participant_external_id");
                  setIsModalOpen(false);
                }}
              >
                {p.firstName} {p.lastName} - {p.dni}
              </li>
            ))
          ) : (
            <li className="py-2 text-gray-500">
              No se encontraron participantes
            </li>
          )}
        </ul>
      </Modal>
    </ShowcaseSection>
  );
}
