/**
 * @module Programación de Sesiones
 * @description Página para crear y gestionar horarios de sesiones de asistencia.
 * Permite crear sesiones recurrentes (por día de semana) o sesiones con fecha específica.
 * Muestra un horario semanal visual con las sesiones programadas.
 */

"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DatePickerTwo from '@/components/FormElements/DatePicker/DatePickerTwo';
import { attendanceService } from '@/services/attendance.services';
import type { Schedule, Program } from '@/types/attendance';
import { Alert } from '@/components/ui-elements/alert';
import ErrorMessage from '@/components/FormElements/errormessage';
import { Button } from '@/components/ui-elements/button';
import { Select } from '@/components/FormElements/select';
import InputGroup from '@/components/FormElements/InputGroup';
import { extractErrorMessage, isServerDownError } from '@/utils/error-handler';
import { useSession } from '@/context/SessionContext';
import { parseDate } from '@/lib/utils';

// Días de la semana disponibles para programación
const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

/** Tipo de sesión: recurrente (semanal) o fecha específica */
type SessionType = 'recurring' | 'specific';

/**
 * Componente de carga con spinner animado.
 */
function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
    </div>
  );
}

/**
 * Página principal de programación de sesiones.
 * Permite crear nuevas sesiones y visualizar el horario semanal.
 */
