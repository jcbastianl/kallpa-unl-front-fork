"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/sign-in");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Mientras verificamos, mostramos un loader para evitar el "flash"
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-boxdark">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
