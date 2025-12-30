import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-700/50 bg-[#1e293b] px-10 py-10 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5e5ce6] text-white shadow-[0_0_20px_rgba(94,92,230,0.3)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6.5 6.5 11 11" />
                <path d="m10 10 5.5 5.5" />
                <path d="m3 21 2.5-2.5" />
                <path d="m3 14 7 7" />
                <path d="m14 3 7 7" />
                <path d="m18.5 5.5 2.5-2.5" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-white">
            Kallpa UNL
          </h1>
        </div>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-white">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-slate-400">
            Ingresa tus credenciales para acceder al panel.
          </p>
        </div>
        <div className="signin-wrapper">
          <Signin />
        </div>
      </div>
    </div>
  );
}
