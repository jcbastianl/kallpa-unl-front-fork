import { ApiResponse } from "@/types/api";
import { get, post } from "./apiUtils";
import type { Participant } from "@/types/participant";
import { AssessmentData, AssessmentResponseData } from "@/types/assessment";

export const getParticipants = async (): Promise<Participant[]> => {
  const response = await get<ApiResponse<Participant[]>>("/users");
  return response.data;
};

//Medidas Antropometricas
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