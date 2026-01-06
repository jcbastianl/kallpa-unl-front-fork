"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { attendanceService } from '@/services/attendance.services';
import type { Schedule, Program } from '@/types/attendance';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

type SessionType = 'recurring' | 'specific';

function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
    </div>
  );
}

export default function Programar() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sessionType, setSessionType] = useState<SessionType>('recurring');

  const [formData, setFormData] = useState({
    name: '',
    program: '', // Program field (INICIACION or FUNCIONAL)
    day_of_week: '',
    start_time: '08:00',
    end_time: '09:00',
    location: '',
    capacity: 30,
    description: '',
    program_id: '',
    // Campos para sesión recurrente
    start_date: '',
    end_date: '',
    // Campo para sesión con fecha específica
    specific_date: ''
  });

  // Fixed program options
  const PROGRAM_OPTIONS = [
    { value: 'INICIACION', label: 'Iniciación' },
    { value: 'FUNCIONAL', label: 'Funcional' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Mapeo para normalizar días de la semana a inglés minúscula (formato del backend)
  const normalizeDayOfWeek = (day: string): string => {
    if (!day) return '';

    const dayLower = day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Normalizar y quitar acentos para comparación

    const dayMap: Record<string, string> = {
      'monday': 'monday', 'lunes': 'monday',
      'tuesday': 'tuesday', 'martes': 'tuesday',
      'wednesday': 'wednesday', 'miercoles': 'wednesday',
      'thursday': 'thursday', 'jueves': 'thursday',
      'friday': 'friday', 'viernes': 'friday',
      'saturday': 'saturday', 'sabado': 'saturday',
      'sunday': 'sunday', 'domingo': 'sunday',
    };
    return dayMap[dayLower] || day || '';
  };

  const loadData = async () => {
    try {
      const res = await attendanceService.getSchedules();
      const rawSchedules = res.data.data || [];

      const normalizedSchedules = rawSchedules.map((s: any) => {
        const dayFromBackend = s.dayOfWeek || s.day_of_week;
        const normalizedDay = normalizeDayOfWeek(dayFromBackend);

        let finalDay = normalizedDay;
        const specificDate = s.specific_date || s.specificDate;

        if (!finalDay && specificDate) {
          const [year, month, day] = specificDate.split('-').map(Number);
          const date = new Date(year, month - 1, day, 12, 0, 0);
          const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          finalDay = dayNames[date.getDay()];
        }

        return {
          ...s,
          id: s.external_id || s.id,
          day_of_week: finalDay,
          start_time: s.startTime || s.start_time,
          end_time: s.endTime || s.end_time,
          specific_date: specificDate,
        };
      });

      setSchedules(normalizedSchedules);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Construir datos según el tipo de sesión
      const dataToSend: any = {
        name: formData.name,
        program: formData.program, // Include program in payload
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location || undefined,
        max_slots: Number(formData.capacity), // Map capacity to max_slots
        description: formData.description || undefined,
        program_id: formData.program_id || undefined,
      };

      if (sessionType === 'recurring') {
        // Sesión recurrente (semanal)
        const dayMap: Record<string, string> = {
          'Lunes': 'monday', 'Martes': 'tuesday', 'Miércoles': 'wednesday',
          'Jueves': 'thursday', 'Viernes': 'friday', 'Sábado': 'saturday', 'Domingo': 'sunday'
        };
        dataToSend.day_of_week = dayMap[formData.day_of_week] || formData.day_of_week;

        if (formData.start_date) dataToSend.start_date = formData.start_date;
        if (formData.end_date) dataToSend.end_date = formData.end_date;
      } else {
        // Sesión con fecha específica
        dataToSend.specific_date = formData.specific_date;
      }

      await attendanceService.createSchedule(dataToSend);
      alert('Sesión creada correctamente');
      router.push('/pages/attendance');
    } catch (error) {
      alert('Error al crear la sesión');
    } finally {
      setSaving(false);
    }
  };

  const getSchedulesByDay = () => {
    const byDay: Record<string, Schedule[]> = {};
    DAYS_OF_WEEK.forEach(d => {
      byDay[d.value] = schedules.filter(s => s.day_of_week === d.value);
    });
    return byDay;
  };

  const schedulesByDay = getSchedulesByDay();

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Programar Sesión</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Crea una nueva sesión de entrenamiento para el programa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-800">add_circle</span>
            Nueva Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de la sesión *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Yoga Matutino"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Program Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Programa *</label>
              <select
                name="program"
                value={formData.program}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Seleccionar programa...</option>
                {PROGRAM_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Tipo de sesión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de sesión *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionType"
                    value="recurring"
                    checked={sessionType === 'recurring'}
                    onChange={() => setSessionType('recurring')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Recurrente (se repite cada semana)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionType"
                    value="specific"
                    checked={sessionType === 'specific'}
                    onChange={() => setSessionType('specific')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Fecha específica (única vez)</span>
                </label>
              </div>
            </div>

            {/* Campos según tipo de sesión */}
            {sessionType === 'recurring' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Día de la semana *</label>
                  <select
                    name="day_of_week"
                    value={formData.day_of_week}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Seleccionar día...</option>
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha inicio (opcional)</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha fin (opcional)</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de la sesión *</label>
                <input
                  type="date"
                  name="specific_date"
                  value={formData.specific_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El día de la semana se calculará automáticamente</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hora inicio *</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hora fin *</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ubicación</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ej: Gimnasio principal"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacidad</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción de la sesión..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Crear Sesión
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Schedules */}
        <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-800">calendar_month</span>
            Horario Semanal Actual
          </h2>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map(day => (
              <div key={day.value}>
                <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${schedulesByDay[day.value]?.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {day.label}
                </h3>
                {schedulesByDay[day.value]?.length > 0 ? (
                  <div className="space-y-2 ml-4">
                    {schedulesByDay[day.value].map(s => (
                      <div key={String(s.id)} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{s.name}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{s.program}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {s.start_time} - {s.end_time}
                          {s.location && ` • ${s.location}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 ml-4">Sin sesiones programadas</p>
                )}
              </div>
            ))}
          </div>

          {schedules.length === 0 && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">event_busy</span>
              <p className="text-gray-500 dark:text-gray-400">No hay sesiones programadas</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Crea tu primera sesión usando el formulario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
