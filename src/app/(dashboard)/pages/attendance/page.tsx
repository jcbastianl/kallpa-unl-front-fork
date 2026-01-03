"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.services';
import type { Session, Participant, Schedule } from '@/types/attendance';

function StatCard({ icon, iconBg, label, value }: { icon: string; iconBg: string; label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`${iconBg} p-2 rounded-lg`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
    </div>
  );
}

export default function DashboardAsistencia() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Schedule[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date());
  const [editingSession, setEditingSession] = useState<Schedule | null>(null);
  const [deleting, setDeleting] = useState<string | number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, participantsRes, schedulesRes] = await Promise.all([
        attendanceService.getSessionsToday(),
        attendanceService.getParticipants(),
        attendanceService.getSchedules()
      ]);
      const sessionsData = sessionsRes.data.data;
      setSessions(sessionsData?.sessions || []);
      setParticipants(participantsRes.data.data || []);
      
      // Obtener próximas sesiones (sesiones programadas para los próximos días)
      const schedules = schedulesRes.data.data || [];
      const upcoming = getUpcomingSessions(schedules);
      setUpcomingSessions(upcoming);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener las próximas sesiones de la semana
  const getUpcomingSessions = (schedules: Schedule[]) => {
    const daysMap: Record<string, number> = {
      'domingo': 0, 'sunday': 0,
      'lunes': 1, 'monday': 1,
      'martes': 2, 'tuesday': 2,
      'miércoles': 3, 'miercoles': 3, 'wednesday': 3,
      'jueves': 4, 'thursday': 4,
      'viernes': 5, 'friday': 5,
      'sábado': 6, 'sabado': 6, 'saturday': 6,
    };

    const today = new Date();
    const todayDay = today.getDay();
    const upcoming: (Schedule & { nextDate: Date })[] = [];

    schedules.forEach(schedule => {
      const dayName = schedule.day_of_week?.toLowerCase() || '';
      const scheduleDay = daysMap[dayName];
      
      if (scheduleDay !== undefined) {
        // Calcular la próxima fecha para esta sesión
        let daysUntil = scheduleDay - todayDay;
        if (daysUntil <= 0) daysUntil += 7; // Si ya pasó esta semana, ir a la próxima
        
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntil);
        
        // Solo incluir sesiones de los próximos 7 días (excluyendo hoy)
        if (daysUntil > 0 && daysUntil <= 7) {
          upcoming.push({ ...schedule, nextDate });
        }
      }
    });

    // Ordenar por fecha más cercana
    return upcoming.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime()).slice(0, 6);
  };

  const handleDelete = async (sessionId: string | number, sessionName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la sesión "${sessionName}"?\n\nEsta acción eliminará la sesión permanentemente.`)) return;
    
    setDeleting(sessionId);
    try {
      await attendanceService.deleteSchedule(sessionId);
      setUpcomingSessions(prev => prev.filter(s => (s.external_id || s.id) !== sessionId));
      alert('Sesión eliminada correctamente');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error al eliminar la sesión');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (session: Schedule) => {
    setEditingSession({...session});
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSession) return;
    
    const formData = new FormData(e.currentTarget);
    const sessionId = editingSession.external_id || editingSession.id;
    
    const data = {
      name: formData.get('name') as string,
      day_of_week: formData.get('day_of_week') as string,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      location: formData.get('location') as string,
      specific_date: formData.get('specific_date') as string || undefined,
      start_date: formData.get('start_date') as string || undefined,
      end_date: formData.get('end_date') as string || undefined,
    };
    
    try {
      await attendanceService.updateSchedule(sessionId, data);
      setEditingSession(null);
      loadData(); // Recargar datos
      alert('Sesión actualizada correctamente');
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Error al actualizar la sesión');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const activeParticipants = participants.filter(p => p.status === 'active' || p.status === 'ACTIVO').length;

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard de Asistencia
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {formatDate(currentDate)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="event"
          iconBg="bg-blue-100 text-blue-800"
          label="Sesiones Hoy"
          value={sessions.length}
        />
        <StatCard
          icon="group"
          iconBg="bg-green-100 text-green-600"
          label="Participantes Activos"
          value={activeParticipants}
        />
        <StatCard
          icon="check_circle"
          iconBg="bg-emerald-100 text-emerald-600"
          label="Asistencia Promedio"
          value="85%"
        />
        <StatCard
          icon="calendar_month"
          iconBg="bg-purple-100 text-purple-600"
          label="Sesiones Semana"
          value={sessions.length * 5}
        />
      </div>

      {/* Sessions Today */}
      <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-800">today</span>
            Sesiones de Hoy
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              {formatShortDate(currentDate)}
            </span>
          </h2>
        </div>
        <div className="p-6">
          {sessions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay sesiones programadas para hoy</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    session.attendance_count > 0 
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{session.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{session.program_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      session.attendance_count > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {session.attendance_count > 0 ? '✓ Completada' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                      {formatShortDate(currentDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {session.start_time} - {session.end_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">group</span>
                      {session.attendance_count}/{session.participant_count}
                    </span>
                  </div>
                  <Link
                    href={`/pages/attendance/registro?session=${session.schedule_id}`}
                    className={`mt-3 block w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                      session.attendance_count > 0
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-blue-800 text-white hover:bg-blue-900'
                    }`}
                  >
                    {session.attendance_count > 0 ? 'Editar Asistencia' : 'Registrar Asistencia'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">upcoming</span>
            Próximas Sesiones
          </h2>
        </div>
        <div className="p-6">
          {upcomingSessions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay sesiones programadas próximamente</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSessions.map((session, index) => {
                const sessionId = session.external_id || session.id;
                return (
                <div
                  key={`${session.id}-${index}`}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{session.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{session.program_name || session.day_of_week}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                      Próxima
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                      {formatShortDate((session as any).nextDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                  {/* Botones Editar/Eliminar */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleEdit(session)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sessionId, session.name)}
                      disabled={deleting === sessionId}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === sessionId ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                      ) : (
                        <span className="material-symbols-outlined text-base">delete</span>
                      )}
                      Eliminar
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/pages/attendance/historial"
          className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:border-blue-300 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
              <span className="material-symbols-outlined text-purple-600 text-2xl">history</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Ver Historial</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Consultar registros anteriores</p>
            </div>
          </div>
        </Link>

        <Link
          href="/pages/attendance/programar"
          className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:border-blue-300 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <span className="material-symbols-outlined text-green-600 text-2xl">event</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Programar Sesión</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Crear nuevos horarios</p>
            </div>
          </div>
        </Link>
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
              {/* Badge indicando tipo de sesión */}
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  editingSession.is_recurring === false || editingSession.specific_date
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {editingSession.is_recurring === false || editingSession.specific_date ? 'event' : 'repeat'}
                  </span>
                  {editingSession.is_recurring === false || editingSession.specific_date ? 'Fecha específica' : 'Sesión recurrente'}
                </span>
              </div>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la sesión</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingSession.name || ''} 
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
                />
              </div>
              
              {/* Mostrar campo según tipo de sesión */}
              {editingSession.is_recurring === false || editingSession.specific_date ? (
                // Sesión con fecha específica
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha específica</label>
                  <input 
                    type="date" 
                    name="specific_date"
                    defaultValue={editingSession.specific_date || ''} 
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                  {/* Campo oculto para mantener compatibilidad */}
                  <input type="hidden" name="day_of_week" value={editingSession.day_of_week || ''} />
                </div>
              ) : (
                // Sesión recurrente - mostrar selector de día y rango de fechas
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Día de la semana</label>
                    <select 
                      name="day_of_week"
                      defaultValue={editingSession.day_of_week || ''} 
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Lunes">Lunes</option>
                      <option value="Martes">Martes</option>
                      <option value="Miércoles">Miércoles</option>
                      <option value="Jueves">Jueves</option>
                      <option value="Viernes">Viernes</option>
                      <option value="Sábado">Sábado</option>
                      <option value="Domingo">Domingo</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha inicio</label>
                      <input 
                        type="date" 
                        name="start_date"
                        defaultValue={editingSession.start_date || ''} 
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha fin</label>
                      <input 
                        type="date" 
                        name="end_date"
                        defaultValue={editingSession.end_date || ''} 
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio</label>
                  <input 
                    type="time" 
                    name="start_time" 
                    defaultValue={editingSession.start_time || ''} 
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin</label>
                  <input 
                    type="time" 
                    name="end_time" 
                    defaultValue={editingSession.end_time || ''} 
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
                <input 
                  type="text" 
                  name="location" 
                  defaultValue={editingSession.location || ''} 
                  placeholder="Ej: Gimnasio principal"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingSession(null)} 
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 font-medium"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
