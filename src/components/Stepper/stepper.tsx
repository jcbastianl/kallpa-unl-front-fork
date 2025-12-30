import React from "react";
import { FiCheck } from "react-icons/fi";

interface Step {
    id: number;
    label: string;
}

interface StepperProps {
    currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    const steps: Step[] = [
        { id: 1, label: "Seleccionar Test" },
        { id: 2, label: "Seleccionar Participante" },
        { id: 3, label: "Llenar Formulario" },
    ];

    return (
        <div className="mb-4 w-full px-10 py-4">
            <div className="relative flex items-center justify-between">
                <div className="dark:bg-strokedark absolute left-0 top-5 h-0.5 w-full -translate-y-1/2 bg-stroke"></div>
                <div
                    className="absolute left-0 top-5 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div
                            key={step.id}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${isCompleted || isActive
                                        ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                                        : "border-stroke bg-gray-2 text-body dark:border-strokedark dark:bg-meta-4"
                                    }`}
                            >
                                {isCompleted ? <FiCheck size={20} strokeWidth={3} /> : <span className="text-sm font-bold">{step.id}</span>}
                            </div>

                            <div className="mt-2 text-center">
                                <span
                                    className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${isActive || isCompleted ? "text-primary" : "text-body"
                                        }`}
                                    style={{ width: 'min-content', minWidth: '80px' }}
                                >
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};