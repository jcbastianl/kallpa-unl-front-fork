"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { login } from "@/hooks/api";

/**
 * Componente de formulario para inicio de sesión con email y contraseña.
 * Maneja la autenticación contra el backend y redirige al dashboard si es exitosa.
 */
export default function SigninWithPassword() {
  const router = useRouter();

  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Actualiza el estado del formulario cuando cambian los inputs */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  /** Envía las credenciales al backend, guarda el token y redirige al dashboard */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });

      if (response.token) {
        localStorage.setItem("token", response.token);

        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }

        router.push("/dashboard");
      } else {
        setError(response.msg || "Credenciales incorrectas");
      }
    } catch (err: any) {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-900/20 p-4 text-sm text-red-500">
          {error}
        </div>
      )}
      <InputGroup
        type="email"
        label=""
        className="mb-4 [&_input]:border-slate-700 [&_input]:bg-[#0f172a] [&_input]:py-[15px] [&_input]:text-white focus:[&_input]:border-[#5e5ce6]"
        placeholder="Enter your email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label=""
        className="mb-5 [&_input]:border-slate-700 [&_input]:bg-[#0f172a] [&_input]:py-[15px] [&_input]:text-white focus:[&_input]:border-[#5e5ce6]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
        {/* Color de texto para el checkbox y link */}
        <div className="text-sm text-slate-400">
          <Checkbox
            label="Remember me"
            name="remember"
            withIcon="check"
            minimal
            radius="md"
            onChange={(e) =>
              setData({
                ...data,
                remember: e.target.checked,
              })
            }
          />
        </div>

        <Link
          href="/auth/forgot-password"
          className="text-sm text-slate-400 transition-colors hover:text-[#5e5ce6]"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#5e5ce6] p-4 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-opacity-90"
        >
          {loading ? "Cargando..." : "Sign In"}
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
          )}
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-slate-400">
        Don't have any account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-[#5e5ce6] hover:underline"
        >
          Sign Up
        </Link>
      </div>
    </form>
  );
}
