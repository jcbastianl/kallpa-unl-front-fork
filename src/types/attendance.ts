export interface Session {
  id: string | number;
  external_id?: string;
  schedule_id?: string;
  name: string;
  program_name?: string;
  program_id?: string;
  start_time: string;
  end_time: string;
  day_of_week?: string;
  location?: string;
  attendance_count: number;
  participant_count?: number;
}

export interface Schedule {
  id: string | number;
  external_id?: string;
  name: string;
  program_name?: string;
  program_id?: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  location?: string;
  capacity?: number;
  description?: string;
  specific_date?: string | null;  // Fecha específica (null si es recurrente)
  start_date?: string | null;     // Rango de fechas inicio
  end_date?: string | null;       // Rango de fechas fin
  is_recurring?: boolean;         // false=fecha única, true=semanal
}

export interface Participant {
  id: string;
  external_id?: string;
  name: string;
  dni?: string;
  email?: string;
  phone?: string;
  role?: string;
  status: string;
}

export interface AttendanceRecord {
  id?: string;
  participant_id: string;
  participant_name?: string;
  schedule_id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'JUSTIFIED';
}

export interface AttendanceHistory {
  schedule_id: string;
  schedule_name: string;
  date: string;
  day_of_week?: string;
  start_time: string;
  end_time: string;
  presentes: number;
  ausentes: number;
  total: number;
}

// Alias para compatibilidad
export type HistoryRecord = AttendanceHistory;

// Interface para Programas
export interface Program {
  id: number;
  external_id: string;
  name: string;
  description?: string;
  color?: string;
  participants_count?: number;
  schedules_count?: number;
}

export interface CreateProgramData {
  name: string;
  description?: string;
  color?: string;
}

// Interface para crear sesiones
export interface CreateScheduleData {
  name: string;
  start_time: string;
  end_time: string;
  location?: string;
  capacity?: number;
  description?: string;
  program_id?: string;  // ID del programa asociado
  // Para sesiones recurrentes
  day_of_week?: string;
  start_date?: string;   // Opcional: desde cuándo aplica
  end_date?: string;     // Opcional: hasta cuándo aplica
  // Para sesiones con fecha específica
  specific_date?: string; // Fecha específica (YYYY-MM-DD)
}

export interface SessionDetail {
  date: string;
  schedule?: Schedule;
  stats?: {
    presentes: number;
    ausentes: number;
    total: number;
  };
  records?: AttendanceRecord[];
}
