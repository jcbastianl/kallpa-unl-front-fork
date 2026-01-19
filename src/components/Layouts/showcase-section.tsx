import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PropsType = {
  icon: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function ShowcaseSection({
  icon,
  title,
  description,
  children,
  className,
}: PropsType) {
  return (
    <div
      className={cn(
        "mx-auto max-w-7xl rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 px-7 py-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            {icon}
          </div>

          <div>
            <h3 className="text-xl font-bold leading-tight text-slate-900 dark:text-white sm:text-2xl">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-sm">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          Nuevo Ingreso
        </div>
      </div>
      {children && <div className="p-6 sm:p-6 xl:p-10">{children}</div>}
    </div>
  );
}