export default function Programar() {
  const router = useRouter();
  const { showServerDown } = useSession();
  
  // Estado de carga y guardado
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Datos principales
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  
  // Estado del formulario
  const [sessionType, setSessionType] = useState<SessionType>('recurring');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado de alertas
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning'>('success');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');

  // Datos del formulario de nueva sesión
  const [formData, setFormData] = useState({
    name: '',
    program: '',
    day_of_week: '',
    start_time: '08:00',
    end_time: '09:00',
    location: '',
    capacity: 30,
    description: '',
    program_id: '',
    end_date: '',        // Para sesiones recurrentes
    specific_date: ''    // Para sesiones de fecha específica
  });

  // Opciones de programa disponibles
  const PROGRAM_OPTIONS = [
    { value: 'INICIACION', label: 'Iniciación' },
    { value: 'FUNCIONAL', label: 'Funcional' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Normaliza el nombre del día de semana a formato inglés minúsculas.
   * Soporta entrada en español e inglés.
   * @param day - Nombre del día a normalizar
   * @returns Día normalizado en inglés minúsculas
   */
  const normalizeDayOfWeek = (day: string): string => {
    if (!day) return '';

    const dayLower = day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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

  /**
   * Carga los horarios existentes desde el servidor.
   */
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
      if (isServerDownError(error)) {
        showServerDown(extractErrorMessage(error));
      } else {
        triggerAlert('error', 'Error al cargar horarios', extractErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Dispara una alerta visual en la interfaz.
   */
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

  /**
   * Limpia el error de un campo específico.
   */
  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  /**
   * Maneja cambios en los campos del formulario.
   * Incluye validación especial para end_date vs día de semana.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar coherencia entre día de semana y fecha final
    if (name === 'end_date' && value && formData.day_of_week) {
      const selectedDate = new Date(value + 'T00:00:00');
      const dayOfWeekMap: Record<string, number> = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      };
      const expectedDay = dayOfWeekMap[formData.day_of_week];
      const actualDay = selectedDate.getDay();

      if (expectedDay !== actualDay) {
        const dayNames: Record<string, string> = {
          'monday': 'lunes', 'tuesday': 'martes', 'wednesday': 'miércoles',
          'thursday': 'jueves', 'friday': 'viernes', 'saturday': 'sábado', 'sunday': 'domingo'
        };
        setErrors(prev => ({
          ...prev,
          end_date: `La fecha debe ser un ${dayNames[formData.day_of_week]}`
        }));
        return;
      }
    }

    clearFieldError(name);
  };

  /**
   * Procesa el envío del formulario para crear una nueva sesión.
   * Realiza validaciones y envía al servidor.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    setErrors({}); // Limpiar errores previos

    try {
      // Construir payload para el backend (camelCase)
      const dataToSend: any = {
        name: formData.name,
        program: formData.program,
        startTime: formData.start_time,
        endTime: formData.end_time,
        location: formData.location || undefined,
        maxSlots: Number(formData.capacity),
        description: formData.description || undefined,
        program_id: formData.program_id || undefined,
      };

      if (sessionType === 'recurring') {
        // Mapeo de día a formato del backend (mayúsculas)
        const dayMap: Record<string, string> = {
          'Lunes': 'MONDAY', 'Martes': 'TUESDAY', 'Miércoles': 'WEDNESDAY',
          'Jueves': 'THURSDAY', 'Viernes': 'FRIDAY', 'Sábado': 'SATURDAY', 'Domingo': 'SUNDAY'
        };
        dataToSend.dayOfWeek = dayMap[formData.day_of_week] || formData.day_of_week.toUpperCase();

        if (formData.end_date) dataToSend.endDate = formData.end_date;
      } else {
        dataToSend.specificDate = formData.specific_date;
      }

      await attendanceService.createSchedule(dataToSend);
      triggerAlert(
        'success',
        'Sesión creada exitosamente',
        'La sesión se ha programado correctamente en el calendario.'
      );

      // Reiniciar formulario
      setFormData({
        name: '',
        program: '',
        day_of_week: '',
        start_time: '08:00',
        end_time: '09:00',
        location: '',
        capacity: 30,
        description: '',
        program_id: '',
        end_date: '',
        specific_date: ''
      });
      setErrors({});
      loadData();
    } catch (error: any) {
      // Verificar si es error de servidor caído
      if (isServerDownError(error)) {
        showServerDown(extractErrorMessage(error));
      } else if (error?.response?.data?.data && typeof error.response.data.data === 'object') {
        // Si hay errores de validación específicos por campo
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.response.data.data).forEach(([key, value]) => {
          fieldErrors[key] = String(value);
        });
        setErrors(fieldErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Agrupa los horarios por día de la semana para mostrar en la vista semanal.
   * Filtra solo sesiones activas (no expiradas).
   * @returns Objeto con días como claves y arrays de horarios como valores
   */
  const getSchedulesByDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayNumberToValue = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Filtrar solo sesiones activas
    const activeSchedules = schedules.filter(s => {
      const specificDate = (s as any).specific_date || (s as any).specificDate;
      if (specificDate) {
        const sessionDate = parseDate(specificDate);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= today;
      }

      const endDateStr = (s as any).end_date || (s as any).endDate;
      if (endDateStr) {
        const endDate = parseDate(endDateStr);
        endDate.setHours(0, 0, 0, 0);
        return endDate >= today;
      }

      // Si no tiene fecha de fin, la sesión está activa
      return true;
    });

    const byDay: Record<string, Schedule[]> = {};
    
    // Inicializar todos los días
    DAYS_OF_WEEK.forEach(d => {
      byDay[d.value] = [];
    });

    activeSchedules.forEach(s => {
      const specificDate = (s as any).specific_date || (s as any).specificDate;
      
      if (specificDate) {
        // Para sesiones con fecha específica, determinar el día de la semana
        const sessionDate = parseDate(specificDate);
        const dayOfWeek = sessionDate.getDay(); // 0=domingo, 1=lunes, etc.
        const dayValue = dayNumberToValue[dayOfWeek];
        
        // Solo incluir si es de esta semana (próximos 7 días)
        const daysDiff = Math.ceil((sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff <= 6) {
          byDay[dayValue].push(s);
        }
      } else {
        // Para sesiones recurrentes
        const dayOfWeek = s.day_of_week;
        if (dayOfWeek && byDay[dayOfWeek]) {
          byDay[dayOfWeek].push(s);
        }
      }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-800" translate="no">add_circle</span>
            Nueva Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <InputGroup
                label="Nombre de la sesión"
                type="text"
                name="name"
                value={formData.name}
                handleChange={handleChange}
                placeholder="Ej: Yoga Matutino"
              />
              <ErrorMessage message={errors.name} />
            </div>

            {/* Program Selection */}
            <div>
              <Select
                label="Programa"
                name="program"
                placeholder="Seleccionar programa..."
                value={formData.program}
                onChange={handleChange}
                items={PROGRAM_OPTIONS}
              />
              <ErrorMessage message={errors.program} />
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
                  <Select
                    label="Día de la semana"
                    name="day_of_week"
                    placeholder="Seleccionar día..."
                    value={formData.day_of_week}
                    onChange={handleChange}
                    items={DAYS_OF_WEEK}
                  />
                  <ErrorMessage message={errors.day_of_week} />
                </div>
                <div>
                  <DatePickerTwo
                    label="Fecha fin (opcional)"
                    value={formData.end_date}
                    onChange={(newDate) => setFormData({ ...formData, end_date: newDate })}
                    minDate="today"
                  />
                  <ErrorMessage message={errors.end_date} />
                  {formData.day_of_week && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selecciona una fecha que sea {DAYS_OF_WEEK.find(d => d.value === formData.day_of_week)?.label}</p>
                  )}
                </div>
              </>
            ) : (
              <div>
                <DatePickerTwo
                  label="Fecha específica"
                  value={formData.specific_date}
                  onChange={(newDate) => setFormData({ ...formData, specific_date: newDate })}
                  minDate="today"
                />
                <ErrorMessage message={errors.specific_date} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El día de la semana se calculará automáticamente</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Hora inicio"
                  name="start_time"
                  placeholder="Seleccionar hora"
                  value={formData.start_time}
                  onChange={handleChange}
                  items={Array.from({ length: 24 }, (_, i) => ({
                    value: `${i.toString().padStart(2, '0')}:00`,
                    label: `${i.toString().padStart(2, '0')}:00`
                  }))}
                />
                <ErrorMessage message={errors.start_time} />
              </div>
              <div>
                <Select
                  label="Hora fin"
                  name="end_time"
                  placeholder="Seleccionar hora"
                  value={formData.end_time}
                  onChange={handleChange}
                  items={Array.from({ length: 24 }, (_, i) => ({
                    value: `${i.toString().padStart(2, '0')}:00`,
                    label: `${i.toString().padStart(2, '0')}:00`
                  }))}
                />
                <ErrorMessage message={errors.end_time} />
              </div>
            </div>

            {/* Error de conflicto de horarios */}
            {errors.schedule && (
              <div className="col-span-2">
                <ErrorMessage message={errors.schedule} />
              </div>
            )}

            <InputGroup
              label="Ubicación"
              type="text"
              name="location"
              value={formData.location}
              handleChange={handleChange}
              placeholder="Ej: Gimnasio principal"
            />

            <InputGroup
              label="Capacidad"
              type="number"
              name="capacity"
              value={String(formData.capacity)}
              handleChange={handleChange}
              placeholder="30"
            />

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

            <Button
              label={saving ? "Guardando..." : "Crear Sesión"}
              variant="primary"
              shape="rounded"
              className="w-full !bg-blue-800 hover:!bg-blue-900"
              icon={saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <span className="material-symbols-outlined" translate="no">save</span>}
            />
          </form>
        </div>

        {/* Existing Schedules */}
        <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-800" translate="no">calendar_month</span>
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
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2" translate="no">event_busy</span>
              <p className="text-gray-500 dark:text-gray-400">No hay sesiones programadas</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Crea tu primera sesión usando el formulario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
