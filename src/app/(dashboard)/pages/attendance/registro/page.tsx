"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { attendanceService } from '@/services/attendance.services';
import type { Schedule, Participant, Program } from '@/types/attendance';

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const sessionParam = searchParams.get('session');
    const dateParam = searchParams.get('date');
    if (sessionParam && dateParam && participants.length > 0) {
      loadExistingAttendance(sessionParam, dateParam);
    } else if (participants.length > 0) {
      const initial: Record<string, string> = {};
      participants.forEach(p => {
        initial[p.id] = 'PRESENT';
      });
      setAttendance(initial);
    }
  }, [participants, searchParams]);

  const loadExistingAttendance = async (scheduleId: string, date: string) => {
    try {
      const res = await attendanceService.getSessionDetail(scheduleId, date);
      const records = res.data.data?.records || [];
      
      if (records.length > 0) {
        setIsEditing(true);
        const existingAttendance: Record<string, string> = {};
        records.forEach(r => {
          existingAttendance[r.participant_id] = r.status;
        });
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
      const [schedulesRes, participantsRes] = await Promise.all([
        attendanceService.getSchedules(),
        attendanceService.getParticipants()
      ]);
      
      const dayMap: Record<string, string> = {
        'monday': 'LUNES', 'tuesday': 'MARTES', 'wednesday': 'MIERCOLES',
        'thursday': 'JUEVES', 'friday': 'VIERNES', 'saturday': 'SABADO', 'sunday': 'DOMINGO'
      };
      const rawSchedules = schedulesRes.data.data || [];
      const normalizedSchedules = rawSchedules.map(s => ({
        ...s,
        id: s.external_id || s.id,
        day_of_week: dayMap[s.dayOfWeek?.toLowerCase() || ''] || dayMap[s.day_of_week?.toLowerCase() || ''] || s.dayOfWeek?.toUpperCase() || 'SIN DÍA',
        start_time: s.startTime || s.start_time,
        end_time: s.endTime || s.end_time,
        program_id: s.program_id || s.programId || null,
        program_name: s.program_name || s.programName || null
      }));
      setSchedules(normalizedSchedules);
      
      const rawParticipants = participantsRes.data.data || [];
      const normalizedParticipants = rawParticipants.map(p => ({
        ...p,
        id: p.external_id || p.id,
        name: p.name || `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim(),
        status: (p.status === 'active' || p.status === 'ACTIVO') ? 'ACTIVO' : 'INACTIVO'
      })) as Participant[];
      
      setAllParticipants(normalizedParticipants);
      setParticipants(normalizedParticipants);

      // Si hay una sesión preseleccionada, verificar si tiene programa
      const sessionId = searchParams.get('session');
      if (sessionId) {
        const selectedSession = normalizedSchedules.find(s => s.id === sessionId || s.external_id === sessionId);
        if (selectedSession?.program_id) {
          // Cargar participantes del programa
          try {
            const programParticipantsRes = await attendanceService.getProgramParticipants(selectedSession.program_id);
            const programParticipants = programParticipantsRes.data.data || [];
            const normalizedProgramParticipants = programParticipants.map((p: any) => ({
              ...p,
              id: p.external_id || p.id,
              name: p.name || `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim(),
              status: (p.status === 'active' || p.status === 'ACTIVO') ? 'ACTIVO' : 'INACTIVO'
            })) as Participant[];
            setParticipants(normalizedProgramParticipants);
            setCurrentProgram(selectedSession.program_name || 'Programa');
          } catch (error) {
            console.error('Error loading program participants:', error);
            // Si falla, usar todos los participantes
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
      alert('Selecciona una sesión');
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      const records = Object.entries(attendance).map(([participantId, status]) => ({
        participant_id: participantId,
        status: status.toLowerCase() // Backend espera minúsculas: present, absent, justified
      }));

      const requestData = {
        schedule_id: selectedSchedule,
        date: selectedDate,
        records
      };
      
      // Debug: Log del request que se envía
      console.log('📤 Enviando registro de asistencia:', requestData);
      console.log('📋 schedule_id:', selectedSchedule);
      console.log('📅 date:', selectedDate);
      console.log('👥 records:', records);

      const response = await attendanceService.registerAttendance(requestData);
      
      // Debug: Log de la respuesta
      console.log('✅ Respuesta del backend:', response.data);

      setSuccess(true);
      setIsEditing(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error al guardar la asistencia');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <span className="text-green-700 dark:text-green-400 font-medium">Asistencia guardada correctamente</span>
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
                    Ve al Dashboard y haz clic en "Registrar Asistencia" en la sesión que deseas registrar.
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
            <div className="flex gap-2">
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
                    { value: 'JUSTIFIED', label: 'J', color: 'yellow', title: 'Justificado' },
                  ].map(status => (
                    <button
                      key={status.value}
                      type="button"
                      title={status.title}
                      onClick={() => handleStatusChange(p.id, status.value)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        attendance[p.id] === status.value
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
