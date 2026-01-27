"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal/modal";
import InputGroup from "@/components/FormElements/InputGroup";
import ErrorMessage from "@/components/FormElements/errormessage";
import { Button } from "@/components/ui-elements/button";
import { Alert } from "@/components/ui-elements/alert";
import { Participant, UpdateParticipantData } from "@/types/participant";
import { participantService } from "@/services/participant.service";
import { X } from "lucide-react";
import { FiMail, FiMapPin, FiPhone, FiSave, FiUser } from "react-icons/fi";
import { LuIdCard } from "react-icons/lu";

interface EditParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    participant: Participant | null;
    onSuccess: () => void;
}

export function EditParticipantModal({
    isOpen,
    onClose,
    participant,
    onSuccess,
}: EditParticipantModalProps) {
    const [formData, setFormData] = useState<UpdateParticipantData>({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        age: 0,
        dni: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<"success" | "error">("success");
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        if (participant) {
            setFormData({
                firstName: participant.firstName || "",
                lastName: participant.lastName || "",
                phone: participant.phone || "",
                email: participant.email || "",
                address: participant.address || "",
                age: participant.age || 0,
                dni: participant.dni || "",
            });
            setErrors({});
        }
    }, [participant]);

    const handleChange = (field: keyof UpdateParticipantData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!participant?.id) return;

        setIsSaving(true);
        setErrors({});

        try {
            const response = await participantService.updateParticipant(
                participant.id,
                formData
            );

            if (response.code === 200) {
                setAlertType("success");
                setAlertMessage("Participante actualizado correctamente");
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                    onSuccess();
                    onClose();
                }, 1500);
            } else if (response.code === 400 && response.data) {
                setErrors(response.data);
            } else if (response.code === 404) {
                setAlertType("error");
                setAlertMessage("Participante no encontrado");
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
            }
        } catch (error) {
            setAlertType("error");
            setAlertMessage("Error al actualizar el participante");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        setShowAlert(false);
        onClose();
    };

    if (!participant) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl dark:border-gray-800 dark:bg-[#111827] dark:text-white">
                <div className="border-b border-gray-200 p-6 dark:border-gray-800">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">
                                Editar Participante
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Modifica la información del participante.
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {showAlert && (
                    <div className="px-6 pt-4">
                        <Alert
                            variant={alertType}
                            title={alertType === "success" ? "Éxito" : "Error"}
                            description={alertMessage}
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="custom-scrollbar flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <InputGroup
                                label="Nombre"
                                type="text"
                                placeholder="Nombre"
                                value={formData.firstName}
                                handleChange={(e) => handleChange("firstName", e.target.value)}
                                iconPosition="left"
                                icon={<FiUser className="text-gray-400" size={18} />}
                                required
                            />
                            <ErrorMessage message={errors.firstName} />
                        </div>

                        <div>
                            <InputGroup
                                label="Apellido"
                                type="text"
                                placeholder="Apellido"
                                value={formData.lastName}
                                handleChange={(e) => handleChange("lastName", e.target.value)}
                                iconPosition="left"
                                icon={<FiUser className="text-gray-400" size={18} />}
                                required
                            />
                            <ErrorMessage message={errors.lastName} />
                        </div>

                        <div>
                            <InputGroup
                                label="DNI"
                                type="text"
                                placeholder="10 dígitos"
                                value={formData.dni}
                                handleChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                    handleChange("dni", value);
                                }}
                                iconPosition="left"
                                icon={<LuIdCard className="text-gray-400" size={18} />}
                                required
                            />
                            <ErrorMessage message={errors.dni} />
                        </div>

                        <div>
                            <InputGroup
                                label="Edad"
                                type="text"
                                placeholder="1-80"
                                value={formData.age.toString()}
                                handleChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    const numValue = parseInt(value) || 0;
                                    handleChange("age", numValue);
                                }}
                                iconPosition="left"
                                icon={<FiUser className="text-gray-400" size={18} />}
                                required
                            />
                            <ErrorMessage message={errors.age} />
                        </div>

                        <div>
                            <InputGroup
                                label="Teléfono"
                                type="text"
                                placeholder="0XXXXXXXXX"
                                value={formData.phone}
                                handleChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                    handleChange("phone", value);
                                }}
                                iconPosition="left"
                                icon={<FiPhone className="text-gray-400" size={18} />}
                            />
                            <ErrorMessage message={errors.phone} />
                        </div>

                        <div>
                            <InputGroup
                                label="Email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={formData.email}
                                handleChange={(e) => handleChange("email", e.target.value)}
                                iconPosition="left"
                                icon={<FiMail className="text-gray-400" size={18} />}
                            />
                            <ErrorMessage message={errors.email} />
                        </div>

                        <div className="md:col-span-2">
                            <InputGroup
                                label="Dirección"
                                type="text"
                                placeholder="Dirección"
                                value={formData.address}
                                handleChange={(e) => handleChange("address", e.target.value)}
                                iconPosition="left"
                                icon={<FiMapPin className="text-gray-400" size={18} />}
                            />
                            <ErrorMessage message={errors.address} />
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        Cancelar
                    </button>
                    <Button
                        label={isSaving ? "Guardando..." : "Guardar Cambios"}
                        icon={<FiSave size={18} />}
                        variant="primary"
                        size="small"
                        shape="rounded"
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className={isSaving ? "cursor-not-allowed opacity-70" : ""}
                    />
                </div>
            </div>
        </Modal>
    );
}
