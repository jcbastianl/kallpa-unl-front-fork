export interface Participant {
  external_id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  status: string;
  type: string;
  dni: string;
}