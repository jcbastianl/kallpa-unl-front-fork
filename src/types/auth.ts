export interface User {
  external: string;
  stament: string;
  first_name: string;
  last_name: string;
  email: string;
  photo?: string;
  token: string;
}

export interface LoginResponse {
  data: User;
  message: string;
  errors: any[];
  status: "success" | "error";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  external: string;
  stament: string;
  first_name: string;
  last_name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  photo?: string;
  token: string;
  phone?: string;
  address?: string;
}
export type Role = "DOCENTE" | "PASANTE" | "ADMINISTRADOR";

export interface NavSubItem {
  title: string;
  url: string;
  roles?: Role[];
}

export interface NavItem {
  title: string;
  icon: any;
  url?: string;
  roles?: Role[];
  items: NavSubItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}
