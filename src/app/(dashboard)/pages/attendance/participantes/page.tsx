"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.services';
import type { Participant } from '@/types/attendance';

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

export default function Participantes() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    loadParticipants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [participants, searchTerm, filterType]);

  const loadParticipants = async () => {
    try {
      // Usar getAllUsers para obtener todos los usuarios incluyendo profesores
      const res = await attendanceService.getAllUsers();
      const rawData = res.data.data || [];
      const normalized = rawData.map(p => ({
        ...p,
        id: p.external_id || p.id,
        name: p.name || `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim(),
        status: (p.status === 'active' || p.status === 'ACTIVO') ? 'ACTIVO' : 'INACTIVO',
        type: p.type?.toUpperCase() || 'ESTUDIANTE'
      })) as Participant[];
      setParticipants(normalized);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...participants];

    if (filterType === 'ESTUDIANTE') {
      filtered = filtered.filter(p => 
        ['PARTICIPANTE', 'ESTUDIANTE', 'INICIACION', 'STUDENT'].includes(p.type?.toUpperCase())
      );
    } else if (filterType === 'PROFESOR') {
      filtered = filtered.filter(p => 
        p.type?.toUpperCase() === 'PROFESOR'
      );
    }

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

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const isTeacher = (type: string) => {
    return type?.toUpperCase() === 'PROFESOR';
  };

  const students = participants.filter(p => 
    ['PARTICIPANTE', 'ESTUDIANTE', 'INICIACION', 'STUDENT'].includes(p.type?.toUpperCase())
  ).length;
  const professors = participants.filter(p => 
    p.type?.toUpperCase() === 'PROFESOR'
  ).length;
  const active = participants.filter(p => p.status?.toUpperCase() === 'ACTIVO').length;

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Participantes</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Lista de participantes registrados en el programa.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon="group" iconBg="bg-blue-100 text-blue-800" label="Estudiantes" value={students} />
        <StatCard icon="school" iconBg="bg-purple-100 text-purple-600" label="Profesores" value={professors} />
        <StatCard icon="check_circle" iconBg="bg-green-100 text-green-600" label="Activos" value={active} />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: 'ALL', label: 'Todos' },
              { value: 'ESTUDIANTE', label: 'Estudiantes' },
              { value: 'PROFESOR', label: 'Profesores' },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilterType(btn.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === btn.value
                    ? 'bg-blue-800 text-white'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">group_off</span>
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isTeacher(p.type) ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isTeacher(p.type) ? 'Profesor' : 'Estudiante'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.status === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
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
