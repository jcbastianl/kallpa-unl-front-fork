"use client";

import { useState, useEffect, useMemo } from "react";
import { userService, UserProfileData } from "@/services/user.services";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { FiEdit, FiAlertTriangle } from "react-icons/fi";

// Cuentas especiales que están hardcodeadas y no pueden editar su perfil
const HARDCODED_ACCOUNTS = ["dev@kallpa.com", "admin@kallpa.com"];

export function PersonalInfoForm() {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [formData, setFormData] = useState<UserProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    password: "",
  });

  // Verificar si es una cuenta especial que no puede editar perfil
  const isHardcodedAccount = useMemo(() => {
    return HARDCODED_ACCOUNTS.includes(userEmail.toLowerCase());
  }, [userEmail]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const firstName = parsedUser.first_name || parsedUser.firstName || "";
        const lastName = parsedUser.last_name || parsedUser.lastName || "";
        const phone = parsedUser.phone || "";
        const address = parsedUser.address || "";
        const email = parsedUser.email || "";

        setUserEmail(email);
        setFormData({
          firstName,
          lastName,
          phone,
          address,
          password: "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password) {
      alert("Debes ingresar tu contraseña para guardar los cambios");
      return;
    }

    setLoading(true);

    try {
      const response: any = await userService.updateProfile(formData);

      if (response.status === "success" || response.status === "ok") {
        const responseData = response.data || {};
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...storedUser,
          first_name: responseData.firstName || formData.firstName,
          last_name: responseData.lastName || formData.lastName,
          firstName: responseData.firstName || formData.firstName,
          lastName: responseData.lastName || formData.lastName,
          phone: responseData.phone || formData.phone,
          address: responseData.address || formData.address,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        alert("Perfil actualizado correctamente");

        window.location.reload();
      } else {
        alert(response.msg || "Error al actualizar perfil");
      }
    } catch (error: any) {
      console.error("Error completo:", error);
      alert(
        "Error: " +
        (error.response?.data?.msg || error.message || "Error al actualizar"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const firstName = parsedUser.first_name || parsedUser.firstName || "";
        const lastName = parsedUser.last_name || parsedUser.lastName || "";

        setFormData({
          firstName,
          lastName,
          phone: parsedUser.phone || "",
          address: parsedUser.address || "",
          password: "",
        });
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <ShowcaseSection
      icon={<FiEdit size={24} />}
      title="Información Personal"
      description="Actualiza tus datos personales"
    >
      {/* Mensaje de advertencia para cuentas especiales */}
      {isHardcodedAccount && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <FiAlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="font-medium text-amber-600 dark:text-amber-400">
              Cuenta de sistema
            </p>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
              Esta es una cuenta de desarrollo/administración y no puede ser editada desde aquí.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <div className="w-full sm:w-1/2">
            <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
              Nombre
            </label>
            <input
              className="w-full rounded-[7px] border border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Tu nombre"
              disabled={isHardcodedAccount}
            />
          </div>

          <div className="w-full sm:w-1/2">
            <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
              Apellido
            </label>
            <input
              className="w-full rounded-[7px] border border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Tu apellido"
              disabled={isHardcodedAccount}
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
            Teléfono
          </label>
          <input
            className="w-full rounded-[7px] border border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="099..."
            disabled={isHardcodedAccount}
          />
        </div>

        <div className="mb-5.5">
          <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
            Dirección
          </label>
          <input
            className="w-full rounded-[7px] border border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Tu dirección"
            disabled={isHardcodedAccount}
          />
        </div>

        <div className="mb-5.5">
          <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-[7px] border border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña para guardar"
            required={!isHardcodedAccount}
            disabled={isHardcodedAccount}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Requerida para sincronizar con el sistema
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-[13px] font-bold text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading || isHardcodedAccount}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
