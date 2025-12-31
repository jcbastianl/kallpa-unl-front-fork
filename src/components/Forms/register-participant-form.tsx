"use client";
import React, { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { participantService } from "@/services/participant.service";

export const RegisterParticipantForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    type: "ESTUDIANTE",
    phone: "",
    address: "",
    age: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.dni.length < 10) {
        throw new Error("La cédula debe tener al menos 10 dígitos.");
      }

      await participantService.create({
        ...formData,
        age: formData.age ? parseInt(formData.age) : 0,
      });

      setSuccess("¡Participante registrado exitosamente!");
      setFormData({
        firstName: "",
        lastName: "",
        dni: "",
        type: "ESTUDIANTE",
        phone: "",
        address: "",
        age: "",
        email: "",
      });
    } catch (err: any) {
      setError(err.message || "Error al registrar participante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
        <h3 className="font-medium text-dark dark:text-white">
          Registro de Participante
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6.5">
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded border border-green-200 bg-green-100 p-3 text-green-700">
            {success}
          </div>
        )}

        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <InputGroup
            label="Nombres"
            name="firstName"
            type="text"
            placeholder="Ej. Juan"
            className="w-full xl:w-1/2"
            value={formData.firstName}
            handleChange={handleChange}
            required
          />
          <InputGroup
            label="Apellidos"
            name="lastName"
            type="text"
            placeholder="Ej. Pérez"
            className="w-full xl:w-1/2"
            value={formData.lastName}
            handleChange={handleChange}
            required
          />
        </div>

        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <InputGroup
            label="Cédula"
            name="dni"
            type="text"
            placeholder="110XXXXXXX"
            className="w-full xl:w-1/2"
            value={formData.dni}
            handleChange={handleChange}
            required
          />

          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Tipo de Participante
            </label>
            <div className="relative z-20 bg-transparent dark:bg-form-input">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
              >
                <option value="ESTUDIANTE">Estudiante</option>
                <option value="DOCENTE">Docente</option>
                <option value="TRABAJADOR">Trabajador</option>
                <option value="EXTERNO">Externo</option>
                <option value="PARTICIPANTE">Participante General</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <InputGroup
            label="Edad"
            name="age"
            type="number"
            placeholder="Ej. 25"
            className="w-full xl:w-1/2"
            value={formData.age}
            handleChange={handleChange}
          />
          <InputGroup
            label="Email (opcional)"
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            className="w-full xl:w-1/2"
            value={formData.email}
            handleChange={handleChange}
          />
        </div>

        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <InputGroup
            label="Teléfono"
            name="phone"
            type="text"
            placeholder="099..."
            className="w-full xl:w-1/2"
            value={formData.phone}
            handleChange={handleChange}
          />
          <InputGroup
            label="Dirección"
            name="address"
            type="text"
            placeholder="Dirección..."
            className="w-full xl:w-1/2"
            value={formData.address}
            handleChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Registrar Participante"}
        </button>
      </form>
    </div>
  );
};
