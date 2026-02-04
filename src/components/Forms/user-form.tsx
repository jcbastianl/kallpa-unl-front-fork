"use client";
import React, { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "../FormElements/select";
import { FiCreditCard, FiEdit, FiInfo, FiLock, FiMail, FiMapPin, FiPhone, FiSave, FiUser } from "react-icons/fi";
import { userService } from "@/services/user.services";
import { CreateUserRequest } from "@/types/user";
import ErrorMessage from "../FormElements/errormessage";
import { ShowcaseSection } from "../Layouts/showcase-section";
import { Alert } from "../ui-elements/alert";
import { Button } from "../ui-elements/button";
import { RefreshCw } from "lucide-react";

export const UserForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [saving, setSaving] = useState(false);
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
    const numericFields = ["dni", "phone"];
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (numericFields.includes(name)) {
      const onlyNums = value.replace(/\D/g, "");
      if (onlyNums.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: onlyNums }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Limpia el error del campo editado
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Validación inmediata de email (para ver "inválido" aunque falten otros campos)
    if (name === "email") {
      const v = String(value || "").trim();
      if (v.length > 0 && !emailPattern.test(v)) {
        setErrors((prev) => ({ ...prev, email: "Correo electrónico inválido" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

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

      showTemporaryAlert("success", "Usuario registrado correctamente","Éxito");

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
    } catch (err: any) {
      if (err?.message === "SERVER_DOWN" || err?.message === "SESSION_EXPIRED") return;

      if (err?.data && typeof err.data === "object") {
        setErrors(err.data);
        return;
      }

      if (err?.msg || err?.message) {
        showTemporaryAlert(
          "error",
          "Error",
          err.msg || err.message
        );
        return;
      }

      showTemporaryAlert("error", "Error", "Error al registrar usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ShowcaseSection
      icon={<FiEdit size={24} />}
      title="Registro de Nueva Cuenta"
      description="Ingresa los datos personales para crear una cuenta nueva"
    >
      {showAlert && (
        <div className="mb-6">
          <Alert variant={alertType} title={alertTitle} description={alertDescription} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-grow lg:w-2/3">
          <div className="mb-4.5 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
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

            <div>
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
          <div className="mb-4.5 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <InputGroup
                label="Cédula"
                name="dni"
                type="text"
                placeholder="110XXXXXXX"
                value={formData.dni}
                handleChange={handleChange}
                iconPosition="left"
                icon={<FiCreditCard className="text-gray-400" size={18} />}
              />
              <ErrorMessage message={errors.dni} />
            </div>

            <div>
              <InputGroup
                label="Teléfono"
                name="phone"
                type="text"
                placeholder="099XXXXXXX"
                value={formData.phone}
                handleChange={handleChange}
                iconPosition="left"
                icon={<FiPhone className="text-gray-400" size={18} />}
              />
              <ErrorMessage message={errors.phone} />
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
              iconPosition="left"
              icon={<FiMapPin className="text-gray-400" size={18} />}
            />
          </div>

          <div className="mb-4.5 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <InputGroup
                label="Correo Electrónico"
                name="email"
                type="text"
                placeholder="john@example.com"
                value={formData.email}
                handleChange={handleChange}
                iconPosition="left"
                icon={<FiMail className="text-gray-400" size={18} />}
              />
              <ErrorMessage message={errors.email} />
            </div>

            <div>
              <InputGroup
                label="Contraseña"
                name="password"
                type="password"
                placeholder="******"
                value={formData.password}
                handleChange={handleChange}
                iconPosition="left"
                icon={<FiLock className="text-gray-400" size={18} />}
              />
              <ErrorMessage message={errors.password} />
            </div>
          </div>

          <div className="mb-4.5">
            <Select
              placeholder="Seleccionar rol"
              name="role"
              label="Rol del Usuario"
              items={participantTypeOptions}
              value={formData.role}
              onChange={handleChange}
              className="w-full"
            />
            <ErrorMessage message={errors.role} />
          </div>
        </div>
        <div className="flex w-full flex-col gap-6 lg:w-1/3">
          <div className="relative overflow-hidden rounded-2xl border border-blue/20 bg-white/10 p-6 shadow-xl dark:border-white/5 dark:bg-[#1a2233]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl"></div>

            <h4 className="mb-4 text-lg font-bold text-dark dark:text-white flex items-center gap-2">
              <FiInfo className="text-primary" />
              Información de Registro
            </h4>

            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Al crear una cuenta, el usuario podrá acceder al sistema según el rol asignado.
              Asegúrese de que el <strong>DNI</strong> y el <strong>Correo</strong> sean correctos, ya que son campos únicos.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li>• <b>Admin:</b> Control total del sistema.</li>
              <li>• <b>Docente:</b> Gestión de alumnos y medidas.</li>
              <li>• <b>Pasante:</b> Registro de datos específicos.</li>
            </ul>
          </div>

          <Button
            label={saving ? "Registrando..." : "Registrar Cuenta"}
            shape="rounded"
            icon={saving ? <RefreshCw className="animate-spin" size={20} /> : <FiSave size={24} />}
            disabled={saving}
          />
        </div>

      </form>
    </ShowcaseSection>
  );
};
