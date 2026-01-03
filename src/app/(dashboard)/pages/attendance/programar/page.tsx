"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { attendanceService } from '@/services/attendance.services';
import type { Schedule } from '@/types/attendance';

const DAYS_OF_WEEK = [
  { value: 'Lunes', label: 'Lunes' },
  { value: 'Martes', label: 'Martes' },
  { value: 'Miércoles', label: 'Miércoles' },
  { value: 'Jueves', label: 'Jueves' },
  { value: 'Viernes', label: 'Viernes' },
  { value: 'Sábado', label: 'Sábado' },
  { value: 'Domingo', label: 'Domingo' },
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
  const [sessionType, setSessionType] = useState<SessionType>('recurring');

  const [formData, setFormData] = useState({
    name: '',
    day_of_week: '',
    start_time: '08:00',
    end_time: '09:00',
    location: '',
    capacity: 30,
    description: '',
    // Campos para sesión recurrente
    start_date: '',
    end_date: '',
    // Campo para sesión con fecha específica
    specific_date: ''
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  // Mapeo para normalizar días de la semana
  const normalizeDayOfWeek = (day: string): string => {
    const dayMap: Record<string, string> = {
      'monday': 'Lunes', 'lunes': 'Lunes', 'LUNES': 'Lunes',
      'tuesday': 'Martes', 'martes': 'Martes', 'MARTES': 'Martes',
      'wednesday': 'Miércoles', 'miercoles': 'Miércoles', 'miércoles': 'Miércoles', 'MIERCOLES': 'Miércoles', 'MIÉRCOLES': 'Miércoles',
      'thursday': 'Jueves', 'jueves': 'Jueves', 'JUEVES': 'Jueves',
      'friday': 'Viernes', 'viernes': 'Viernes', 'VIERNES': 'Viernes',
      'saturday': 'Sábado', 'sabado': 'Sábado', 'sábado': 'Sábado', 'SABADO': 'Sábado', 'SÁBADO': 'Sábado',
      'sunday': 'Domingo', 'domingo': 'Domingo', 'DOMINGO': 'Domingo',
    };
    return dayMap[day?.toLowerCase()] || dayMap[day] || day || '';
  };

  const loadSchedules = async () => {
    try {
      const res = await attendanceService.getSchedules();
      const rawSchedules = res.data.data || [];
      // Normalizar los datos del backend
      const normalizedSchedules = rawSchedules.map((s: any) => ({
        ...s,
        id: s.external_id || s.id,
        day_of_week: normalizeDayOfWeek(s.dayOfWeek || s.day_of_week),
        start_time: s.startTime || s.start_time,
        end_time: s.endTime || s.end_time,
      }));
      setSchedules(normalizedSchedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
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
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location || undefined,
        capacity: formData.capacity,
        description: formData.description || undefined,
      };

      if (sessionType === 'recurring') {
        // Sesión recurrente (semanal)
        dataToSend.day_of_week = formData.day_of_week;
        if (formData.start_date) dataToSend.start_date = formData.start_date;
        if (formData.end_date) dataToSend.end_date = formData.end_date;
      } else {
        // Sesión con fecha específica
        dataToSend.specific_date = formData.specific_date;
      }

      await attendanceService.createSchedule(dataToSend);
      alert('Sesión creada correctamente');
      router.push('/pages/attendance/sesiones');
    } catch (error) {
      console.error('Error creating schedule:', error);
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
