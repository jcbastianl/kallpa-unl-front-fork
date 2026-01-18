"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.services';
import type { Session, Participant, Schedule, Program } from '@/types/attendance';
import { Alert } from '@/components/ui-elements/alert';
import ErrorMessage from '@/components/FormElements/errormessage';

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
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Schedule[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [todayHistory, setTodayHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date());
  const [editingSession, setEditingSession] = useState<Schedule | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning'>('success');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{id: string | number, name: string} | null>(null);
  const [editEndDateError, setEditEndDateError] = useState<string>('');
  const PROGRAM_COLORS = [
    { value: '#3B82F6', label: 'Azul' },
    { value: '#10B981', label: 'Verde' },
    { value: '#F59E0B', label: 'Amarillo' },
    { value: '#EF4444', label: 'Rojo' },
    { value: '#8B5CF6', label: 'Morado' },
    { value: '#EC4899', label: 'Rosa' },
    { value: '#06B6D4', label: 'Cyan' },
    { value: '#F97316', label: 'Naranja' },
  ];
  const [deleting, setDeleting] = useState<string | number | null>(null);

  const triggerAlert = (
    variant: 'success' | 'error' | 'warning',
    title: string,
    description: string
  ) => {
    setAlertVariant(variant);
    setAlertTitle(title);
    setAlertDescription(description);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  // Fixed program options
  const PROGRAM_OPTIONS = [
    { value: 'INICIACION', label: 'Iniciación' },
    { value: 'FUNCIONAL', label: 'Funcional' },
  ];

  useEffect(() => {
    loadData();

    // Recargar datos cuando la página se vuelve visible (cuando vuelve del registro)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Recargar datos cada 30 segundos para mantener actualizado
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      // Obtener fecha de hoy en formato YYYY-MM-DD
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      let historyData: any[] = [];
      try {
        const historyRes = await attendanceService.getHistory(todayStr, todayStr);
        historyData = historyRes.data.data || [];
      } catch (error) {
      }

      const [participantsRes, schedulesRes] = await Promise.all([
        attendanceService.getParticipants(),
        attendanceService.getSchedules(),
      ]);
      const sessionsData: any[] = [];
      const sessionsFromBackend: Session[] = [];
      setSessions(sessionsFromBackend);
      setParticipants(participantsRes.data.data || []);

      setTodayHistory(historyData);

      // Obtener todos los schedules
      const schedules = schedulesRes.data.data || [];

      // Obtener sesiones de hoy basándose en los schedules
      const todaySessions = getTodaySessions(schedules);
      setTodaySchedules(todaySessions);

      const upcoming = getUpcomingSessions(schedules);
      setUpcomingSessions(upcoming);

    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Función para normalizar día (quitar acentos y pasar a minúsculas)
  const normalizeDay = (day: string): string => {
    if (!day) return '';
    return day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Mapeo de días a español
  const dayToSpanish: Record<string, string> = {
    'monday': 'Lunes', 'tuesday': 'Martes', 'wednesday': 'Miércoles',
    'thursday': 'Jueves', 'friday': 'Viernes', 'saturday': 'Sábado', 'sunday': 'Domingo',
    'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles',
    'jueves': 'Jueves', 'viernes': 'Viernes', 'sabado': 'Sábado', 'domingo': 'Domingo'
  };

  // Función para parsear fecha en formato YYYY-MM-DD
  const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  // Obtener las sesiones de hoy basándose en los schedules
  const getTodaySessions = (schedules: Schedule[]) => {
    const daysMap: Record<string, number> = {
      'domingo': 0, 'sunday': 0,
      'lunes': 1, 'monday': 1,
      'martes': 2, 'tuesday': 2,
      'miercoles': 3, 'wednesday': 3,
      'jueves': 4, 'thursday': 4,
      'viernes': 5, 'friday': 5,
      'sabado': 6, 'saturday': 6,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDay = today.getDay();
    const todayStr = today.toISOString().split('T')[0];
    const todaySessions: Schedule[] = [];

    schedules.forEach(schedule => {
      const specificDate = (schedule as any).specific_date || (schedule as any).specificDate;

      if (specificDate) {
        // Sesión con fecha específica - verificar si es hoy
        if (specificDate === todayStr) {
          todaySessions.push(schedule);
        }
      } else {
        // Sesión recurrente - verificar si el día coincide con hoy
        const dayName = normalizeDay((schedule as any).day_of_week || (schedule as any).dayOfWeek || '');
        const scheduleDay = daysMap[dayName];

        if (scheduleDay === todayDay) {
          // Validar que hoy esté dentro del rango start_date - end_date
          const startDateStr = (schedule as any).start_date || (schedule as any).startDate;
          const endDateStr = (schedule as any).end_date || (schedule as any).endDate;

          let isWithinRange = true;

          if (startDateStr) {
            const startDate = parseDate(startDateStr);
            startDate.setHours(0, 0, 0, 0);
            if (today < startDate) {
              isWithinRange = false;
            }
          }

          if (endDateStr && isWithinRange) {
            const endDate = parseDate(endDateStr);
            endDate.setHours(0, 0, 0, 0);
            if (today > endDate) {
              isWithinRange = false;
            }
          }

          if (isWithinRange) {
            todaySessions.push(schedule);
          }
        }
      }
    });

    return todaySessions;
  };

  // Obtener las próximas sesiones de la semana
  const getUpcomingSessions = (schedules: Schedule[]) => {
    const daysMap: Record<string, number> = {
      'domingo': 0, 'sunday': 0,
      'lunes': 1, 'monday': 1,
      'martes': 2, 'tuesday': 2,
      'miercoles': 3, 'wednesday': 3,
      'jueves': 4, 'thursday': 4,
      'viernes': 5, 'friday': 5,
      'sabado': 6, 'saturday': 6,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDay = today.getDay();
    const upcoming: (Schedule & { nextDate: Date; day_of_week_es: string })[] = [];

    schedules.forEach(schedule => {
      // Manejar sesiones con fecha específica
      const specificDate = (schedule as any).specific_date || (schedule as any).specificDate;

      if (specificDate) {
        // Sesión con fecha específica
        const sessionDate = parseDate(specificDate);
        sessionDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.ceil((sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Solo incluir si es en el futuro (no hoy)
        if (daysDiff > 0 && daysDiff <= 30) {
          const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          upcoming.push({
            ...schedule,
            nextDate: sessionDate,
            day_of_week_es: dayNames[sessionDate.getDay()]
          });
        }
      } else {
        // Sesión recurrente
        const dayName = normalizeDay((schedule as any).day_of_week || (schedule as any).dayOfWeek || '');
        const scheduleDay = daysMap[dayName];

        if (scheduleDay !== undefined) {
          // Calcular la próxima fecha para esta sesión
          let daysUntil = scheduleDay - todayDay;
          if (daysUntil <= 0) daysUntil += 7;

          const nextDate = new Date(today);
          nextDate.setDate(today.getDate() + daysUntil);
          nextDate.setHours(0, 0, 0, 0);

          // Validar que la fecha calculada esté dentro del rango start_date - end_date
          const startDateStr = (schedule as any).start_date || (schedule as any).startDate;
          const endDateStr = (schedule as any).end_date || (schedule as any).endDate;

          let isWithinRange = true;

          if (startDateStr) {
            const startDate = parseDate(startDateStr);
            startDate.setHours(0, 0, 0, 0);
            if (startDate > today) {
              // Start date is in the future, skip this session for now
              isWithinRange = false;
            }
          }

          if (endDateStr && isWithinRange) {
            const endDate = parseDate(endDateStr);
            endDate.setHours(0, 0, 0, 0);
            if (nextDate > endDate) {
              isWithinRange = false;
            }
          }

          // Solo incluir sesiones de los próximos 14 días (excluyendo hoy) y dentro del rango válido
          if (daysUntil > 0 && daysUntil <= 14 && isWithinRange) {
            const dayEs = dayToSpanish[dayName] || dayName;
            upcoming.push({ ...schedule, nextDate, day_of_week_es: dayEs });
          }
        }
      }
    });

    // Ordenar por fecha más cercana
    return upcoming.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime()).slice(0, 6);
  };

  const handleDelete = async (sessionId: string | number, sessionName: string) => {
    setSessionToDelete({ id: sessionId, name: sessionName });
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    setDeleting(sessionToDelete.id);
    setShowConfirmDelete(false);
    try {
      await attendanceService.deleteSchedule(String(sessionToDelete.id));
      // Eliminar de todas las listas
      setUpcomingSessions(prev => prev.filter(s => (s.external_id || s.id) !== sessionToDelete.id));
      setTodaySchedules(prev => prev.filter(s => ((s as any).external_id || s.id) !== sessionToDelete.id));
      triggerAlert(
        'success',
        'Sesión eliminada',
        `La sesión "${sessionToDelete.name}" se ha eliminado correctamente.`
      );
      loadData(); // Recargar todos los datos
    } catch (error) {
      triggerAlert(
        'error',
        'Error al eliminar',
        'No se pudo eliminar la sesión. Intenta nuevamente.'
      );
    } finally {
      setDeleting(null);
      setSessionToDelete(null);
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
      'lunes': 'MONDAY', 'martes': 'TUESDAY', 'miércoles': 'WEDNESDAY', 'miercoles': 'WEDNESDAY',
      'jueves': 'THURSDAY', 'viernes': 'FRIDAY', 'sábado': 'SATURDAY', 'sabado': 'SATURDAY', 'domingo': 'SUNDAY',
      'monday': 'MONDAY', 'tuesday': 'TUESDAY', 'wednesday': 'WEDNESDAY',
      'thursday': 'THURSDAY', 'friday': 'FRIDAY', 'saturday': 'SATURDAY', 'sunday': 'SUNDAY'
    };
    const dayValue = (formData.get('day_of_week') as string)?.toLowerCase();
    const endDate = formData.get('end_date') as string;

    // Validar fecha fin para sesiones recurrentes
    if (dayValue && endDate && !formData.get('specific_date')) {
      const endDateObj = new Date(endDate + 'T12:00:00');
      const dayOfWeek = endDateObj.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
      
      const dayMapping: Record<string, number> = {
        'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0,
        'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6, 'domingo': 0
      };

      const expectedDay = dayMapping[dayValue];
      if (expectedDay !== dayOfWeek) {
        const dayNames: Record<number, string> = { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miércoles', 4: 'jueves', 5: 'viernes', 6: 'sábado' };
        setEditEndDateError(`La fecha fin debe ser un ${dayNames[expectedDay]}. La fecha seleccionada es ${dayNames[dayOfWeek]}.`);
        return;
      }
    }
    
    setEditEndDateError('');

    const data = {
      name: formData.get('name') as string,
      program: formData.get('program') as string,
      dayOfWeek: dayMap[dayValue] || dayValue?.toUpperCase(),
      startTime: formData.get('start_time') as string,
      endTime: formData.get('end_time') as string,
      location: formData.get('location') as string,
      specificDate: formData.get('specific_date') as string || undefined,
      endDate: endDate || undefined,
    };

    try {
      await attendanceService.updateSchedule(String(sessionId), data);
      setEditingSession(null);
      loadData(); // Recargar datos
      triggerAlert(
        'success',
        'Sesión actualizada',
        'Los cambios se han guardado correctamente.'
      );
    } catch (error) {
      triggerAlert(
        'error',
        'Error al actualizar',
        'No se pudieron guardar los cambios. Intenta nuevamente.'
      );
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
          Asistencias
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {formatDate(currentDate)}
        </p>
      </div>

      {/* Alert */}
      {showAlert && (
        <div className="mb-6">
          <Alert
            variant={alertVariant}
            title={alertTitle}
            description={alertDescription}
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="event"
          iconBg="bg-blue-100 text-blue-800"
          label="Sesiones Hoy"
          value={todaySchedules.length}
        />
        <StatCard
          icon="group"
          iconBg="bg-green-100 text-green-600"
          label="Participantes Activos"
          value={activeParticipants}
        />

        <StatCard
          icon="calendar_month"
          iconBg="bg-purple-100 text-purple-600"
          label="Sesiones Semana"
          value={upcomingSessions.length + todaySchedules.length}
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
          {todaySchedules.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay sesiones programadas para hoy</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaySchedules.map((schedule) => {
                const startTime = (schedule as any).start_time || (schedule as any).startTime || '';
                const endTime = (schedule as any).end_time || (schedule as any).endTime || '';
                const location = (schedule as any).location || '';
                const scheduleId = (schedule as any).external_id || schedule.id;

                // Buscar TODOS los registros de asistencia para esta sesión
                const historyRecords = todayHistory.filter((h: any) => {
                  const hScheduleId = h.schedule?.external_id || h.schedule?.externalId;
                  return hScheduleId === scheduleId;
                });

                // Si hay registros, la sesión está completada
                const isCompleted = historyRecords.length > 0;
                
                // Contar presentes y total
                const presentCount = historyRecords.filter((h: any) => h.status === 'present').length;
                const totalCount = historyRecords.length;

                // Obtener información del programa
                const prog = programs.find(p => {
                  const pid = (schedule as any).program_id || (schedule as any).programId || null;
                  if (!pid) return false;
                  return p.external_id === String(pid) || p.id === pid || String(p.id) === String(pid) || p.name === (schedule as any).program_name;
                }) || null;

                const programDisplayName = (schedule as any).program || (schedule as any).program_name || prog?.name || null;
                const progColor = prog?.color || '#3B82F6';

                return (
                  <div
                    key={scheduleId}
                    className={`relative rounded-lg transition-all duration-300 overflow-hidden ${
                      isCompleted
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}
                  >
                    {/* Barra superior de color */}
                    <div className={`h-1 w-full ${
                      isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}></div>

                    <div className="p-4">
                      {/* Header con título y badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">{schedule.name}</h3>
                          {programDisplayName && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: progColor }}></span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{programDisplayName}</span>
                            </div>
                          )}
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          <span className="text-sm">
                            {isCompleted ? '✓' : '⌛'}
                          </span>
                          {isCompleted ? 'Completada' : 'Pendiente'}
                        </span>
                      </div>

                      {/* Información de la sesión */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-base">⏰</span>
                          <span className="font-medium">{startTime} - {endTime}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-base">📅</span>
                          <span>{formatShortDate(currentDate)}</span>
                        </div>

                        {location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-base">📍</span>
                            <span>{location}</span>
                          </div>
                        )}
                      </div>

                      {/* Botón de acción */}
                      {scheduleId ? (
                        <Link
                          href={`/pages/attendance/registro?session=${scheduleId}&date=${currentDate.toISOString().split('T')[0]}`}
                          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            isCompleted
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <span className="text-base">{isCompleted ? '✏️' : '✅'}</span>
                          {isCompleted ? 'Editar Asistencia' : 'Registrar Asistencia'}
                        </Link>
                      ) : (
                        <button disabled className="w-full py-2 rounded-lg text-sm font-medium bg-gray-300 text-gray-500 cursor-not-allowed">
                          No disponible
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
                const programName = (session as any).program || (session as any).program_name || null;
                return (
                  <div
                    key={`${session.id}-${index}`}
                    className="relative rounded-lg transition-all duration-300 overflow-hidden bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600"
                  >
                    {/* Barra superior de color */}
                    <div className="h-1 w-full bg-purple-500"></div>

                    <div className="p-4">
                      {/* Header con título y badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">{session.name}</h3>
                          {programName && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{programName}</span>
                            </div>
                          )}
                        </div>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          <span className="text-sm">📅</span>
                          Próxima
                        </span>
                      </div>

                      {/* Información de la sesión */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-base">⏰</span>
                          <span className="font-medium">{session.start_time} - {session.end_time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-base">📆</span>
                          <span>{formatShortDate((session as any).nextDate)}</span>
                        </div>

                        {session.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-base">📍</span>
                            <span>{session.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(session)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                        >
                          <span className="text-base">✏️</span>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(sessionId, session.name)}
                          className="p-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Eliminar sesión"
                        >
                          <span className="text-base">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${editingSession.is_recurring === false || editingSession.specific_date
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

              {/* Program Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Programa</label>
                <select
                  name="program"
                  defaultValue={editingSession.program || ''}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Seleccionar programa...</option>
                  {PROGRAM_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                      onChange={() => setEditEndDateError('')}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="monday">Lunes</option>
                      <option value="tuesday">Martes</option>
                      <option value="wednesday">Miércoles</option>
                      <option value="thursday">Jueves</option>
                      <option value="friday">Viernes</option>
                      <option value="saturday">Sábado</option>
                      <option value="sunday">Domingo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha fin (opcional)</label>
                    <input
                      type="date"
                      name="end_date"
                      defaultValue={editingSession.end_date || ''}
                      onChange={() => setEditEndDateError('')}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">La fecha debe coincidir con el día de la semana seleccionado</p>
                    <ErrorMessage message={editEndDateError} />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio</label>
                  <select
                    name="start_time"
                    defaultValue={editingSession.start_time || ''}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Seleccionar hora</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {`${i.toString().padStart(2, '0')}:00`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin</label>
                  <select
                    name="end_time"
                    defaultValue={editingSession.end_time || ''}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Seleccionar hora</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {`${i.toString().padStart(2, '0')}:00`}
                      </option>
                    ))}
                  </select>
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

      {/* Modal de Confirmación de Eliminación */}
      {showConfirmDelete && sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-dark rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar eliminación</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              ¿Estás seguro de eliminar la sesión <strong>"{sessionToDelete.name}"</strong>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSessionToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
