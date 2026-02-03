"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { attendanceService } from '@/services/attendance.services';
import type { Schedule, Participant, Program } from '@/types/attendance';
import { Alert } from '@/components/ui-elements/alert';
import { Button } from '@/components/ui-elements/button';

import { Calendar, Check, Clock, MapPin, RefreshCw, Save, Users, X } from 'lucide-react';

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

  useEffect(() => {
    const sessionParam = searchParams.get('session');
    const dateParam = searchParams.get('date');
    if (sessionParam) setSelectedSchedule(sessionParam);
    if (dateParam) setSelectedDate(dateParam);
  }, [searchParams]);

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

    if (participants.length > 0 && Object.keys(attendance).length === 0) {
      if (sessionParam && dateParam) {
        loadExistingAttendance(sessionParam, dateParam);
      } else {
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
      const res = await attendanceService.getHistory(date, date, scheduleId);
      const allRecords = res.data || [];

      if (allRecords.length > 0) {
        setIsEditing(true);
        const existingAttendance: Record<string, string> = {};

        allRecords.forEach((r: any) => {
          const participantId = r.participant?.external_id || r.participant?.id || r.participant_id || r.participantId;
          const status = (r.status || r.attendance_status || 'present').toUpperCase();

          if (participantId) {
            existingAttendance[participantId] = status;
          }
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
      const schedulesRes = await attendanceService.getSchedules();

      const dayMap: Record<string, string> = {
        'monday': 'LUNES', 'tuesday': 'MARTES', 'wednesday': 'MIERCOLES',
        'thursday': 'JUEVES', 'friday': 'VIERNES', 'saturday': 'SABADO', 'sunday': 'DOMINGO'
      };
      const rawSchedules = schedulesRes.data || [];
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

      const sessionId = searchParams.get('session');
      if (sessionId) {
        const selectedSched = normalizedSchedules.find((s: Schedule) =>
          String(s.id) === sessionId || String((s as any).external_id) === sessionId
        );
        if (selectedSched?.program) {
          await loadParticipantsByProgram(selectedSched.program);
        } else {
          await loadParticipantsByProgram();
        }
      } else {
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
      const rawParticipants = participantsRes.data || [];
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
      const rawParticipants = participantsRes.data || [];
      const normalizedParticipants = rawParticipants.map((p: any) => {
        const fullName = p.name || `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim();
        return {
          ...p,
          id: p.external_id || p.id,
          name: fullName || 'Sin nombre',
          status: (p.status === 'active' || p.status === 'ACTIVO') ? 'ACTIVO' : 'INACTIVO'
        };
      }) as Participant[];

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
    } catch (err: any) {
      if (err?.message === "SERVER_DOWN" || err?.message === "SESSION_EXPIRED") return;
      triggerAlert(
        'error',
        'Error al guardar',
        err?.response?.data?.message || err?.message || 'No se pudo guardar la asistencia. Intenta nuevamente.'
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

  const selectedScheduleData = schedules.find(s =>
    String(s.id) === selectedSchedule || String((s as any).external_id) === selectedSchedule
  );

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isEditing ? 'Editar Asistencia' : 'Registrar Asistencia'}
        </h1>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección: Información de la Sesión */}
        <div className="bg-[#0f172a] dark:bg-[#0f172a] rounded-[24px] border border-gray-800 p-6 shadow-2xl">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            Información de la Sesión
          </h2>

          {hasPreselectedSession && selectedScheduleData ? (
            <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center gap-4">
              <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="text-blue-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white leading-tight">
                  {selectedScheduleData.name}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="text-blue-500 font-bold">•</span> {selectedScheduleData.day_of_week}
                  </span>
                  <span>{selectedScheduleData.start_time} - {selectedScheduleData.end_time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Fecha: <span className="capitalize">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-orange-500/5 border border-orange-500/20 rounded-2xl text-orange-400 flex gap-3">
              <MapPin size={20} />
              <p className="text-sm font-medium">Selecciona una sesión desde el Dashboard para continuar.</p>
            </div>
          )}
        </div>

        {/* Sección: Lista de Participantes */}
        <div className="bg-[#0f172a] rounded-[24px] border border-gray-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                Lista de Participantes ({participants.length})
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Mostrando participantes del programa: <span className="text-blue-400 font-bold">INICIACION</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={refreshParticipants} className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-all flex items-center gap-2 text-sm font-bold border border-gray-700">
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Actualizar
              </button>
              <button type="button" onClick={() => markAll('PRESENT')} className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition-all text-sm font-bold flex items-center gap-2">
                <Check size={16} /> Todos Presentes
              </button>
              <button type="button" onClick={() => markAll('ABSENT')} className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition-all text-sm font-bold flex items-center gap-2">
                <X size={16} /> Todos Ausentes
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-800">
            {participants.map(p => (
              <div key={p.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-900/20">
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{p.name}</p>
                    <p className="text-xs text-gray-500 font-medium tracking-wider">ID: {p.dni || '---'}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {[
                    { value: 'PRESENT', label: 'P', active: 'bg-emerald-500 text-white shadow-emerald-900/50', hover: 'hover:bg-emerald-500/20 text-emerald-500' },
                    { value: 'ABSENT', label: 'A', active: 'bg-red-500 text-white shadow-red-900/50', hover: 'hover:bg-red-500/20 text-red-500' },
                  ].map(status => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => handleStatusChange(p.id, status.value)}
                      className={`w-12 h-12 rounded-xl font-black text-sm transition-all border flex items-center justify-center ${attendance[p.id] === status.value
                          ? `${status.active} border-transparent shadow-lg scale-110`
                          : `bg-gray-800/50 border-gray-700 text-gray-500 ${status.hover}`
                        }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-gray-900/50">
            <Button
              disabled={saving}
              label={saving ? "Guardando..." : "Guardar Asistencia"}
              icon={saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              shape="rounded"
            />
          </div>
        </div>
      </form>
    </div>
  );
}