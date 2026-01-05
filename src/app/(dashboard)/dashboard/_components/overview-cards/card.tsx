import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";

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
    green:
      "bg-green-500/10 text-green-600 dark:bg-[#3FD97F]/10 dark:text-[#3FD97F]",
    orange:
      "bg-orange-500/10 text-orange-600 dark:bg-[#FF9C55]/10 dark:text-[#FF9C55]",
    purple:
      "bg-purple-500/10 text-purple-600 dark:bg-[#8155FF]/10 dark:text-[#8155FF]",
    blue: "bg-sky-500/10 text-sky-600 dark:bg-[#18BFFF]/10 dark:text-[#18BFFF]",
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-[#1a2233] dark:shadow-lg dark:ring-0">
      <div
        className={cn(
          "mb-8 flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-110",
          variantStyles[variant],
        )}
      >
        <Icon size={28} />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
          {data.value}
        </h3>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              isDecreasing
                ? "text-red-500 dark:text-red-400"
                : "text-green-600 dark:text-green-400",
            )}
          >
            {/* Aquí irían tus flechas de react-icons también */}
          </div>
        </div>
      </div>
    </div>
  );
}
