"use client";
import React, { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "../FormElements/select";
import { FiEdit, FiSave} from "react-icons/fi";
import { userService } from "@/services/user.services";
import { CreateUserRequest } from "@/types/user";

export const UserForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    role: "" as "DOCENTE" | "PASANTE" | "ADMINISTRADOR" |  "",
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      alert("Usuario registrado correctamente");

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
      alert(error.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-center justify-between border-b border-slate-200 px-7 py-6 transition-colors dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            <FiEdit size={24} strokeWidth={2} />
          </div>

          <div>
            <h3 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">
              Registro de Cuenta
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ingresa los datos personales para un nuevo perfil.
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

      <form onSubmit={handleSubmit} className="p-6.5">
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
        </div>
        <button
          type="submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-[13px] font-bold text-white hover:bg-opacity-90"
        >
          <FiSave className="h-5 w-5" />
          Registrar Cuenta
        </button>
      </form>
    </div>
  );
};
