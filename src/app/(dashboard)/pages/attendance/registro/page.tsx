"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { attendanceService } from '@/services/attendance.services';
import type { Schedule, Participant, Program } from '@/types/attendance';
import { Alert } from '@/components/ui-elements/alert';

function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
    </div>
  );
}

export default function Registro() {
  const searchParams = useSearchParams();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning'>('success');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');

  // Si viene de una sesión específica, no mostrar selectores
  const hasPreselectedSession = searchParams.get('session') !== null;

  const [selectedSchedule, setSelectedSchedule] = useState(searchParams.get('session') || '');
  const [selectedDate, setSelectedDate] = useState(() => {
    const urlDate = searchParams.get('date');
    if (urlDate) return urlDate;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [attendance, setAttendance] = useState<Record<string, string>>({});

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

  useEffect(() => {
    loadData();
  }, []);

  // Recargar participantes cuando la página vuelve a estar visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentProgram) {
        refreshParticipants();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentProgram]);

  useEffect(() => {
    const sessionParam = searchParams.get('session');
    const dateParam = searchParams.get('date');
    
    // Solo cargar asistencia si hay participantes y el estado de attendance está vacío
    if (participants.length > 0 && Object.keys(attendance).length === 0) {
      if (sessionParam && dateParam) {
        loadExistingAttendance(sessionParam, dateParam);
      } else {
        // Inicializar con PRESENT solo si no hay nada cargado
        const initial: Record<string, string> = {};
        participants.forEach(p => {
          initial[p.id] = 'PRESENT';
        });
        setAttendance(initial);
      }
    }
  }, [participants]);

  const loadExistingAttendance = async (scheduleId: string, date: string) => {
    if (!scheduleId) return;
    try {
      // Usar el endpoint general de history con filtros ya que el endpoint específico no funciona
      const res = await attendanceService.getHistory(date, date, scheduleId);
      const allRecords = res.data.data || [];

      if (allRecords.length > 0) {
        setIsEditing(true);
        const existingAttendance: Record<string, string> = {};
        
        allRecords.forEach((r: any) => {
          // Normalizar el ID del participante
          const participantId = r.participant?.external_id || r.participant?.id || r.participant_id || r.participantId;
          // Normalizar el estado (convertir a mayúsculas)
          const status = (r.status || r.attendance_status || 'present').toUpperCase();
          
          if (participantId) {
            existingAttendance[participantId] = status;
          }
        });
        
        // Para participantes que no tienen registro, usar PRESENT por defecto
        participants.forEach(p => {
          if (!existingAttendance[p.id]) {
            existingAttendance[p.id] = 'PRESENT';
          }
        });
        
        setAttendance(existingAttendance);
      } else {
        const initial: Record<string, string> = {};
        participants.forEach(p => {
          initial[p.id] = 'PRESENT';
        });
        setAttendance(initial);
      }
    } catch (error) {
      const initial: Record<string, string> = {};
      participants.forEach(p => {
        initial[p.id] = 'PRESENT';
      });
      setAttendance(initial);
    }
  };

  const loadData = async () => {
    try {
      // First, load all schedules
      const schedulesRes = await attendanceService.getSchedules();

      const dayMap: Record<string, string> = {
        'monday': 'LUNES', 'tuesday': 'MARTES', 'wednesday': 'MIERCOLES',
        'thursday': 'JUEVES', 'friday': 'VIERNES', 'saturday': 'SABADO', 'sunday': 'DOMINGO'
      };
      const rawSchedules = schedulesRes.data.data || [];
      const normalizedSchedules = rawSchedules.map((s: any) => ({
        ...s,
        id: s.external_id || s.id,
        program: s.program || '',
        day_of_week: dayMap[s.dayOfWeek?.toLowerCase() || ''] || dayMap[s.day_of_week?.toLowerCase() || ''] || s.dayOfWeek?.toUpperCase() || 'SIN DÍA',
        start_time: s.startTime || s.start_time,
        end_time: s.endTime || s.end_time,
        program_id: s.program_id || s.programId || null,
        program_name: s.program_name || s.programName || null
      }));
      setSchedules(normalizedSchedules);

      // If there's a preselected session, load participants for that schedule's program
      const sessionId = searchParams.get('session');
      if (sessionId) {
        const selectedSched = normalizedSchedules.find((s: Schedule) => String(s.id) === sessionId);
        if (selectedSched?.program) {
          await loadParticipantsByProgram(selectedSched.program);
        } else {
          // Fallback: load all participants if no program
          await loadParticipantsByProgram();
        }
      } else {
        // No preselection - don't load participants yet
        setParticipants([]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadParticipantsByProgram = async (program?: string) => {
    try {
      const participantsRes = await attendanceService.getParticipantsByProgram(program);
      const rawParticipants = participantsRes.data.data || [];
      const normalizedParticipants = rawParticipants.map((p: any) => {
        const fullName = p.name || `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim();
        return {
          ...p,
          id: p.external_id || p.id,
          name: fullName || 'Sin nombre',
          status: (p.status === 'active' || p.status === 'ACTIVO') ? 'ACTIVO' : 'INACTIVO'
        };
      }) as Participant[];

      setAllParticipants(normalizedParticipants);
      setParticipants(normalizedParticipants);

      if (program) {
        setCurrentProgram(program);
      }
    } catch (error) {
      setParticipants([]);
    }
  };

  const refreshParticipants = async () => {
    setRefreshing(true);
    try {
      // Load participants - filtered by program if available, otherwise all
      const participantsRes = await attendanceService.getParticipantsByProgram(currentProgram || undefined);
      const rawParticipants = participantsRes.data.data || [];
      const normalizedParticipants = rawParticipants.map((p: any) => {
        const fullName = p.name || `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim();
        return {
          ...p,
          id: p.external_id || p.id,
          name: fullName || 'Sin nombre',
          status: (p.status === 'active' || p.status === 'ACTIVO') ? 'ACTIVO' : 'INACTIVO'
        };
      }) as Participant[];

      // Mantener el estado de asistencia de los participantes existentes
      // y agregar los nuevos con estado 'PRESENT' por defecto
      const newAttendance = { ...attendance };
      normalizedParticipants.forEach(p => {
        if (!(p.id in newAttendance)) {
          newAttendance[p.id] = 'PRESENT';
        }
      });

      setAllParticipants(normalizedParticipants);
      setParticipants(normalizedParticipants);
      setAttendance(newAttendance);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = (participantId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [participantId]: status
    }));
  };

  const markAll = (status: string) => {
    const newAttendance: Record<string, string> = {};
    participants.forEach(p => {
      newAttendance[p.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSchedule) {
      triggerAlert(
        'warning',
        'Selección requerida',
        'Por favor selecciona una sesión antes de guardar.'
      );
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      const records = Object.entries(attendance).map(([participantId, status]) => ({
        participant_external_id: participantId,
        status: status.toLowerCase() // Backend espera minúsculas: present, absent, justified
      }));

      const requestData = {
        schedule_external_id: selectedSchedule,
        date: selectedDate,
        attendances: records
      };

      const response = await attendanceService.registerAttendance(requestData);

      setSuccess(true);
      setIsEditing(true);
      triggerAlert(
        'success',
        'Asistencia guardada',
        `Se registró la asistencia de ${records.length} participante(s) correctamente.`
      );
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      triggerAlert(
        'error',
        'Error al guardar',
        error?.response?.data?.message || error?.message || 'No se pudo guardar la asistencia. Intenta nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name || name.trim() === '') return '??';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return parts[0]?.[0]?.toUpperCase() || '??';
  };

  const selectedScheduleData = schedules.find(s => String(s.id) === selectedSchedule);

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isEditing ? 'Editar Asistencia' : 'Registrar Asistencia'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          {isEditing ? 'Modifica los registros de asistencia de esta sesión.' : 'Selecciona la sesión y registra la asistencia de los participantes.'}
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

      <form onSubmit={handleSubmit}>
        {/* Session Selection - Solo mostrar selectores si no viene preseleccionada */}
        <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-800">event</span>
            Información de la Sesión
          </h2>

          {hasPreselectedSession && selectedScheduleData ? (
            // Vista simplificada cuando viene de sesiones
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600">schedule</span>
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300">{selectedScheduleData.name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {selectedScheduleData.day_of_week} • {selectedScheduleData.start_time} - {selectedScheduleData.end_time}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    <strong>Fecha:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Mensaje para seleccionar desde Dashboard
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-600">info</span>
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Selecciona una sesión desde el Dashboard</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Ve al Dashboard y haz clic en &quot;Registrar Asistencia&quot; en la sesión que deseas registrar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Attendance List */}
        <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-800">groups</span>
                Lista de Participantes ({participants.length})
              </h2>
              {currentProgram && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Mostrando participantes del programa: <span className="font-medium text-blue-600">{currentProgram}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={refreshParticipants}
                disabled={refreshing}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Actualizar lista de participantes"
              >
                <span className={`material-symbols-outlined text-base ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button type="button" onClick={() => markAll('PRESENT')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                Todos Presentes
              </button>
              <button type="button" onClick={() => markAll('ABSENT')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                Todos Ausentes
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {participants.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.dni || 'Sin cédula'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: 'PRESENT', label: 'P', color: 'green', title: 'Presente' },
                    { value: 'ABSENT', label: 'A', color: 'red', title: 'Ausente' },
                  ].map(status => (
                    <button
                      key={status.value}
                      type="button"
                      title={status.title}
                      onClick={() => handleStatusChange(p.id, status.value)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${attendance[p.id] === status.value
                        ? status.color === 'green' ? 'bg-green-500 text-white ring-2 ring-green-300' :
                          status.color === 'red' ? 'bg-red-500 text-white ring-2 ring-red-300' :
                            'bg-yellow-500 text-white ring-2 ring-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="submit"
              disabled={saving || !selectedSchedule}
              className="w-full sm:w-auto px-8 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Guardar Asistencia
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
