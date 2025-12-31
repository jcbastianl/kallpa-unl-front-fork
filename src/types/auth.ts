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
  email: string;
  photo?: string;
  token: string;
}
