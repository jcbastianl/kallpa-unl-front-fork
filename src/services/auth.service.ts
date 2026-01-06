import { LoginRequest, LoginResponse } from "@/types/auth";

const API_URL = "http://localhost:5000/api";

  export const authService = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
      let response;

      try {
        response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });
      } catch {
        throw new Error("Error en el sistema, vuelva a intentarlo.");
      }

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new Error(data.message || data.msg || "Error al iniciar sesión");
      }

      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user || data.data;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        document.cookie = `token=${token}; path=/; max-age=86400;`;
      }

      return data;
    },
  
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/";
  },

  // getCurrentUser() {
  //   if (typeof window === "undefined") return null;
  //   const userStr = localStorage.getItem("user");
  //   if (!userStr) return null;
  //   return JSON.parse(userStr);
  // },

  // getToken() {
  //   if (typeof window === "undefined") return null;
  //   return localStorage.getItem("token");
  // },
};
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function getUserRole(): "DOCENTE" | "PASANTE" | "ADMINISTRADOR" | null {
  const user = getCurrentUser();
  return user?.role || null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}