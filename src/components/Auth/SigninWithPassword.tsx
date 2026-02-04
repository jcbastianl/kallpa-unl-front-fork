"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { authService } from "@/services/auth.service";

export default function SigninWithPassword() {
  const router = useRouter();

  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.login({
        email: data.email,
        password: data.password,
      });
      
      setTimeout(() => {
        router.push("/pages/participant");
      }, 100);
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-400/50 bg-red-500/10 backdrop-blur-sm p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <InputGroup
        type="email"
        label=""
        className="mb-4 [&_input]:border-white/20 [&_input]:bg-white/5 [&_input]:py-[15px] [&_input]:text-white [&_input]:placeholder-gray-400 focus:[&_input]:border-indigo-400 focus:[&_input]:bg-white/10 [&_input]:backdrop-blur-sm"
        placeholder="Ingrese su email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label=""
        className="mb-5 [&_input]:border-white/20 [&_input]:bg-white/5 [&_input]:py-[15px] [&_input]:text-white [&_input]:placeholder-gray-400 focus:[&_input]:border-indigo-400 focus:[&_input]:bg-white/10 [&_input]:backdrop-blur-sm"
        placeholder="Ingrese su contraseña"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />
      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 p-4 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Iniciando sesión..." : "Ingresar"}
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}