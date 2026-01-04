import { cn } from "@/lib/utils";
import type { IconType } from "react-icons"; // Cambiamos el tipo a IconType de react-icons

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
  };
  Icon: IconType; // Ahora recibe el componente de Fi icon directamente
  variant?: "green" | "orange" | "purple" | "blue"; // Añadimos variantes para los colores
};

export function OverviewCard({ label, data, Icon, variant = "blue" }: PropsType) {
  const isDecreasing = data.growthRate < 0;

  // Definición de estilos por variante (Fondo translúcido y color de icono)
  const variantStyles = {
    green: "bg-[#3FD97F]/10 text-[#3FD97F]",
    orange: "bg-[#FF9C55]/10 text-[#FF9C55]",
    purple: "bg-[#8155FF]/10 text-[#8155FF]",
    blue: "bg-[#18BFFF]/10 text-[#18BFFF]",
  };

  return (
    <div className="rounded-2xl bg-[#1a2233] p-6 shadow-lg">
      {/* Contenedor del Icono con fondo circular translúcido */}
      <div className={cn(
        "mb-8 flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-110",
        variantStyles[variant]
      )}>
        <Icon size={28} strokeWidth={2.5} />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-3xl font-bold text-white">{data.value}</h3>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <div className={cn(
            "flex items-center gap-1 text-sm font-semibold",
            isDecreasing ? "text-red-500" : "text-green-400"
          )}>
            <span>{Math.abs(data.growthRate)}%</span>
            {/* Aquí irían tus flechas de react-icons también */}
          </div>
        </div>
      </div>
    </div>
  );
}