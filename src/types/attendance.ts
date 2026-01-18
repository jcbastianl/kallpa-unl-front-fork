export interface Session {
  id: string | number;
  external_id?: string;
  schedule_id?: string;
  name: string;
  program?: string;
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
  program: string; // Updated: Program is now a string
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
  max_slots?: number;
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
  program: string;
  startTime: string;     // ✅ Backend espera camelCase
  endTime: string;       // ✅ Backend espera camelCase
  location?: string;
  maxSlots?: number;     // ✅ Backend espera camelCase
  description?: string;
  program_id?: string;
  // Para sesiones recurrentes
  dayOfWeek?: string;    // ✅ Backend espera camelCase y UPPERCASE
  endDate?: string;      // ✅ Backend espera camelCase
  // Para sesiones con fecha específica
  specificDate?: string; // ✅ Backend espera camelCase
}

export interface SessionDetail {
  date: string;
  schedule?: Schedule;
  stats?: {
    present: number;
    absent: number;
    justified: number;
    total: number;
  };
  attendances?: any[]; // Using any[] temporarily or define a proper interface if needed
  records?: AttendanceRecord[];
}
