import axios from 'axios';
import type {
  Session,
  Schedule,
  Participant,
  AttendanceRecord,
  AttendanceHistory,
  SessionDetail,
  CreateScheduleData
} from '@/types/attendance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token || '',
  };
};

export const attendanceService = {
  // Obtener sesiones de hoy (se mantiene igual o se puede actualizar si API cambia)
  // getSessionsToday removed as it is legacy and returns 404

  // Obtener todos los horarios/sesiones programadas
  async getSchedules() {
    return axios.get(`${API_URL}/attendance/v2/public/schedules`, {
      headers: getHeaders(),
    });
  },

  // Obtener programas disponibles
  async getPrograms() {
    return axios.get(`${API_URL}/attendance/v2/public/programs`, {
      headers: getHeaders(),
    });
  },

  // Crear un nuevo horario
  async createSchedule(data: CreateScheduleData) {
    return axios.post(`${API_URL}/attendance/v2/public/schedules`, data, {
      headers: getHeaders(),
    });
  },

  // Actualizar un horario
  async updateSchedule(id: string | number, data: Partial<CreateScheduleData>) {
    return axios.put(`${API_URL}/attendance/v2/public/schedules/${id}`, data, {
      headers: getHeaders(),
    });
  },

  // Eliminar un horario
  async deleteSchedule(id: string | number) {
    return axios.delete(`${API_URL}/attendance/v2/public/schedules/${id}`, {
      headers: getHeaders(),
    });
  },

  // Obtener participantes filtrados por programa
  // Now returns objects with attendance_percentage
  async getParticipantsByProgram(program?: string) {
    const params = program ? `?program=${program}` : '';
    return axios.get(`${API_URL}/attendance/v2/public/participants${params}`, {
      headers: getHeaders(),
    });
  },

  // Alias para compatibilidad (sin filtro)
  async getParticipants() {
    return this.getParticipantsByProgram();
  },

  // Obtener todos los usuarios
  async getAllUsers() {
    return axios.get(`${API_URL}/users`, {
      headers: getHeaders(),
    });
  },

  // Registrar asistencia
  async registerAttendance(data: {
    schedule_external_id: string;
    date: string;
    attendances: { participant_external_id: string; status: string }[];
  }) {
    return axios.post(`${API_URL}/attendance/v2/public/register`, data, {
      headers: getHeaders(),
    });
  },

  // Obtener historial de asistencia
  async getHistory(startDate?: string, endDate?: string, scheduleId?: string, day?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('date_from', startDate); // Updated param name
    if (endDate) params.append('date_to', endDate);     // Updated param name
    if (scheduleId) params.append('schedule_id', scheduleId);
    if (day && day !== 'Todos los días') params.append('day', day);

    return axios.get(`${API_URL}/attendance/v2/public/history?${params.toString()}`, {
      headers: getHeaders(),
    });
  },

  // Obtener detalle de una sesión específica (reutilizando history)
  async getSessionDetail(scheduleExternalId: string, date: string) {
    const params = new URLSearchParams();
    params.append('date_from', date);
    params.append('date_to', date);
    params.append('schedule_external_id', scheduleExternalId);

    return axios.get(`${API_URL}/attendance/v2/public/history?${params.toString()}`, {
      headers: getHeaders(),
    });
  },

  // Eliminar registro de asistencia
  async deleteAttendance(scheduleId: string, date: string) {
    return axios.delete(`${API_URL}/attendance/session/${scheduleId}/${date}`, {
      headers: getHeaders(),
    });
  },

  // Alias para compatibilidad
  async deleteSessionAttendance(scheduleId: string, date: string) {
    return this.deleteAttendance(scheduleId, date);
  },
};

export default attendanceService;

