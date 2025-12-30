// src/types/auth.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  user: {
    email: string;
    stament?: string; 
    nombre?: string;
    apellido?: string;
  };
  msg: string;
}

export interface AuthUser {
  email: string;
  stament?: string;
  nombre?: string;
  apellido?: string;
}
