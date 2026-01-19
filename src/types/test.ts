import { ReactNode } from "react";

export interface TestExercise {
  external_id?: string;
  name: string;
  unit: string;
}

export interface TestData {
  external_id?: string;
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

export interface TestListItemForParticipant {
  external_id: string;
  name: string;
  description: string | null;
  frequency_months: number;
  exercises: TestExercise[];
  already_done: boolean;
}
export interface TestHistoryTimelineItem {
  date: string; // fecha ISO
  value: number; // valor de la evaluación
}

export interface TestHistoryStats {
  count: number;
  average: number | null;
  min: number | null;
  max: number | null;
  first_value: number | null;
  last_value: number | null;
  delta: number | null;
}

export interface TestHistoryTrend {
  status: string; // "Mejorando" | "Bajando" | "Estable" | "Inestable"
  description: string; // texto descriptivo
}

export interface TestHistoryExercise {
  exercise_name: string;
  unit: string;
  stats: TestHistoryStats;
  timeline: TestHistoryTimelineItem[];
  trend: TestHistoryTrend;
}

export interface TestHistoryData {
  participant_external_id: string;
  test_external_id: string;
  start_date: string;
  end_date: string; 
  exercises: {
    [exerciseExternalId: string]: TestHistoryExercise;
  };
}

export interface ProgressItem {
  evaluation_external_id: string;
  date: string;
  general_observations: string;
  results: Record<string, number>;
  test_name: string;
  total: number;
}

export interface ParticipantProgressResponse {
  participant_name: string;
  progress: ProgressItem[];
}

