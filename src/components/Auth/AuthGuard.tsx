"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Rutas públicas (login y registro)
    const publicPaths = ["/", "/auth/sign-in", "/auth/sign-up"];
    const isPublicPath = publicPaths.includes(pathname);
    const token = localStorage.getItem("token");

    if (!token && !isPublicPath) {
      // Si no hay token y no es una ruta pública, redirigir al login
      router.push("/");
      setAuthorized(false);
    } else if (token && isPublicPath) {
      // Si hay token y está en una ruta pública (login), redirigir al dashboard
      router.push("/dashboard");
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
