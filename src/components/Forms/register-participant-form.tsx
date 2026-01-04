"use client";
import React, { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { participantService } from "@/services/participant.service";
import { Select } from "../FormElements/select";
import { FiSave, FiUserPlus, FiUsers } from "react-icons/fi";
import { Alert } from "@/components/ui-elements/alert";
import ErrorMessage from "../FormElements/errormessage";

export const RegisterParticipantForm = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");

  // const [formData, setFormData] = useState({
  //   firstName: "",
  //   lastName: "",
  //   dni: "",
  //   type: "ESTUDIANTE",
  //   phone: "",
  //   address: "",
  //   age: "",
  //   email: "",
  // });

  //logica revisar josep
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    type: "",
    program: "", // Required program field: INICIACION or FUNCIONAL
    phone: "",
    address: "",
    age: "",
    email: "",

    //SOLO PARA MENORES
    responsibleName: "",
    responsibleDni: "",
    responsiblePhone: "",
  });

  const isMinor = Number(formData.age) > 0 && Number(formData.age) < 18;
  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const participantTypeOptions = [
    { value: "", label: "Seleccione un tipo" },
    { value: "ESTUDIANTE", label: "Estudiante" },
    { value: "DOCENTE", label: "Docente" },
    { value: "TRABAJADOR", label: "Trabajador" },
    { value: "EXTERNO", label: "Externo" },
    { value: "PARTICIPANTE", label: "Participante General" },
  ];

  // Fixed program options per backend API
  const programOptions = [
    { value: "", label: "Seleccione un programa" },
    { value: "INICIACION", label: "Iniciación" },
    { value: "FUNCIONAL", label: "Funcional" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const newErrors: Record<string, string> = {};

    try {
      if (!formData.firstName)
        newErrors.firstName = "Nombre requerido";

      if (!formData.lastName)
        newErrors.lastName = "Apellido requerido";

      if (!formData.dni || formData.dni.length < 10)
        newErrors.dni = "La cédula debe tener al menos 10 dígitos";

      if (!formData.age)
        newErrors.age = "Edad requerida";

      if (!formData.type)
        newErrors.type = "Tipo de participante requerido";

      if (!formData.program)
        newErrors.program = "Programa requerido (INICIACION o FUNCIONAL)";

      if (formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = "Email no válido";
        }
      }

      if (!formData.phone)
        newErrors.phone = "Celular requerido";
      else if (formData.phone.length < 10)
        newErrors.phone = "Celular no válido";

      if (!formData.address)
        newErrors.address = "Dirección requerida";

      if (isMinor) {
        if (!formData.responsibleName)
          newErrors.responsibleName = "Nombre del responsable requerido";
        if (!formData.responsibleDni)
          newErrors.responsibleDni = "Cédula del responsable requerida";
        if (!formData.responsiblePhone)
          newErrors.responsiblePhone = "Teléfono del responsable requerido";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      await participantService.createParticipant({
        ...formData,
        age: formData.age ? parseInt(formData.age) : 0,
      });

      setAlertType("success");
      setAlertTitle("Participante registrado");
      setAlertDescription("El participante se registró correctamente.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);

      setFormData({
        firstName: "",
        lastName: "",
        dni: "",
        type: "ESTUDIANTE",
        program: "",
        phone: "",
        address: "",
        age: "",
        email: "",
        responsibleName: "",
        responsibleDni: "",
        responsiblePhone: "",
      });

    } catch (err: any) {
      setAlertType("error");
      setAlertTitle("Error");
      setAlertDescription(err.message || "Error al registrar participante.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-center justify-between border-b border-slate-200 px-7 py-6 transition-colors dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            <FiUserPlus size={24} strokeWidth={2} />
          </div>

          <div>
            <h3 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">
              Registro de Participante
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ingresa los datos para un nuevo perfil antropométrico.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300">
            Nuevo Ingreso
          </span>
        </div>
      </div>
      {showAlert && (
        <div className="mb-4">
          <Alert
            variant={alertType}
            title={alertTitle}
            description={alertDescription}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6.5">
        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <InputGroup
              label="Nombres"
              name="firstName"
              type="text"
              placeholder="Ej. Juan"
              value={formData.firstName}
              handleChange={handleChange}
            />
            <ErrorMessage message={errors.firstName} />
          </div>

          <div className="w-full xl:w-1/2">
            <InputGroup
              label="Apellidos"
              name="lastName"
              type="text"
              placeholder="Ej. Pérez"
              value={formData.lastName}
              handleChange={handleChange}
            />
            <ErrorMessage message={errors.lastName} />
          </div>
        </div>

        <div className="mb-4.5 grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-5">
            <InputGroup
              label="Cédula"
              name="dni"
              type="text"
              placeholder="110XXXXXXX"
              value={formData.dni}
              handleChange={handleChange}
            />
            <ErrorMessage message={errors.dni} />
          </div>

          <div className="xl:col-span-2">
            <InputGroup
              label="Edad"
              name="age"
              type="number"
              placeholder="25"
              value={formData.age}
              handleChange={handleChange}
            />
            <ErrorMessage message={errors.age} />
          </div>

          <div className="xl:col-span-5">
            <Select
              name="type"
              label="Tipo"
              items={participantTypeOptions}
              placeholder="Estudiante"
              value={formData.type}
              onChange={(e) => handleChange(e)}
              className="w-full"
            />
            <ErrorMessage message={errors.type} />
          </div>
        </div>

        {/* Program Selection */}
        <div className="mb-4.5">
          <Select
            name="program"
            label="Programa *"
            items={programOptions}
            placeholder="Seleccione programa"
            value={formData.program}
            onChange={(e) => handleChange(e)}
            className="w-full"
          />
          <ErrorMessage message={errors.program} />
        </div>

        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <InputGroup
              label="Email Address (Optional)"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              handleChange={handleChange}
            />
            <ErrorMessage message={errors.email} />
          </div>

          <div className="w-full xl:w-1/2">
            <InputGroup
              label="Phone Number"
              name="phone"
              type="text"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              handleChange={handleChange}
            />
            <ErrorMessage message={errors.phone} />
          </div>
        </div>

        <div className="mb-4.5">
          <InputGroup
            label="Dirección"
            name="address"
            type="text"
            placeholder="Street address, City, State"
            className="w-full"
            value={formData.address}
            handleChange={handleChange}
          />
          <ErrorMessage message={errors.address} />
        </div>

        <div className="relative mb-8 mt-10 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative bg-white px-4 dark:bg-[#1a222c]">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Solo para menores de edad
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-[#1e293b]/30">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FiUsers size={18} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Datos del Responsable
            </h4>
          </div>
          <div className="mb-6 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <InputGroup
                label="Nombre del Responsable"
                name="responsibleName"
                type="text"
                placeholder="Ej. Carlos Pérez"
                value={formData.responsibleName}
                handleChange={handleChange}
                disabled={!isMinor}
              />
              <ErrorMessage message={errors.responsibleName} />
            </div>

            <div className="w-full xl:w-1/2">
              <InputGroup
                label="Cédula del Responsable"
                name="responsibleDni"
                type="text"
                placeholder="110XXXXXXX"
                value={formData.responsibleDni}
                handleChange={handleChange}
                disabled={!isMinor}
              />
              <ErrorMessage message={errors.responsibleDni} />
            </div>
          </div>

          <div className="w-full">
            <InputGroup
              label="Teléfono del Responsable"
              name="responsiblePhone"
              type="text"
              placeholder="099..."
              value={formData.responsiblePhone}
              handleChange={handleChange}
              disabled={!isMinor}
            />
            <ErrorMessage message={errors.responsiblePhone} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-[13px] font-bold text-white hover:bg-opacity-90"
        >
          {loading ? (
            "Guardando..."
          ) : (
            <>
              <FiSave className="h-5 w-5" />
              Registrar Participante
            </>
          )}
        </button>
      </form>
    </div>
  );
};
