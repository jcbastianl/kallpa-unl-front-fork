export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    dni: string;
    phone?: string;
    address: string;
    email: string;
    password: string;
    role: "DOCENTE" | "PASANTE" | "ADMINISTRADOR";
  }
  
  export interface CreateUserResponse {
    status: "success" | "error";
    msg: string;
    code: number;
    data?: {
      external_id: string;
      role: string;
    };
  }
  