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

  let trendColor = '';
  let trendArrow = '';

  if (trend === 'up') {
    trendColor = 'text-green-500';
    trendArrow = '↗';
  } else if (trend === 'down') {
    trendColor = 'text-red-500';
    trendArrow = '↘';
  } else {
    trendColor = 'text-gray-400';
    trendArrow = '';
  }

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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 transition-all duration-300 shadow-sm">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {badge && (
          <span className="rounded bg-meta-3/10 px-2 py-0.5 text-xs font-medium text-meta-3">
            {badge}
          </span>
        )}

        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          {trendValue && (
            <span>
              {trendArrow} {trendValue}
            </span>
          )}
          {trendText && <span className="text-gray-400 font-normal">{trendText}</span>}
        </div>

      </div>
    </div>
  );
};