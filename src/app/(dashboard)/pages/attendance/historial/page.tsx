"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.services';
import type { Schedule, HistoryRecord, SessionDetail } from '@/types/attendance';

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

export default function Historial() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [filterDay, setFilterDay] = useState('Todos los días');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadHistory();
    }
  }, [dateFrom, dateTo, filterDay]);

  const loadData = async () => {
    try {
      const [historyRes, schedulesRes] = await Promise.all([
        attendanceService.getHistory(dateFrom, dateTo, undefined, filterDay),
        attendanceService.getSchedules()
      ]);
      
      const dayMap: Record<string, string> = {
        'monday': 'LUNES', 'tuesday': 'MARTES', 'wednesday': 'MIERCOLES',
        'thursday': 'JUEVES', 'friday': 'VIERNES', 'saturday': 'SABADO', 'sunday': 'DOMINGO'
      };
      const rawSchedules = schedulesRes.data.data || [];
      const normalizedSchedules = rawSchedules.map((s: any) => ({
        ...s,
        id: s.external_id || s.id,
        day_of_week: dayMap[s.dayOfWeek?.toLowerCase() || ''] || dayMap[s.day_of_week?.toLowerCase() || ''] || s.dayOfWeek?.toUpperCase() || 'SIN DÍA',
        start_time: s.startTime || s.start_time,
        end_time: s.endTime || s.end_time
      }));
      setSchedules(normalizedSchedules);
      
      // El backend ya devuelve los datos agrupados, solo normalizamos
      const rawHistory = historyRes.data.data || [];
      const normalizedHistory = normalizeHistoryData(rawHistory);
      setHistory(normalizedHistory);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normaliza los datos del historial que ya vienen agrupados del backend
  const normalizeHistoryData = (records: any[]): HistoryRecord[] => {
    return records.map(r => ({
      date: r.date,
      schedule_id: r.schedule_id || r.scheduleId,
      schedule_name: r.schedule_name || r.scheduleName || 'Sesión',
      day_of_week: r.day_of_week || r.dayOfWeek || '',
      start_time: r.start_time || r.startTime || '',
      end_time: r.end_time || r.endTime || '',
      presentes: r.presentes || 0,
      ausentes: r.ausentes || 0,
      total: r.total || 0
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const loadHistory = async () => {
    try {
      const res = await attendanceService.getHistory(dateFrom, dateTo, undefined, filterDay);
      const rawHistory = res.data.data || [];
      const normalizedHistory = normalizeHistoryData(rawHistory);
      setHistory(normalizedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const viewDetail = async (scheduleId: string, date: string) => {
    try {
      const res = await attendanceService.getSessionDetail(scheduleId, date);
      setSessionDetail(res.data.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading session detail:', error);
    }
  };

  const handleDelete = async (scheduleId: string, date: string, scheduleName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la asistencia de "${scheduleName}" del ${date}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      await attendanceService.deleteSessionAttendance(scheduleId, date);
      loadHistory();
      alert('Registro de asistencia eliminado correctamente');
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Error al eliminar el registro');
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const totalSessions = history.length;
  const totalPresent = history.reduce((sum, h) => sum + (h.presentes || 0), 0);
  const totalAbsent = history.reduce((sum, h) => sum + (h.ausentes || 0), 0);
  const avgAttendance = totalSessions > 0 && (totalPresent + totalAbsent) > 0
    ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100)
    : 0;

  // Ya no necesitamos filtrar en frontend, el backend filtra por día
  const filteredHistory = history;

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Historial de Asistencia</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Consulta los registros de asistencia anteriores.</p>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard icon="event" iconBg="bg-blue-100 text-blue-800" label="Total Sesiones" value={totalSessions} />
        <StatCard icon="percent" iconBg="bg-purple-100 text-purple-600" label="Asistencia Promedio" value={`${avgAttendance}%`} />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Día</label>
            <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white">
              <option value="Todos los días">Todos los días</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sesión</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Horario</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Presentes</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ausentes</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">history</span>
                    <p>No hay registros en este período</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((h, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><span className="font-medium text-gray-900 dark:text-white">{formatDate(h.date)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-gray-900 dark:text-white">{h.schedule_name}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{h.start_time} - {h.end_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{h.presentes || 0}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-center"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">{h.ausentes || 0}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-gray-900 dark:text-white">{h.total || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => viewDetail(h.schedule_id, h.date)} className="text-blue-800 hover:text-blue-900" title="Ver detalle">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <Link href={`/pages/attendance/registro?session=${h.schedule_id}&date=${h.date}`} className="text-gray-600 hover:text-gray-800 dark:text-gray-400" title="Editar asistencia">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button onClick={() => handleDelete(h.schedule_id, h.date, h.schedule_name)} className="text-red-600 hover:text-red-800" title="Eliminar registro">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && sessionDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sessionDetail.schedule?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{sessionDetail.date} • {sessionDetail.schedule?.start_time} - {sessionDetail.schedule?.end_time}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{sessionDetail.stats?.presentes || 0}</p>
                  <p className="text-xs text-green-700 dark:text-green-400">Presentes</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{sessionDetail.stats?.ausentes || 0}</p>
                  <p className="text-xs text-red-700 dark:text-red-400">Ausentes</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{sessionDetail.stats?.total || 0}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">Total</p>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Lista de Asistencia</h4>
              <div className="space-y-2">
                {sessionDetail.records?.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white">{r.participant_name}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      r.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                      r.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.status === 'PRESENT' ? 'Presente' : r.status === 'ABSENT' ? 'Ausente' : 'Justificado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
