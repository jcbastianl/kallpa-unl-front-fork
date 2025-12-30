import React from "react";
import { FiClock, FiCheckCircle, FiCalendar } from "react-icons/fi";

export interface Test {
  id: string;
  name: string;
  description: string;
  frequencyMonths: number;
  icon: React.ReactNode;
}

interface TestCardProps {
  test: Test;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const TestCard: React.FC<TestCardProps> = ({ test, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(test.id)}
      className={`relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-5 transition-all duration-300 ${
        isSelected
          ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500 dark:bg-blue-900/10"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#1e293b] shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
            isSelected 
              ? "bg-blue-600 text-white border-blue-600" 
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
          }`}>
            <div className="text-2xl">
              {test.icon}
            </div>
          </div>

          <div>
            <h3 className={`font-bold leading-tight ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-white"}`}>
              {test.name}
            </h3>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Evaluación Física
            </span>
          </div>
        </div>

        <div className={`transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-20"}`}>
           <FiCheckCircle size={20} className={isSelected ? "text-blue-600" : "text-slate-300 dark:text-slate-700"} />
        </div>
      </div>

      <div className="my-5 flex-grow">
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {test.description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <FiClock className="text-blue-500" />
            <span>Frecuencia: {test.frequencyMonths} meses</span>
          </div>
        </div>

        {isSelected && (
          <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 animate-pulse">
            Seleccionado
          </span>
        )}
      </div>
    </div>
  );
};

export default TestCard;