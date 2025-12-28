"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const publicPaths = ["/auth/sign-in", "/auth/sign-up"];
    const isPublicPath = publicPaths.includes(pathname);
    const token = localStorage.getItem("token");

    if (!token && !isPublicPath) {
      router.push("/auth/sign-in");
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
