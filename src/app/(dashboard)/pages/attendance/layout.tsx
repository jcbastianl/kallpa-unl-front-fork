"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';

const navItems = [
  { path: '/pages/attendance', label: 'Dashboard', icon: 'dashboard' },
  { path: '/pages/attendance/participantes', label: 'Participantes', icon: 'group' },
  { path: '/pages/attendance/historial', label: 'Historial', icon: 'history' },
  { path: '/pages/attendance/programar', label: 'Programar', icon: 'calendar_month' },
];

function AsistenciaNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white dark:bg-gray-dark border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center gap-1 overflow-x-auto py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AsistenciaLayout({ children }: PropsWithChildren) {
  return (
    <>
      <AsistenciaNav />
      {children}
    </>
  );
}
