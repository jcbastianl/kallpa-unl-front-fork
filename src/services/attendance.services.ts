/**
 * @module attendance.services
 * @description Servicio para gestión de asistencias.
 * Proporciona métodos para interactuar con la API de asistencia,
 * incluyendo horarios, participantes, programas y registros de asistencia.
 */

import axios from 'axios';
import type {
  CreateScheduleData
} from '@/types/attendance';
import { fetchWithSession } from './fetchWithSession';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Genera los headers de autenticación para las peticiones.
 * @returns Headers con Content-Type y token de autorización
 */
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  // Si el token no incluye "Bearer", agregarlo
  const authHeader = token && !token.startsWith('Bearer ') ? `Bearer ${token}` : token;
  return {
    'Content-Type': 'application/json',
    'Authorization': authHeader || '',
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
    const res = await fetchWithSession(
      `${API_URL}/attendance/v2/public/schedules`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return result;
  },

  /**
   * Crea un nuevo horario de sesión.
   * @param data - Datos del horario a crear
   */
  async createSchedule(data: CreateScheduleData) {
    const res = await fetchWithSession(
      `${API_URL}/attendance/v2/public/schedules`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return result;

  },

  /**
   * Actualiza un horario existente.
   * @param id - ID del horario
   * @param data - Datos a actualizar
   */
  async updateSchedule(id: string | number, data: Partial<CreateScheduleData>) {
    const res = await fetchWithSession(
      `${API_URL}/attendance/v2/public/schedules/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return result;
  },

  /**
   * Elimina un horario.
   * @param id - ID del horario a eliminar
   */
  async deleteSchedule(id: string | number) {
    const res = await fetchWithSession(
      `${API_URL}/attendance/v2/public/schedules/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return result;
  },

  // ==================== PARTICIPANTES ====================

  /**
   * Obtiene participantes filtrados opcionalmente por programa.
   * @param program - Nombre del programa para filtrar (opcional)
   */
  async getParticipantsByProgram(program?: string) {
    const params = program ? `?program=${program}` : '';
    const res = await fetchWithSession(
      `${API_URL}/attendance/v2/public/participants${params}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return result;
  },

  /**
   * Obtiene todos los participantes (alias sin filtro).
   */
  async getParticipants() {
    return this.getParticipantsByProgram();
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

    const res = await fetchWithSession(
      `${API_URL}/attendance/v2/public/history?${params.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return result;
  },

  /**
   * Obtiene el detalle de asistencia de una sesión específica.
   * @param scheduleExternalId - ID externo del horario
   * @param date - Fecha de la sesión (YYYY-MM-DD)
   */
  async getSessionDetail(scheduleExternalId: string, date: string) {
    const res = await fetchWithSession(
      `${API_URL}/attendance/v2/public/history/session/${scheduleExternalId}/${date}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return result;
  },

  /**
   * Elimina un registro de asistencia.
   * @param scheduleId - ID del horario
   * @param date - Fecha de la sesión
   */
  async deleteAttendance(scheduleId: string, date: string) {
    const res = await fetchWithSession(
      `${API_URL}/attendance/session/${scheduleId}/${date}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return result;
  },

  async deleteSessionAttendance(scheduleId: string, date: string) {
    return this.deleteAttendance(scheduleId, date);
  },

  async registerAttendance(data: {
    schedule_external_id: string;
    date: string;
    attendances: { participant_external_id: string; status: string }[];
  }) {
    const res = await fetchWithSession(
      `${API_URL}/attendance/v2/public/register`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return result;
  },
};

export default attendanceService;

