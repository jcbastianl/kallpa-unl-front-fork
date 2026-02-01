/**
 * @module attendance.services
 * @description Servicio para gestión de asistencias.
 * Proporciona métodos para interactuar con la API de asistencia,
 * incluyendo horarios, participantes, programas y registros de asistencia.
 */

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

/**
 * Genera los headers de autenticación para las peticiones.
 * @returns Headers con Content-Type y token de autorización
 */
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token || '',
  };
};

/**
 * Servicio de asistencia - API v2
 */
export const attendanceService = {
  
  // ==================== HORARIOS ====================

  /**
   * Obtiene todos los horarios/sesiones programadas.
   */
  async getSchedules() {
    return axios.get(`${API_URL}/attendance/v2/public/schedules`, {
      headers: getHeaders(),
    });
  },

  /**
   * Crea un nuevo horario de sesión.
   * @param data - Datos del horario a crear
   */
  async createSchedule(data: CreateScheduleData) {
    return axios.post(`${API_URL}/attendance/v2/public/schedules`, data, {
      headers: getHeaders(),
    });
  },

  /**
   * Actualiza un horario existente.
   * @param id - ID del horario
   * @param data - Datos a actualizar
   */
  async updateSchedule(id: string | number, data: Partial<CreateScheduleData>) {
    return axios.put(`${API_URL}/attendance/v2/public/schedules/${id}`, data, {
      headers: getHeaders(),
    });
  },

  /**
   * Elimina un horario.
   * @param id - ID del horario a eliminar
   */
  async deleteSchedule(id: string | number) {
    return axios.delete(`${API_URL}/attendance/v2/public/schedules/${id}`, {
      headers: getHeaders(),
    });
  },

  // ==================== PROGRAMAS ====================

  /**
   * Obtiene todos los programas disponibles.
   */
  async getPrograms() {
    return axios.get(`${API_URL}/attendance/v2/public/programs`, {
      headers: getHeaders(),
    });
  },

  /**
   * Crea un nuevo programa.
   * @param data - Datos del programa
   */
  async createProgram(data: { name: string; description?: string; color?: string }) {
    return axios.post(`${API_URL}/attendance/v2/public/programs`, data, {
      headers: getHeaders(),
    });
  },

  /**
   * Actualiza un programa existente.
   * @param id - ID del programa
   * @param data - Datos a actualizar
   */
  async updateProgram(id: string, data: { name?: string; description?: string; color?: string }) {
    return axios.put(`${API_URL}/attendance/v2/public/programs/${id}`, data, {
      headers: getHeaders(),
    });
  },

  /**
   * Elimina un programa.
   * @param id - ID del programa a eliminar
   */
  async deleteProgram(id: string) {
    return axios.delete(`${API_URL}/attendance/v2/public/programs/${id}`, {
      headers: getHeaders(),
    });
  },

  /**
   * Obtiene los participantes de un programa específico.
   * @param programId - ID del programa
   */
  async getProgramParticipants(programId: string) {
    return axios.get(`${API_URL}/attendance/v2/public/programs/${programId}/participants`, {
      headers: getHeaders(),
    });
  },

  // ==================== PARTICIPANTES ====================

  /**
   * Obtiene participantes filtrados opcionalmente por programa.
   * @param program - Nombre del programa para filtrar (opcional)
   */
  async getParticipantsByProgram(program?: string) {
    const params = program ? `?program=${program}` : '';
    return axios.get(`${API_URL}/attendance/v2/public/participants${params}`, {
      headers: getHeaders(),
    });
  },

  /**
   * Obtiene todos los participantes (alias sin filtro).
   */
  async getParticipants() {
    return this.getParticipantsByProgram();
  },

  /**
   * Obtiene todos los usuarios del sistema.
   */
  async getAllUsers() {
    return axios.get(`${API_URL}/users`, {
      headers: getHeaders(),
    });
  },

  // ==================== ASISTENCIA ====================

  /**
   * Registra la asistencia de una sesión.
   * @param data - Datos de asistencia con lista de participantes y estados
   */
  async registerAttendance(data: {
    schedule_external_id: string;
    date: string;
    attendances: { participant_external_id: string; status: string }[];
  }) {
    return axios.post(`${API_URL}/attendance/v2/public/register`, data, {
      headers: getHeaders(),
    });
  },

  /**
   * Obtiene el historial de asistencia con filtros opcionales.
   * @param startDate - Fecha de inicio (YYYY-MM-DD)
   * @param endDate - Fecha de fin (YYYY-MM-DD)
   * @param scheduleId - ID del horario (opcional)
   * @param day - Día de la semana para filtrar (opcional)
   */
  async getHistory(startDate?: string, endDate?: string, scheduleId?: string, day?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('date_from', startDate);
    if (endDate) params.append('date_to', endDate);
    if (scheduleId) params.append('schedule_id', scheduleId);
    if (day && day !== 'Todos los días') params.append('day', day);

    return axios.get(`${API_URL}/attendance/v2/public/history?${params.toString()}`, {
      headers: getHeaders(),
    });
  },

  /**
   * Obtiene el detalle de asistencia de una sesión específica.
   * @param scheduleExternalId - ID externo del horario
   * @param date - Fecha de la sesión (YYYY-MM-DD)
   */
  async getSessionDetail(scheduleExternalId: string, date: string) {
    return axios.get(`${API_URL}/attendance/v2/public/history/session/${scheduleExternalId}/${date}`, {
      headers: getHeaders(),
    });
  },

  /**
   * Elimina un registro de asistencia.
   * @param scheduleId - ID del horario
   * @param date - Fecha de la sesión
   */
  async deleteAttendance(scheduleId: string, date: string) {
    return axios.delete(`${API_URL}/attendance/session/${scheduleId}/${date}`, {
      headers: getHeaders(),
    });
  },

  /**
   * Alias para eliminar asistencia (compatibilidad).
   */
  async deleteSessionAttendance(scheduleId: string, date: string) {
    return this.deleteAttendance(scheduleId, date);
  },
};

export default attendanceService;

