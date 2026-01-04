import { ApiResponse } from "@/types/api";
import { get, post, postWithAuth } from "./apiUtils";
import type { Participant, InitiationRequest } from "@/types/participant";
import { AssessmentData, AssessmentResponseData } from "@/types/assessment";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import {
  RegisterTestFormData,
  TestData,
  TestHistoryData,
  TestListItem,
  TestListItemForParticipant,
  TestResponseData,
} from "@/types/test";

// ==================== AUTH ====================

// Login - Conecta con tu Proxy / AuthController
export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await post<LoginResponse, LoginRequest>(
    "/auth/login",
    credentials,
  );
  return response;
};

// ==================== PARTICIPANTES ====================

export const getParticipants = async (): Promise<Participant[]> => {
  const response = await get<ApiResponse<Participant[]>>("/users");
  return response.data;
};

// Crear usuario estándar
export const createParticipant = async (
  data: Participant,
): Promise<ApiResponse<Participant>> => {
  const response = await postWithAuth<ApiResponse<Participant>, Participant>(
    "/users",
    data,
  );
  return response;
};

// Crear Iniciación Deportiva (Niño + Padre - Transacción)
export const createInitiation = async (
  data: InitiationRequest,
): Promise<ApiResponse<any>> => {
  const response = await postWithAuth<ApiResponse<any>, InitiationRequest>(
    "/users/initiation",
    data,
  );
  return response;
};

// Búsqueda segura por DNI
export const searchParticipantByDni = async (
  dni: string,
): Promise<Participant | null> => {
  try {
    const response = await postWithAuth<
      ApiResponse<Participant>,
      { dni: string }
    >("/users/search", { dni });
    return response.data;
  } catch (error) {
    return null;
  }
};

// ==================== MEDIDAS ANTROPOMÉTRICAS ====================
export const saveAssessment = async (
  data: AssessmentData,
): Promise<ApiResponse<AssessmentResponseData>> => {
  const response = await post<
    ApiResponse<AssessmentResponseData>,
    AssessmentData
  >("/save-assessment", data);
  return response;
};

export const getRecords = async (): Promise<AssessmentResponseData[]> => {
  const response =
    await get<ApiResponse<AssessmentResponseData[]>>("/list-assessment");
  return response.data;
};

export const getAssessmentsByParticipant = async (
  participantExternalId: string,
) => {
  const response = await get<
    ApiResponse<{
      participant: Participant;
      assessments: AssessmentResponseData[];
    }>
  >(`/participants/${participantExternalId}/assessments`);

  return response.data;
};

export const getAverageBMI = async (): Promise<{ average_bmi: number | null }> => {
  const response = await get<ApiResponse<{ average_bmi: number | null }>>(
    "/average-bmi"
  );
  return response.data;
};

export const getAnthropometricHistory = async (
  dateFrom?: string,
  dateTo?: string,
) => {
  const params = new URLSearchParams();
  if (dateFrom) params.append("date_from", dateFrom);
  if (dateTo) params.append("date_to", dateTo);

  const response = await get<ApiResponse<AssessmentResponseData[]>>(
    `/assessments/history?${params.toString()}`
  );

  return response.data; // esto contendrá el arreglo de evaluaciones
};


// ==================== TEST FORMULARIOS ====================
export const getTests = async (): Promise<TestListItem[]> => {
  const response = await get<ApiResponse<TestListItem[]>>("/list-test");
  return response.data;
};

export const saveTest = async (
  data: TestData,
): Promise<ApiResponse<TestResponseData>> => {
  const response = await post<ApiResponse<TestResponseData>, TestData>(
    "/save-test",
    data,
  );

  return response;
};

export const registerForm = async (
  data: RegisterTestFormData,
): Promise<ApiResponse<any>> => {
  const response = await post<ApiResponse<any>, RegisterTestFormData>(
    "/apply_test",
    data,
  );

  return response;
};

export const getTestsForParticipant = async (
  participant_external_id: string,
): Promise<TestListItemForParticipant[]> => {
  const response = await get<ApiResponse<TestListItemForParticipant[]>>(
    `/list-tests-participant?participant_external_id=${participant_external_id}`,
  );
  return response.data;
};

export const getTestHistory = async (
  participantExternalId: string,
  testExternalId: string,
  months: number = 6,
  startDate?: string,   // YYYY-MM-DD opcional
  endDate?: string,     // YYYY-MM-DD opcional
): Promise<ApiResponse<TestHistoryData>> => {
  const params = new URLSearchParams({
    participant_external_id: participantExternalId,
    test_external_id: testExternalId,
    months: months.toString(),
  });

  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const response = await get<ApiResponse<TestHistoryData>>(`/history?${params.toString()}`);
  return response;
};
