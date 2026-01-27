export type ParticipantType =
  | "ESTUDIANTE"
  | "DOCENTE"
  | "TRABAJADOR"
  | "EXTERNO"
  | "ADMINISTRATIVO"
  | "DOCENTEADMIN"
  | "PASANTE"
  | "PARTICIPANTE"
  | "INICIACION";

export type ProgramType = "INICIACION" | "FUNCIONAL";

export interface Participant {
  id: string;
  external_id?: string;
  firstName: string;
  lastName?: string;
  dni: string;
  email?: string;
  phone?: string;
  address?: string;
  type: ParticipantType;
  role?: string;
  status?: string;
  age?: number;
  program?: ProgramType;
}

export interface CreateParticipantRequest {
  firstName: string;
  lastName: string;
  dni: string;
  type: ParticipantType;
  phone?: string;
  address?: string;
  age?: number;
  email?: string;
  program: ProgramType;
}

export interface InitiationRequest {
  participant: {
    firstName: string;
    lastName: string;
    age: number;
  };
  guardian: {
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    relationship: string;
  };
}
export interface SelectedParticipant {
  participant_external_id: string;
  participant_name: string;
  dni?: string;
  age?: number;
}

export interface UpdateParticipantData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  age: number;
  dni: string;
}