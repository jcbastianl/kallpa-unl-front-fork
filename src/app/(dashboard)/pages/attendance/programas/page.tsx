"use client";

import { useState, useEffect } from 'react';
import { attendanceService } from '@/services/attendance.services';
import type { Program, Participant } from '@/types/attendance';
import { Alert } from '@/components/ui-elements/alert';

const COLORS = [
  { value: '#3B82F6' },
  { value: '#10B981' },
  { value: '#F59E0B' },
  { value: '#EF4444' },
  { value: '#8B5CF6' },
  { value: '#EC4899' },
  { value: '#06B6D4' },
  { value: '#F97316' },
];

function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
    </div>
  );
}

export default function ProgramasPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning'>('success');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<{id: string, name: string} | null>(null);

  // Estado para ver participantes de un programa
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [programParticipants, setProgramParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    loadPrograms();
  }, []);

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

  const loadPrograms = async () => {
    try {
      const res = await attendanceService.getPrograms();
      setPrograms(res.data.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (program?: Program) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        name: program.name,
        description: program.description || '',
        color: program.color || '#3B82F6',
      });
    } else {
      setEditingProgram(null);
      setFormData({ name: '', description: '', color: '#3B82F6' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProgram(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerAlert(
        'warning',
        'Campo requerido',
        'El nombre del programa es obligatorio.'
      );
      return;
    }

    setSaving(true);
    try {
      if (editingProgram) {
        await attendanceService.updateProgram(editingProgram.external_id, formData);
        triggerAlert(
          'success',
          'Programa actualizado',
          `El programa "${formData.name}" se actualizó correctamente.`
        );
      } else {
        await attendanceService.createProgram(formData);
        triggerAlert(
          'success',
          'Programa creado',
          `El programa "${formData.name}" se creó correctamente.`
        );
      }
      handleCloseModal();
      loadPrograms();
    } catch (error) {
      triggerAlert(
        'error',
        'Error al guardar',
        'No se pudo guardar el programa. Intenta nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (program: Program) => {
    setProgramToDelete({ id: program.external_id, name: program.name });
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!programToDelete) return;

    setDeleting(programToDelete.id);
    setShowConfirmDelete(false);
    try {
      await attendanceService.deleteProgram(programToDelete.id);
      triggerAlert(
        'success',
        'Programa eliminado',
        `El programa "${programToDelete.name}" se ha eliminado correctamente.`
      );
      loadPrograms();
    } catch (error) {
      triggerAlert(
        'error',
        'Error al eliminar',
        'No se pudo eliminar el programa. Intenta nuevamente.'
      );
    } finally {
      setDeleting(null);
      setProgramToDelete(null);
    }
  };

  const handleViewParticipants = async (program: Program) => {
    setSelectedProgram(program);
    setLoadingParticipants(true);
    try {
      const res = await attendanceService.getProgramParticipants(program.external_id);
      // Normalizar los datos para asegurar que siempre haya nombre y DNI
      const normalized = (res.data.data || []).map((p: any) => ({
        ...p,
        id: p.external_id || p.id,
        name: p.name || `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim() || p.dni || 'Sin nombre',
        status: (p.status === 'active' || p.status === 'ACTIVO') ? 'ACTIVO' : 'INACTIVO',
      }));
      setProgramParticipants(normalized);
    } catch (error) {
      setProgramParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleCloseParticipants = () => {
    setSelectedProgram(null);
    setProgramParticipants([]);
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Programas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los programas de actividades y sus participantes.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow transition-all"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Nuevo Programa
        </button>
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

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className="bg-white dark:bg-gray-dark rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
            folder_open
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay programas
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Crea tu primer programa para organizar las actividades.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Crear Programa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div
              key={program.external_id}
              className="bg-white dark:bg-gray-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Color bar */}
              <div
                className="h-1.5"
                style={{ backgroundColor: program.color || '#3B82F6' }}
              />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${program.color || '#3B82F6'}15` }}
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ color: program.color || '#3B82F6' }}
                    >
                      school
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                      {program.name}
                    </h3>
                    {program.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {program.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 py-4 border-y border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">group</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{program.participants_count || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">participantes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">calendar_month</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{program.schedules_count || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">sesiones</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleViewParticipants(program)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
                    style={{
                      backgroundColor: `${program.color || '#3B82F6'}15`,
                      color: program.color || '#3B82F6'
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                    Ver
                  </button>
                  <button
                    onClick={() => handleOpenModal(program)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(program)}
                    disabled={deleting === program.external_id}
                    className="px-3 py-2.5 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  >
                    {deleting === program.external_id ? (
                      <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                    ) : (
                      <span className="material-symbols-outlined text-lg">delete</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar Programa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-dark rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingProgram ? 'Editar Programa' : 'Nuevo Programa'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Actividad Física Adultos"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe el programa..."
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 rounded-lg transition-all ${formData.color === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800'
                          : 'hover:scale-110'
                        }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <span className="material-symbols-outlined animate-spin text-lg">refresh</span>}
                  {editingProgram ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Participantes */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Participantes de {selectedProgram.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {programParticipants.length} participante(s) inscrito(s)
                </p>
              </div>
              <button
                onClick={handleCloseParticipants}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingParticipants ? (
                <Loading />
              ) : programParticipants.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">
                    group_off
                  </span>
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay participantes en este programa
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {programParticipants.map((participant) => (
                    <div
                      key={participant.external_id || participant.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600">person</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {participant.name}
                        </p>
                        {participant.dni && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            DNI: {participant.dni}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${participant.status === 'active' || participant.status === 'ACTIVO'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {participant.status === 'active' || participant.status === 'ACTIVO' ? 'Activo' : participant.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showConfirmDelete && programToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-dark rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar eliminación</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              ¿Estás seguro de eliminar el programa <strong>"{programToDelete.name}"</strong>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmDelete(false);
                  setProgramToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
