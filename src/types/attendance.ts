/**
 * @module attendance.types
 * @description Tipos e interfaces para el módulo de gestión de asistencia.
 * Define estructuras de datos para sesiones, horarios, participantes,
 * registros de asistencia y programas.
 */

/** Sesión de asistencia con información básica */
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

/** Horario programado para sesiones de asistencia */
export interface Schedule {
  id: string | number;
  external_id?: string;
  name: string;
  program: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  location?: string;
  capacity?: number;
  description?: string;
  specific_date?: string | null;  // null = sesión recurrente
  start_date?: string | null;     // Inicio del rango válido
  end_date?: string | null;       // Fin del rango válido
  is_recurring?: boolean;
  max_slots?: number;
}

/** Participante del sistema (estudiante, profesor, etc.) */
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

/** Registro individual de asistencia */
export interface AttendanceRecord {
  id?: string;
  participant_id: string;
  participant_name?: string;
  schedule_id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'JUSTIFIED';
}

/** Resumen de historial de asistencia por sesión */
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

/** Alias para compatibilidad con código existente */
export type HistoryRecord = AttendanceHistory;

/** Programa de entrenamiento */
export interface Program {
  id: number;
  external_id: string;
  name: string;
  description?: string;
  color?: string;
  participants_count?: number;
  schedules_count?: number;
}

/** Datos para crear un nuevo programa */
export interface CreateProgramData {
  name: string;
  description?: string;
  color?: string;
}

/** Datos para crear un nuevo horario (formato del backend - camelCase) */
export interface CreateScheduleData {
  name: string;
  program: string;
  startTime: string;
  endTime: string;
  location?: string;
  maxSlots?: number;
  description?: string;
  program_id?: string;
  dayOfWeek?: string;    // Para sesiones recurrentes (UPPERCASE)
  endDate?: string;      // Fin del periodo recurrente
  specificDate?: string; // Para sesiones de fecha única
}

/** Detalle completo de una sesión con estadísticas y registros */
export interface SessionDetail {
  date: string;
  schedule?: Schedule;
  stats?: {
    present: number;
    absent: number;
    justified: number;
    total: number;
  };
  attendances?: any[];
  records?: AttendanceRecord[];
}
