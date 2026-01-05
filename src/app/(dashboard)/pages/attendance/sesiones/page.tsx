"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.services';
import type { Schedule } from '@/types/attendance';

function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
    </div>
  );
}

export default function Sesiones() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const [editingSession, setEditingSession] = useState<Schedule | null>(null);

  const daysOrder = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const res = await attendanceService.getSchedules();

      // Función para normalizar día (quitar acentos y pasar a mayúsculas)
      const normalizeDay = (day: string): string => {
        if (!day) return 'SIN DÍA';
        const normalized = day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const dayMap: Record<string, string> = {
          'monday': 'LUNES', 'lunes': 'LUNES',
          'tuesday': 'MARTES', 'martes': 'MARTES',
          'wednesday': 'MIERCOLES', 'miercoles': 'MIERCOLES',
          'thursday': 'JUEVES', 'jueves': 'JUEVES',
          'friday': 'VIERNES', 'viernes': 'VIERNES',
          'saturday': 'SABADO', 'sabado': 'SABADO',
          'sunday': 'DOMINGO', 'domingo': 'DOMINGO',
        };
        return dayMap[normalized] || day.toUpperCase();
      };

      const rawData = res.data.data || [];
      const normalized = rawData.map((s: any) => {
        const dayFromBackend = s.dayOfWeek || s.day_of_week || '';
        return {
          ...s,
          id: s.external_id || s.id,
          day_of_week: normalizeDay(dayFromBackend),
          start_time: s.startTime || s.start_time,
          end_time: s.endTime || s.end_time,
        };
      });
      setSchedules(normalized);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = () => {
    const grouped: Record<string, Schedule[]> = {};
    schedules.forEach(s => {
      const day = s.day_of_week?.toUpperCase() || 'SIN DÍA';
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(s);
    });
    return grouped;
  };

  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      'LUNES': 'bg-blue-500', 'MARTES': 'bg-green-500', 'MIERCOLES': 'bg-yellow-500',
      'JUEVES': 'bg-purple-500', 'VIERNES': 'bg-red-500', 'SABADO': 'bg-pink-500', 'DOMINGO': 'bg-gray-500',
    };
    return colors[day] || 'bg-gray-500';
  };

  const handleDelete = async (sessionId: string | number, sessionName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la sesión "${sessionName}"?`)) return;

    setDeleting(sessionId);
    try {
      await attendanceService.deleteSchedule(sessionId);
      setSchedules(prev => prev.filter(s => (s.external_id || s.id) !== sessionId));
    } catch (error) {
      alert('Error al eliminar la sesión');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (session: Schedule) => {
    setEditingSession({ ...session });
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSession) return;

    const formData = new FormData(e.currentTarget);
    const sessionId = editingSession.external_id || editingSession.id;

    const dayMap: Record<string, string> = {
      'LUNES': 'monday', 'MARTES': 'tuesday', 'MIERCOLES': 'wednesday',
      'JUEVES': 'thursday', 'VIERNES': 'friday', 'SABADO': 'saturday', 'DOMINGO': 'sunday'
    };
    const dayValue = editingSession.day_of_week || '';

    const data = {
      name: formData.get('name') as string,
      program: editingSession.program || '', // Include program from state
      day_of_week: dayMap[dayValue] || dayValue.toLowerCase(), // Map to English
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      location: formData.get('location') as string,
    };

    try {
      await attendanceService.updateSchedule(sessionId, data);
      setEditingSession(null);
      loadSchedules();
    } catch (error) {
      alert('Error al actualizar la sesión');
    }
  };

  const grouped = groupByDay();

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Sesiones</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Horarios de sesiones por día de la semana.</p>
          </div>
          <Link
            href="/pages/attendance/programar"
            className="inline-flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Nueva Sesión
          </Link>
        </div>
      </div>

      {/* Sessions by Day */}
      <div className="space-y-6">
        {daysOrder.map(day => {
          const daySessions = grouped[day];
          if (!daySessions || daySessions.length === 0) return null;

          return (
            <div key={day} className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className={`${getDayColor(day)} px-6 py-3`}>
                <h2 className="text-white font-semibold text-lg">{day}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daySessions.map(session => {
                    const sessionId = session.external_id || session.id;
                    return (
                      <div key={sessionId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{session.name || 'Sesión'}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{session.program || 'Sin programa'}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(session)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Editar sesión"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(sessionId, session.name || 'esta sesión')}
                              disabled={deleting === sessionId}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Eliminar sesión"
                            >
                              <span className="material-symbols-outlined text-lg">
                                {deleting === sessionId ? 'hourglass_empty' : 'delete'}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">schedule</span>
                            {session.start_time} - {session.end_time}
                          </span>
                          {session.location && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">location_on</span>
                              {session.location}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/pages/attendance/registro?session=${sessionId}`}
                          className="block w-full text-center bg-blue-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
                        >
                          Registrar Asistencia
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">event_busy</span>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No hay sesiones programadas</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Comienza creando una nueva sesión</p>
            <Link
              href="/pages/attendance/programar"
              className="inline-flex items-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Crear Sesión
            </Link>
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-dark rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Sesión</h2>
                <button onClick={() => setEditingSession(null)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input type="text" name="name" defaultValue={editingSession.name || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Programa</label>
                <input type="text" defaultValue={editingSession.program || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700" disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio</label>
                  <input type="time" name="start_time" defaultValue={editingSession.start_time || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin</label>
                  <input type="time" name="end_time" defaultValue={editingSession.end_time || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
                <input type="text" name="location" defaultValue={editingSession.location || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingSession(null)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 font-medium">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
