export interface Participant {
  id: number;
  external_id?: string;
  firstName: string;
  lastName?: string;
  email: string | null;
  status?: string;
  type?: string;
  role?: string;
  dni?: string;
  age?: number;
  phone?: string;
  address?: string;
}

export interface InitiationRequest {
  participant: Participant;
  guardian: {
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    relationship: string;
  };
}