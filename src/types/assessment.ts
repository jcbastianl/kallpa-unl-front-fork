export interface AssessmentData {
  participant_external_id: string;
  date: string;
  weight: number;
  height: number;
  waistPerimeter: number;
  armPerimeter: number;
  legPerimeter: number;
  calfPerimeter: number;
}
export interface AssessmentResponseData extends AssessmentData {
  bmi: number;
  status: string;
  external_id: string;
  age: number;
  participant_name: string;
  height: number;
}
export interface AssessmentTableData {
  participant_external_id: string;
  participant_name: string;
  external_id: string;
  date: string;
  age: number;
  bmi: number;
  dni?: number;
  status: string;
  height: number;
  weight: number;
  waistPerimeter: number;
  armPerimeter: number;
  legPerimeter: number;
  calfPerimeter: number;
}
export interface BmiDistributionItem {
  label: string;
  value: number;
}