import React from 'react';

// 1. Definimos la estructura de las props
interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  trendText: string;
  icon: React.ReactNode;
  badge?: string;
}

// 2. Aplicamos la Interface al componente y lo exportamos
export const StatCard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  trendValue, 
  trendText, 
  icon, 
  badge 
}: StatCardProps) => {
  
  const isPositive = trend === 'up';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-dark-2">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <h2 className="text-3xl font-bold text-black dark:text-white">
              {value}
            </h2>
            {unit && <span className="text-lg font-medium text-gray-400">{unit}</span>}
          </div>
        </div>
        
        {/* Contenedor del Icono */}
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {/* Badge opcional (ej. "Normal") */}
        {badge && (
          <span className="rounded bg-meta-3/10 px-2 py-0.5 text-xs font-medium text-meta-3">
            {badge}
          </span>
        )}

        {/* Indicador de tendencia */}
        {(trendValue || trendText) && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-blue-500' : 'text-green-500'}`}>
            {trendValue && (
               <span>
                {isPositive ? '↗' : '↘'} {trendValue}
              </span>
            )}
            <span className="text-gray-400 font-normal">{trendText}</span>
          </div>
        )}
      </div>
    </div>
  );
};