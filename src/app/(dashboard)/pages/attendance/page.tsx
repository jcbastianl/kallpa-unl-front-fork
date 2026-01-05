"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.services';
import type { Session, Participant, Schedule, Program } from '@/types/attendance';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Obtener fecha de hoy en formato YYYY-MM-DD
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const [sessionsRes, participantsRes, schedulesRes, historyRes, programsRes] = await Promise.all([
        attendanceService.getSessionsToday(),
        attendanceService.getParticipants(),
        attendanceService.getSchedules(),
        attendanceService.getHistory(todayStr, todayStr), // Obtener historial de hoy
        attendanceService.getPrograms(),
      ]);
      const sessionsData = sessionsRes.data.data;
      const sessionsFromBackend = sessionsData?.sessions || [];
      setSessions(sessionsFromBackend);
      setParticipants(participantsRes.data.data || []);
      setPrograms(programsRes.data.data || []);
      
      // Guardar el historial de hoy para verificar asistencia
      const historyData = historyRes.data.data || [];
      setTodayHistory(historyData);
      console.log('📜 Today history:', historyData);
      
      // Obtener todos los schedules y normalizarlos
      const rawSchedules = schedulesRes.data.data || [];
      console.log('🔍 RAW SCHEDULES FROM BACKEND:', JSON.stringify(rawSchedules, null, 2));
      
      const normalizedSchedules: Schedule[] = rawSchedules.map((s: any) => {
        const dayFromBackend = s.dayOfWeek || s.day_of_week;
        console.log(`📅 Schedule "${s.name}": dayFromBackend="${dayFromBackend}", raw day_of_week="${s.day_of_week}", raw dayOfWeek="${s.dayOfWeek}"`);
        const normalizedDay = normalizeDay(dayFromBackend || '') || s.day_of_week || s.dayOfWeek || '';
        const specificDate = s.specific_date || s.specificDate || null;

        // Obtener program info si viene anidada en el schedule
        const nestedProgram = s.program || s.programo || null;
        const programIdFromNested = nestedProgram?.external_id || nestedProgram?.id || nestedProgram?.program_id || null;
        const programNameFromNested = nestedProgram?.name || nestedProgram?.title || null;

        const programId = s.program_id || s.programId || s.programExternalId || programIdFromNested || null;
        const programName = s.program_name || s.programName || programNameFromNested || null;

        return {
          ...s,
          id: s.external_id || s.id,
          external_id: s.external_id || s.id,
          day_of_week: normalizedDay,
          start_time: s.startTime || s.start_time,
          end_time: s.endTime || s.end_time,
          specific_date: specificDate,
          program_id: programId,
          program_name: programName,
        } as Schedule;
      });

      // Obtener sesiones de hoy basándose en los schedules normalizados
      console.log('📊 NORMALIZED SCHEDULES:', normalizedSchedules.map(s => ({ name: (s as any).name, day_of_week: s.day_of_week, specific_date: s.specific_date })));
      const todaySessions = getTodaySessions(normalizedSchedules);
      console.log('✅ TODAY SESSIONS:', todaySessions.map(s => ({ name: (s as any).name, day_of_week: s.day_of_week })));
      setTodaySchedules(todaySessions);

      // Obtener próximas sesiones (sesiones programadas para los próximos días)
      const upcoming = getUpcomingSessions(normalizedSchedules);
      console.log('📆 UPCOMING SESSIONS:', upcoming.map(s => ({ name: (s as any).name, day_of_week_es: (s as any).day_of_week_es })));
      setUpcomingSessions(upcoming);
    } catch (error) {
      console.error('Error loading data:', error);
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
    
    console.log(`🗓️ HOY: todayDay=${todayDay} (0=Dom, 1=Lun, ..., 6=Sáb), todayStr=${todayStr}`);

    schedules.forEach(schedule => {
      const specificDate = (schedule as any).specific_date || (schedule as any).specificDate;
      const dayName = normalizeDay((schedule as any).day_of_week || (schedule as any).dayOfWeek || '');
      const scheduleDay = daysMap[dayName];
      
      console.log(`🔎 Evaluando "${(schedule as any).name}": dayName="${dayName}", scheduleDay=${scheduleDay}, specificDate=${specificDate}`);
      
      if (specificDate) {
        // Sesión con fecha específica - verificar si es hoy
        if (specificDate === todayStr) {
          console.log(`✅ "${(schedule as any).name}" agregada (fecha específica coincide)`);
          todaySessions.push(schedule);
        }
      } else {
        // Sesión recurrente - verificar si el día coincide con hoy
        if (scheduleDay === todayDay) {
          // Validar que hoy esté dentro del rango start_date - end_date
          const startDateStr = (schedule as any).start_date || (schedule as any).startDate;
          const endDateStr = (schedule as any).end_date || (schedule as any).endDate;
          
          let isWithinRange = true;
          
          if (startDateStr) {
            const startDate = parseDate(startDateStr);
            startDate.setHours(0, 0, 0, 0);
            if (today < startDate) {
              console.log(`❌ "${(schedule as any).name}" excluida: hoy < start_date (${startDateStr})`);
              isWithinRange = false;
            }
          }
          
          if (endDateStr && isWithinRange) {
            const endDate = parseDate(endDateStr);
            endDate.setHours(0, 0, 0, 0);
            if (today > endDate) {
              console.log(`❌ "${(schedule as any).name}" excluida: hoy > end_date (${endDateStr})`);
              isWithinRange = false;
            }
          }
          
          if (isWithinRange) {
            console.log(`✅ "${(schedule as any).name}" agregada (día recurrente coincide)`);
            todaySessions.push(schedule);
          }
        } else {
          console.log(`⏭️ "${(schedule as any).name}" omitida: scheduleDay=${scheduleDay} !== todayDay=${todayDay}`);
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
          const startDateStr = (schedule as any).start_date || (schedule as any).startDate;
          const endDateStr = (schedule as any).end_date || (schedule as any).endDate;
          
          // Calcular la primera fecha válida para esta sesión recurrente
          let candidateDate = new Date(today);
          
          // Si hay start_date y es en el futuro, comenzar desde ahí
          if (startDateStr) {
            const startDate = parseDate(startDateStr);
            startDate.setHours(0, 0, 0, 0);
            if (startDate > today) {
              candidateDate = new Date(startDate);
            }
          }
          
          // Encontrar el próximo día de la semana que coincida con scheduleDay
          let daysUntil = scheduleDay - candidateDate.getDay();
          if (daysUntil < 0) daysUntil += 7;
          if (daysUntil === 0 && candidateDate.getTime() === today.getTime()) {
            // Si es hoy, buscar la próxima semana
            daysUntil = 7;
          }
          
          const nextDate = new Date(candidateDate);
          nextDate.setDate(candidateDate.getDate() + daysUntil);
          nextDate.setHours(0, 0, 0, 0);
          
          // Verificar que nextDate esté dentro del rango end_date
          let isValid = true;
          if (endDateStr) {
            const endDate = parseDate(endDateStr);
            endDate.setHours(0, 0, 0, 0);
            if (nextDate > endDate) {
              isValid = false;
            }
          }
          
          // Verificar que esté dentro de los próximos 30 días
          const daysDiff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          console.log(`📅 Próxima "${(schedule as any).name}": nextDate=${nextDate.toISOString().split('T')[0]}, daysDiff=${daysDiff}, isValid=${isValid}`);
          
          if (isValid && daysDiff > 0 && daysDiff <= 30) {
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
    // Verificar si hay historial de asistencia para esta sesión
    try {
      const historyRes = await attendanceService.getHistory(undefined, undefined, String(sessionId));
      const historyRecords = historyRes.data.data || [];
      
      if (historyRecords.length > 0) {
        // Hay asistencia registrada - mostrar advertencia especial
        const confirmMsg = `⚠️ ADVERTENCIA: La sesión "${sessionName}" tiene ${historyRecords.length} registro(s) de asistencia.\n\n` +
          `Si eliminas esta sesión:\n` +
          `• Se perderá TODO el historial de asistencia\n` +
          `• No podrás recuperar los datos\n\n` +
          `¿Deseas DESACTIVAR la sesión en lugar de eliminarla?\n` +
          `(Esto mantendrá el historial pero no aparecerán más sesiones futuras)\n\n` +
          `Presiona "Aceptar" para DESACTIVAR o "Cancelar" para volver.`;
        
        if (confirm(confirmMsg)) {
          // Desactivar: cambiar la fecha fin a ayer para que no aparezcan más sesiones
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          await attendanceService.updateSchedule(String(sessionId), {
            end_date: yesterdayStr
          });
          
          alert('Sesión desactivada correctamente. El historial de asistencia se ha conservado.');
          loadData();
          return;
        } else {
          // El usuario canceló, preguntar si quiere eliminar de todas formas
          const forceDelete = confirm(
            `¿Deseas ELIMINAR PERMANENTEMENTE la sesión y TODO su historial?\n\n` +
            `Esta acción NO se puede deshacer.`
          );
          
          if (!forceDelete) return;
        }
      } else {
        // No hay asistencia registrada - confirmación normal
        if (!confirm(`¿Estás seguro de eliminar la sesión "${sessionName}"?\n\nEsta sesión no tiene asistencia registrada.`)) return;
      }
    } catch (error) {
      console.error('Error checking history:', error);
      // Si falla la verificación, continuar con confirmación normal
      if (!confirm(`¿Estás seguro de eliminar la sesión "${sessionName}"?\n\nEsta acción eliminará:\n• La sesión programada del horario\n• Los registros de asistencia asociados`)) return;
    }

    setDeleting(sessionId);
    try {
      await attendanceService.deleteSchedule(String(sessionId));
      // Eliminar de todas las listas
      setUpcomingSessions(prev => prev.filter(s => (s.external_id || s.id) !== sessionId));
      setTodaySchedules(prev => prev.filter(s => ((s as any).external_id || s.id) !== sessionId));
      alert('Sesión eliminada correctamente');
      loadData(); // Recargar todos los datos
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error al eliminar la sesión');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (session: Schedule) => {
    setEditingSession({...session});
    // Cargar lista de programas para el selector (no bloqueante)
    attendanceService.getPrograms()
      .then(res => setPrograms(res.data.data || []))
      .catch(err => console.error('Error loading programs:', err));
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSession) return;
    
    const formData = new FormData(e.currentTarget);
    const sessionId = editingSession.external_id || editingSession.id;
    const sessionIdStr = String(sessionId); // Convert to string to match the expected type
    
    const data = {
      name: formData.get('name') as string,
      day_of_week: formData.get('day_of_week') as string,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      location: formData.get('location') as string,
      program_id: (formData.get('program_id') as string) || undefined,
      specific_date: formData.get('specific_date') as string || undefined,
      start_date: formData.get('start_date') as string || undefined,
      end_date: formData.get('end_date') as string || undefined,
    };
    
    try {
      await attendanceService.updateSchedule(sessionIdStr, data);
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
          value={todaySchedules.length}
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
                
                // Buscar en el historial de hoy si hay asistencia registrada para esta sesión
                const historyRecord = todayHistory.find((h: any) => 
                  h.schedule_id === scheduleId || 
                  h.scheduleId === scheduleId ||
                  h.schedule_id === (schedule as any).external_id ||
                  h.scheduleId === (schedule as any).external_id
                );
                
                const isCompleted = historyRecord && (historyRecord.present_count > 0 || historyRecord.presentCount > 0 || historyRecord.total > 0);
                const presentCount = historyRecord?.present_count || historyRecord?.presentCount || 0;
                const totalCount = historyRecord?.total || historyRecord?.total_count || historyRecord?.totalCount || 0;
                
                return (
                  <div
                    key={scheduleId}
                    className={`border rounded-lg p-4 transition-colors ${
                      isCompleted 
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{schedule.name}</h3>
                        {(() => {
                          const prog = programs.find(p => {
                            const pid = (schedule as any).program_id || (schedule as any).programId || null;
                            if (!pid) return false;
                            // Match by external_id or numeric id
                            return p.external_id === String(pid) || p.id === pid || String(p.id) === String(pid) || p.name === (schedule as any).program_name;
                          }) || null;

                          const programDisplayName = schedule.program_name || prog?.name || null;
                          if (!programDisplayName) return null;

                          const progColor = prog?.color || '#3B82F6';
                          const label = PROGRAM_COLORS.find(c => c.value.toLowerCase() === progColor.toLowerCase())?.label || 'Programa';

                          return (
                            <div className="mt-1">
                              <p className="text-sm text-gray-700 dark:text-gray-300">{programDisplayName}</p>
                            </div>
                          );
                        })()}
                        {location && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{location}</p>}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isCompleted 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {isCompleted ? '✓ Completada' : 'Pendiente'}
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
                        {startTime} - {endTime}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">group</span>
                          {presentCount}/{totalCount}
                        </span>
                      )}
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/pages/attendance/registro?session=${scheduleId}`}
                        className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                          isCompleted
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-blue-800 text-white hover:bg-blue-900'
                        }`}
                      >
                        {isCompleted ? 'Editar Asistencia' : 'Registrar Asistencia'}
                      </Link>
                      <button
                        onClick={() => handleDelete(scheduleId, schedule.name)}
                        disabled={deleting === scheduleId}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                        title="Eliminar sesión"
                      >
                        {deleting === scheduleId ? (
                          <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                        ) : (
                          <span className="material-symbols-outlined text-base">delete</span>
                        )}
                      </button>
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
                return (
                <div
                  key={`${session.id}-${index}`}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{session.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{(session as any).day_of_week_es}</p>
                      {(() => {
                        const prog = programs.find(p => {
                          const pid = (session as any).program_id || (session as any).programId || null;
                          if (!pid) return false;
                          return p.external_id === String(pid) || p.id === pid || String(p.id) === String(pid) || p.name === session.program_name;
                        }) || null;

                        const programDisplayName = session.program_name || prog?.name || null;
                        if (!programDisplayName) return null;

                        const progColor = prog?.color || '#8B5CF6';
                        const label = PROGRAM_COLORS.find(c => c.value.toLowerCase() === progColor.toLowerCase())?.label || 'Programa';

                        return (
                          <div className="mt-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{programDisplayName}</p>
                          </div>
                        );
                      })()}
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
                      <option value="monday">Lunes</option>
                      <option value="tuesday">Martes</option>
                      <option value="wednesday">Miércoles</option>
                      <option value="thursday">Jueves</option>
                      <option value="friday">Viernes</option>
                      <option value="saturday">Sábado</option>
                      <option value="sunday">Domingo</option>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Programa (opcional)</label>
                <select
                  name="program_id"
                  defaultValue={(editingSession as any).program_id || (editingSession as any).programId || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Sin programa</option>
                  {programs.map(p => (
                    <option key={p.external_id} value={p.external_id}>{p.name}</option>
                  ))}
                </select>
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
