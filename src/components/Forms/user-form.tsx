"use client";
import React, { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "../FormElements/select";
import { FiEdit, FiSave } from "react-icons/fi";
import { userService } from "@/services/user.services";
import { CreateUserRequest } from "@/types/user";
import ErrorMessage from "../FormElements/errormessage";
import { ShowcaseSection } from "../Layouts/showcase-section";
import { Alert } from "../ui-elements/alert";

export const UserForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAlert, setShowAlert] = useState(false);
const [alertType, setAlertType] = useState<"success" | "error" | "warning">("success");
const [alertTitle, setAlertTitle] = useState("");
const [alertDescription, setAlertDescription] = useState("");
const showTemporaryAlert = (
  type: "success" | "error" | "warning",
  title: string,
  description: string,
  duration = 3000
) => {
  setAlertType(type);
  setAlertTitle(title);
  setAlertDescription(description);
  setShowAlert(true);

  setTimeout(() => {
    setShowAlert(false);
  }, duration);
};
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    role: "" as "DOCENTE" | "PASANTE" | "ADMINISTRADOR" | "",
  });

  const participantTypeOptions = [
    { value: "", label: "Seleccione un tipo" },
    { value: "DOCENTE", label: "Docente" },
    { value: "PASANTE", label: "Pasante" },
    { value: "ADMINISTRADOR", label: "Admin" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload: CreateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dni: formData.dni,
        phone: formData.phone || undefined,
        address: formData.address,
        email: formData.email,
        password: formData.password,
        role: formData.role as "DOCENTE" | "PASANTE" | "ADMINISTRADOR",
      };

      await userService.createUser(payload);

      showTemporaryAlert("success", "Éxito", "Usuario registrado correctamente");

      setFormData({
        firstName: "",
        lastName: "",
        dni: "",
        phone: "",
        address: "",
        email: "",
        password: "",
        role: "",
      });
    } catch (error: any) {
      if (error?.data) {
        setErrors(error.data);
      } else {
        showTemporaryAlert("error", "Error", error.msg || "Error al registrar usuario");
      }
    }
  };

  return (
    <ShowcaseSection
      icon={<FiEdit size={24} />}
      title="Registro de Nueva Cuenta"
      description="Ingresa los datos personales para crear un cuaneta nueva"
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
      <form onSubmit={handleSubmit}>
        <div className="mb-4.5 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
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

          <div>
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

        <div className="mb-4.5 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
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

          <div>
            <InputGroup
              label="Phone"
              name="phone"
              type="number"
              placeholder="25"
              value={formData.phone}
              handleChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-4.5">
          <InputGroup
            label="Dirección"
            name="address"
            type="text"
            placeholder="Ej. Av. Universitaria y Calle Principal"
            value={formData.address}
            handleChange={handleChange}
          />
        </div>

        <div className="mb-4.5 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
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

          <div>
            <InputGroup
              label="Password"
              name="password"
              type="password"
              placeholder="xxxxxx"
              value={formData.password}
              handleChange={handleChange}
            />
            <ErrorMessage message={errors.password} />
          </div>
        </div>
        <div className="mb-4.5">
          <Select
            name="role"
            label="Rol"
            items={participantTypeOptions}
            value={formData.role}
            onChange={handleChange}
            placeholder="Seleccione un rol"
            className="w-full"
          />
          <ErrorMessage message={errors.role} />
        </div>
        <button
          type="submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-[13px] font-bold text-white hover:bg-opacity-90"
        >
          <FiSave className="h-5 w-5" />
          Registrar Cuenta
        </button>
      </form>
    </ShowcaseSection>
  );
};
