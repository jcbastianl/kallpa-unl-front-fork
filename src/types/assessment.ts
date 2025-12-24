export interface AssessmentData {
  participant_external_id: string;
  date: string;
  weight: number;
  height: number;
  waistPerimeter: number;
  wingspan: number;
}
export interface AssessmentResponseData extends AssessmentData {
  bmi: number;
  status: string;
  external_id: string;
  age: number;
  participant_name: string;
}
export interface AssessmentTableData {
  participant_external_id: string;
  participant_name: string;
  external_id: string;
  date: string;
  age: number;
  bmi: number;
  status: string;
}
