/**
 * @module Gestión de Participantes
 * @description Página para visualizar y gestionar participantes del sistema.
 * Muestra lista de usuarios (estudiantes, pasantes, profesores) con estadísticas
 * de asistencia y permite filtrar por tipo y programa.
 */

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.services';
import { participantService } from '@/services/participant.service';
import type { Participant } from '@/types/attendance';

/**
 * Componente de tarjeta estadística para mostrar métricas resumidas.
 */
function StatCard({ icon, iconBg, label, value }: { icon: string; iconBg: string; label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`${iconBg} p-2 rounded-lg`}>
          <span className="material-symbols-outlined" translate="no">{icon}</span>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

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
 * Página principal de gestión de participantes.
 * Lista todos los usuarios con filtros por tipo y búsqueda.
 */
export default function Participantes() {
  // Estado de datos
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [pasantesData, setPasantesData] = useState<Participant[]>([]);
  
  // Estado de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [programFilter, setProgramFilter] = useState('');
  const [attendanceStats, setAttendanceStats] = useState<Record<string, { present: number; total: number; percentage: number }>>({});

  // Opciones de programa disponibles
  const PROGRAM_OPTIONS = [
    { value: '', label: 'Todos los programas' },
    { value: 'INICIACION', label: 'Iniciación' },
    { value: 'FUNCIONAL', label: 'Funcional' },
  ];

  useEffect(() => {
    loadParticipants();
    loadPasantes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [participants, pasantesData, searchTerm, filterType]);

  /**
   * Carga todos los usuarios del sistema.
   */
  const loadParticipants = async () => {
    try {
      const res = await attendanceService.getAllUsers();
      const rawData = res.data.data || [];
      const normalized = rawData.map((p: any) => ({
        ...p,
        id: p.external_id || p.id,
        name: p.name || `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim(),
        status: (p.status === 'active' || p.status === 'ACTIVO') ? 'ACTIVO' : 'INACTIVO',
        type: p.type?.toUpperCase() || 'ESTUDIANTE'
      })) as Participant[];
      setParticipants(normalized);
    } catch (error) {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga los pasantes desde el endpoint específico.
   */
  const loadPasantes = async () => {
    try {
      const pasantes = await participantService.getPasantes();
      const normalized = pasantes.map(p => ({
        ...p,
        id: (p as any).external_id || p.id,
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        status: (p.status === 'active' || p.status === 'ACTIVO') ? 'ACTIVO' : 'INACTIVO',
        type: 'PASANTE'
      })) as Participant[];
      setPasantesData(normalized);
    } catch (error) {
      // Error silencioso
    }
  };

  /**
   * Carga participantes filtrados por programa.
   * El backend retorna attendance_percentage directamente.
   * @param program - Nombre del programa para filtrar
   */
  const loadParticipantsByProgram = async (program: string) => {
    setLoading(true);
    try {
      const res = await attendanceService.getParticipantsByProgram(program === 'Todos los programas' ? undefined : program);
      const data = res.data.data || [];
      setParticipants(data);

      // Mapear porcentaje de asistencia del backend
      const newStats: Record<string, { present: number; total: number; percentage: number }> = {};
      data.forEach((p: any) => {
        newStats[p.external_id || p.id] = {
          present: 0,
          total: 0,
          percentage: p.attendance_percentage || 0
        };
      });
      setAttendanceStats(newStats);

    } catch (error) {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplica los filtros de búsqueda y tipo a la lista de participantes.
   */
  const applyFilters = () => {
    let filtered = [...participants];

    // Filtrar por tipo de usuario
    if (filterType === 'ESTUDIANTE') {
      filtered = filtered.filter(p =>
        ['PARTICIPANTE', 'ESTUDIANTE', 'INICIACION', 'STUDENT', 'EXTERNO', 'PASANTE'].includes((p as any).type?.toUpperCase())
      );
    } else if (filterType === 'PROFESOR') {
      filtered = filtered.filter(p =>
        (p as any).type?.toUpperCase() === 'PROFESOR'
      );
    } else if (filterType === 'EXTERNO') {
      filtered = filtered.filter(p =>
        (p as any).type?.toUpperCase() === 'EXTERNO'
      );
    } else if (filterType === 'PASANTE') {
      filtered = pasantesData.length > 0 ? [...pasantesData] : participants.filter(p =>
        (p as any).type?.toUpperCase() === 'PASANTE'
      );
    } else if (filterType === 'ADMIN') {
      filtered = filtered.filter(p => ['ADMIN', 'STAFF'].includes((p as any).type?.toUpperCase()));
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.dni?.includes(term) ||
        p.email?.toLowerCase().includes(term)
      );
    }

    setFilteredParticipants(filtered);
  };

  /**
   * Obtiene las iniciales de un nombre para mostrar en avatar.
   */
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  /**
   * Verifica si un tipo de usuario es profesor.
   */
  const isTeacher = (type: string) => {
    return type?.toUpperCase() === 'PROFESOR';
  };

  // Contar estudiantes (incluye EXTERNO y PASANTE como participante)
  const students = participants.filter(p =>
    ['PARTICIPANTE', 'ESTUDIANTE', 'INICIACION', 'STUDENT', 'EXTERNO', 'PASANTE'].includes((p as any).type?.toUpperCase())
  ).length + (pasantesData.length > 0 ? pasantesData.length : 0);
  const externos = participants.filter(p =>
    (p as any).type?.toUpperCase() === 'EXTERNO'
  ).length;
  // Usar el conteo del endpoint de pasantes si está disponible
  const pasantes = pasantesData.length > 0 ? pasantesData.length : participants.filter(p =>
    (p as any).type?.toUpperCase() === 'PASANTE'
  ).length;
  const professors = participants.filter(p =>
    (p as any).type?.toUpperCase() === 'PROFESOR'
  ).length;
  const active = participants.filter(p => p.status?.toUpperCase() === 'ACTIVO').length + pasantesData.filter(p => p.status?.toUpperCase() === 'ACTIVO').length;

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Participantes</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Lista de participantes registrados en el programa.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard icon="group" iconBg="bg-blue-100 text-blue-800" label="Participantes" value={students} />
        <StatCard icon="person" iconBg="bg-orange-100 text-orange-600" label="Externos" value={externos} />
        <StatCard icon="badge" iconBg="bg-cyan-100 text-cyan-600" label="Pasantes" value={pasantes} />
        <StatCard icon="school" iconBg="bg-purple-100 text-purple-600" label="Profesores" value={professors} />
        <StatCard icon="check_circle" iconBg="bg-green-100 text-green-600" label="Activos" value={active} />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" translate="no">search</span>
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'ALL', label: 'Todos' },
              { value: 'ESTUDIANTE', label: 'Participantes' },
              { value: 'EXTERNO', label: 'Externos' },
              { value: 'PASANTE', label: 'Pasantes' },
              { value: 'PROFESOR', label: 'Profesores' },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilterType(btn.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === btn.value
                  ? 'bg-blue-800 text-white'
                  : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          {/* Program Filter for Attendance Stats */}
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROGRAM_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Participante</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cédula</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                {programFilter && <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asistencia</th>}
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block" translate="no">group_off</span>
                    <p>No se encontraron participantes</p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                          {getInitials(p.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{p.dni || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{p.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isTeacher((p as any).type) ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {isTeacher((p as any).type) ? 'Profesor' : 'Estudiante'}
                      </span>
                    </td>
                    {programFilter && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendanceStats[p.id] ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${(attendanceStats[p.id].present / attendanceStats[p.id].total) >= 0.8 ? 'bg-green-500' :
                                  (attendanceStats[p.id].present / attendanceStats[p.id].total) >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${(attendanceStats[p.id].present / attendanceStats[p.id].total) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {Math.round((attendanceStats[p.id].present / attendanceStats[p.id].total) * 100)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              ({attendanceStats[p.id].present}/{attendanceStats[p.id].total})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.status === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {p.status || 'ACTIVO'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
