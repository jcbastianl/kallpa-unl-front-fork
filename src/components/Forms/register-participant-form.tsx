"use client";
import React, { useState, useEffect } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { participantService } from "@/services/participant.service";
import { Select } from "../FormElements/select";
import { FiCalendar, FiCreditCard, FiEdit, FiMail, FiMapPin, FiPhone, FiSave, FiUser, FiUserPlus, FiUsers } from "react-icons/fi";
import { Alert } from "@/components/ui-elements/alert";
import ErrorMessage from "../FormElements/errormessage";
import { ShowcaseSection } from "../Layouts/showcase-section";
import { Button } from "@/components/ui-elements/button";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";

interface RegisterParticipantFormProps {
  participantId?: string;
}

export const RegisterParticipantForm = ({ participantId }: RegisterParticipantFormProps) => {
  const router = useRouter();
  const isEditMode = Boolean(participantId);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<
    "success" | "error" | "warning"
  >("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [hasOriginalResponsible, setHasOriginalResponsible] = useState(false);

  const triggerAlert = (
    variant: "success" | "error" | "warning",
    title: string,
    description: string,
  ) => {
    setAlertVariant(variant);
    setAlertTitle(title);
    setAlertDescription(description);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    type: "",
    phone: "",
    address: "",
    age: "",
    email: "",
    program: "",

    //SOLO PARA MENORES
    responsibleName: "",
    responsibleDni: "",
    responsiblePhone: "",
  });

  // Cargar datos del participante en modo edición
  useEffect(() => {
    if (!participantId) return;

    const fetchParticipant = async () => {
      try {
        const participant = await participantService.getById(participantId);

        if (participant) {
          // Verificar si tiene responsable original
          if (participant.responsible) {
            setHasOriginalResponsible(true);
          }

          setFormData({
            firstName: participant.firstName || "",
            lastName: participant.lastName || "",
            dni: participant.dni || "",
            type: participant.type || "",
            phone: participant.phone || "",
            address: participant.address || "",
            age: participant.age?.toString() || "",
            email: participant.email || "",
            program: participant.program || "",
            responsibleName: participant.responsible?.name || "",
            responsibleDni: participant.responsible?.dni || "",
            responsiblePhone: participant.responsible?.phone || "",
          });
        }
      } catch (error) {
        triggerAlert("error", "Error", "No se pudo cargar el participante");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [participantId]);

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
    { value: "EXTERNO", label: "Externo" },
  ];
  const TypeOptions = [
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
    setSubmitting(true);
    setErrors({});

    // Validación de campos requeridos antes de enviar
    const validationErrors: Record<string, string> = {};

    if (!formData.type || formData.type === "") {
      validationErrors.type = "Debe seleccionar un tipo de participante";
    }

    if (!formData.program || formData.program === "") {
      validationErrors.program = "Debe seleccionar un programa";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitting(false);
      return;
    }

    const isMinor = Number(formData.age) > 0 && Number(formData.age) < 18;
    if (isMinor && formData.program === "FUNCIONAL") {
      setErrors((prev) => ({
        ...prev,
        program:
          "Los participantes menores de 18 años no pueden inscribirse en el programa Funcional.",
      }));
      triggerAlert(
        "error",
        "Restricción de edad",
        "Los menores de 18 años no pueden inscribirse en el programa Funcional.",
      );
      setSubmitting(false);
      return;
    }

    try {
      if (isEditMode && participantId) {
        // Modo edición: actualizar participante
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: formData.age ? parseInt(formData.age) : undefined,
          dni: formData.dni,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          type: formData.type || undefined,
          program: formData.program || undefined,
        };

        // Solo incluir responsable si el participante YA tenía uno originalmente
        // (el API no permite agregar responsable en actualización, solo modificar existente)
        if (hasOriginalResponsible && (formData.responsibleName || formData.responsibleDni || formData.responsiblePhone)) {
          updateData.responsible = {
            name: formData.responsibleName,
            dni: formData.responsibleDni,
            phone: formData.responsiblePhone,
          };
        }

        const response = await participantService.updateParticipant(participantId, updateData);

        if (response.status === "success" || response.code === 200) {
          triggerAlert(
            "success",
            "Participante actualizado",
            "El participante se actualizó correctamente.",
          );
          setTimeout(() => {
            router.push("/pages/participant");
          }, 1500);
        } else if (response.data && typeof response.data === "object") {
          setErrors(response.data);
        }
      } else {
        // Modo registro: crear participante
        const response = await participantService.createParticipant({
          ...formData,
          age: formData.age ? parseInt(formData.age) : 0,
        });
        triggerAlert(
          "success",
          "Participante registrado",
          "El participante se registró correctamente.",
        );

        setFormData({
          firstName: "",
          lastName: "",
          dni: "",
          type: "",
          phone: "",
          address: "",
          age: "",
          email: "",
          responsibleName: "",
          responsibleDni: "",
          responsiblePhone: "",
          program: "",
        });
      }
    } catch (err: any) {
      if (err?.data && typeof err.data === "object") {
        setErrors(err.data);
        const hasFieldErrors = Object.keys(err.data).some(
          (key) => key !== "general" && err.data[key],
        );
        if (!hasFieldErrors && err.msg) {
          triggerAlert("error", "Error", err.msg);
        }
      } else {
        triggerAlert(
          "error",
          isEditMode ? "Error al actualizar" : "Error al registrar",
          isEditMode ? "No se pudo actualizar el participante." : "No se pudo registrar el participante.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  return (
    <ShowcaseSection
      icon={isEditMode ? <FiEdit size={24} /> : <FiUserPlus size={24} />}
      title={isEditMode ? "Editar Participante" : "Registro de Participante"}
      description={isEditMode ? "Modifica los datos del participante" : "Ingresa los datos para un nuevo perfil"}
    >
      {showAlert && (
        <div className="mb-6">
          <Alert
            variant={alertVariant}
            title={alertTitle}
            description={alertDescription}
          />
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <InputGroup
              label="Nombres"
              name="firstName"
              type="text"
              placeholder="Ej. Juan"
              value={formData.firstName}
              handleChange={handleChange}
              iconPosition="left"
              icon={<FiUser className="text-gray-400" size={18} />}
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
              iconPosition="left"
              icon={<FiUser className="text-gray-400" size={18} />}
            />
            <ErrorMessage message={errors.lastName} />
          </div>
        </div>

        <div className="mb-4.5 grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-5">
            <InputGroup
              label="Cédula"
              name="dni"
              type="number"
              placeholder="110XXXXXXX"
              value={formData.dni}
              handleChange={handleChange}
              iconPosition="left"
              icon={<FiCreditCard className="text-gray-400" size={18} />}
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
              iconPosition="left"
              icon={<FiCalendar className="text-gray-400" size={18} />}
            />
            <ErrorMessage message={errors.age} />
          </div>

          <div className="xl:col-span-5">
            <Select
              name="type"
              label="Tipo"
              items={participantTypeOptions}
              placeholder=""
              value={formData.type}
              onChange={(e) => handleChange(e)}
              className="w-full"
            />
            <ErrorMessage message={errors.type} />
          </div>
        </div>

        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <InputGroup
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              handleChange={handleChange}
              iconPosition="left"
              icon={<FiMail className="text-gray-400" size={18} />}
            />
            <ErrorMessage message={errors.email} />
          </div>

          <div className="w-full xl:w-1/2">
            <InputGroup
              label="Teléfono"
              name="phone"
              type="number"
              placeholder="099XXXXXXX"
              value={formData.phone}
              handleChange={handleChange}
              iconPosition="left"
              icon={<FiPhone className="text-gray-400" size={18} />}
            />
            <ErrorMessage message={errors.phone} />
          </div>
        </div>

        <div className="xl:col-span-5">
          <Select
            name="program"
            label="Seleccione un programa"
            items={TypeOptions}
            placeholder=""
            value={formData.program}
            onChange={(e) => handleChange(e)}
            className="w-full"
          />
          <ErrorMessage message={errors.program} />
        </div>
        <div className="mb-4.5">
          <InputGroup
            label="Dirección"
            name="address"
            type="text"
            placeholder="Ej. Av. Universitaria y Calle Principal"
            className="w-full"
            value={formData.address}
            handleChange={handleChange}
            iconPosition="left"
            icon={<FiMapPin className="text-gray-400" size={18} />}
          />
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
                disabled={isEditMode ? !hasOriginalResponsible : !isMinor}
              />
              <ErrorMessage message={errors.responsibleName} />
            </div>

            <div className="w-full xl:w-1/2">
              <InputGroup
                label="Cédula del Responsable"
                name="responsibleDni"
                type="number"
                placeholder="110XXXXXXX"
                value={formData.responsibleDni}
                handleChange={handleChange}
                disabled={isEditMode ? !hasOriginalResponsible : !isMinor}
              />
              <ErrorMessage message={errors.responsibleDni} />
            </div>
          </div>

          <div className="w-full">
            <InputGroup
              label="Teléfono del Responsable"
              name="responsiblePhone"
              type="text"
              placeholder="+593 999 000 000"
              value={formData.responsiblePhone}
              handleChange={handleChange}
              disabled={isEditMode ? !hasOriginalResponsible : !isMinor}
            />
            <ErrorMessage message={errors.responsiblePhone} />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          label={submitting ? "Guardando..." : (isEditMode ? "Guardar Cambios" : "Registrar Participante")}
          icon={!submitting ? <FiSave size={20} /> : undefined}
          variant="primary"
          className="mt-6 w-full"
        />
      </form>
    </ShowcaseSection>
  );
};
