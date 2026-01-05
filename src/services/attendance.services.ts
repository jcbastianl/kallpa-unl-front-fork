import axios from 'axios';
import type { 
  Session, 
  Schedule, 
  Participant, 
  AttendanceRecord, 
  AttendanceHistory, 
  SessionDetail,
  CreateScheduleData,
  Program,
  CreateProgramData
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
  // ==================== PROGRAMAS ====================
  
  // Obtener lista de programas
  async getPrograms() {
    return axios.get(`${API_URL}/attendance/programs`, {
      headers: getHeaders(),
    });
  },

  // Obtener programas con detalles (conteo de participantes y sesiones)
  async getProgramsWithDetails() {
    return axios.get(`${API_URL}/attendance/programs/details`, {
      headers: getHeaders(),
    });
  },

  // Obtener un programa específico con sus participantes
  async getProgram(externalId: string) {
    return axios.get(`${API_URL}/attendance/programs/${externalId}`, {
      headers: getHeaders(),
    });
  },

  // Crear un nuevo programa
  async createProgram(data: CreateProgramData) {
    return axios.post(`${API_URL}/attendance/programs`, data, {
      headers: getHeaders(),
    });
  },

  // Actualizar un programa
  async updateProgram(externalId: string, data: Partial<CreateProgramData>) {
    return axios.put(`${API_URL}/attendance/programs/${externalId}`, data, {
      headers: getHeaders(),
    });
  },

  // Eliminar un programa
  async deleteProgram(externalId: string) {
    return axios.delete(`${API_URL}/attendance/programs/${externalId}`, {
      headers: getHeaders(),
    });
  },

  // Obtener participantes de un programa
  async getProgramParticipants(externalId: string) {
    return axios.get(`${API_URL}/attendance/programs/${externalId}/participants`, {
      headers: getHeaders(),
    });
  },

  // ==================== SESIONES ====================

  // Obtener sesiones de hoy
  async getSessionsToday() {
    return axios.get(`${API_URL}/attendance/sessions/today`, {
      headers: getHeaders(),
    });
  },

  // Obtener todos los horarios/sesiones programadas
  async getSchedules() {
    return axios.get(`${API_URL}/attendance/schedules`, {
      headers: getHeaders(),
    });
  },

  // Crear un nuevo horario
  async createSchedule(data: CreateScheduleData) {
    return axios.post(`${API_URL}/attendance/schedules`, data, {
      headers: getHeaders(),
    });
  },

  // Actualizar un horario
  async updateSchedule(id: string, data: Partial<CreateScheduleData>) {
    return axios.put(`${API_URL}/attendance/schedules/${id}`, data, {
      headers: getHeaders(),
    });
  },

  // Eliminar un horario
  async deleteSchedule(id: string) {
    return axios.delete(`${API_URL}/attendance/schedules/${id}`, {
      headers: getHeaders(),
    });
  },

  // ==================== PARTICIPANTES ====================

  // Obtener participantes (solo participantes activos, sin docentes/staff) - para registro de asistencia
  async getParticipants() {
    return axios.get(`${API_URL}/users/participants`, {
      headers: getHeaders(),
    });
  },

  // Obtener todos los usuarios (incluye profesores y staff) - para página de participantes
  async getAllUsers() {
    return axios.get(`${API_URL}/users`, {
      headers: getHeaders(),
    });
  },

  // ==================== ASISTENCIA ====================

  // Registrar asistencia
  async registerAttendance(data: {
    schedule_id: string;
    date: string;
    records: { participant_id: string; status: string }[];
  }) {
    return axios.post(`${API_URL}/attendance/register`, data, {
      headers: getHeaders(),
    });
  },

  // Obtener historial de asistencia
  async getHistory(startDate?: string, endDate?: string, scheduleId?: string, day?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (scheduleId) params.append('scheduleId', scheduleId);
    if (day && day !== 'Todos los días') params.append('day', day);
    
    return axios.get(`${API_URL}/attendance/history?${params.toString()}`, {
      headers: getHeaders(),
    });
  },

  // Obtener detalle de una sesión específica
  async getSessionDetail(scheduleId: string, date: string) {
    return axios.get(`${API_URL}/attendance/session/${scheduleId}/${date}`, {
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
