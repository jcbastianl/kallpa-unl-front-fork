import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";
import {
  FiArrowUpRight,
  FiArrowDownRight,
  FiMoreHorizontal,
} from "react-icons/fi";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
  };
  Icon: IconType;
  variant?: "green" | "orange" | "purple" | "blue";
};

export function OverviewCard({
  label,
  data,
  Icon,
  variant = "blue",
}: PropsType) {
  const isDecreasing = data.growthRate < 0;

  const variantStyles = {
    green: "bg-blue-600/20 text-blue-500",
    orange: "bg-orange-500/10 text-orange-600",
    purple: "bg-purple-500/10 text-purple-600",
    blue: "bg-sky-500/10 text-sky-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 dark:border-[#2d3643] dark:bg-[#1a2233] dark:hover:border-slate-700">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              variantStyles[variant],
            )}
          >
            <Icon size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
        </div>
        <button className="text-slate-400 transition-colors hover:text-white">
          <FiMoreHorizontal size={20} />
        </button>
      </div>
      <div className="mb-4">
        <h3 className="text-4xl font-bold text-slate-900 dark:text-white">
          {data.value}
        </h3>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
            isDecreasing
              ? "bg-red-500/10 text-red-500"
              : "bg-green-500/10 text-green-500",
          )}
        >
          {isDecreasing ? <FiArrowDownRight /> : <FiArrowUpRight />}
          {Math.abs(data.growthRate)}%
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-500">
          vs. mes anterior
        </span>
      </div>
    </div>
  );
}
