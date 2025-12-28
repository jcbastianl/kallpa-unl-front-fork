import { ApiResponse } from "@/types/api";
import { get, post, postWithAuth } from "./apiUtils";
import type { Participant, InitiationRequest } from "@/types/participant";
import { AssessmentData, AssessmentResponseData } from "@/types/assessment";
import type { LoginRequest, LoginResponse } from "@/types/auth";

// ==================== AUTH ====================

// Login - Conecta con tu Proxy / AuthController
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await post<LoginResponse, LoginRequest>("/auth/login", credentials);
  return response;
};

// ==================== PARTICIPANTES ====================

export const getParticipants = async (): Promise<Participant[]> => {
  const response = await get<ApiResponse<Participant[]>>("/users");
  return response.data;
};

// Crear usuario estándar
export const createParticipant = async (data: Participant): Promise<ApiResponse<Participant>> => {
  const response = await postWithAuth<ApiResponse<Participant>, Participant>("/users", data);
  return response;
};

// Crear Iniciación Deportiva (Niño + Padre - Transacción)
export const createInitiation = async (data: InitiationRequest): Promise<ApiResponse<any>> => {
  const response = await postWithAuth<ApiResponse<any>, InitiationRequest>("/users/initiation", data);
  return response;
};

// Búsqueda segura por DNI 
export const searchParticipantByDni = async (dni: string): Promise<Participant | null> => {
  try {
    const response = await postWithAuth<ApiResponse<Participant>, { dni: string }>("/users/search", { dni });
    return response.data;
  } catch (error) {
    return null;
  }
};

// ==================== MEDIDAS ANTROPOMÉTRICAS ====================
export const saveAssessment = async (
  data: AssessmentData
): Promise<ApiResponse<AssessmentResponseData>> => {
  const response = await post<ApiResponse<AssessmentResponseData>, AssessmentData>(
    "/save-assessment",
    data
  );
  return response;
};

export const getRecords = async (): Promise<AssessmentResponseData[]> => {
  const response = await get<ApiResponse<AssessmentResponseData[]>>(
    "/list-assessment"
  );
  return response.data;
};