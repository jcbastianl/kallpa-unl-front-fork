import { ReactNode } from "react";

export interface TestExercise {
  external_id?: string;
  name: string;
  unit: string;
}

export interface TestData {
  external_id: string;
  name: string;
  description: string;
  frequency_months: number;
  exercises: TestExercise[];
}

export interface TestResponseData {
  test_external_id: string;
}
export interface TestListItem {
  external_id: string;
  name: string;
  description: string | null;
  frequency_months: number;
  exercises: TestExercise[];
}
export interface Test {
  id: string;
  name: string;
  description: string;
  frequencyMonths: number;
  icon: ReactNode;
  exercises: TestExercise[];
}
export interface TestResult {
  test_exercise_external_id: string;
  value: number;
}

export interface RegisterTestFormData {
  participant_external_id: string;
  test_external_id: string;
  general_observations: string;
  date: string;
  results: TestResult[];
}